import { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest, AppointmentFilters, AppointmentListResponse, AppointmentStats, AppointmentStatus } from '../types/appointment';
export declare class AppointmentModel {
    static create(userId: string, data: CreateAppointmentRequest): Promise<Appointment>;
    static findById(id: string, userId: string): Promise<Appointment | null>;
    static update(id: string, userId: string, data: UpdateAppointmentRequest): Promise<Appointment | null>;
    static delete(id: string, userId: string): Promise<boolean>;
    static findMany(userId: string, filters?: AppointmentFilters, page?: number, limit?: number): Promise<AppointmentListResponse>;
    static getUpcoming(userId: string, days?: number): Promise<Appointment[]>;
    static getStats(userId: string): Promise<AppointmentStats>;
    static updateStatus(id: string, userId: string, status: AppointmentStatus): Promise<Appointment | null>;
    static getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Appointment[]>;
    static search(userId: string, query: string, limit?: number): Promise<Appointment[]>;
}
//# sourceMappingURL=Appointment.d.ts.map