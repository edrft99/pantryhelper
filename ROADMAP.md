# PantryHelper - Development Roadmap

## Overview
A web app that lets users photograph their pantry/fridge, identifies ingredients using OpenAI Vision, suggests recipes, and tracks pantry inventory.

**Tech Stack**: React + Vite + Tailwind CSS | Node.js + Express | SQLite | OpenAI gpt-4o

---

## Phase 1: Project Scaffolding - COMPLETE
- [x] Create root `package.json` with concurrently
- [x] Scaffold React app with Vite (`client/`)
- [x] Install client dependencies (react-router-dom, axios, tailwind, lucide-react, etc.)
- [x] Create server directory structure
- [x] Create server `package.json`
- [x] Install server dependencies
- [x] Create `.env` with OPENAI_API_KEY placeholder
- [x] Configure Tailwind CSS in client (using @tailwindcss/vite plugin)
- [x] Configure Vite proxy for `/api`
- [x] Create Express server entry point (`server/index.js`)

## Phase 2: Database + Pantry CRUD - COMPLETE
- [x] Create SQLite schema (`server/db/init.js`) - pantry_items + favorite_recipes tables
- [x] Build pantry service (`server/services/pantryService.js`) - getAllItems, addItems, updateItem, deleteItem, mergeIngredients
- [x] Build pantry routes (`server/routes/pantry.js`) - GET, POST, PUT, DELETE, merge endpoints
- [x] Build frontend API client (`client/src/api/client.js`) - axios instance
- [x] Build `usePantry` hook
- [x] Build PantryPage with full CRUD UI
- [x] Set up React Router + Layout component in App.jsx

## Phase 3: Image Scan + Ingredient Detection - COMPLETE
- [x] Set up Multer middleware (`server/middleware/upload.js`)
- [x] Build OpenAI `detectIngredients` service (`server/services/openai.js`)
- [x] Build scan route (`server/routes/scan.js`)
- [x] Build `useImageUpload` hook (with browser-image-compression)
- [x] Build PhotoCapture component (camera + file upload)
- [x] Build IngredientList component (editable detected ingredients)
- [x] Build ScanResultsPage
- [x] Build HomePage with PhotoCapture + pantry preview

## Phase 4: Recipe Suggestions - COMPLETE
- [x] Add `suggestRecipes` to OpenAI service
- [x] Build recipes route (`server/routes/recipes.js`) - POST /api/recipes/suggest
- [x] Build `useRecipes` hook
- [x] Build RecipeCard component (expandable with ingredients + instructions)
- [x] Build RecipesPage

## Phase 5: Favorites - COMPLETE
- [x] Add favorites endpoints (`server/routes/favorites.js`) - GET, POST, DELETE /api/favorites
- [x] Favorites logic integrated into `useRecipes` hook
- [x] Build FavoritesPage

## Phase 6: Polish - COMPLETE
- [x] LoadingSpinner component
- [x] Loading/error states on all pages
- [x] Empty states (no items, no recipes, no favorites)
- [x] Toast notifications (react-hot-toast)
- [x] Client-side image compression (browser-image-compression)
- [x] Responsive design (mobile bottom nav + desktop top nav)

## Phase 7: Multi-Image Upload + Clear Pantry - COMPLETE
- [x] Support uploading multiple images at once (file input accepts `multiple`)
- [x] Thumbnail grid preview with individual remove (X) buttons per image
- [x] "Add more" tile to keep adding photos after initial selection
- [x] "Clear all" link to remove all selected images
- [x] Each image scanned separately via OpenAI, ingredients deduplicated across all photos
- [x] "Clear All" button on Pantry page to delete all items at once (`DELETE /api/pantry/all`)
- [x] Confirmation dialog before clearing pantry
- [x] ScanResultsPage updated to show multi-image thumbnail grid

