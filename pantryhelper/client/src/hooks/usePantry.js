import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/client';

export function usePantry() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPantryItems();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItems = async (newItems) => {
    const added = await api.addPantryItems(newItems);
    await fetchItems();
    return added;
  };

  const updateItem = async (id, data) => {
    const updated = await api.updatePantryItem(id, data);
    setItems(prev => prev.map(i => i.id === id ? updated : i));
    return updated;
  };

  const deleteItem = async (id) => {
    await api.deletePantryItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearAll = async () => {
    await api.clearPantry();
    setItems([]);
  };

  const mergeIngredients = async (ingredients) => {
    const allItems = await api.mergePantryIngredients(ingredients);
    setItems(allItems);
    return allItems;
  };

  return { items, loading, error, addItems, updateItem, deleteItem, clearAll, mergeIngredients, refresh: fetchItems };
}
