import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Plus, ImagePlus, Check } from 'lucide-react';

export default function PhotoCapture({ onScan, previews, scanning, error, onSelect, onRemove, onClear }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setPhotoCount(0);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      // Fallback to file input with capture attribute
      cameraInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onSelect([file]);
        setPhotoCount(prev => prev + 1);
      }
    }, 'image/jpeg', 0.85);
  };

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
              onClick={startCamera}
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
      <canvas ref={canvasRef} className="hidden" />

      {cameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="flex-1 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 bg-gradient-to-t from-black/80 to-transparent">
            {photoCount > 0 && (
              <div className="text-center mb-3">
                <span className="text-white/80 text-sm bg-white/20 px-3 py-1 rounded-full">
                  {photoCount} photo{photoCount > 1 ? 's' : ''} taken
                </span>
              </div>
            )}
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={stopCamera}
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white"
              >
                <Check className="w-6 h-6" />
              </button>
              <button
                onClick={capturePhoto}
                className="rounded-full border-4 border-white bg-white/20 flex items-center justify-center active:bg-white/40 transition-colors"
                style={{ width: '72px', height: '72px' }}
              >
                <div className="rounded-full bg-white" style={{ width: '56px', height: '56px' }} />
              </button>
              <div className="w-12 h-12" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
