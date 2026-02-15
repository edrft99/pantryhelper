import OpenAI from 'openai';

let openai;
function getClient() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

function parseJsonResponse(content) {
  const cleaned = content.trim().replace(/^```json?\n?/i, '').replace(/\n?```$/i, '');
  return JSON.parse(cleaned);
}

export async function detectIngredients(base64Image) {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a kitchen inventory assistant. Analyze the provided photo of a pantry, refrigerator, or food items. Identify every visible food ingredient. Return ONLY valid JSON in this exact format, no markdown fencing:
{
  "ingredients": [
    { "name": "eggs", "confidence": "high", "category": "protein" },
    { "name": "cheddar cheese", "confidence": "medium", "category": "dairy" }
  ]
}
Categories must be one of: produce, dairy, protein, grain, condiment, beverage, frozen, canned, other.
Confidence must be one of: high, medium, low.
Be specific (e.g., "red bell pepper" not just "pepper").
Only list food items, ignore non-food objects.`
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What food ingredients do you see in this image?' },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'high'
            }
          }
        ]
      }
    ],
    max_tokens: 1000,
    temperature: 0.2
  });

  return parseJsonResponse(response.choices[0].message.content);
}

export async function suggestRecipes(ingredientNames) {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a creative home chef. Given a list of available ingredients, suggest 3-5 practical recipes that primarily use those ingredients. You may include common pantry staples (salt, pepper, oil, butter, garlic) even if not listed. Return ONLY valid JSON in this exact format, no markdown fencing:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief one-sentence description",
      "cookTime": "25 minutes",
      "servings": 4,
      "difficulty": "easy",
      "ingredients": ["2 eggs", "1 cup flour"],
      "instructions": ["Step 1...", "Step 2..."]
    }
  ]
}
Difficulty must be one of: easy, medium, hard.
Keep instructions clear and concise. Prefer recipes that use more of the given ingredients. Vary the recipes in style.`
      },
      {
        role: 'user',
        content: `I have these ingredients available: ${ingredientNames.join(', ')}. What can I make?`
      }
    ],
    max_tokens: 2500,
    temperature: 0.7
  });

  return parseJsonResponse(response.choices[0].message.content);
}
