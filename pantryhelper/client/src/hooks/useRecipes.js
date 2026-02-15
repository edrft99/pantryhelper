import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/client';

export function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    try {
      const data = await api.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    }
  }, []);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const generateRecipes = async (ingredients) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.suggestRecipes(ingredients);
      // Handle new response structure with recipes array and metadata
      if (data.recipes && Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
        setMetadata(data.metadata);
        return data.recipes;
      } else {
        // Fallback for old response format (plain array)
        setRecipes(data);
        setMetadata(null);
        return data;
      }
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (recipe) => {
    // Improved favorite detection: use externalId + source combo if available
    const existing = favorites.find(f => {
      if (recipe.externalId && recipe.source) {
        return f.externalId === recipe.externalId && f.source === recipe.source;
      }
      // Fallback to title matching for AI recipes or old favorites
      return f.title === recipe.title;
    });
    
    if (existing) {
      await api.deleteFavorite(existing.id);
      setFavorites(prev => prev.filter(f => f.id !== existing.id));
    } else {
      const saved = await api.saveFavorite(recipe);
      setFavorites(prev => [...prev, saved]);
    }
  };

  const removeFavorite = async (id) => {
    await api.deleteFavorite(id);
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const isFavorite = (recipe) => {
    if (!recipe) return false;
    // Use externalId + source for TheMealDB recipes
    if (recipe.externalId && recipe.source) {
      return favorites.some(f => 
        f.externalId === recipe.externalId && f.source === recipe.source
      );
    }
    // Fallback to title matching
    return favorites.some(f => f.title === recipe.title);
  };

  return { recipes, metadata, favorites, loading, error, generateRecipes, toggleFavorite, removeFavorite, isFavorite, fetchFavorites };
}
