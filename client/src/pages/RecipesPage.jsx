import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useRecipes } from '../hooks/useRecipes';

export default function RecipesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { recipes, metadata, loading, error, generateRecipes, toggleFavorite, isFavorite } = useRecipes();
  const [generated, setGenerated] = useState(false);

  const ingredients = location.state?.ingredients || [];

  useEffect(() => {
    if (ingredients.length > 0 && !generated) {
      generateRecipes(ingredients);
      setGenerated(true);
    }
  }, [ingredients, generated, generateRecipes]);

  if (!ingredients.length && !recipes.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No ingredients provided. Scan an image or select ingredients from your pantry.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-emerald-600 font-medium hover:underline">
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipe Suggestions</h1>
          <p className="text-sm text-gray-500">Based on {ingredients.length} ingredients</p>
        </div>
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ing, i) => (
            <span key={i} className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full capitalize">
              {ing}
            </span>
          ))}
        </div>
      )}

      {loading && <LoadingSpinner message="Finding recipes..." />}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm">
          {error}
          <button onClick={() => generateRecipes(ingredients)} className="ml-2 underline font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Recipe metadata info banner */}
      {!loading && metadata && recipes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">
              Found {metadata.totalRecipes} recipe{metadata.totalRecipes !== 1 ? 's' : ''}
            </p>
            <p className="text-blue-700 mt-1">
              {metadata.themealdbCount > 0 && (
                <span>{metadata.themealdbCount} real recipe{metadata.themealdbCount !== 1 ? 's' : ''} from TheMealDB</span>
              )}
              {metadata.themealdbCount > 0 && metadata.aiCount > 0 && <span> + </span>}
              {metadata.aiCount > 0 && (
                <span>{metadata.aiCount} AI-generated suggestion{metadata.aiCount !== 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {!loading && recipes.length > 0 && (
        <div className="space-y-4">
          {recipes.map((recipe, i) => (
            <RecipeCard
              key={recipe.externalId || recipe.title || i}
              recipe={recipe}
              isFavorite={isFavorite(recipe)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