**Files changed:**
- `server/services/pantryService.js` - added `clearAll()`
- `server/routes/pantry.js` - added `DELETE /all` route
- `client/src/api/client.js` - added `clearPantry()`
- `client/src/hooks/usePantry.js` - added `clearAll` function
- `client/src/hooks/useImageUpload.js` - rewritten for multi-image support
- `client/src/components/PhotoCapture.jsx` - rewritten for thumbnail grid UI
- `client/src/pages/HomePage.jsx` - updated to pass multi-image props
- `client/src/pages/PantryPage.jsx` - added Clear All button
- `client/src/pages/ScanResultsPage.jsx` - updated to show multiple preview thumbnails

## Phase 8: TheMealDB Integration - COMPLETE
- [x] Create TheMealDB service (`server/services/themealdb.js`)
  - [x] `searchByIngredient(ingredient)` - query single ingredient filter endpoint
  - [x] `getMealDetails(mealId)` - fetch full recipe by ID with all fields
  - [x] `searchMultipleIngredients(ingredients[])` - parallel queries, deduplicate by meal ID
  - [x] `scoreRecipeMatch(recipe, userIngredients)` - calculate % of user ingredients in recipe
  - [x] `findBestMatches(ingredients[], minMatchPercent=50)` - filter & sort by score
  - [x] Map TheMealDB response to app schema: `strMeal→title`, `strInstructions→instructions[]`, `strIngredient/Measure→ingredients[]`
  - [x] Add new fields: `imageUrl`, `category`, `cuisine`, `source: 'themealdb'`, `externalId: idMeal`

- [x] Enhance database schema (`server/db/init.js`)
  - [x] Add columns to `favorite_recipes`: `source TEXT DEFAULT 'ai'`, `external_id TEXT`, `image_url TEXT`, `category TEXT`, `cuisine TEXT`, `source_url TEXT`, `youtube_url TEXT`
  - [x] Create migration function to safely add columns without breaking existing data
  - [x] Verify backward compatibility with existing favorites

- [x] Update recipes route (`server/routes/recipes.js`)
  - [x] Modify `POST /api/recipes/suggest` to implement hybrid logic:
    - Query TheMealDB with all user ingredients
    - Filter to recipes with 50%+ match
    - If < 5 results, supplement with AI-generated recipes (call OpenAI service)
    - Combine arrays, add `matchPercentage` to TheMealDB recipes
    - Return metadata object with recipe counts

- [x] Enhance RecipeCard component (`client/src/components/RecipeCard.jsx`)
  - [x] Add recipe image display when `recipe.imageUrl` exists (above title)
  - [x] Add source badge: "TheMealDB" or "AI Generated" with distinct colors
  - [x] Display `recipe.category` and `recipe.cuisine` tags if available
  - [x] Show match percentage badge for TheMealDB recipes (e.g., "85% match")
  - [x] Handle missing `cookTime`, `difficulty`, `servings` gracefully (may be null for TheMealDB)
  - [x] Add external links for `sourceUrl` and `youtubeUrl` when available

- [x] Update favorites routes (`server/routes/favorites.js`)
  - [x] Handle new optional columns when saving favorites
  - [x] Return new fields when retrieving favorites (proper camelCase mapping)

- [x] Update favorites hook (`client/src/hooks/useRecipes.js`)
  - [x] Update favorite detection: use `externalId` + `source` combo if present
  - [x] Fallback to title matching for backward compatibility with AI recipes
  - [x] Handle new metadata response structure from recipes API

- [x] Enhance RecipesPage (`client/src/pages/RecipesPage.jsx`)
  - [x] Add info banner: "Showing {X} real recipes + {Y} AI suggestions"
  - [x] Display metadata with recipe counts
  - [x] Update RecipeCard key to use `externalId` when available

**API Reference**: https://www.themealdb.com/api.php

