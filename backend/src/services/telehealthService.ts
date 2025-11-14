import { AppointmentModel } from '../models/Appointment';
import { Appointment, CreateAppointmentRequest } from '../types/appointment';

export const TelehealthService = {
  async scheduleTelehealthSession(
    userId: string,
    dateTime: string,
    providerId: string
  ): Promise<Appointment> {
    const appointmentData: CreateAppointmentRequest = {
      hospitalName: 'Telehealth', // Or derive from providerId
      department: 'Remote Consultation',
      doctorName: providerId,
      appointmentType: 'telehealth',
      purpose: 'Telehealth session',
      appointmentDate: dateTime,
      duration: 30, // Default duration
    };
    return AppointmentModel.create(userId, appointmentData);
  },

  async getTelehealthSessions(userId: string): Promise<Appointment[]> {
    const { appointments } = await AppointmentModel.findMany(
      userId,
      { appointmentType: ['telehealth'] },
      1,
      100 // Assuming a limit of 100 for now
    );
    return appointments;
  },

  async getTelehealthSessionDetails(
    sessionId: string,
    userId: string
  ): Promise<Appointment | null> {
    return AppointmentModel.findById(sessionId, userId);
  },

  async cancelTelehealthSession(
    sessionId: string,
    userId: string
  ): Promise<Appointment | null> {
    return AppointmentModel.updateStatus(sessionId, userId, 'cancelled');
  },

  async connectToTelehealthSession(
    sessionId: string,
    userId: string
  ): Promise<{ connectUrl: string; status: string }> {
    const session = await AppointmentModel.findById(sessionId, userId);
    if (!session) {
      throw new Error('Telehealth session not found.');
    }
    
    // In a real implementation, this would involve generating a unique meeting URL
    // from a video conferencing service provider.
    // For now, we'll return a mock URL and update the status.
    
    // Optional: Update status to something like 'in_progress' if the schema supports it.
    // Currently, it does not, so we just return the URL.
    
    return {
      connectUrl: `https://telehealth.example.com/session/${sessionId}?token=${Math.random().toString(36).substring(2)}`,
      status: 'Connection initiated',
    };
  },
};
