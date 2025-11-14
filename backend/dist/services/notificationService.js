"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const Medication_1 = require("../models/Medication");
class NotificationService {
    static async createMedicationReminders(userId) {
        const todaySchedule = await Medication_1.MedicationModel.getTodaySchedule(userId);
        const notifications = [];
        const now = new Date();
        for (const item of todaySchedule) {
            if (item.isTaken)
                continue;
            const [hours, minutes] = item.schedule.scheduledTime.split(':').map(Number);
            const scheduledTime = new Date();
            scheduledTime.setHours(hours, minutes, 0, 0);
            const reminderTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000);
            if (reminderTime > now) {
                const notification = {
                    id: `reminder-${item.medicationId}-${item.schedule.id}`,
                    userId,
                    type: 'reminder',
                    title: '복약 알림',
                    message: `${item.medicationName} ${item.schedule.dosage} 복용 시간입니다 (${item.schedule.scheduledTime})`,
                    medicationId: item.medicationId,
                    scheduledFor: reminderTime,
                    isRead: false,
                    priority: 'medium'
                };
                notifications.push(notification);
            }
            if (scheduledTime < now) {
                const overdueNotification = {
                    id: `overdue-${item.medicationId}-${item.schedule.id}`,
                    userId,
                    type: 'reminder',
                    title: '복약 지연 알림',
                    message: `${item.medicationName} 복용이 지연되었습니다. 지금 복용하세요.`,
                    medicationId: item.medicationId,
                    scheduledFor: now,
                    isRead: false,
                    priority: 'high'
                };
                notifications.push(overdueNotification);
            }
        }
        const userNotifications = this.notifications.get(userId) || [];
        userNotifications.push(...notifications);
        this.notifications.set(userId, userNotifications);
        return notifications;
    }
    static async sendPushNotification(userId, notification) {
        try {
            console.log(`[PUSH] ${userId}: ${notification.title} - ${notification.message}`);
            notification.sentAt = new Date();
            return true;
        }
        catch (error) {
            console.error('푸시 알림 전송 실패:', error);
            return false;
        }
    }
    static async sendEmailNotification(userId, email, notification) {
        try {
            console.log(`[EMAIL] ${email}: ${notification.title} - ${notification.message}`);
            const emailContent = this.generateEmailContent(notification);
            notification.sentAt = new Date();
            return true;
        }
        catch (error) {
            console.error('이메일 알림 전송 실패:', error);
            return false;
        }
    }
    static async sendSMSNotification(userId, phoneNumber, notification) {
        try {
            console.log(`[SMS] ${phoneNumber}: ${notification.message}`);
            const smsMessage = `${notification.title}: ${notification.message}`;
            notification.sentAt = new Date();
            return true;
        }
        catch (error) {
            console.error('SMS 알림 전송 실패:', error);
            return false;
        }
    }
    static getUserNotifications(userId) {
        return this.notifications.get(userId) || [];
    }
    static markNotificationAsRead(userId, notificationId) {
        const userNotifications = this.notifications.get(userId) || [];
        const notification = userNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            return true;
        }
        return false;
    }
    static getUnreadCount(userId) {
        const userNotifications = this.notifications.get(userId) || [];
        return userNotifications.filter(n => !n.isRead).length;
    }
    static async createInteractionAlert(userId, medicationName, interactionDescription) {
        const notification = {
            id: `interaction-${Date.now()}`,
            userId,
            type: 'interaction',
            title: '약물 상호작용 경고',
            message: `${medicationName}에 대한 상호작용이 발견되었습니다: ${interactionDescription}`,
            scheduledFor: new Date(),
            isRead: false,
            priority: 'urgent'
        };
        const userNotifications = this.notifications.get(userId) || [];
        userNotifications.push(notification);
        this.notifications.set(userId, userNotifications);
        return notification;
    }
    static async createRefillReminder(userId, medicationName, daysRemaining) {
        const priority = daysRemaining <= 3 ? 'high' : daysRemaining <= 7 ? 'medium' : 'low';
        const notification = {
            id: `refill-${Date.now()}`,
            userId,
            type: 'refill',
            title: '약물 보충 알림',
            message: `${medicationName} 복용 종료까지 ${daysRemaining}일 남았습니다. 처방전을 준비하세요.`,
            scheduledFor: new Date(),
            isRead: false,
            priority
        };
        const userNotifications = this.notifications.get(userId) || [];
        userNotifications.push(notification);
        this.notifications.set(userId, userNotifications);
        return notification;
    }
    static async processScheduledNotifications() {
        const now = new Date();
        for (const [userId, notifications] of this.notifications.entries()) {
            for (const notification of notifications) {
                if (!notification.sentAt && notification.scheduledFor <= now) {
                    await this.sendPushNotification(userId, notification);
                }
            }
        }
    }
    static generateEmailContent(notification) {
        return `
      <html>
        <body>
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          
          ${notification.type === 'reminder' ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>복약 안내</h3>
              <p>정확한 복용을 위해 다음 사항을 확인하세요:</p>
              <ul>
                <li>처방된 용량과 시간을 지켜주세요</li>
                <li>물과 함께 복용하세요</li>
                <li>부작용이 있으면 즉시 의사와 상담하세요</li>
              </ul>
            </div>
          ` : ''}
          
          ${notification.type === 'interaction' ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
              <h3>⚠️ 중요한 안전 정보</h3>
              <p>약물 상호작용이 발견되었습니다. 즉시 의사나 약사와 상담하시기 바랍니다.</p>
            </div>
          ` : ''}
          
          <hr>
          <p style="color: #6c757d; font-size: 12px;">
            이 알림은 개인 건강 플랫폼에서 자동으로 발송되었습니다.<br>
            알림 설정을 변경하려면 앱의 설정 메뉴를 확인하세요.
          </p>
        </body>
      </html>
    `;
    }
    static getNotificationStats(userId) {
        const userNotifications = this.notifications.get(userId) || [];
        const stats = {
            total: userNotifications.length,
            unread: userNotifications.filter(n => !n.isRead).length,
            byType: {},
            byPriority: {}
        };
        userNotifications.forEach(notification => {
            stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
            stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
        });
        return stats;
    }
    static cleanupOldNotifications(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        for (const [userId, notifications] of this.notifications.entries()) {
            const filteredNotifications = notifications.filter(notification => notification.scheduledFor > cutoffDate);
            this.notifications.set(userId, filteredNotifications);
        }
    }
}
exports.NotificationService = NotificationService;
NotificationService.notifications = new Map();
//# sourceMappingURL=notificationService.js.map