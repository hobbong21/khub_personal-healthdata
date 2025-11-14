import { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest, AppointmentFilters, AppointmentListResponse, AppointmentStats, AppointmentStatus } from '../types/appointment';
export declare class AppointmentService {
    static createAppointment(userId: string, data: CreateAppointmentRequest): Promise<Appointment>;
    static getAppointment(id: string, userId: string): Promise<Appointment | null>;
    static updateAppointment(id: string, userId: string, data: UpdateAppointmentRequest): Promise<Appointment | null>;
    static cancelAppointment(id: string, userId: string): Promise<Appointment | null>;
    static deleteAppointment(id: string, userId: string): Promise<boolean>;
    static getAppointments(userId: string, filters?: AppointmentFilters, page?: number, limit?: number): Promise<AppointmentListResponse>;
    static getUpcomingAppointments(userId: string, days?: number): Promise<Appointment[]>;
    static getAppointmentStats(userId: string): Promise<AppointmentStats>;
    static updateAppointmentStatus(id: string, userId: string, status: AppointmentStatus): Promise<Appointment | null>;
    static getAppointmentsForCalendar(userId: string, startDate: Date, endDate: Date): Promise<Appointment[]>;
    static searchAppointments(userId: string, query: string, limit?: number): Promise<Appointment[]>;
    static rescheduleAppointment(id: string, userId: string, newDate: Date, notes?: string): Promise<Appointment | null>;
    static getTodaysAppointments(userId: string): Promise<Appointment[]>;
    static getAppointmentsByDepartment(userId: string, department: string, limit?: number): Promise<Appointment[]>;
    static processPendingNotifications(): Promise<void>;
    private static sendNotification;
    static validateAppointmentData(data: CreateAppointmentRequest | UpdateAppointmentRequest): string[];
}
//# sourceMappingURL=appointmentService.d.ts.map