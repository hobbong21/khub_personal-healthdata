"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentModel = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AppointmentModel {
    static async create(userId, data) {
        const appointment = await prisma.appointment.create({
            data: {
                userId,
                hospitalName: data.hospitalName,
                department: data.department,
                doctorName: data.doctorName,
                appointmentType: data.appointmentType,
                purpose: data.purpose,
                appointmentDate: new Date(data.appointmentDate),
                duration: data.duration,
                location: data.location,
                notes: data.notes,
                hospitalPhone: data.hospitalPhone,
                hospitalAddress: data.hospitalAddress,
                reminderSettings: data.reminderSettings || null,
            },
        });
        return appointment;
    }
    static async findById(id, userId) {
        const appointment = await prisma.appointment.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                notifications: true,
            },
        });
        return appointment;
    }
    static async update(id, userId, data) {
        const updateData = { ...data };
        if (data.appointmentDate) {
            updateData.appointmentDate = new Date(data.appointmentDate);
        }
        const appointment = await prisma.appointment.updateMany({
            where: {
                id,
                userId,
            },
            data: updateData,
        });
        if (appointment.count === 0) {
            return null;
        }
        return this.findById(id, userId);
    }
    static async delete(id, userId) {
        const result = await prisma.appointment.deleteMany({
            where: {
                id,
                userId,
            },
        });
        return result.count > 0;
    }
    static async findMany(userId, filters = {}, page = 1, limit = 20) {
        const where = { userId };
        if (filters.status && filters.status.length > 0) {
            where.status = { in: filters.status };
        }
        if (filters.department && filters.department.length > 0) {
            where.department = { in: filters.department };
        }
        if (filters.appointmentType && filters.appointmentType.length > 0) {
            where.appointmentType = { in: filters.appointmentType };
        }
        if (filters.dateFrom || filters.dateTo) {
            where.appointmentDate = {};
            if (filters.dateFrom) {
                where.appointmentDate.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.appointmentDate.lte = new Date(filters.dateTo);
            }
        }
        if (filters.hospitalName) {
            where.hospitalName = { contains: filters.hospitalName, mode: 'insensitive' };
        }
        if (filters.doctorName) {
            where.doctorName = { contains: filters.doctorName, mode: 'insensitive' };
        }
        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                orderBy: { appointmentDate: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    notifications: true,
                },
            }),
            prisma.appointment.count({ where }),
        ]);
        return {
            appointments: appointments,
            total,
            page,
            limit,
        };
    }
    static async getUpcoming(userId, days = 30) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + days);
        const appointments = await prisma.appointment.findMany({
            where: {
                userId,
                appointmentDate: {
                    gte: now,
                    lte: futureDate,
                },
                status: {
                    in: ['scheduled', 'confirmed'],
                },
            },
            orderBy: { appointmentDate: 'asc' },
            include: {
                notifications: true,
            },
        });
        return appointments;
    }
    static async getStats(userId) {
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        const [totalAppointments, upcomingAppointments, completedAppointments, cancelledAppointments, appointmentsByDepartment, appointmentsByMonth,] = await Promise.all([
            prisma.appointment.count({
                where: { userId },
            }),
            prisma.appointment.count({
                where: {
                    userId,
                    appointmentDate: { gte: now },
                    status: { in: ['scheduled', 'confirmed'] },
                },
            }),
            prisma.appointment.count({
                where: {
                    userId,
                    status: 'completed',
                },
            }),
            prisma.appointment.count({
                where: {
                    userId,
                    status: 'cancelled',
                },
            }),
            prisma.appointment.groupBy({
                by: ['department'],
                where: {
                    userId,
                    appointmentDate: { gte: oneYearAgo },
                },
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: 'desc',
                    },
                },
            }),
            prisma.$queryRaw `
        SELECT 
          TO_CHAR(appointment_date, 'YYYY-MM') as month,
          COUNT(*)::int as count
        FROM appointments 
        WHERE user_id = ${userId}
          AND appointment_date >= ${oneYearAgo}
        GROUP BY TO_CHAR(appointment_date, 'YYYY-MM')
        ORDER BY month DESC
      `,
        ]);
        return {
            totalAppointments,
            upcomingAppointments,
            completedAppointments,
            cancelledAppointments,
            appointmentsByDepartment: appointmentsByDepartment.map(item => ({
                department: item.department,
                count: item._count.id,
            })),
            appointmentsByMonth: appointmentsByMonth.map(item => ({
                month: item.month,
                count: item.count,
            })),
        };
    }
    static async updateStatus(id, userId, status) {
        const appointment = await prisma.appointment.updateMany({
            where: {
                id,
                userId,
            },
            data: { status },
        });
        if (appointment.count === 0) {
            return null;
        }
        return this.findById(id, userId);
    }
    static async getByDateRange(userId, startDate, endDate) {
        const appointments = await prisma.appointment.findMany({
            where: {
                userId,
                appointmentDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { appointmentDate: 'asc' },
            include: {
                notifications: true,
            },
        });
        return appointments;
    }
    static async search(userId, query, limit = 10) {
        const appointments = await prisma.appointment.findMany({
            where: {
                userId,
                OR: [
                    { hospitalName: { contains: query, mode: 'insensitive' } },
                    { department: { contains: query, mode: 'insensitive' } },
                    { doctorName: { contains: query, mode: 'insensitive' } },
                    { purpose: { contains: query, mode: 'insensitive' } },
                    { notes: { contains: query, mode: 'insensitive' } },
                ],
            },
            orderBy: { appointmentDate: 'desc' },
            take: limit,
        });
        return appointments;
    }
}
exports.AppointmentModel = AppointmentModel;
//# sourceMappingURL=Appointment.js.map