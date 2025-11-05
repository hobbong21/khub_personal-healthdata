import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  });
});

app.get('/api/health/dashboard', (_req, res) => {
  res.json({
    success: true,
    data: {
      summary: { totalRecords: 10, lastUpdate: new Date().toISOString() },
      recentTrends: { weight: [], bloodPressure: [] },
      goals: { weightGoal: 68, exerciseGoal: 150 },
      todos: [
        { id: 1, task: '혈압 측정', completed: false },
        { id: 2, task: '운동 30분', completed: true }
      ]
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      success: true,
      token: 'mock-token',
      user: { id: '1', email, name: 'Test User' }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
