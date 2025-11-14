import { AppointmentNotification, NotificationType, NotificationStatus, ReminderSettings } from '../types/appointment';
export declare class AppointmentNotificationModel {
    static create(appointmentId: string, notificationType: NotificationType, scheduledTime: Date, message?: string): Promise<AppointmentNotification>;
    static createFromReminderSettings(appointmentId: string, appointmentDate: Date, reminderSettings: ReminderSettings): Promise<AppointmentNotification[]>;
    static getPendingNotifications(): Promise<AppointmentNotification[]>;
    static updateStatus(id: string, status: NotificationStatus, sentAt?: Date, errorMessage?: string): Promise<AppointmentNotification | null>;
    static getByAppointmentId(appointmentId: string): Promise<AppointmentNotification[]>;
    static cancelForAppointment(appointmentId: string): Promise<number>;
    static deleteForAppointment(appointmentId: string): Promise<number>;
    static rescheduleForAppointment(appointmentId: string, newAppointmentDate: Date, reminderSettings: ReminderSettings): Promise<AppointmentNotification[]>;
    static getStats(appointmentId?: string): Promise<{
        totalNotifications: number;
        pendingNotifications: number;
        sentNotifications: number;
        failedNotifications: number;
    }>;
    static cleanup(): Promise<number>;
}
//# sourceMappingURL=AppointmentNotification.d.ts.map