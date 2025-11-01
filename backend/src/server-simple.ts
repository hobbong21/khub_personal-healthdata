import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Personal Health Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// Basic user routes (simplified)
app.get('/api/users/profile', (req, res) => {
  res.json({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    message: 'Profile endpoint working'
  });
});

// Basic health data routes
app.get('/api/health-data', (req, res) => {
  res.json({
    vitals: [],
    message: 'Health data endpoint working'
  });
});

// Basic medical records routes
app.get('/api/medical-records', (req, res) => {
  res.json({
    records: [],
    message: 'Medical records endpoint working'
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});