import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Package, ChefHat } from 'lucide-react';
import IngredientList from '../components/IngredientList';
import { usePantry } from '../hooks/usePantry';
import toast from 'react-hot-toast';

export default function ScanResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mergeIngredients } = usePantry();
  const [ingredients, setIngredients] = useState(
    () => (location.state?.ingredients || []).map(ing => ({ ...ing, selected: true }))
  );

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No scan results. Go back and scan an image first.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-emerald-600 font-medium hover:underline">
          Back to home
        </button>
      </div>
    );
  }

  const selected = ingredients.filter(i => i.selected !== false);

  const handleAddToPantry = async () => {
    if (selected.length === 0) return;
    try {
      await mergeIngredients(selected.map(i => ({ name: i.name, category: i.category })));
      toast.success(`Added ${selected.length} items to pantry`);
    } catch {
      toast.error('Failed to add items to pantry');
    }
  };

  const handleGetRecipes = () => {
    const names = selected.map(i => i.name);
    navigate('/recipes', { state: { ingredients: names } });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scan Results</h1>
        <p className="text-sm text-gray-500 mt-1">Review detected ingredients. Add or remove items, then choose an action.</p>
      </div>

      {location.state?.previews?.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {location.state.previews.map((src, i) => (
            <img key={i} src={src} alt={`Scanned ${i + 1}`} className="w-full aspect-square object-cover rounded-xl" />
          ))}
        </div>
      )}

      <IngredientList ingredients={ingredients} onChange={setIngredients} />

      <div className="flex gap-3">
        <button
          onClick={handleAddToPantry}
          disabled={selected.length === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 py-3 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <Package className="w-4 h-4" /> Add to Pantry
        </button>
        <button
          onClick={handleGetRecipes}
          disabled={selected.length === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-40 transition-colors"
        >
          <ChefHat className="w-4 h-4" /> Get Recipes
        </button>
      </div>
    </div>
  );
}
