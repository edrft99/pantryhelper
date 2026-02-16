import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db/init.js';
import * as mealie from './services/mealie.js';
import pantryRoutes from './routes/pantry.js';
import scanRoutes from './routes/scan.js';
import recipesRoutes from './routes/recipes.js';
import favoritesRoutes from './routes/favorites.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration - handle both development and HA ingress
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost
    if (!isProduction && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // In production (HA addon), allow all origins
    // HA Ingress handles authentication
    if (isProduction) {
      return callback(null, true);
    }
    
    callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Initialize database
initDb();

// Test Mealie connection (non-blocking)
mealie.testConnection();

// API Routes - register before static files
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/pantry', pantryRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/favorites', favoritesRoutes);

// Serve static files in production (Home Assistant addon)
if (isProduction) {
  const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
  const indexHtml = fs.readFileSync(path.join(clientDistPath, 'index.html'), 'utf8');

  console.log(`Serving static files from: ${clientDistPath}`);

  // Serve static assets (JS, CSS, images, etc.)
  app.use(express.static(clientDistPath, { index: false }));

  // SPA fallback - serve index.html with dynamic <base href> for HA Ingress
  app.get('*', (req, res) => {
    const ingressPath = req.headers['x-ingress-path'];
    if (ingressPath) {
      // Inject <base href> for asset URLs and ingress path for React Router
      const baseTag = `<base href="${ingressPath}/">`;
      const ingressScript = `<script>window.__INGRESS_PATH__="${ingressPath}";</script>`;
      const html = indexHtml.replace('<head>', `<head>${baseTag}${ingressScript}`);
      res.type('html').send(html);
    } else {
      res.type('html').send(indexHtml);
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
  if (isProduction) {
    console.log('Static files will be served from Express');
  }
});

