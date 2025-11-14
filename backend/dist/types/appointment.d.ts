export interface Appointment {
    id: string;
    userId: string;
    hospitalName: string;
    department: string;
    doctorName?: string;
    appointmentType: AppointmentType;
    purpose?: string;
    appointmentDate: Date;
    duration?: number;
    status: AppointmentStatus;
    location?: string;
    notes?: string;
    hospitalPhone?: string;
    hospitalAddress?: string;
    reminderSettings?: ReminderSettings;
    createdAt: Date;
    updatedAt: Date;
}
export interface AppointmentNotification {
    id: string;
    appointmentId: string;
    notificationType: NotificationType;
    scheduledTime: Date;
    message?: string;
    status: NotificationStatus;
    sentAt?: Date;
    errorMessage?: string;
    createdAt: Date;
}
export type AppointmentType = 'consultation' | 'follow_up' | 'procedure' | 'test' | 'emergency' | 'routine_checkup';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type NotificationType = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled';
export interface ReminderSettings {
    enabled: boolean;
    notifications: {
        type: NotificationType;
        timeBeforeAppointment: number;
        message?: string;
    }[];
}
export interface CreateAppointmentRequest {
    hospitalName: string;
    department: string;
    doctorName?: string;
    appointmentType: AppointmentType;
    purpose?: string;
    appointmentDate: string;
    duration?: number;
    location?: string;
    notes?: string;
    hospitalPhone?: string;
    hospitalAddress?: string;
    reminderSettings?: ReminderSettings;
}
export interface UpdateAppointmentRequest {
    hospitalName?: string;
    department?: string;
    doctorName?: string;
    appointmentType?: AppointmentType;
    purpose?: string;
    appointmentDate?: string;
    duration?: number;
    status?: AppointmentStatus;
    location?: string;
    notes?: string;
    hospitalPhone?: string;
    hospitalAddress?: string;
    reminderSettings?: ReminderSettings;
}
export interface AppointmentFilters {
    status?: AppointmentStatus[];
    department?: string[];
    appointmentType?: AppointmentType[];
    dateFrom?: string;
    dateTo?: string;
    hospitalName?: string;
    doctorName?: string;
}
export interface AppointmentListResponse {
    appointments: Appointment[];
    total: number;
    page: number;
    limit: number;
}
export interface AppointmentStats {
    totalAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    appointmentsByDepartment: {
        department: string;
        count: number;
    }[];
    appointmentsByMonth: {
        month: string;
        count: number;
    }[];
}
export interface DepartmentInfo {
    name: string;
    description?: string;
    commonAppointmentTypes: AppointmentType[];
    averageDuration: number;
}
export declare const DEPARTMENTS: readonly ["내과", "외과", "정형외과", "신경과", "신경외과", "심장내과", "심장외과", "소화기내과", "호흡기내과", "내분비내과", "신장내과", "혈액종양내과", "감염내과", "피부과", "안과", "이비인후과", "산부인과", "소아과", "정신건강의학과", "재활의학과", "영상의학과", "병리과", "마취통증의학과", "응급의학과", "가정의학과", "치과", "한방내과", "한방부인과", "침구과"];
export type Department = typeof DEPARTMENTS[number];
//# sourceMappingURL=appointment.d.ts.map