import express from 'express';
import { HealthController } from '../controllers/healthController';
import { authenticateToken } from '../middleware/auth';
import { 
  validateVitalSign, 
  validateHealthJournal, 
  validateHealthRecordUpdate 
} from '../middleware/validation';

const router = express.Router();

// 모든 건강 데이터 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 바이탈 사인 관련 라우트 (요구사항 2.1, 2.2, 2.3, 2.4, 2.5)
router.post('/vitals', validateVitalSign, HealthController.createVitalSign);
router.get('/vitals', HealthController.getVitalSigns);
router.get('/vitals/trends', HealthController.getVitalSignTrends);

// 건강 일지 관련 라우트 (요구사항 3.1, 3.2, 3.3, 3.4, 3.5)
router.post('/journal', validateHealthJournal, HealthController.createHealthJournal);
router.get('/journal', HealthController.getHealthJournals);

// 건강 기록 수정/삭제 라우트 (요구사항 2.5)
router.put('/records/:recordId', validateHealthRecordUpdate, HealthController.updateHealthRecord);
router.delete('/records/:recordId', HealthController.deleteHealthRecord);

// 건강 데이터 대시보드 요약
router.get('/summary', HealthController.getHealthSummary);

export default router;