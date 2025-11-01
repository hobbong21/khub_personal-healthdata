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
import genomicsRoutes from './routes/genomics';
import aiRoutes from './routes/ai';
import recommendationRoutes from './routes/recommendations';
import nlpRoutes from './routes/nlp';
import wearableRoutes from './routes/wearable';
import appleHealthRoutes from './routes/appleHealth';
import googleFitRoutes from './routes/googleFit';
import remoteMonitoringRoutes from './routes/remoteMonitoring';
import telehealthRoutes from './routes/telehealth';
import dataAnonymizationRoutes from './routes/dataAnonymization';
import researchParticipationRoutes from './routes/researchParticipation';
import incentiveManagementRoutes from './routes/incentiveManagement';
import performanceRoutes from './routes/performance';
import monitoringRoutes from './routes/monitoring';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { 
  generateRequestId, 
  recordStartTime, 
  logAPIRequest, 
  logErrors, 
  trackUserActivity,
  detectSecurityEvents,
  monitorRequestSize
} from './middleware/monitoring';

// Import Redis service
import { redisService } from './config/redis';
import { monitoringService } from './services/monitoringService';
import { loggingService } from './services/loggingService';

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

// Monitoring middleware
app.use(generateRequestId);
app.use(recordStartTime);
app.use(logAPIRequest);
app.use(trackUserActivity);
app.use(detectSecurityEvents);
app.use(monitorRequestSize());

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
app.use('/api/genomics', genomicsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/nlp', nlpRoutes);
app.use('/api/wearable', wearableRoutes);
app.use('/api/apple-health', appleHealthRoutes);
app.use('/api/google-fit', googleFitRoutes);
app.use('/api/remote-monitoring', remoteMonitoringRoutes);
app.use('/api/telehealth', telehealthRoutes);
app.use('/api/data-anonymization', dataAnonymizationRoutes);
app.use('/api/research', researchParticipationRoutes);
app.use('/api/incentives', incentiveManagementRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Error handling middleware
app.use(notFound);
app.use(logErrors);
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    await redisService.connect();
    console.log('✅ Redis connection initialized');
  } catch (error) {
    console.warn('⚠️  Redis connection failed, continuing without cache:', error);
  }

  // Start monitoring service
  try {
    monitoringService.startMonitoring(60000); // 1분 간격
    console.log('✅ Monitoring service started');
  } catch (error) {
    console.warn('⚠️  Monitoring service failed to start:', error);
  }

  // Log application startup
  loggingService.info('Health Platform application started', {
    port: PORT,
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
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
  
  // Stop monitoring
  monitoringService.stopMonitoring();
  
  // Disconnect services
  await redisService.disconnect();
  loggingService.close();
  
  console.log('✅ Graceful shutdown completed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  
  // Stop monitoring
  monitoringService.stopMonitoring();
  
  // Disconnect services
  await redisService.disconnect();
  loggingService.close();
  
  console.log('✅ Graceful shutdown completed');
  process.exit(0);
});

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;