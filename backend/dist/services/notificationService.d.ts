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
export declare class NotificationService {
    private static notifications;
    static createMedicationReminders(userId: string): Promise<MedicationNotification[]>;
    static sendPushNotification(userId: string, notification: MedicationNotification): Promise<boolean>;
    static sendEmailNotification(userId: string, email: string, notification: MedicationNotification): Promise<boolean>;
    static sendSMSNotification(userId: string, phoneNumber: string, notification: MedicationNotification): Promise<boolean>;
    static getUserNotifications(userId: string): MedicationNotification[];
    static markNotificationAsRead(userId: string, notificationId: string): boolean;
    static getUnreadCount(userId: string): number;
    static createInteractionAlert(userId: string, medicationName: string, interactionDescription: string): Promise<MedicationNotification>;
    static createRefillReminder(userId: string, medicationName: string, daysRemaining: number): Promise<MedicationNotification>;
    static processScheduledNotifications(): Promise<void>;
    private static generateEmailContent;
    static getNotificationStats(userId: string): {
        total: number;
        unread: number;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
    };
    static cleanupOldNotifications(daysOld?: number): void;
}
//# sourceMappingURL=notificationService.d.ts.map