import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db/init.js';
import * as mealie from './services/mealie.js';
import pantryRoutes from './routes/pantry.js';
import scanRoutes from './routes/scan.js';
import recipesRoutes from './routes/recipes.js';
import favoritesRoutes from './routes/favorites.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// Initialize database
initDb();

// Test Mealie connection (non-blocking)
mealie.testConnection();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/pantry', pantryRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/favorites', favoritesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
