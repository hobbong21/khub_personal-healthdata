import { api } from './api';
import {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentFilters,
  AppointmentListResponse,
  AppointmentStats,
  AppointmentStatus,
} from '../types/appointment';

export const appointmentApi = {
  // Create appointment
  async createAppointment(data: CreateAppointmentRequest): Promise<{ appointment: Appointment }> {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  // Get appointment by ID
  async getAppointment(id: string): Promise<{ appointment: Appointment }> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Update appointment
  async updateAppointment(
    id: string, 
    data: UpdateAppointmentRequest
  ): Promise<{ appointment: Appointment }> {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  // Delete appointment
  async deleteAppointment(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  // Get appointments with filters and pagination
  async getAppointments(
    filters: AppointmentFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<AppointmentListResponse> {
    const params = new URLSearchParams();
    
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    if (filters.status) {
      filters.status.forEach(status => params.append('status', status));
    }
    
    if (filters.department) {
      filters.department.forEach(dept => params.append('department', dept));
    }
    
    if (filters.appointmentType) {
      filters.appointmentType.forEach(type => params.append('appointmentType', type));
    }
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.hospitalName) params.append('hospitalName', filters.hospitalName);
    if (filters.doctorName) params.append('doctorName', filters.doctorName);

    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data;
  },

  // Get upcoming appointments
  async getUpcomingAppointments(days: number = 30): Promise<{ appointments: Appointment[] }> {
    const response = await api.get(`/appointments/upcoming?days=${days}`);
    return response.data;
  },

  // Get appointment statistics
  async getAppointmentStats(): Promise<{ stats: AppointmentStats }> {
    const response = await api.get('/appointments/stats');
    return response.data;
  },

  // Update appointment status
  async updateAppointmentStatus(
    id: string, 
    status: AppointmentStatus
  ): Promise<{ appointment: Appointment }> {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  // Cancel appointment
  async cancelAppointment(id: string): Promise<{ appointment: Appointment }> {
    const response = await api.patch(`/appointments/${id}/cancel`);
    return response.data;
  },

  // Get appointments for calendar
  async getAppointmentsForCalendar(
    startDate: string, 
    endDate: string
  ): Promise<{ appointments: Appointment[] }> {
    const response = await api.get(
      `/appointments/calendar?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  // Search appointments
  async searchAppointments(
    query: string, 
    limit: number = 10
  ): Promise<{ appointments: Appointment[] }> {
    const response = await api.get(`/appointments/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  },

  // Reschedule appointment
  async rescheduleAppointment(
    id: string, 
    newDate: string, 
    notes?: string
  ): Promise<{ appointment: Appointment }> {
    const response = await api.patch(`/appointments/${id}/reschedule`, { 
      newDate, 
      notes 
    });
    return response.data;
  },

  // Get today's appointments
  async getTodaysAppointments(): Promise<{ appointments: Appointment[] }> {
    const response = await api.get('/appointments/today');
    return response.data;
  },
};