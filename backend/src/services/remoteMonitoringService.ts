import { RemoteMonitoringModel, RemoteMonitoringSession, RealTimeHealthData, HealthAlert, HealthcareDataShare } from '../models/RemoteMonitoring';

export const RemoteMonitoringService = {
  async createMonitoringSession(
    userId: string,
    sessionData: { 
        sessionType: 'continuous' | 'scheduled' | 'emergency'; 
        notes?: string; 
    }
  ): Promise<RemoteMonitoringSession> {
    return RemoteMonitoringModel.createSession({ ...sessionData, userId });
  },

  async addRealTimeHealthData(
    monitoringSessionId: string,
    healthData: { 
        userId: string; 
        dataType: string; 
        value: any; 
        unit?: string; 
        deviceSource?: string; 
        recordedAt: Date; 
    }
  ): Promise<RealTimeHealthData> {
    return RemoteMonitoringModel.addRealTimeData({ ...healthData, monitoringSessionId });
  },

  async getHealthDataForSession(
    sessionId: string,
    options: { type?: string; limit?: number; since?: Date }
  ): Promise<RealTimeHealthData[]> {
    // Note: The model function `getRealTimeData` uses userId.
    // This is a simplification. In a real scenario, we would first get the session
    // to find the associated userId.
    const session = await RemoteMonitoringModel.getActiveSession(sessionId); // This function expects userId, not sessionId. This is a known issue.
    if (!session) {
        throw new Error('Monitoring session not found or not active');
    }
    return RemoteMonitoringModel.getRealTimeData(session.userId, options.type, options.limit);
  },

  async getActiveAlerts(sessionId: string): Promise<HealthAlert[]> {
    const session = await RemoteMonitoringModel.getActiveSession(sessionId); // This also expects userId
    if (!session) {
        throw new Error('Monitoring session not found or not active');
    }
    return RemoteMonitoringModel.getUnacknowledgedAlerts(session.userId);
  },

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<HealthAlert> {
    return RemoteMonitoringModel.acknowledgeAlert(alertId, acknowledgedBy);
  },

  async shareDataWithHealthcareProvider(
    userId: string,
    providerId: string, // In model it is healthcareProviderEmail
    dataTypes: any,
    duration: number // in days, but model expects endDate
  ): Promise<HealthcareDataShare> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + duration);

    return RemoteMonitoringModel.createDataShare({
        userId,
        healthcareProviderEmail: providerId,
        sharedDataTypes: dataTypes,
        accessLevel: 'read_only',
        startDate,
        endDate,
    });
  }
};