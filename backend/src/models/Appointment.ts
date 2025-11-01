import { PrismaClient } from '@prisma/client';
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

const prisma = new PrismaClient();

export class AppointmentModel {
  /**
   * Create a new appointment
   */
  static async create(userId: string, data: CreateAppointmentRequest): Promise<Appointment> {
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

    return appointment as Appointment;
  }

  /**
   * Get appointment by ID
   */
  static async findById(id: string, userId: string): Promise<Appointment | null> {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        notifications: true,
      },
    });

    return appointment as Appointment | null;
  }

  /**
   * Update appointment
   */
  static async update(
    id: string, 
    userId: string, 
    data: UpdateAppointmentRequest
  ): Promise<Appointment | null> {
    const updateData: any = { ...data };
    
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

  /**
   * Delete appointment
   */
  static async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.appointment.deleteMany({
      where: {
        id,
        userId,
      },
    });

    return result.count > 0;
  }

  /**
   * Get appointments with filters and pagination
   */
  static async findMany(
    userId: string,
    filters: AppointmentFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<AppointmentListResponse> {
    const where: any = { userId };

    // Apply filters
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
      appointments: appointments as Appointment[],
      total,
      page,
      limit,
    };
  }

  /**
   * Get upcoming appointments
   */
  static async getUpcoming(userId: string, days: number = 30): Promise<Appointment[]> {
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

    return appointments as Appointment[];
  }

  /**
   * Get appointment statistics
   */
  static async getStats(userId: string): Promise<AppointmentStats> {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const [
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
      appointmentsByDepartment,
      appointmentsByMonth,
    ] = await Promise.all([
      // Total appointments
      prisma.appointment.count({
        where: { userId },
      }),

      // Upcoming appointments
      prisma.appointment.count({
        where: {
          userId,
          appointmentDate: { gte: now },
          status: { in: ['scheduled', 'confirmed'] },
        },
      }),

      // Completed appointments
      prisma.appointment.count({
        where: {
          userId,
          status: 'completed',
        },
      }),

      // Cancelled appointments
      prisma.appointment.count({
        where: {
          userId,
          status: 'cancelled',
        },
      }),

      // Appointments by department
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

      // Appointments by month (last 12 months)
      prisma.$queryRaw`
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
      appointmentsByMonth: (appointmentsByMonth as any[]).map(item => ({
        month: item.month,
        count: item.count,
      })),
    };
  }

  /**
   * Update appointment status
   */
  static async updateStatus(
    id: string, 
    userId: string, 
    status: AppointmentStatus
  ): Promise<Appointment | null> {
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

  /**
   * Get appointments for a specific date range
   */
  static async getByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
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

    return appointments as Appointment[];
  }

  /**
   * Search appointments
   */
  static async search(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<Appointment[]> {
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

    return appointments as Appointment[];
  }
}