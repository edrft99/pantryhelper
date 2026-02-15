import { Router } from 'express';
import db from '../db/init.js';

const router = Router();

// Get all favorites - GET /api/favorites
router.get('/', (req, res) => {
  try {
    const favorites = db.prepare('SELECT * FROM favorite_recipes ORDER BY saved_at DESC').all();
    const parsed = favorites.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      cookTime: f.cook_time,
      servings: f.servings,
      difficulty: f.difficulty,
      ingredients: JSON.parse(f.ingredients),
      instructions: JSON.parse(f.instructions),
      source: f.source || 'ai',
      externalId: f.external_id,
      imageUrl: f.image_url,
      category: f.category,
      cuisine: f.cuisine,
      sourceUrl: f.source_url,
      youtubeUrl: f.youtube_url,
      savedAt: f.saved_at
    }));
    res.json({ favorites: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save a favorite - POST /api/favorites
router.post('/', (req, res) => {
  try {
    const { recipe } = req.body;
    if (!recipe) return res.status(400).json({ error: 'recipe is required' });

    const stmt = db.prepare(`
      INSERT INTO favorite_recipes (
        title, description, cook_time, servings, difficulty, 
        ingredients, instructions, source, external_id, 
        image_url, category, cuisine, source_url, youtube_url
      )
      VALUES (
        @title, @description, @cook_time, @servings, @difficulty, 
        @ingredients, @instructions, @source, @external_id, 
        @image_url, @category, @cuisine, @source_url, @youtube_url
      )
    `);

    const result = stmt.run({
      title: recipe.title,
      description: recipe.description || '',
      cook_time: recipe.cookTime || '',
      servings: recipe.servings || 0,
      difficulty: recipe.difficulty || 'medium',
      ingredients: JSON.stringify(recipe.ingredients),
      instructions: JSON.stringify(recipe.instructions),
      source: recipe.source || 'ai',
      external_id: recipe.externalId || null,
      image_url: recipe.imageUrl || null,
      category: recipe.category || null,
      cuisine: recipe.cuisine || null,
      source_url: recipe.sourceUrl || null,
      youtube_url: recipe.youtubeUrl || null
    });

    res.json({ id: result.lastInsertRowid, ...recipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a favorite - DELETE /api/favorites/:id
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM favorite_recipes WHERE id = ?').run(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
