import { Heart } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useRecipes } from '../hooks/useRecipes';

export default function FavoritesPage() {
  const { favorites, toggleFavorite, isFavorite } = useRecipes();

  if (!favorites) return <LoadingSpinner message="Loading favorites..." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
        <p className="text-sm text-gray-500">{favorites.length} saved recipes</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No favorites yet</p>
          <p className="text-sm text-gray-400 mt-1">Save recipes you love by tapping the heart icon</p>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={isFavorite(recipe.title)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
