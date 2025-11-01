import { PrismaClient } from '@prisma/client';
import { 
  AppointmentNotification, 
  NotificationType, 
  NotificationStatus,
  ReminderSettings
} from '../types/appointment';

const prisma = new PrismaClient();

export class AppointmentNotificationModel {
  /**
   * Create notification for appointment
   */
  static async create(
    appointmentId: string,
    notificationType: NotificationType,
    scheduledTime: Date,
    message?: string
  ): Promise<AppointmentNotification> {
    const notification = await prisma.appointmentNotification.create({
      data: {
        appointmentId,
        notificationType,
        scheduledTime,
        message,
      },
    });

    return notification as AppointmentNotification;
  }

  /**
   * Create notifications based on reminder settings
   */
  static async createFromReminderSettings(
    appointmentId: string,
    appointmentDate: Date,
    reminderSettings: ReminderSettings
  ): Promise<AppointmentNotification[]> {
    if (!reminderSettings.enabled || !reminderSettings.notifications.length) {
      return [];
    }

    const notifications: AppointmentNotification[] = [];

    for (const reminder of reminderSettings.notifications) {
      const scheduledTime = new Date(appointmentDate);
      scheduledTime.setMinutes(scheduledTime.getMinutes() - reminder.timeBeforeAppointment);

      // Only create notification if scheduled time is in the future
      if (scheduledTime > new Date()) {
        const notification = await this.create(
          appointmentId,
          reminder.type,
          scheduledTime,
          reminder.message
        );
        notifications.push(notification);
      }
    }

    return notifications;
  }

  /**
   * Get pending notifications that should be sent
   */
  static async getPendingNotifications(): Promise<AppointmentNotification[]> {
    const now = new Date();
    
    const notifications = await prisma.appointmentNotification.findMany({
      where: {
        status: 'pending',
        scheduledTime: {
          lte: now,
        },
      },
      include: {
        appointment: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { scheduledTime: 'asc' },
    });

    return notifications as AppointmentNotification[];
  }

  /**
   * Update notification status
   */
  static async updateStatus(
    id: string,
    status: NotificationStatus,
    sentAt?: Date,
    errorMessage?: string
  ): Promise<AppointmentNotification | null> {
    const notification = await prisma.appointmentNotification.update({
      where: { id },
      data: {
        status,
        sentAt,
        errorMessage,
      },
    });

    return notification as AppointmentNotification;
  }

  /**
   * Get notifications for appointment
   */
  static async getByAppointmentId(appointmentId: string): Promise<AppointmentNotification[]> {
    const notifications = await prisma.appointmentNotification.findMany({
      where: { appointmentId },
      orderBy: { scheduledTime: 'asc' },
    });

    return notifications as AppointmentNotification[];
  }

  /**
   * Cancel all pending notifications for appointment
   */
  static async cancelForAppointment(appointmentId: string): Promise<number> {
    const result = await prisma.appointmentNotification.updateMany({
      where: {
        appointmentId,
        status: 'pending',
      },
      data: {
        status: 'cancelled',
      },
    });

    return result.count;
  }

  /**
   * Delete notifications for appointment
   */
  static async deleteForAppointment(appointmentId: string): Promise<number> {
    const result = await prisma.appointmentNotification.deleteMany({
      where: { appointmentId },
    });

    return result.count;
  }

  /**
   * Reschedule notifications for appointment
   */
  static async rescheduleForAppointment(
    appointmentId: string,
    newAppointmentDate: Date,
    reminderSettings: ReminderSettings
  ): Promise<AppointmentNotification[]> {
    // Cancel existing pending notifications
    await this.cancelForAppointment(appointmentId);

    // Create new notifications
    return this.createFromReminderSettings(
      appointmentId,
      newAppointmentDate,
      reminderSettings
    );
  }

  /**
   * Get notification statistics
   */
  static async getStats(appointmentId?: string) {
    const where = appointmentId ? { appointmentId } : {};

    const [
      totalNotifications,
      pendingNotifications,
      sentNotifications,
      failedNotifications,
    ] = await Promise.all([
      prisma.appointmentNotification.count({ where }),
      prisma.appointmentNotification.count({ 
        where: { ...where, status: 'pending' } 
      }),
      prisma.appointmentNotification.count({ 
        where: { ...where, status: 'sent' } 
      }),
      prisma.appointmentNotification.count({ 
        where: { ...where, status: 'failed' } 
      }),
    ]);

    return {
      totalNotifications,
      pendingNotifications,
      sentNotifications,
      failedNotifications,
    };
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  static async cleanup(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.appointmentNotification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
        status: {
          in: ['sent', 'failed', 'cancelled'],
        },
      },
    });

    return result.count;
  }
}