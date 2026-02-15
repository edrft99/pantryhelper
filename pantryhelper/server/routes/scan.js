import { Router } from 'express';
import upload from '../middleware/upload.js';
import { detectIngredients } from '../services/openai.js';

const router = Router();

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const result = await detectIngredients(base64Image);

    res.json(result);
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: 'Failed to analyze image. ' + err.message });
  }
});

export default router;
