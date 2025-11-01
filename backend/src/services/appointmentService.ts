import { AppointmentModel } from '../models/Appointment';
import { AppointmentNotificationModel } from '../models/AppointmentNotification';
import { 
  Appointment, 
  CreateAppointmentRequest, 
  UpdateAppointmentRequest,
  AppointmentFilters,
  AppointmentListResponse,
  AppointmentStats,
  AppointmentStatus,
  ReminderSettings
} from '../types/appointment';

export class AppointmentService {
  /**
   * Create a new appointment
   */
  static async createAppointment(
    userId: string, 
    data: CreateAppointmentRequest
  ): Promise<Appointment> {
    // Create the appointment
    const appointment = await AppointmentModel.create(userId, data);

    // Create notifications if reminder settings are provided
    if (data.reminderSettings && data.reminderSettings.enabled) {
      await AppointmentNotificationModel.createFromReminderSettings(
        appointment.id,
        new Date(data.appointmentDate),
        data.reminderSettings
      );
    }

    return appointment;
  }

  /**
   * Get appointment by ID
   */
  static async getAppointment(id: string, userId: string): Promise<Appointment | null> {
    return AppointmentModel.findById(id, userId);
  }

  /**
   * Update appointment
   */
  static async updateAppointment(
    id: string,
    userId: string,
    data: UpdateAppointmentRequest
  ): Promise<Appointment | null> {
    const existingAppointment = await AppointmentModel.findById(id, userId);
    if (!existingAppointment) {
      return null;
    }

    // Update the appointment
    const updatedAppointment = await AppointmentModel.update(id, userId, data);
    if (!updatedAppointment) {
      return null;
    }

    // If appointment date or reminder settings changed, reschedule notifications
    if (data.appointmentDate || data.reminderSettings) {
      const newDate = data.appointmentDate 
        ? new Date(data.appointmentDate) 
        : existingAppointment.appointmentDate;
      
      const reminderSettings = data.reminderSettings || existingAppointment.reminderSettings;
      
      if (reminderSettings) {
        await AppointmentNotificationModel.rescheduleForAppointment(
          id,
          newDate,
          reminderSettings
        );
      }
    }

    return updatedAppointment;
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(id: string, userId: string): Promise<Appointment | null> {
    const appointment = await AppointmentModel.updateStatus(id, userId, 'cancelled');
    
    if (appointment) {
      // Cancel pending notifications
      await AppointmentNotificationModel.cancelForAppointment(id);
    }

    return appointment;
  }

  /**
   * Delete appointment
   */
  static async deleteAppointment(id: string, userId: string): Promise<boolean> {
    const appointment = await AppointmentModel.findById(id, userId);
    if (!appointment) {
      return false;
    }

    // Delete notifications first
    await AppointmentNotificationModel.deleteForAppointment(id);
    
    // Delete appointment
    return AppointmentModel.delete(id, userId);
  }

  /**
   * Get appointments with filters and pagination
   */
  static async getAppointments(
    userId: string,
    filters: AppointmentFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<AppointmentListResponse> {
    return AppointmentModel.findMany(userId, filters, page, limit);
  }

  /**
   * Get upcoming appointments
   */
  static async getUpcomingAppointments(
    userId: string, 
    days: number = 30
  ): Promise<Appointment[]> {
    return AppointmentModel.getUpcoming(userId, days);
  }

  /**
   * Get appointment statistics
   */
  static async getAppointmentStats(userId: string): Promise<AppointmentStats> {
    return AppointmentModel.getStats(userId);
  }

  /**
   * Update appointment status
   */
  static async updateAppointmentStatus(
    id: string,
    userId: string,
    status: AppointmentStatus
  ): Promise<Appointment | null> {
    const appointment = await AppointmentModel.updateStatus(id, userId, status);
    
    // If appointment is completed or cancelled, cancel pending notifications
    if (appointment && (status === 'completed' || status === 'cancelled')) {
      await AppointmentNotificationModel.cancelForAppointment(id);
    }

    return appointment;
  }

  /**
   * Get appointments for calendar view
   */
  static async getAppointmentsForCalendar(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    return AppointmentModel.getByDateRange(userId, startDate, endDate);
  }

  /**
   * Search appointments
   */
  static async searchAppointments(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<Appointment[]> {
    return AppointmentModel.search(userId, query, limit);
  }

  /**
   * Reschedule appointment
   */
  static async rescheduleAppointment(
    id: string,
    userId: string,
    newDate: Date,
    notes?: string
  ): Promise<Appointment | null> {
    const existingAppointment = await AppointmentModel.findById(id, userId);
    if (!existingAppointment) {
      return null;
    }

    // Update appointment with new date and status
    const updatedAppointment = await AppointmentModel.update(id, userId, {
      appointmentDate: newDate.toISOString(),
      status: 'rescheduled',
      notes: notes || existingAppointment.notes,
    });

    if (updatedAppointment && existingAppointment.reminderSettings) {
      // Reschedule notifications
      await AppointmentNotificationModel.rescheduleForAppointment(
        id,
        newDate,
        existingAppointment.reminderSettings
      );
    }

    return updatedAppointment;
  }

  /**
   * Get today's appointments
   */
  static async getTodaysAppointments(userId: string): Promise<Appointment[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return AppointmentModel.getByDateRange(userId, startOfDay, endOfDay);
  }

  /**
   * Get appointments by department
   */
  static async getAppointmentsByDepartment(
    userId: string,
    department: string,
    limit: number = 10
  ): Promise<Appointment[]> {
    return AppointmentModel.findMany(
      userId,
      { department: [department] },
      1,
      limit
    ).then(response => response.appointments);
  }

  /**
   * Process pending notifications
   */
  static async processPendingNotifications(): Promise<void> {
    const pendingNotifications = await AppointmentNotificationModel.getPendingNotifications();
    
    for (const notification of pendingNotifications) {
      try {
        // Here you would integrate with actual notification services
        // For now, we'll just mark as sent
        await this.sendNotification(notification);
        
        await AppointmentNotificationModel.updateStatus(
          notification.id,
          'sent',
          new Date()
        );
      } catch (error) {
        await AppointmentNotificationModel.updateStatus(
          notification.id,
          'failed',
          undefined,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  }

  /**
   * Send notification (placeholder for actual implementation)
   */
  private static async sendNotification(notification: any): Promise<void> {
    // This would integrate with actual notification services like:
    // - Email service (SendGrid, AWS SES)
    // - SMS service (Twilio, AWS SNS)
    // - Push notification service (Firebase, OneSignal)
    // - In-app notification system
    
    console.log(`Sending ${notification.notificationType} notification:`, {
      appointmentId: notification.appointmentId,
      message: notification.message,
      scheduledTime: notification.scheduledTime,
    });
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Validate appointment data
   */
  static validateAppointmentData(data: CreateAppointmentRequest | UpdateAppointmentRequest): string[] {
    const errors: string[] = [];

    if ('hospitalName' in data && !data.hospitalName?.trim()) {
      errors.push('병원명은 필수입니다.');
    }

    if ('department' in data && !data.department?.trim()) {
      errors.push('진료과는 필수입니다.');
    }

    if ('appointmentDate' in data && data.appointmentDate) {
      const appointmentDate = new Date(data.appointmentDate);
      const now = new Date();
      
      if (appointmentDate < now) {
        errors.push('예약 날짜는 현재 시간 이후여야 합니다.');
      }
    }

    if ('duration' in data && data.duration !== undefined) {
      if (data.duration < 5 || data.duration > 480) {
        errors.push('예약 시간은 5분에서 8시간 사이여야 합니다.');
      }
    }

    return errors;
  }
}