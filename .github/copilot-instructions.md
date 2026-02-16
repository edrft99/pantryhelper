# PantryHelper AI Coding Guide

## Architecture Overview

**Monorepo Structure**: Root contains parallel `client/` and `server/` folders for standalone dev, plus `pantryhelper/` with identical structure for Home Assistant addon deployment.

**Stack**: React 19 + Vite + Tailwind v4 (client) | Node.js + Express + better-sqlite3 (server) | OpenAI GPT-4o (vision + text)

**Deployment Modes**:
- **Dev**: `npm run dev` (root) → concurrently runs client (Vite :5173) + server (nodemon :3001). Client proxies `/api` to server.
- **Production**: Multi-stage Dockerfile builds client static files, serves via Express. HA Ingress handles auth at port 3001.

## Data Flow & Services

**Image Scan Pipeline**: 
1. `PhotoCapture.jsx` → `browser-image-compression` (max 1.5MB, 1920px)
2. `useImageUpload.js` → `POST /api/scan` (multer) → `openai.detectIngredients(base64)`
3. Returns `{ingredients: [{name, confidence, category}]}` → ScanResultsPage

**Recipe Generation (Hybrid)**:
- `POST /api/recipes/suggest` tries TheMealDB first (`themealdb.js::findBestMatches` - 50% ingredient match)
- Falls back to OpenAI if <5 recipes (`openai.js::suggestRecipes`)
- Both sources normalized to same schema: `{title, description, cookTime, servings, difficulty, ingredients[], instructions[], source: 'themealdb'|'ai'}`

**Database Patterns** (`server/db/init.js`):
- SQLite WAL mode, `/data/pantryhelper.db` in production, `./db/pantryhelper.db` in dev
- Schema migration via `addColumnIfNotExists()` - safe to run multiple times
- Tables: `pantry_items` (UNIQUE on name), `favorite_recipes` (supports both AI and TheMealDB fields)

## Critical Conventions

**OpenAI Prompts** (`server/services/openai.js`):
- All responses use JSON mode with markdown fence stripping (`parseJsonResponse`)
- Vision calls use `detail: 'high'`, `temperature: 0.2` for consistency
- System prompts enforce strict schemas - categories/difficulty are enums

**Frontend Hooks Pattern**:
- `usePantry.js`: Manages local state + optimistic updates (e.g., `deleteItem` filters immediately)
- `useImageUpload.js`: Handles multi-image selection, compression, deduplication by name
- `useRecipes.js`: Combines suggest + favorites with loading states
- All hooks return `{ data, loading, error, ...actions }` signature

**API Client** (`client/src/api/client.js`):
- Axios instance with `/api` base URL (Vite proxy in dev, relative in prod)
- All functions return unwrapped `.then(r => r.data)` for direct destructuring

**Service Integration** (`server/services/mealie.js`):
- Check `isMealieEnabled` before every call (gracefully degrades if not configured)
- `testConnection()` called on server start (non-blocking)
- Sync operations in `pantryService.js` (add/update/delete items → `mealie.addFood`)

## Home Assistant Specifics

**Configuration Flow**: HA options UI → `/data/options.json` → `run.sh` reads via `jq` → exports env vars → `server/index.js`

**Required**: `OPENAI_API_KEY` (validated in run.sh), **Optional**: `MEALIE_URL`, `MEALIE_API_TOKEN`

**Ingress Support** (`server/index.js`):
- Middleware reads `X-Ingress-Path` header for base URL adjustments
- Dynamic CORS: allows all origins in production (HA handles auth), localhost only in dev
- Static file serving: `express.static(client/dist)` + SPA fallback in production mode only

**Persistence**: Database path checks `existsSync('/data')` to use `/data/` (HA) vs `./db/` (dev)

## Development Commands

```bash
npm run dev              # Start both client + server with hot reload
npm run install:all      # Install deps in client/ and server/
npm run dev:client       # Vite only (:5173)
npm run dev:server       # Nodemon only (:3001)
```

**Build Docker Image** (from root):
```bash
docker build -f pantryhelper/Dockerfile -t pantryhelper .
```

**Database Migrations**: Add columns via `addColumnIfNotExists` in `db/init.js` (idempotent, preserves data)

## Common Pitfalls

- **ES Modules**: All server code uses `import`, `package.json` has `"type": "module"`. Use `fileURLToPath` for `__dirname`.
- **OpenAI Responses**: Always strip markdown fencing - GPT-4o occasionally wraps JSON in ` ```json ` despite instructions.
- **Multi-Image Deduplication**: Done in `useImageUpload::scan()` after scanning all images, uses case-insensitive name Set.
- **Environment Files**: `.env` in root for dev server only. Production uses HA options system.
- **better-sqlite3**: Compile errors on Alpine? Must rebuild with `npm rebuild better-sqlite3 --build-from-source` (see Dockerfile).
- **Route Order**: API routes registered before static middleware in production to prevent index.html fallback.

## Key Files

- `server/services/openai.js` - Prompt engineering & JSON parsing
- `server/services/themealdb.js` - Recipe matching algorithm (`scoreRecipeMatch`)
- `server/db/init.js` - Schema + safe migration pattern
- `client/src/hooks/` - Reusable state + API logic
- `pantryhelper/run.sh` - HA config loading & validation
- `pantryhelper/Dockerfile` - Multi-stage build for ARM64 + AMD64
