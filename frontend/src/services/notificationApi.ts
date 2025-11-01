import { api } from './api';

export interface MedicationNotification {
  id: string;
  userId: string;
  type: 'reminder' | 'interaction' | 'side_effect' | 'refill';
  title: string;
  message: string;
  medicationId?: string;
  scheduledFor: string;
  sentAt?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export const notificationApi = {
  // 알림 조회 및 관리
  async getNotifications(): Promise<MedicationNotification[]> {
    const response = await api.get('/notifications');
    return response.data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  async getStats(): Promise<NotificationStats> {
    const response = await api.get('/notifications/stats');
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`);
  },

  // 복약 알림 생성
  async createMedicationReminders(): Promise<MedicationNotification[]> {
    const response = await api.post('/notifications/medication-reminders');
    return response.data;
  },

  // 특별 알림 생성
  async createInteractionAlert(medicationName: string, interactionDescription: string): Promise<MedicationNotification> {
    const response = await api.post('/notifications/interaction-alert', {
      medicationName,
      interactionDescription
    });
    return response.data;
  },

  async createRefillReminder(medicationName: string, daysRemaining: number): Promise<MedicationNotification> {
    const response = await api.post('/notifications/refill-reminder', {
      medicationName,
      daysRemaining
    });
    return response.data;
  },

  // 테스트 알림
  async testPushNotification(title?: string, message?: string): Promise<void> {
    await api.post('/notifications/test-push', { title, message });
  }
};

// 브라우저 푸시 알림 관리 클래스
export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  /**
   * 푸시 알림 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('알림 권한이 거부되었습니다.');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * 서비스 워커 등록
   */
  async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('이 브라우저는 서비스 워커를 지원하지 않습니다.');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('서비스 워커가 등록되었습니다:', this.registration);
      return true;
    } catch (error) {
      console.error('서비스 워커 등록 실패:', error);
      return false;
    }
  }

  /**
   * 즉시 알림 표시
   */
  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'medication-reminder',
      requireInteraction: true,
      ...options
    };

    if (this.registration) {
      // 서비스 워커를 통한 알림
      await this.registration.showNotification(title, defaultOptions);
    } else {
      // 직접 알림
      new Notification(title, defaultOptions);
    }
  }

  /**
   * 복약 알림 표시
   */
  async showMedicationReminder(medicationName: string, dosage: string, time: string): Promise<void> {
    await this.showNotification(`복약 알림: ${medicationName}`, {
      body: `${dosage} 복용 시간입니다 (${time})`,
      icon: '/medication-icon.png',
      actions: [
        {
          action: 'take',
          title: '복용 완료'
        },
        {
          action: 'snooze',
          title: '10분 후 알림'
        }
      ],
      data: {
        type: 'medication-reminder',
        medicationName,
        dosage,
        time
      }
    });
  }

  /**
   * 상호작용 경고 알림
   */
  async showInteractionAlert(medicationName: string, description: string): Promise<void> {
    await this.showNotification(`⚠️ 약물 상호작용 경고`, {
      body: `${medicationName}: ${description}`,
      icon: '/warning-icon.png',
      tag: 'interaction-warning',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: '자세히 보기'
        }
      ],
      data: {
        type: 'interaction-alert',
        medicationName,
        description
      }
    });
  }

  /**
   * 정기적인 알림 확인 및 표시
   */
  async checkAndShowScheduledNotifications(): Promise<void> {
    try {
      const notifications = await notificationApi.getNotifications();
      const now = new Date();

      for (const notification of notifications) {
        if (notification.isRead || notification.sentAt) continue;

        const scheduledTime = new Date(notification.scheduledFor);
        if (scheduledTime <= now) {
          if (notification.type === 'reminder') {
            // 복약 알림인 경우 특별한 형태로 표시
            const medicationMatch = notification.message.match(/^(.+?)\s+(.+?)\s+복용/);
            if (medicationMatch) {
              const [, medicationName, dosage] = medicationMatch;
              await this.showMedicationReminder(medicationName, dosage, '지금');
            } else {
              await this.showNotification(notification.title, {
                body: notification.message
              });
            }
          } else if (notification.type === 'interaction') {
            await this.showInteractionAlert('약물 상호작용', notification.message);
          } else {
            await this.showNotification(notification.title, {
              body: notification.message,
              tag: notification.type
            });
          }

          // 알림을 읽음 처리
          await notificationApi.markAsRead(notification.id);
        }
      }
    } catch (error) {
      console.error('예정된 알림 확인 실패:', error);
    }
  }

  /**
   * 알림 스케줄러 시작
   */
  startNotificationScheduler(): void {
    // 1분마다 알림 확인
    setInterval(() => {
      this.checkAndShowScheduledNotifications();
    }, 60000);

    // 즉시 한 번 확인
    this.checkAndShowScheduledNotifications();
  }

  /**
   * 초기화
   */
  async initialize(): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (hasPermission) {
      await this.registerServiceWorker();
      this.startNotificationScheduler();
    }
  }
}