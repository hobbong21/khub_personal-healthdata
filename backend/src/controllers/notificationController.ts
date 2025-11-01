import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
  /**
   * 사용자의 모든 알림 조회
   * GET /api/notifications
   */
  static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const notifications = NotificationService.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error('알림 조회 오류:', error);
      res.status(500).json({ error: '알림 조회 중 오류가 발생했습니다' });
    }
  }

  /**
   * 복약 알림 생성
   * POST /api/notifications/medication-reminders
   */
  static async createMedicationReminders(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const reminders = await NotificationService.createMedicationReminders(userId);
      res.status(201).json(reminders);
    } catch (error) {
      console.error('복약 알림 생성 오류:', error);
      res.status(500).json({ error: '복약 알림 생성 중 오류가 발생했습니다' });
    }
  }

  /**
   * 알림 읽음 처리
   * PUT /api/notifications/:id/read
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const notificationId = req.params.id;
      const success = NotificationService.markNotificationAsRead(userId, notificationId);
      
      if (success) {
        res.json({ message: '알림이 읽음 처리되었습니다' });
      } else {
        res.status(404).json({ error: '알림을 찾을 수 없습니다' });
      }
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error);
      res.status(500).json({ error: '알림 읽음 처리 중 오류가 발생했습니다' });
    }
  }

  /**
   * 읽지 않은 알림 개수 조회
   * GET /api/notifications/unread-count
   */
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const count = NotificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 오류:', error);
      res.status(500).json({ error: '읽지 않은 알림 개수 조회 중 오류가 발생했습니다' });
    }
  }

  /**
   * 알림 통계 조회
   * GET /api/notifications/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const stats = NotificationService.getNotificationStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('알림 통계 조회 오류:', error);
      res.status(500).json({ error: '알림 통계 조회 중 오류가 발생했습니다' });
    }
  }

  /**
   * 푸시 알림 전송 테스트
   * POST /api/notifications/test-push
   */
  static async testPushNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const { title, message } = req.body;
      
      const testNotification = {
        id: `test-${Date.now()}`,
        userId,
        type: 'reminder' as const,
        title: title || '테스트 알림',
        message: message || '푸시 알림 테스트입니다.',
        scheduledFor: new Date(),
        isRead: false,
        priority: 'medium' as const
      };

      const success = await NotificationService.sendPushNotification(userId, testNotification);
      
      if (success) {
        res.json({ message: '테스트 알림이 전송되었습니다' });
      } else {
        res.status(500).json({ error: '테스트 알림 전송에 실패했습니다' });
      }
    } catch (error) {
      console.error('테스트 알림 전송 오류:', error);
      res.status(500).json({ error: '테스트 알림 전송 중 오류가 발생했습니다' });
    }
  }

  /**
   * 상호작용 경고 알림 생성
   * POST /api/notifications/interaction-alert
   */
  static async createInteractionAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const { medicationName, interactionDescription } = req.body;
      
      if (!medicationName || !interactionDescription) {
        res.status(400).json({ error: '약물명과 상호작용 설명이 필요합니다' });
        return;
      }

      const alert = await NotificationService.createInteractionAlert(
        userId, 
        medicationName, 
        interactionDescription
      );
      
      // 즉시 푸시 알림 전송
      await NotificationService.sendPushNotification(userId, alert);
      
      res.status(201).json(alert);
    } catch (error) {
      console.error('상호작용 경고 생성 오류:', error);
      res.status(500).json({ error: '상호작용 경고 생성 중 오류가 발생했습니다' });
    }
  }

  /**
   * 약물 보충 알림 생성
   * POST /api/notifications/refill-reminder
   */
  static async createRefillReminder(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const { medicationName, daysRemaining } = req.body;
      
      if (!medicationName || daysRemaining === undefined) {
        res.status(400).json({ error: '약물명과 남은 일수가 필요합니다' });
        return;
      }

      const reminder = await NotificationService.createRefillReminder(
        userId, 
        medicationName, 
        daysRemaining
      );
      
      res.status(201).json(reminder);
    } catch (error) {
      console.error('보충 알림 생성 오류:', error);
      res.status(500).json({ error: '보충 알림 생성 중 오류가 발생했습니다' });
    }
  }
}