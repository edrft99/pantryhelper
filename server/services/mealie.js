import axios from 'axios';

// Get Mealie configuration from environment variables
const MEALIE_URL = process.env.MEALIE_URL;
const MEALIE_API_TOKEN = process.env.MEALIE_API_TOKEN;

// Flag to track if Mealie is enabled
const isMealieEnabled = Boolean(MEALIE_URL && MEALIE_API_TOKEN);

/**
 * Create Axios client for Mealie API
 * @returns {Object|null} Axios instance or null if not configured
 */
function getMealieClient() {
  if (!isMealieEnabled) {
    return null;
  }

  return axios.create({
    baseURL: MEALIE_URL,
    headers: {
      'Authorization': `Bearer ${MEALIE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    timeout: 5000 // 5 second timeout for all requests
  });
}

/**
 * Test connection to Mealie instance
 * @returns {Promise<boolean>} True if connection successful, false otherwise
 */
export async function testConnection() {
  if (!isMealieEnabled) {
    console.log('Mealie integration not configured (MEALIE_URL or MEALIE_API_TOKEN missing)');
    return false;
  }

  const client = getMealieClient();
  
  try {
    // Ping the about endpoint to verify connection
    await client.get('/api/app/about');
    console.log('✓ Mealie connection successful:', MEALIE_URL);
    return true;
  } catch (error) {
    console.warn('⚠ Mealie connection failed:', error.message);
    console.warn('  PantryHelper will continue without Mealie integration');
    return false;
  }
}

/**
 * Add or update a food item in Mealie
 * @param {string} name - Food name
 * @param {number} quantity - Quantity
 * @param {string} unit - Unit of measurement
 * @returns {Promise<Object|null>} Created/updated food object or null on failure
 */
export async function addFood(name, quantity, unit) {
  if (!isMealieEnabled) {
    return null;
  }

  const client = getMealieClient();
  
  try {
    // Search for existing food by name
    const searchResponse = await client.get('/api/foods', {
      params: { 
        search: name,
        page: 1,
        perPage: 1
      }
    });

    const existingFood = searchResponse.data.items?.find(
      food => food.name.toLowerCase() === name.toLowerCase()
    );

    if (existingFood) {
      // Update existing food
      const updateResponse = await client.put(`/api/foods/${existingFood.id}`, {
        name: name,
        description: `Quantity: ${quantity} ${unit}`,
        labelId: null
      });
      console.log(`✓ Updated food in Mealie: ${name}`);
      return updateResponse.data;
    } else {
      // Create new food
      const createResponse = await client.post('/api/foods', {
        name: name,
        description: `Quantity: ${quantity} ${unit}`,
        labelId: null
      });
      console.log(`✓ Added food to Mealie: ${name}`);
      return createResponse.data;
    }
  } catch (error) {
    console.error(`✗ Failed to sync food to Mealie (${name}):`, error.message);
    return null;
  }
}

/**
 * Remove a food item from Mealie by name
 * @param {string} name - Food name to remove
 * @returns {Promise<boolean>} True if removed or not found, false on error
 */
export async function removeFood(name) {
  if (!isMealieEnabled) {
    return true; // Consider success if Mealie not enabled
  }

  const client = getMealieClient();
  
  try {
    // Search for food by name
    const searchResponse = await client.get('/api/foods', {
      params: { 
        search: name,
        page: 1,
        perPage: 1
      }
    });

    const existingFood = searchResponse.data.items?.find(
      food => food.name.toLowerCase() === name.toLowerCase()
    );

    if (existingFood) {
      await client.delete(`/api/foods/${existingFood.id}`);
      console.log(`✓ Removed food from Mealie: ${name}`);
    } else {
      console.log(`→ Food not found in Mealie (already removed?): ${name}`);
    }
    
    return true;
  } catch (error) {
    console.error(`✗ Failed to remove food from Mealie (${name}):`, error.message);
    return false;
  }
}

/**
 * Add a recipe to Mealie
 * @param {Object} recipe - Recipe object with title, ingredients, instructions, etc.
 * @returns {Promise<Object|null>} Created recipe object or null on failure
 */
export async function addRecipe(recipe) {
  if (!isMealieEnabled) {
    return null;
  }

  const client = getMealieClient();
  
  try {
    // Map PantryHelper recipe schema to Mealie schema
    const mealieRecipe = {
      name: recipe.title,
      description: recipe.description || '',
      recipeYield: recipe.servings ? `${recipe.servings} servings` : '',
      totalTime: recipe.cookTime || null,
      prepTime: null,
      performTime: recipe.cookTime || null,
      recipeIngredient: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : [],
      recipeInstructions: Array.isArray(recipe.instructions)
        ? recipe.instructions.map((instruction, index) => ({
            id: null,
            title: '',
            text: instruction.step || instruction,
            ingredientReferences: []
          }))
        : [],
      recipeCategory: recipe.category ? [recipe.category] : [],
      recipeCuisine: recipe.cuisine || null,
      tools: [],
      tags: [],
      dateAdded: new Date().toISOString(),
      notes: [],
      rating: null,
      orgURL: recipe.sourceUrl || recipe.source_url || null,
      settings: {
        public: true,
        showNutrition: false,
        showAssets: false,
        landscapeView: false,
        disableComments: false,
        disableAmount: false,
        locked: false
      }
    };

    const response = await client.post('/api/recipes', mealieRecipe);
    console.log(`✓ Added recipe to Mealie: ${recipe.title}`);
    return response.data;
  } catch (error) {
    console.error(`✗ Failed to add recipe to Mealie (${recipe.title}):`, error.message);
    if (error.response) {
      console.error('  Response status:', error.response.status);
      console.error('  Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

/**
 * Batch sync multiple foods to Mealie
 * @param {Array<Object>} items - Array of pantry items with name, quantity, unit
 * @returns {Promise<Object>} Results with success and failure counts
 */
export async function batchSyncFoods(items) {
  if (!isMealieEnabled || !items || items.length === 0) {
    return { succeeded: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    items.map(item => addFood(item.name, item.quantity, item.unit))
  );

  const succeeded = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
  const failed = results.filter(r => r.status === 'rejected' || r.value === null).length;

  console.log(`Mealie batch sync: ${succeeded} succeeded, ${failed} failed`);
  
  return { succeeded, failed };
}

/**
 * Batch remove multiple foods from Mealie
 * @param {Array<string>} names - Array of food names to remove
 * @returns {Promise<Object>} Results with success and failure counts
 */
export async function batchRemoveFoods(names) {
  if (!isMealieEnabled || !names || names.length === 0) {
    return { succeeded: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    names.map(name => removeFood(name))
  );

  const succeeded = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  const failed = results.filter(r => r.status === 'rejected' || r.value === false).length;

  console.log(`Mealie batch remove: ${succeeded} succeeded, ${failed} failed`);
  
  return { succeeded, failed };
}
