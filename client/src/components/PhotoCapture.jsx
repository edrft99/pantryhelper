import { useRef } from 'react';
import { Camera, Upload, X, Loader2, Plus, ImagePlus } from 'lucide-react';

export default function PhotoCapture({ onScan, previews, scanning, error, onSelect, onRemove, onClear }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files?.length) onSelect(files);
    e.target.value = '';
  };

  const hasImages = previews.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {hasImages ? (
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">{previews.length} image{previews.length > 1 ? 's' : ''} selected</span>
            <button
              onClick={onClear}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => onRemove(i)}
                  className="absolute top-1.5 right-1.5 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {/* Add more button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-emerald-600 hover:border-emerald-400 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Add more</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 flex flex-col items-center gap-4 bg-gradient-to-b from-emerald-50 to-white">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <ImagePlus className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Scan Your Food</h3>
            <p className="text-sm text-gray-500 mt-1">Take photos or upload images of your pantry and fridge</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              <Camera className="w-4 h-4" /> Take Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
        </div>
      )}

      {hasImages && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onScan}
            disabled={scanning}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {scanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing {previews.length} image{previews.length > 1 ? 's' : ''}...
              </>
            ) : (
              `Identify Ingredients (${previews.length} image${previews.length > 1 ? 's' : ''})`
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="px-4 pb-4">
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
