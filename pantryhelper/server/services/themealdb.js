import axios from 'axios';

const THEMEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const API_KEY = '1'; // Free tier test key

/**
 * Search for meals by a single ingredient
 * @param {string} ingredient - The ingredient to search for
 * @returns {Promise<Array>} Array of simplified meal objects with id, name, and thumbnail
 */
export async function searchByIngredient(ingredient) {
  try {
    const response = await axios.get(`${THEMEALDB_BASE_URL}/filter.php`, {
      params: { i: ingredient.toLowerCase().trim() }
    });
    
    if (!response.data.meals) {
      return [];
    }
    
    return response.data.meals.map(meal => ({
      id: meal.idMeal,
      name: meal.strMeal,
      thumbnail: meal.strMealThumb
    }));
  } catch (error) {
    console.error(`Error searching TheMealDB for ingredient "${ingredient}":`, error.message);
    return [];
  }
}

/**
 * Get full meal details by ID
 * @param {string} mealId - The meal ID
 * @returns {Promise<Object|null>} Full meal object or null if not found
 */
export async function getMealDetails(mealId) {
  try {
    const response = await axios.get(`${THEMEALDB_BASE_URL}/lookup.php`, {
      params: { i: mealId }
    });
    
    if (!response.data.meals || response.data.meals.length === 0) {
      return null;
    }
    
    return response.data.meals[0];
  } catch (error) {
    console.error(`Error fetching meal details for ID ${mealId}:`, error.message);
    return null;
  }
}

/**
 * Parse TheMealDB meal object to extract ingredients list
 * @param {Object} meal - TheMealDB meal object
 * @returns {Array<string>} Array of ingredient strings (e.g., "2 cups flour")
 */
export function extractIngredients(meal) {
  const ingredients = [];
  
  // TheMealDB has up to 20 ingredient/measure pairs
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    
    if (ingredient && ingredient.trim()) {
      const measureText = measure && measure.trim() ? measure.trim() : '';
      ingredients.push(measureText ? `${measureText} ${ingredient}` : ingredient);
    }
  }
  
  return ingredients;
}

/**
 * Parse instructions text into array of steps
 * @param {string} instructions - Instructions text from TheMealDB
 * @returns {Array<string>} Array of instruction steps
 */
export function parseInstructions(instructions) {
  if (!instructions) return [];
  
  // Split by newlines first, then by periods if steps are on one line
  let steps = instructions
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // If we only got 1-2 steps, try splitting by sentence
  if (steps.length <= 2) {
    steps = instructions
      .split(/\.\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10) // Filter out very short fragments
      .map(s => s.endsWith('.') ? s : s + '.');
  }
  
  // Remove step numbers like "1.", "STEP 1:", etc.
  steps = steps.map(step => 
    step.replace(/^(STEP\s*)?\d+[\.):\s]+/i, '').trim()
  );
  
  return steps;
}

/**
 * Map TheMealDB meal object to app recipe schema
 * @param {Object} meal - TheMealDB meal object
 * @param {number} matchPercentage - Optional match percentage
 * @returns {Object} Recipe object matching app schema
 */
export function mapToRecipeSchema(meal, matchPercentage = null) {
  const ingredients = extractIngredients(meal);
  const instructions = parseInstructions(meal.strInstructions);
  
  return {
    title: meal.strMeal,
    description: meal.strCategory && meal.strArea 
      ? `${meal.strArea} ${meal.strCategory}` 
      : meal.strCategory || meal.strArea || 'Delicious recipe from TheMealDB',
    cookTime: null, // TheMealDB doesn't provide cook time
    servings: null, // TheMealDB doesn't provide servings
    difficulty: null, // TheMealDB doesn't provide difficulty
    ingredients,
    instructions,
    imageUrl: meal.strMealThumb,
    category: meal.strCategory,
    cuisine: meal.strArea,
    source: 'themealdb',
    externalId: meal.idMeal,
    matchPercentage: matchPercentage,
    sourceUrl: meal.strSource || null,
    youtubeUrl: meal.strYoutube || null
  };
}

/**
 * Search for meals by multiple ingredients (parallel queries, then deduplicate)
 * @param {Array<string>} ingredients - Array of ingredient names
 * @returns {Promise<Array>} Array of unique meal IDs with counts
 */
