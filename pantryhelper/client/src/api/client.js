import axios from 'axios';

const ingressPath = window.__INGRESS_PATH__ || '';
const api = axios.create({
  baseURL: `${ingressPath}/api`
});

// Pantry
export const getPantryItems = () => api.get('/pantry').then(r => r.data.items);
export const addPantryItems = (items) => api.post('/pantry', { items }).then(r => r.data.added);
export const updatePantryItem = (id, data) => api.put(`/pantry/${id}`, data).then(r => r.data.item);
export const deletePantryItem = (id) => api.delete(`/pantry/${id}`);
export const clearPantry = () => api.delete('/pantry/all');
export const mergePantryIngredients = (ingredients) => api.post('/pantry/merge', { ingredients }).then(r => r.data.items);

// Scan
export const scanImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};

// Recipes
export const suggestRecipes = (ingredients) => api.post('/recipes/suggest', { ingredients }).then(r => r.data);
export const exportRecipeToMealie = (recipe) => api.post('/recipes/export-to-mealie', { recipe }).then(r => r.data);

// Favorites
export const getFavorites = () => api.get('/favorites').then(r => r.data.favorites);
export const saveFavorite = (recipe) => api.post('/favorites', { recipe }).then(r => r.data);
export const deleteFavorite = (id) => api.delete(`/favorites/${id}`);
