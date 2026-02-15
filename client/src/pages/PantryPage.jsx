import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChefHat, Package } from 'lucide-react';
import { usePantry } from '../hooks/usePantry';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const categoryColors = {
  produce: 'bg-green-100 text-green-800',
  dairy: 'bg-blue-100 text-blue-800',
  protein: 'bg-red-100 text-red-800',
  grain: 'bg-amber-100 text-amber-800',
  condiment: 'bg-purple-100 text-purple-800',
  beverage: 'bg-cyan-100 text-cyan-800',
  frozen: 'bg-sky-100 text-sky-800',
  canned: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800'
};

export default function PantryPage() {
  const navigate = useNavigate();
  const { items, loading, addItems, deleteItem, clearAll } = usePantry();
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('other');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await addItems([{ name: newName.trim(), category: newCategory }]);
      setNewName('');
      toast.success('Item added');
    } catch {
      toast.error('Failed to add item');
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await deleteItem(id);
      toast.success(`Removed ${name}`);
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleGetRecipes = () => {
    const names = items.map(i => i.name);
    navigate('/recipes', { state: { ingredients: names } });
  };

  if (loading) return <LoadingSpinner message="Loading pantry..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Pantry</h1>
          <p className="text-sm text-gray-500">{items.length} items</p>
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (!confirm('Clear all items from your pantry?')) return;
                try {
                  await clearAll();
                  toast.success('Pantry cleared');
                } catch {
                  toast.error('Failed to clear pantry');
                }
              }}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
            <button
              onClick={handleGetRecipes}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <ChefHat className="w-4 h-4" /> Get Recipes
            </button>
          </div>
        )}
      </div>

      {/* Add item form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add an item..."
            className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {Object.keys(categoryColors).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:opacity-30 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Item list */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Your pantry is empty</p>
          <p className="text-sm text-gray-400 mt-1">Scan a photo or add items manually</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
              <span className="flex-1 text-sm font-medium text-gray-800 capitalize">{item.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[item.category] || categoryColors.other}`}>
                {item.category}
              </span>
              <span className="text-xs text-gray-400">
                {item.quantity} {item.unit}
              </span>
              <button
                onClick={() => handleDelete(item.id, item.name)}
                className="text-gray-400 hover:text-red-500 p-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
