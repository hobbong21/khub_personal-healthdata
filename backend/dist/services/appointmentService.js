"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const Appointment_1 = require("../models/Appointment");
const AppointmentNotification_1 = require("../models/AppointmentNotification");
class AppointmentService {
    static async createAppointment(userId, data) {
        const appointment = await Appointment_1.AppointmentModel.create(userId, data);
        if (data.reminderSettings && data.reminderSettings.enabled) {
            await AppointmentNotification_1.AppointmentNotificationModel.createFromReminderSettings(appointment.id, new Date(data.appointmentDate), data.reminderSettings);
        }
        return appointment;
    }
    static async getAppointment(id, userId) {
        return Appointment_1.AppointmentModel.findById(id, userId);
    }
    static async updateAppointment(id, userId, data) {
        const existingAppointment = await Appointment_1.AppointmentModel.findById(id, userId);
        if (!existingAppointment) {
            return null;
        }
        const updatedAppointment = await Appointment_1.AppointmentModel.update(id, userId, data);
        if (!updatedAppointment) {
            return null;
        }
        if (data.appointmentDate || data.reminderSettings) {
            const newDate = data.appointmentDate
                ? new Date(data.appointmentDate)
                : existingAppointment.appointmentDate;
            const reminderSettings = data.reminderSettings || existingAppointment.reminderSettings;
            if (reminderSettings) {
                await AppointmentNotification_1.AppointmentNotificationModel.rescheduleForAppointment(id, newDate, reminderSettings);
            }
        }
        return updatedAppointment;
    }
    static async cancelAppointment(id, userId) {
        const appointment = await Appointment_1.AppointmentModel.updateStatus(id, userId, 'cancelled');
        if (appointment) {
            await AppointmentNotification_1.AppointmentNotificationModel.cancelForAppointment(id);
        }
        return appointment;
    }
    static async deleteAppointment(id, userId) {
        const appointment = await Appointment_1.AppointmentModel.findById(id, userId);
        if (!appointment) {
            return false;
        }
        await AppointmentNotification_1.AppointmentNotificationModel.deleteForAppointment(id);
        return Appointment_1.AppointmentModel.delete(id, userId);
    }
    static async getAppointments(userId, filters = {}, page = 1, limit = 20) {
        return Appointment_1.AppointmentModel.findMany(userId, filters, page, limit);
    }
    static async getUpcomingAppointments(userId, days = 30) {
        return Appointment_1.AppointmentModel.getUpcoming(userId, days);
    }
    static async getAppointmentStats(userId) {
        return Appointment_1.AppointmentModel.getStats(userId);
    }
    static async updateAppointmentStatus(id, userId, status) {
        const appointment = await Appointment_1.AppointmentModel.updateStatus(id, userId, status);
        if (appointment && (status === 'completed' || status === 'cancelled')) {
            await AppointmentNotification_1.AppointmentNotificationModel.cancelForAppointment(id);
        }
        return appointment;
    }
    static async getAppointmentsForCalendar(userId, startDate, endDate) {
        return Appointment_1.AppointmentModel.getByDateRange(userId, startDate, endDate);
    }
    static async searchAppointments(userId, query, limit = 10) {
        return Appointment_1.AppointmentModel.search(userId, query, limit);
    }
    static async rescheduleAppointment(id, userId, newDate, notes) {
        const existingAppointment = await Appointment_1.AppointmentModel.findById(id, userId);
        if (!existingAppointment) {
            return null;
        }
        const updatedAppointment = await Appointment_1.AppointmentModel.update(id, userId, {
            appointmentDate: newDate.toISOString(),
            status: 'rescheduled',
            notes: notes || existingAppointment.notes,
        });
        if (updatedAppointment && existingAppointment.reminderSettings) {
            await AppointmentNotification_1.AppointmentNotificationModel.rescheduleForAppointment(id, newDate, existingAppointment.reminderSettings);
        }
        return updatedAppointment;
    }
    static async getTodaysAppointments(userId) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        return Appointment_1.AppointmentModel.getByDateRange(userId, startOfDay, endOfDay);
    }
    static async getAppointmentsByDepartment(userId, department, limit = 10) {
        return Appointment_1.AppointmentModel.findMany(userId, { department: [department] }, 1, limit).then(response => response.appointments);
    }
    static async processPendingNotifications() {
        const pendingNotifications = await AppointmentNotification_1.AppointmentNotificationModel.getPendingNotifications();
        for (const notification of pendingNotifications) {
            try {
                await this.sendNotification(notification);
                await AppointmentNotification_1.AppointmentNotificationModel.updateStatus(notification.id, 'sent', new Date());
            }
            catch (error) {
                await AppointmentNotification_1.AppointmentNotificationModel.updateStatus(notification.id, 'failed', undefined, error instanceof Error ? error.message : 'Unknown error');
            }
        }
    }
    static async sendNotification(notification) {
        console.log(`Sending ${notification.notificationType} notification:`, {
            appointmentId: notification.appointmentId,
            message: notification.message,
            scheduledTime: notification.scheduledTime,
        });
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    static validateAppointmentData(data) {
        const errors = [];
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
exports.AppointmentService = AppointmentService;
//# sourceMappingURL=appointmentService.js.map