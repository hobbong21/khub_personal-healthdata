export interface RemoteMonitoringSession {
    id: string;
    userId: string;
    healthcareProviderId?: string;
    sessionType: 'continuous' | 'scheduled' | 'emergency';
    status: 'active' | 'paused' | 'completed' | 'terminated';
    startTime: Date;
    endTime?: Date;
    monitoringParameters?: any;
    alertThresholds?: any;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface RealTimeHealthData {
    id: string;
    userId: string;
    monitoringSessionId?: string;
    dataType: string;
    value: any;
    unit?: string;
    deviceSource?: string;
    isCritical: boolean;
    recordedAt: Date;
    processedAt: Date;
}
export interface HealthAlert {
    id: string;
    userId: string;
    monitoringSessionId?: string;
    alertType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    dataReference?: any;
    isAcknowledged: boolean;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    isResolved: boolean;
    resolvedAt?: Date;
    createdAt: Date;
}
export interface HealthcareDataShare {
    id: string;
    userId: string;
    healthcareProviderEmail: string;
    healthcareProviderName?: string;
    sharedDataTypes: any;
    accessLevel: 'read_only' | 'read_write';
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    accessToken?: string;
    lastAccessedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class RemoteMonitoringModel {
    static createSession(sessionData: {
        userId: string;
        sessionType: 'continuous' | 'scheduled' | 'emergency';
        monitoringParameters?: any;
        alertThresholds?: any;
        notes?: string;
    }): Promise<RemoteMonitoringSession>;
    static addRealTimeData(healthData: {
        userId: string;
        monitoringSessionId?: string;
        dataType: string;
        value: any;
        unit?: string;
        deviceSource?: string;
        recordedAt: Date;
    }): Promise<RealTimeHealthData>;
    static createHealthAlert(alertData: {
        userId: string;
        monitoringSessionId?: string;
        alertType: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        title: string;
        message: string;
        dataReference?: any;
    }): Promise<HealthAlert>;
    static createDataShare(shareData: {
        userId: string;
        healthcareProviderEmail: string;
        healthcareProviderName?: string;
        sharedDataTypes: any;
        accessLevel: 'read_only' | 'read_write';
        startDate: Date;
        endDate?: Date;
    }): Promise<HealthcareDataShare>;
    static getActiveSession(userId: string): Promise<RemoteMonitoringSession | null>;
    static getRealTimeData(userId: string, dataType?: string, limit?: number): Promise<RealTimeHealthData[]>;
    static getUnacknowledgedAlerts(userId: string): Promise<HealthAlert[]>;
    static acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<HealthAlert>;
    static endSession(sessionId: string): Promise<RemoteMonitoringSession>;
    private static checkCriticalThresholds;
    private static generateAccessToken;
    static getDashboardData(userId: string): Promise<{
        activeSession: RemoteMonitoringSession | null;
        recentData: RealTimeHealthData[];
        unacknowledgedAlerts: HealthAlert[];
        dataShares: HealthcareDataShare[];
    }>;
}
//# sourceMappingURL=RemoteMonitoring.d.ts.map