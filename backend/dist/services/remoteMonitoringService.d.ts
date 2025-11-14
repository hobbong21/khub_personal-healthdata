import { RemoteMonitoringSession, RealTimeHealthData, HealthAlert, HealthcareDataShare } from '../models/RemoteMonitoring';
export declare const RemoteMonitoringService: {
    createMonitoringSession(userId: string, sessionData: {
        sessionType: "continuous" | "scheduled" | "emergency";
        notes?: string;
    }): Promise<RemoteMonitoringSession>;
    addRealTimeHealthData(monitoringSessionId: string, healthData: {
        userId: string;
        dataType: string;
        value: any;
        unit?: string;
        deviceSource?: string;
        recordedAt: Date;
    }): Promise<RealTimeHealthData>;
    getHealthDataForSession(sessionId: string, options: {
        type?: string;
        limit?: number;
        since?: Date;
    }): Promise<RealTimeHealthData[]>;
    getActiveAlerts(sessionId: string): Promise<HealthAlert[]>;
    acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<HealthAlert>;
    shareDataWithHealthcareProvider(userId: string, providerId: string, dataTypes: any, duration: number): Promise<HealthcareDataShare>;
};
//# sourceMappingURL=remoteMonitoringService.d.ts.map