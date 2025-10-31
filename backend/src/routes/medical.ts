import express from 'express';

const router = express.Router();

// Placeholder routes for medical records
router.get('/records', (_req, res) => {
  res.json({ message: 'Get medical records endpoint - to be implemented' });
});

router.post('/records', (_req, res) => {
  res.json({ message: 'Create medical record endpoint - to be implemented' });
});

router.get('/appointments', (_req, res) => {
  res.json({ message: 'Get appointments endpoint - to be implemented' });
});

router.post('/appointments', (_req, res) => {
  res.json({ message: 'Create appointment endpoint - to be implemented' });
});

export default router;