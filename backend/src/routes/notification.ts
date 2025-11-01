import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 알림 조회 및 관리
router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.get('/stats', NotificationController.getStats);
router.put('/:id/read', NotificationController.markAsRead);

// 복약 알림 생성
router.post('/medication-reminders', NotificationController.createMedicationReminders);

// 특별 알림 생성
router.post('/interaction-alert', NotificationController.createInteractionAlert);
router.post('/refill-reminder', NotificationController.createRefillReminder);

// 테스트 알림
router.post('/test-push', NotificationController.testPushNotification);

export default router;