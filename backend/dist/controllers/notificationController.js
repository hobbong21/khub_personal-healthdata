"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../services/notificationService");
class NotificationController {
    static async getNotifications(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const notifications = notificationService_1.NotificationService.getUserNotifications(userId);
            res.json(notifications);
        }
        catch (error) {
            console.error('알림 조회 오류:', error);
            res.status(500).json({ error: '알림 조회 중 오류가 발생했습니다' });
        }
    }
    static async createMedicationReminders(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const reminders = await notificationService_1.NotificationService.createMedicationReminders(userId);
            res.status(201).json(reminders);
        }
        catch (error) {
            console.error('복약 알림 생성 오류:', error);
            res.status(500).json({ error: '복약 알림 생성 중 오류가 발생했습니다' });
        }
    }
    static async markAsRead(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const notificationId = req.params.id;
            const success = notificationService_1.NotificationService.markNotificationAsRead(userId, notificationId);
            if (success) {
                res.json({ message: '알림이 읽음 처리되었습니다' });
            }
            else {
                res.status(404).json({ error: '알림을 찾을 수 없습니다' });
            }
        }
        catch (error) {
            console.error('알림 읽음 처리 오류:', error);
            res.status(500).json({ error: '알림 읽음 처리 중 오류가 발생했습니다' });
        }
    }
    static async getUnreadCount(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const count = notificationService_1.NotificationService.getUnreadCount(userId);
            res.json({ count });
        }
        catch (error) {
            console.error('읽지 않은 알림 개수 조회 오류:', error);
            res.status(500).json({ error: '읽지 않은 알림 개수 조회 중 오류가 발생했습니다' });
        }
    }
    static async getStats(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const stats = notificationService_1.NotificationService.getNotificationStats(userId);
            res.json(stats);
        }
        catch (error) {
            console.error('알림 통계 조회 오류:', error);
            res.status(500).json({ error: '알림 통계 조회 중 오류가 발생했습니다' });
        }
    }
    static async testPushNotification(req, res) {
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
                type: 'reminder',
                title: title || '테스트 알림',
                message: message || '푸시 알림 테스트입니다.',
                scheduledFor: new Date(),
                isRead: false,
                priority: 'medium'
            };
            const success = await notificationService_1.NotificationService.sendPushNotification(userId, testNotification);
            if (success) {
                res.json({ message: '테스트 알림이 전송되었습니다' });
            }
            else {
                res.status(500).json({ error: '테스트 알림 전송에 실패했습니다' });
            }
        }
        catch (error) {
            console.error('테스트 알림 전송 오류:', error);
            res.status(500).json({ error: '테스트 알림 전송 중 오류가 발생했습니다' });
        }
    }
    static async createInteractionAlert(req, res) {
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
            const alert = await notificationService_1.NotificationService.createInteractionAlert(userId, medicationName, interactionDescription);
            await notificationService_1.NotificationService.sendPushNotification(userId, alert);
            res.status(201).json(alert);
        }
        catch (error) {
            console.error('상호작용 경고 생성 오류:', error);
            res.status(500).json({ error: '상호작용 경고 생성 중 오류가 발생했습니다' });
        }
    }
    static async createRefillReminder(req, res) {
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
            const reminder = await notificationService_1.NotificationService.createRefillReminder(userId, medicationName, daysRemaining);
            res.status(201).json(reminder);
        }
        catch (error) {
            console.error('보충 알림 생성 오류:', error);
            res.status(500).json({ error: '보충 알림 생성 중 오류가 발생했습니다' });
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notificationController.js.map