**Key Decisions**:
- Using free tier (test key "1") - no environment variable needed
- 50% ingredient match threshold for inclusion
- Hybrid approach: TheMealDB primary, AI supplemental when <5 matches
- Client-side scoring algorithm (free tier doesn't support multi-ingredient filter)

**Files created/modified**:
- NEW: `server/services/themealdb.js`
- MODIFIED: `server/db/init.js` - enhanced schema with migration logic
- MODIFIED: `server/routes/recipes.js` - hybrid TheMealDB + AI logic
- MODIFIED: `server/routes/favorites.js` - new field handling
- MODIFIED: `client/src/components/RecipeCard.jsx` - images, badges, metadata display
- MODIFIED: `client/src/pages/RecipesPage.jsx` - metadata info banner
- MODIFIED: `client/src/hooks/useRecipes.js` - improved favorite detection, metadata handling

## Phase 9: Mealie Integration - COMPLETE
Self-hosted recipe manager integration for automatic pantry sync and manual recipe export.

**Goal**: Sync pantry items to Mealie foods automatically; export recipes to Mealie on-demand with explicit user action.

**Configuration**:
- Single shared Mealie instance via environment variables
- `MEALIE_URL` - Base URL of Mealie instance (e.g., http://localhost:9000)
- `MEALIE_API_TOKEN` - API authentication token from Mealie settings

**Backend Tasks**:
- [x] Create Mealie service (`server/services/mealie.js`)
  - [x] Initialize Axios client with base URL and auth headers
  - [x] Implement `addFood(name, quantity, unit)` - creates/updates food in Mealie
  - [x] Implement `removeFood(name)` - deletes food by name from Mealie
  - [x] Implement `addRecipe(recipeObject)` - posts recipe with ingredients/instructions to Mealie
  - [x] Implement `testConnection()` - health check for Mealie availability
  - [x] Add graceful error handling (non-blocking failures, log but continue)

- [x] Integrate Mealie sync into pantry service (`server/services/pantryService.js`)
  - [x] Import Mealie service
  - [x] `addItems()`: Sync each item to Mealie after DB insert
  - [x] `updateItem()`: Update Mealie food with new quantity/unit after DB update
  - [x] `deleteItem()`: Remove from Mealie after DB delete
  - [x] `clearAll()`: Fetch all items, remove each from Mealie, then clear DB
  - [x] `mergeIngredients()`: Sync newly added ingredients to Mealie
  - [x] Use `Promise.allSettled()` for batch operations to handle partial failures

- [x] Add recipe export endpoint (`server/routes/recipes.js`)
  - [x] Create `POST /api/recipes/export-to-mealie` route
  - [x] Map PantryHelper recipe schema to Mealie format
  - [x] Call `mealie.addRecipe()`
  - [x] Return success/failure status

- [x] Add server startup health check (`server/index.js`)
  - [x] Call `mealie.testConnection()` after DB initialization
  - [x] Log warning if unreachable but allow server to continue

**Frontend Tasks**:
- [x] Update API client (`client/src/api/client.js`)
  - [x] Add `exportRecipeToMealie(recipe)` function

- [x] Add Mealie export UI (`client/src/components/RecipeCard.jsx`)
  - [x] Add "Add to Mealie" button next to favorite heart icon
  - [x] Show loading state during export
  - [x] Display success/error toast notification after export
  - [x] Handle Mealie connection errors gracefully

**Configuration & Documentation**:
- [x] Add to `server/.env.example`:
  ```
  MEALIE_URL=http://localhost:9000
  MEALIE_API_TOKEN=your_token_here
  ```

**Sync Behavior**:
- **Pantry → Mealie Foods**: Automatic sync on all operations (add, update, delete, clear all)
- **Recipes → Mealie**: Manual export via "Add to Mealie" button (user chooses which recipes to export)
- **Error Handling**: Non-blocking - if Mealie is down, pantry operations still succeed locally

**Key Decisions**:
- Environment variable configuration (single shared instance)
- Automatic pantry sync to keep Mealie foods in sync with PantryHelper
- Manual recipe export to give users control over which recipes go to Mealie
- Name-based matching for food sync (no local tracking of Mealie IDs for MVP)
- Graceful degradation if Mealie is unreachable
- Pattern follows existing `themealdb.js` service architecture

**API Reference**: Mealie API docs at your instance `/docs` (e.g., http://localhost:9000/docs)

**Files to create/modify**:
- NEW: `server/services/mealie.js`
- MODIFIED: `server/services/pantryService.js` - add sync hooks
- MODIFIED: `server/routes/recipes.js` - add export endpoint
- MODIFIED: `server/index.js` - add health check
- MODIFIED: `client/src/api/client.js` - add export function
- MODIFIED: `client/src/components/RecipeCard.jsx` - add export button
- MODIFIED: `server/.env.example` - add Mealie config

## Phase 10: Spoonacular Integration - PENDING
Add Spoonacular as a third recipe source alongside TheMealDB and OpenAI. Spoonacular provides richer data (cook time, servings, dietary info, nutrition) and a native "find by ingredients" endpoint.

**API Reference**: https://spoonacular.com/food-api/docs
**Base URL**: `https://api.spoonacular.com`
**Auth**: API key passed as `apiKey` query parameter
**Free tier**: ~150 requests/day (points-based system: 1 point per call + 0.01 per result)

**Configuration**:
- `SPOONACULAR_API_KEY` in `server/.env` — required, no free test key available
- Service skips gracefully if key is not set (like Mealie pattern)

**Backend Tasks**:
- [ ] Create Spoonacular service (`server/services/spoonacular.js`)
  - [ ] `searchByIngredients(ingredients[], number)` — `GET /recipes/findByIngredients`
    - Params: `ingredients` (comma-separated), `number` (max results, default 10), `ranking=1` (maximize used ingredients), `ignorePantry=true`
    - Returns: array of `{ id, title, image, usedIngredientCount, missedIngredientCount, usedIngredients[], missedIngredients[] }`
  - [ ] `getRecipeDetails(id)` — `GET /recipes/{id}/information`
    - Params: `includeNutrition=false`
    - Returns: full recipe with `extendedIngredients[]`, `readyInMinutes`, `servings`, `sourceUrl`, `instructions`, `analyzedInstructions[]`, `diets[]`, `cuisines[]`, `dishTypes[]`
  - [ ] `mapToRecipeSchema(spoonacularRecipe, usedCount, totalUserIngredients)` — map to app schema:
    - `title` ← `title`
    - `description` ← `summary` (strip HTML tags)
    - `cookTime` ← `"readyInMinutes minutes"`
    - `servings` ← `servings`
    - `difficulty` ← derive from `readyInMinutes` (≤20 easy, ≤45 medium, else hard)
    - `ingredients[]` ← `extendedIngredients[].original`
    - `instructions[]` ← `analyzedInstructions[0].steps[].step`
    - `imageUrl` ← `image`
    - `category` ← `dishTypes[0]` or null
    - `cuisine` ← `cuisines[0]` or null
    - `source` ← `'spoonacular'`
    - `externalId` ← `id` (as string)
    - `matchPercentage` ← calculate from `usedIngredientCount / totalUserIngredients * 100`
    - `sourceUrl` ← `sourceUrl`
    - `youtubeUrl` ← null (not provided by Spoonacular)
  - [ ] `findBestMatches(ingredients[], maxResults)` — orchestrator:
    - Call `searchByIngredients` to get candidates
    - Filter to recipes where `usedIngredientCount >= 1`
    - Fetch full details for top candidates (parallel with `Promise.all`)
    - Map to app schema, sort by match percentage descending
  - [ ] Lazy-init pattern (like openai.js) — only create client when key exists

- [ ] Update recipes route (`server/routes/recipes.js`)
  - [ ] Import Spoonacular service
  - [ ] Add Spoonacular as Step 1.5 in hybrid logic (between TheMealDB and AI):
    - TheMealDB first (free, no key needed)
    - Spoonacular second (if key configured and still need more recipes)
    - AI last (if combined results < 5)
  - [ ] Add `spoonacularCount` to metadata object
  - [ ] Deduplicate across sources by title (case-insensitive)

**Frontend Tasks** (minimal — existing UI handles it):
- [ ] Update source badge colors in RecipeCard for `'spoonacular'` source
  - TheMealDB: blue, AI: purple, Spoonacular: orange
- [ ] Update metadata banner in RecipesPage to show Spoonacular count

**Database** — no schema changes needed (existing `source`, `external_id`, `image_url` columns work as-is)

**Environment Setup**:
- Add to `server/.env`:
  ```
  SPOONACULAR_API_KEY=your-spoonacular-key-here
  ```

**Key Decisions**:
- Spoonacular runs between TheMealDB and AI in the pipeline (richer data than MealDB, cheaper than AI)
- Lazy initialization — service is a no-op if API key is not configured
- Free tier is limited (~150 req/day), so limit to 5 candidates max and batch detail fetches
- No new database columns needed — reuses existing TheMealDB metadata fields
- Deduplication by title prevents showing the same recipe from multiple sources

**Files to create/modify**:
- NEW: `server/services/spoonacular.js`
- MODIFIED: `server/routes/recipes.js` — add Spoonacular step in hybrid pipeline
- MODIFIED: `client/src/components/RecipeCard.jsx` — add orange badge for Spoonacular source
- MODIFIED: `client/src/pages/RecipesPage.jsx` — show Spoonacular count in metadata banner

## Phase 11: Home Assistant Addon - IN PROGRESS
Convert PantryHelper into a Home Assistant addon with Ingress support for seamless integration. Deploy to GitHub repository for installation on HA Green (aarch64).

**Goal**: Run PantryHelper as a native HA addon accessible via the HA UI panel, with persistent data storage and user-configurable API keys.

**Architecture Changes**:
- Single Express server serving both static frontend and API routes
- HA Ingress integration with `X-Ingress-Path` header handling
- Data persistence in `/data/` directory (included in HA snapshots)
- Configuration via HA options UI instead of `.env` file
- Multi-stage Docker build for production optimization

**Implementation Tasks**:

- [x] Fix Ingress static asset serving — dynamically inject `<base href>` from `X-Ingress-Path` header so relative asset URLs resolve correctly through HA Ingress proxy
- [x] Native camera support for HA mobile app — use `getUserMedia` API with live camera preview overlay instead of file input `capture` attribute (which is ignored by HA WebView)

- [ ] Create addon manifest (`config.json`)
  - Define metadata: name "PantryHelper", slug `pantryhelper`, version `1.0.0`
  - Set architectures: `["aarch64", "amd64"]` (HA Green + testing)
  - Configure ingress with panel icon and title
  - Define options schema: `OPENAI_API_KEY` (required), `MEALIE_URL`, `MEALIE_API_TOKEN` (optional)
  - Set startup type `application`, boot `auto`

- [ ] Create multi-stage Dockerfile
  - Stage 1: Build frontend with `node:20-alpine`, run `npm ci && npm run build` in `client/`
  - Stage 2: Production image, copy server code and built frontend
  - Install production dependencies only (`npm ci --production`)
  - Expose port 3001, set entrypoint to `node server/index.js`

- [ ] Create startup script (`run.sh`)
  - Read `/data/options.json` and export to environment variables
  - Validate `OPENAI_API_KEY` is present
  - Set `PORT=3001` and `NODE_ENV=production`
  - Execute Node server

- [ ] Update server for static file serving (`server/index.js`)
  - Remove hardcoded CORS origin `http://localhost:5173`
  - Add middleware to handle `X-Ingress-Path` header for subpath routing
  - Add `express.static()` middleware to serve `client/dist/` at root `/` in production
  - Update CORS to accept dynamic origins from HA ingress headers
  - Ensure API routes registered before static middleware

- [ ] Update database path for persistence (`server/db/init.js`)
  - Change SQLite path from `server/db/pantryhelper.db` to `/data/pantryhelper.db`
  - Add environment detection: use `/data/` in production, current path in dev
  - Ensure `/data/` directory exists before DB init

- [ ] Create addon documentation
  - `README.md`: Brief description, features, screenshot
  - `DOCS.md`: Installation guide (add repo to HA), configuration (OpenAI key, Mealie), usage, troubleshooting

- [ ] Add build configuration (`build.json`)
  - Define architectures: `aarch64` (HA Green), `amd64` (testing)
  - Set base images per architecture

- [ ] Prepare GitHub repository
  - Add addon files to root: `config.json`, `Dockerfile`, `run.sh`, `build.json`, `README.md`, `DOCS.md`, `icon.png`
  - Update this ROADMAP to mark Phase 11 complete
  - Tag release as `v1.0.0`

- [ ] Local testing
  - Build Docker image: `docker build -t pantryhelper-test .`
  - Run with mounted `/data` volume and test env vars
  - Verify frontend loads, API works, database persists

- [ ] Deploy to HA Green
  - Push all changes to GitHub (`edrft99/pantryhelper`)
  - In HA: Settings → Add-ons → Add-on Store → ⋮ → Repositories
  - Add repository URL: `https://github.com/edrft99/pantryhelper`
  - Find "PantryHelper" in store, install
  - Configure OpenAI API key in addon config
  - Start addon and access via Ingress panel

**Verification Checklist**:
- [ ] Docker image builds without errors
- [ ] HA recognizes addon in store after repo added
- [ ] Addon starts and shows "Started" state
- [ ] Ingress panel loads React interface (no 404s, proper routing)
- [ ] Image upload and scanning returns detected ingredients
- [ ] Pantry CRUD persists after addon restart
- [ ] Recipe search works (TheMealDB and/or OpenAI)
- [ ] Mealie sync works if configured (optional)

**Key Decisions**:
- **Ingress over port mapping**: Better HA integration, embedded in UI panel
- **aarch64 + amd64**: Targeting HA Green primary, amd64 for dev/testing
- **MVP scope**: No authentication (HA provides), no multi-user, no HA camera integration yet
- **Database in /data/**: Standard HA persistence pattern, auto-included in snapshots
- **Production mode detection**: Use `/data/` when exists, dev path for local development

**Target Hardware**: Home Assistant Green (aarch64)

**Repository**: https://github.com/edrft99/pantryhelper

**Future Enhancements (Phase 12+)**:
- Multi-architecture support (armv7, armhf for older Raspberry Pi)
- HA authentication integration
- HA camera entity integration (use existing HA cameras)
- HA notification integration (low stock alerts, recipe suggestions)
- Auto-discovery of Mealie addon if installed
- Backup/restore features beyond HA snapshots

---

## Getting Started

1. **Set your OpenAI API key** in `server/.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Install dependencies**:
   ```bash
   npm install            # root (concurrently)
   npm run install:all    # client + server
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `server/services/openai.js` | Core AI integration - ingredient detection + recipe generation |
| `server/services/themealdb.js` | TheMealDB API integration - real recipe search and matching |
| `server/db/init.js` | SQLite database schema |
| `server/routes/scan.js` | Image upload + ingredient detection endpoint |
| `server/routes/pantry.js` | Pantry inventory CRUD |
| `server/routes/recipes.js` | Recipe suggestions (hybrid TheMealDB + AI) |
| `server/routes/favorites.js` | Favorites CRUD |
| `client/src/api/client.js` | Frontend API layer |
| `client/src/pages/HomePage.jsx` | Main entry - photo capture |
| `client/src/pages/ScanResultsPage.jsx` | Ingredient review after scan |
| `client/src/pages/RecipesPage.jsx` | Recipe suggestions display |
| `client/src/pages/PantryPage.jsx` | Full pantry inventory management |
| `client/src/pages/FavoritesPage.jsx` | Saved recipes |

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| POST | `/api/scan` | Upload image, detect ingredients |
| GET | `/api/pantry` | List pantry items |
| POST | `/api/pantry` | Add items |
| PUT | `/api/pantry/:id` | Update item |
| DELETE | `/api/pantry/all` | Clear all pantry items |
| DELETE | `/api/pantry/:id` | Remove item |
| POST | `/api/pantry/merge` | Merge scanned ingredients into pantry |
| POST | `/api/recipes/suggest` | Generate recipes from ingredients |
| GET | `/api/favorites` | List saved recipes |
| POST | `/api/favorites` | Save a recipe |
| DELETE | `/api/favorites/:id` | Remove saved recipe |
