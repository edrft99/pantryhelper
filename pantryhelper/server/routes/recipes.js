import { Router } from 'express';
import { suggestRecipes } from '../services/openai.js';
import { findBestMatches } from '../services/themealdb.js';
import * as mealie from '../services/mealie.js';
import db from '../db/init.js';

const router = Router();

// Generate recipe suggestions - POST /api/recipes/suggest
// Hybrid approach: Try TheMealDB first, supplement with AI if needed
router.post('/suggest', async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'ingredients array is required' });
    }

    let recipes = [];
    let themealdbCount = 0;
    let aiCount = 0;

    // Step 1: Try TheMealDB first (50% match threshold, max 10 results)
    try {
      const themealdbRecipes = await findBestMatches(ingredients, 50, 10);
      recipes = themealdbRecipes;
      themealdbCount = themealdbRecipes.length;
      console.log(`Found ${themealdbCount} TheMealDB recipes`);
    } catch (error) {
      console.error('TheMealDB search error:', error.message);
      // Continue to AI fallback
    }

    // Step 2: If we have fewer than 5 recipes, supplement with AI
    if (recipes.length < 5) {
      try {
        const aiResponse = await suggestRecipes(ingredients);
        // Extract recipes array from response
        const aiRecipes = aiResponse?.recipes || [];
        // Add source field to AI recipes
        const enhancedAiRecipes = aiRecipes.map(recipe => ({
          ...recipe,
          source: 'ai',
          externalId: null,
          imageUrl: null,
          category: null,
          cuisine: null,
          matchPercentage: null
        }));
        recipes = [...recipes, ...enhancedAiRecipes];
        aiCount = enhancedAiRecipes.length;
        console.log(`Supplemented with ${aiCount} AI recipes`);
      } catch (error) {
        console.error('AI recipe generation error:', error.message);
        // If TheMealDB worked but AI failed, just return TheMealDB results
      }
    }

    // Return combined results with metadata
    res.json({
      recipes,
      metadata: {
        totalRecipes: recipes.length,
        themealdbCount,
        aiCount,
        ingredients: ingredients.length
      }
    });
  } catch (err) {
    console.error('Recipe suggestion error:', err);
    res.status(500).json({ error: 'Failed to generate recipes. ' + err.message });
  }
});

// Export recipe to Mealie - POST /api/recipes/export-to-mealie
router.post('/export-to-mealie', async (req, res) => {
  try {
    const { recipe } = req.body;
    
    if (!recipe) {
      return res.status(400).json({ error: 'recipe object is required' });
    }
    
    if (!recipe.title) {
      return res.status(400).json({ error: 'recipe must have a title' });
    }
    
    // Attempt to add recipe to Mealie
    const result = await mealie.addRecipe(recipe);
    
    if (result) {
      res.json({ 
        success: true, 
        message: `Recipe "${recipe.title}" exported to Mealie successfully`,
        mealieRecipe: result
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Failed to export recipe to Mealie. Check server logs for details.' 
      });
    }
  } catch (err) {
    console.error('Mealie export error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to export recipe to Mealie: ' + err.message 
    });
  }
});

export default router;
