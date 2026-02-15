import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { scanImage } from '../api/client';

export function useImageUpload() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const selectImages = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      setError(null);
      const newFiles = [];
      const newPreviews = [];

      for (const file of Array.from(selectedFiles)) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        });
        newFiles.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      }

      setFiles(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
    } catch (err) {
      setError('Failed to process one or more images');
    }
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const scan = async () => {
    if (files.length === 0) return null;

    try {
      setScanning(true);
      setError(null);

      const allIngredients = [];
      for (const file of files) {
        const result = await scanImage(file);
        if (result?.ingredients) {
          allIngredients.push(...result.ingredients);
        }
      }

      // Deduplicate by name (case-insensitive)
      const seen = new Set();
      const unique = allIngredients.filter(ing => {
        const key = ing.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return { ingredients: unique };
    } catch (err) {
      setError('Failed to scan images. Please try again.');
      return null;
    } finally {
      setScanning(false);
    }
  };

  const clear = () => {
    previews.forEach(p => URL.revokeObjectURL(p));
    setFiles([]);
    setPreviews([]);
    setError(null);
  };

  return { previews, files, scanning, error, selectImages, removeImage, scan, clear };
}
