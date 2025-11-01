import { MedicationModel } from '../models/Medication';

export interface NotificationPreferences {
  enableReminders: boolean;
  reminderMinutesBefore: number;
  enableInteractionAlerts: boolean;
  enableSideEffectReminders: boolean;
  notificationMethods: ('push' | 'email' | 'sms')[];
}

export interface MedicationNotification {
  id: string;
  userId: string;
  type: 'reminder' | 'interaction' | 'side_effect' | 'refill';
  title: string;
  message: string;
  medicationId?: string;
  scheduledFor: Date;
  sentAt?: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export class NotificationService {
  private static notifications: Map<string, MedicationNotification[]> = new Map();

  /**
   * 복약 알림 생성 (요구사항 6.2)
   */
  static async createMedicationReminders(userId: string): Promise<MedicationNotification[]> {
    const todaySchedule = await MedicationModel.getTodaySchedule(userId);
    const notifications: MedicationNotification[] = [];
    const now = new Date();

    for (const item of todaySchedule) {
      if (item.isTaken) continue; // 이미 복용한 약물은 제외

      const [hours, minutes] = item.schedule.scheduledTime.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // 복용 시간 15분 전 알림
      const reminderTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000);
      
      if (reminderTime > now) {
        const notification: MedicationNotification = {
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

      // 복용 시간이 지난 경우 지연 알림
      if (scheduledTime < now) {
        const overdueNotification: MedicationNotification = {
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

    // 사용자별 알림 저장
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.push(...notifications);
    this.notifications.set(userId, userNotifications);

    return notifications;
  }

  /**
   * 브라우저 푸시 알림 전송 (요구사항 6.2)
   */
  static async sendPushNotification(
    userId: string, 
    notification: MedicationNotification
  ): Promise<boolean> {
    try {
      // 실제 구현에서는 웹 푸시 API 또는 Firebase Cloud Messaging 사용
      console.log(`[PUSH] ${userId}: ${notification.title} - ${notification.message}`);
      
      // 알림 전송 시간 기록
      notification.sentAt = new Date();
      
      return true;
    } catch (error) {
      console.error('푸시 알림 전송 실패:', error);
      return false;
    }
  }

  /**
   * 이메일 알림 전송 (요구사항 6.2)
   */
  static async sendEmailNotification(
    userId: string,
    email: string,
    notification: MedicationNotification
  ): Promise<boolean> {
    try {
      // 실제 구현에서는 SendGrid, AWS SES 등 이메일 서비스 사용
      console.log(`[EMAIL] ${email}: ${notification.title} - ${notification.message}`);
      
      const emailContent = this.generateEmailContent(notification);
      // await emailService.send(email, notification.title, emailContent);
      
      notification.sentAt = new Date();
      return true;
    } catch (error) {
      console.error('이메일 알림 전송 실패:', error);
      return false;
    }
  }

  /**
   * SMS 알림 전송 (요구사항 6.2)
   */
  static async sendSMSNotification(
    userId: string,
    phoneNumber: string,
    notification: MedicationNotification
  ): Promise<boolean> {
    try {
      // 실제 구현에서는 Twilio, AWS SNS 등 SMS 서비스 사용
      console.log(`[SMS] ${phoneNumber}: ${notification.message}`);
      
      // SMS는 메시지 길이 제한이 있으므로 간단하게
      const smsMessage = `${notification.title}: ${notification.message}`;
      // await smsService.send(phoneNumber, smsMessage);
      
      notification.sentAt = new Date();
      return true;
    } catch (error) {
      console.error('SMS 알림 전송 실패:', error);
      return false;
    }
  }

  /**
   * 사용자의 모든 알림 조회
   */
  static getUserNotifications(userId: string): MedicationNotification[] {
    return this.notifications.get(userId) || [];
  }

  /**
   * 알림 읽음 처리
   */
  static markNotificationAsRead(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.isRead = true;
      return true;
    }
    
    return false;
  }

  /**
   * 읽지 않은 알림 개수
   */
  static getUnreadCount(userId: string): number {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter(n => !n.isRead).length;
  }

  /**
   * 약물 상호작용 경고 알림 생성
   */
  static async createInteractionAlert(
    userId: string,
    medicationName: string,
    interactionDescription: string
  ): Promise<MedicationNotification> {
    const notification: MedicationNotification = {
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

  /**
   * 약물 보충 알림 생성
   */
  static async createRefillReminder(
    userId: string,
    medicationName: string,
    daysRemaining: number
  ): Promise<MedicationNotification> {
    const priority = daysRemaining <= 3 ? 'high' : daysRemaining <= 7 ? 'medium' : 'low';
    
    const notification: MedicationNotification = {
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

  /**
   * 정기적인 알림 처리 (크론 작업용)
   */
  static async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    
    for (const [userId, notifications] of this.notifications.entries()) {
      for (const notification of notifications) {
        if (!notification.sentAt && notification.scheduledFor <= now) {
          // 알림 전송 (실제 구현에서는 사용자 설정에 따라)
          await this.sendPushNotification(userId, notification);
          
          // 이메일이나 SMS도 설정에 따라 전송
          // const userPreferences = await getUserNotificationPreferences(userId);
          // if (userPreferences.notificationMethods.includes('email')) {
          //   await this.sendEmailNotification(userId, userEmail, notification);
          // }
        }
      }
    }
  }

  /**
   * 이메일 내용 생성
   */
  private static generateEmailContent(notification: MedicationNotification): string {
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

  /**
   * 알림 통계
   */
  static getNotificationStats(userId: string): {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    const userNotifications = this.notifications.get(userId) || [];
    
    const stats = {
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.isRead).length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>
    };

    userNotifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
    });

    return stats;
  }

  /**
   * 오래된 알림 정리
   */
  static cleanupOldNotifications(daysOld: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    for (const [userId, notifications] of this.notifications.entries()) {
      const filteredNotifications = notifications.filter(
        notification => notification.scheduledFor > cutoffDate
      );
      this.notifications.set(userId, filteredNotifications);
    }
  }
}