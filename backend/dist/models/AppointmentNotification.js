"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentNotificationModel = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AppointmentNotificationModel {
    static async create(appointmentId, notificationType, scheduledTime, message) {
        const notification = await prisma.appointmentNotification.create({
            data: {
                appointmentId,
                notificationType,
                scheduledTime,
                message,
            },
        });
        return notification;
    }
    static async createFromReminderSettings(appointmentId, appointmentDate, reminderSettings) {
        if (!reminderSettings.enabled || !reminderSettings.notifications.length) {
            return [];
        }
        const notifications = [];
        for (const reminder of reminderSettings.notifications) {
            const scheduledTime = new Date(appointmentDate);
            scheduledTime.setMinutes(scheduledTime.getMinutes() - reminder.timeBeforeAppointment);
            if (scheduledTime > new Date()) {
                const notification = await this.create(appointmentId, reminder.type, scheduledTime, reminder.message);
                notifications.push(notification);
            }
        }
        return notifications;
    }
    static async getPendingNotifications() {
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
        return notifications;
    }
    static async updateStatus(id, status, sentAt, errorMessage) {
        const notification = await prisma.appointmentNotification.update({
            where: { id },
            data: {
                status,
                sentAt,
                errorMessage,
            },
        });
        return notification;
    }
    static async getByAppointmentId(appointmentId) {
        const notifications = await prisma.appointmentNotification.findMany({
            where: { appointmentId },
            orderBy: { scheduledTime: 'asc' },
        });
        return notifications;
    }
    static async cancelForAppointment(appointmentId) {
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
    static async deleteForAppointment(appointmentId) {
        const result = await prisma.appointmentNotification.deleteMany({
            where: { appointmentId },
        });
        return result.count;
    }
    static async rescheduleForAppointment(appointmentId, newAppointmentDate, reminderSettings) {
        await this.cancelForAppointment(appointmentId);
        return this.createFromReminderSettings(appointmentId, newAppointmentDate, reminderSettings);
    }
    static async getStats(appointmentId) {
        const where = appointmentId ? { appointmentId } : {};
        const [totalNotifications, pendingNotifications, sentNotifications, failedNotifications,] = await Promise.all([
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
    static async cleanup() {
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
exports.AppointmentNotificationModel = AppointmentNotificationModel;
//# sourceMappingURL=AppointmentNotification.js.map