export async function searchMultipleIngredients(ingredients) {
  if (!ingredients || ingredients.length === 0) {
    return [];
  }
  
  // Limit to top 5 ingredients to avoid rate limiting
  const limitedIngredients = ingredients.slice(0, 5);
  console.log(`Searching TheMealDB for ${limitedIngredients.length} ingredients:`, limitedIngredients.join(', '));
  
  // Query TheMealDB for each ingredient in parallel (with error handling)
  const searchPromises = limitedIngredients.map(ing => 
    searchByIngredient(ing).catch(err => {
      console.error(`Failed to search for "${ing}":`, err.message);
      return []; // Return empty array on error
    })
  );
  const results = await Promise.all(searchPromises);
  
  // Count how many times each meal appears across all ingredient searches
  const mealCounts = new Map();
  
  results.forEach((meals, ingredientIndex) => {
    meals.forEach(meal => {
      if (!mealCounts.has(meal.id)) {
        mealCounts.set(meal.id, {
          id: meal.id,
          name: meal.name,
          thumbnail: meal.thumbnail,
          count: 0,
          matchedIngredients: []
        });
      }
      const entry = mealCounts.get(meal.id);
      entry.count++;
      entry.matchedIngredients.push(limitedIngredients[ingredientIndex]);
    });
  });
  
  // Convert to array and sort by count (most matches first)
  return Array.from(mealCounts.values()).sort((a, b) => b.count - a.count);
}

/**
 * Calculate match percentage between recipe ingredients and user ingredients
 * @param {Object} meal - TheMealDB meal object
 * @param {Array<string>} userIngredients - User's ingredient names
 * @returns {number} Percentage (0-100) of user ingredients found in recipe
 */
export function scoreRecipeMatch(meal, userIngredients) {
  const recipeIngredients = extractIngredients(meal).map(ing => 
    ing.toLowerCase().trim()
  );
  
  let matchCount = 0;
  
  userIngredients.forEach(userIng => {
    const userIngLower = userIng.toLowerCase().trim();
    // Check if user ingredient appears in any recipe ingredient
    const found = recipeIngredients.some(recipeIng => 
      recipeIng.includes(userIngLower) || userIngLower.includes(recipeIng.split(' ').pop())
    );
    if (found) matchCount++;
  });
  
  return Math.round((matchCount / userIngredients.length) * 100);
}

/**
 * Find best matching recipes from TheMealDB
 * @param {Array<string>} ingredients - User's ingredients
 * @param {number} minMatchPercent - Minimum match percentage (default 50)
 * @param {number} maxResults - Maximum number of results to return (default 10)
 * @returns {Promise<Array>} Array of recipe objects sorted by match percentage
 */
export async function findBestMatches(ingredients, minMatchPercent = 50, maxResults = 10) {
  if (!ingredients || ingredients.length === 0) {
    return [];
  }
  
  // Search and get candidate meals
  const candidateMeals = await searchMultipleIngredients(ingredients);
  
  if (candidateMeals.length === 0) {
    console.log('No candidate meals found from TheMealDB');
    return [];
  }
  
  console.log(`Found ${candidateMeals.length} candidate meals from TheMealDB`);
  
  // Fetch full details for top candidates (limit to 15 to avoid rate limiting)
  const topCandidates = candidateMeals.slice(0, Math.min(15, candidateMeals.length));
  const detailsPromises = topCandidates.map(meal => 
    getMealDetails(meal.id).catch(err => {
      console.error(`Failed to get details for meal ${meal.id}:`, err.message);
      return null; // Return null on error
    })
  );
  const detailedMeals = await Promise.all(detailsPromises);
  
  // Score and filter
  const scoredRecipes = detailedMeals
    .filter(meal => meal !== null)
    .map(meal => {
      const matchPercentage = scoreRecipeMatch(meal, ingredients);
      return {
        meal,
        matchPercentage
      };
    })
    .filter(item => item.matchPercentage >= minMatchPercent)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, maxResults)
    .map(item => mapToRecipeSchema(item.meal, item.matchPercentage));
  
  console.log(`Returning ${scoredRecipes.length} recipes with ${minMatchPercent}%+ match`);
  return scoredRecipes;
}
