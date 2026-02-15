import { useState } from 'react';
import { Clock, Users, ChefHat, Heart, ChevronDown, ChevronUp, ExternalLink, Youtube, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportRecipeToMealie } from '../api/client';

const difficultyColors = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700'
};

export default function RecipeCard({ recipe, isFavorite, onToggleFavorite }) {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [exportingToMealie, setExportingToMealie] = useState(false);

  const handleExportToMealie = async () => {
    setExportingToMealie(true);
    try {
      const result = await exportRecipeToMealie(recipe);
      if (result.success) {
        toast.success(`Recipe exported to Mealie successfully!`);
      } else {
        toast.error(result.error || 'Failed to export recipe to Mealie');
      }
    } catch (error) {
      console.error('Mealie export error:', error);
      toast.error('Failed to export recipe to Mealie. Check if Mealie is configured.');
    } finally {
      setExportingToMealie(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Recipe Image */}
      {recipe.imageUrl && !imageError && (
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          {/* Source Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              recipe.source === 'themealdb' 
                ? 'bg-blue-600 text-white' 
                : 'bg-purple-600 text-white'
            }`}>
              {recipe.source === 'themealdb' ? 'TheMealDB' : 'AI Generated'}
            </span>
          </div>
          {/* Match Percentage Badge */}
          {recipe.matchPercentage && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-600 text-white">
                {recipe.matchPercentage}% match
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Source badge for recipes without images */}
            {(!recipe.imageUrl || imageError) && (
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${
                recipe.source === 'themealdb' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {recipe.source === 'themealdb' ? 'TheMealDB' : 'AI Generated'}
              </span>
            )}
            <h3 className="font-bold text-gray-900 text-lg">{recipe.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{recipe.description}</p>
            
            {/* Category and Cuisine Tags */}
            {(recipe.category || recipe.cuisine) && (
              <div className="flex items-center gap-2 mt-2">
                {recipe.category && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {recipe.category}
                  </span>
                )}
                {recipe.cuisine && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {recipe.cuisine}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleExportToMealie}
              disabled={exportingToMealie}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to Mealie"
            >
              <Download className={`w-5 h-5 ${exportingToMealie ? 'text-gray-400 animate-pulse' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={() => onToggleFavorite(recipe)}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Add to favorites"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {recipe.matchPercentage && (!recipe.imageUrl || imageError) && (
            <span className="text-xs font-semibold text-green-600">
              {recipe.matchPercentage}% ingredient match
            </span>
          )}
          {recipe.cookTime && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" /> {recipe.cookTime}
            </span>
          )}
          {recipe.servings > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Users className="w-3.5 h-3.5" /> {recipe.servings} servings
            </span>
          )}
          {recipe.difficulty && (
            <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${difficultyColors[recipe.difficulty] || ''}`}>
              <ChefHat className="w-3.5 h-3.5" /> {recipe.difficulty}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-emerald-600 font-medium hover:text-emerald-700"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'Hide details' : 'View recipe'}
          </button>
          
          {/* External Links */}
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
              Source
            </a>
          )}
          {recipe.youtubeUrl && (
            <a
              href={recipe.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-red-600 font-medium hover:text-red-700"
            >
              <Youtube className="w-4 h-4" />
              Video
            </a>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50/50">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Ingredients</h4>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h4>
            <ol className="space-y-2">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-3">
                  <span className="bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
