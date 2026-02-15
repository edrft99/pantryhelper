import { useNavigate } from 'react-router-dom';
import { useImageUpload } from '../hooks/useImageUpload';
import PhotoCapture from '../components/PhotoCapture';

export default function HomePage() {
  const navigate = useNavigate();
  const { previews, scanning, error, selectImages, removeImage, scan, clear } = useImageUpload();

  const handleScan = async () => {
    const result = await scan();
    if (result?.ingredients) {
      navigate('/scan-results', { state: { ingredients: result.ingredients, previews } });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">What's in your kitchen?</h1>
        <p className="text-gray-500">Snap photos and we'll suggest recipes with what you have</p>
      </div>

      <PhotoCapture
        previews={previews}
        scanning={scanning}
        error={error}
        onSelect={selectImages}
        onRemove={removeImage}
        onScan={handleScan}
        onClear={clear}
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Snap photos', desc: 'Take pictures of your pantry, fridge, or countertop' },
            { step: '2', title: 'Review ingredients', desc: 'AI identifies what you have across all photos' },
            { step: '3', title: 'Get recipes', desc: 'Get meal ideas tailored to your ingredients' }
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="bg-emerald-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {item.step}
              </span>
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
