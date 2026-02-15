import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';

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

export default function IngredientList({ ingredients, onChange }) {
  const [newItem, setNewItem] = useState('');

  const toggleIngredient = (index) => {
    const updated = ingredients.map((ing, i) =>
      i === index ? { ...ing, selected: !ing.selected } : ing
    );
    onChange(updated);
  };

  const removeIngredient = (index) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    if (!newItem.trim()) return;
    onChange([...ingredients, { name: newItem.trim(), confidence: 'manual', category: 'other', selected: true }]);
    setNewItem('');
  };

  const selectedCount = ingredients.filter(i => i.selected !== false).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Detected Ingredients</h3>
        <span className="text-sm text-gray-500">{selectedCount} selected</span>
      </div>

      <div className="p-3 space-y-1.5 max-h-96 overflow-y-auto">
        {ingredients.map((ing, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer ${
              ing.selected !== false ? 'bg-emerald-50' : 'bg-gray-50 opacity-60'
            }`}
            onClick={() => toggleIngredient(index)}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
              ing.selected !== false
                ? 'bg-emerald-600 border-emerald-600'
                : 'border-gray-300 bg-white'
            }`}>
              {ing.selected !== false && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="flex-1 text-sm font-medium text-gray-800 capitalize">{ing.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[ing.category] || categoryColors.other}`}>
              {ing.category}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); removeIngredient(index); }}
              className="text-gray-400 hover:text-red-500 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
          placeholder="Add missing ingredient..."
          className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          onClick={addIngredient}
          disabled={!newItem.trim()}
          className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:opacity-30 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
