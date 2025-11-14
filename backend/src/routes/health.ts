import express from 'express';
import { getHealthSummary, getHealthData } from '../controllers/healthController';
import { authenticateToken } from '../middleware/auth';
import {
  validateVitalSign,
  validateHealthJournal,
  validateHealthRecordUpdate
} from '../middleware/validation';
import { cacheMiddleware, invalidateUserCache } from '../middleware/cache';

const router = express.Router();

// Apply authentication middleware to all health data routes
router.use(authenticateToken);

// Health data summary
router.get('/summary', cacheMiddleware(300), getHealthSummary);

// The following routes are commented out because their corresponding controller functions are not yet implemented.
// Uncomment them as you implement the controller logic.

// router.post('/vitals', validateVitalSign, HealthController.createVitalSign);
// router.get('/vitals', cacheMiddleware(300), HealthController.getVitalSigns);
// router.get('/vitals/trends', cacheMiddleware(600), HealthController.getVitalSignTrends);

// router.post('/journal', validateHealthJournal, HealthController.createHealthJournal);
// router.get('/journal', cacheMiddleware(300), HealthController.getHealthJournals);

// router.put('/records/:recordId', validateHealthRecordUpdate, HealthController.updateHealthRecord);
// router.delete('/records/:recordId', HealthController.deleteHealthRecord);

// router.get('/dashboard', cacheMiddleware(300), HealthController.getDashboardData);
// router.get('/dashboard/trends', cacheMiddleware(600), HealthController.getHealthTrends);
// router.get('/dashboard/goals', cacheMiddleware(300), HealthController.getGoalProgress);

export default router;
