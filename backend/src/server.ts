import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import healthRoutes from './routes/health';
import medicalRoutes from './routes/medical';
import documentRoutes from './routes/documents';
import medicationRoutes from './routes/medication';
import notificationRoutes from './routes/notification';
import familyHistoryRoutes from './routes/familyHistory';
import appointmentRoutes from './routes/appointment';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Import Redis service
import { redisService } from './config/redis';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/family-history', familyHistoryRoutes);
app.use('/api/appointments', appointmentRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize Redis connection
async function initializeServices() {
  try {
    await redisService.connect();
    console.log('✅ Redis connection initialized');
  } catch (error) {
    console.warn('⚠️  Redis connection failed, continuing without cache:', error);
  }
}

// Start server
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await redisService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await redisService.disconnect();
  process.exit(0);
});

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;