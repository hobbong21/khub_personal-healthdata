export interface Appointment {
  id: string;
  userId: string;
  hospitalName: string;
  department: string;
  doctorName?: string;
  appointmentType: AppointmentType;
  purpose?: string;
  appointmentDate: string; // ISO string
  duration?: number;
  status: AppointmentStatus;
  location?: string;
  notes?: string;
  hospitalPhone?: string;
  hospitalAddress?: string;
  reminderSettings?: ReminderSettings;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentNotification {
  id: string;
  appointmentId: string;
  notificationType: NotificationType;
  scheduledTime: string; // ISO string
  message?: string;
  status: NotificationStatus;
  sentAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export type AppointmentType = 
  | 'consultation'
  | 'follow_up'
  | 'procedure'
  | 'test'
  | 'emergency'
  | 'routine_checkup';

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type NotificationType = 
  | 'email'
  | 'sms'
  | 'push'
  | 'in_app';

export type NotificationStatus = 
  | 'pending'
  | 'sent'
  | 'failed'
  | 'cancelled';

export interface ReminderSettings {
  enabled: boolean;
  notifications: {
    type: NotificationType;
    timeBeforeAppointment: number; // minutes before appointment
    message?: string;
  }[];
}

export interface CreateAppointmentRequest {
  hospitalName: string;
  department: string;
  doctorName?: string;
  appointmentType: AppointmentType;
  purpose?: string;
  appointmentDate: string; // ISO string
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
  appointmentDate?: string; // ISO string
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
  dateFrom?: string; // ISO string
  dateTo?: string; // ISO string
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

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: Appointment;
}

// Constants
export const APPOINTMENT_TYPES: { value: AppointmentType; label: string }[] = [
  { value: 'consultation', label: '진료 상담' },
  { value: 'follow_up', label: '재진' },
  { value: 'procedure', label: '시술' },
  { value: 'test', label: '검사' },
  { value: 'emergency', label: '응급' },
  { value: 'routine_checkup', label: '정기 검진' },
];

export const APPOINTMENT_STATUSES: { value: AppointmentStatus; label: string; color: string }[] = [
  { value: 'scheduled', label: '예약됨', color: '#3b82f6' },
  { value: 'confirmed', label: '확정됨', color: '#10b981' },
  { value: 'completed', label: '완료됨', color: '#6b7280' },
  { value: 'cancelled', label: '취소됨', color: '#ef4444' },
  { value: 'no_show', label: '노쇼', color: '#f59e0b' },
  { value: 'rescheduled', label: '변경됨', color: '#8b5cf6' },
];

export const NOTIFICATION_TYPES: { value: NotificationType; label: string }[] = [
  { value: 'email', label: '이메일' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: '푸시 알림' },
  { value: 'in_app', label: '앱 내 알림' },
];

export const DEPARTMENTS = [
  '내과', '외과', '정형외과', '신경과', '신경외과',
  '심장내과', '심장외과', '소화기내과', '호흡기내과',
  '내분비내과', '신장내과', '혈액종양내과', '감염내과',
  '피부과', '안과', '이비인후과', '산부인과', '소아과',
  '정신건강의학과', '재활의학과', '영상의학과', '병리과',
  '마취통증의학과', '응급의학과', '가정의학과', '치과',
  '한방내과', '한방부인과', '침구과'
] as const;

export const REMINDER_TIME_OPTIONS = [
  { value: 15, label: '15분 전' },
  { value: 30, label: '30분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
  { value: 2880, label: '2일 전' },
  { value: 10080, label: '1주일 전' },
];

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  notifications: [
    {
      type: 'in_app',
      timeBeforeAppointment: 1440, // 1 day before
    },
    {
      type: 'push',
      timeBeforeAppointment: 60, // 1 hour before
    },
  ],
};