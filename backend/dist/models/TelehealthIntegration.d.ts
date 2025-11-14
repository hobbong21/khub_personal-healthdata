export interface TelehealthIntegration {
    id: string;
    userId: string;
    platformName: string;
    platformId: string;
    accessToken?: string;
    refreshToken?: string;
    isActive: boolean;
    lastSyncAt?: Date;
    integrationConfig?: any;
    createdAt: Date;
    updatedAt: Date;
}
export interface TelehealthSession {
    id: string;
    telehealthIntegrationId: string;
    sessionId: string;
    doctorName: string;
    specialty?: string;
    sessionType: string;
    scheduledTime: Date;
    actualStartTime?: Date;
    actualEndTime?: Date;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    sessionNotes?: string;
    diagnosis?: string;
    prescriptions?: any;
    followUpRequired: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TelehealthIntegrationModel {
    static createIntegration(integrationData: {
        userId: string;
        platformName: string;
        platformUserId?: string;
        integrationSettings?: any;
    }): Promise<TelehealthIntegration>;
    static createSession(sessionData: {
        telehealthIntegrationId: string;
        sessionId: string;
        doctorName: string;
        specialty?: string;
        sessionType: string;
        scheduledTime: Date;
    }): Promise<TelehealthSession>;
    static getUserIntegrations(userId: string): Promise<TelehealthIntegration[]>;
    static getUserSessions(userId: string, status?: string, limit?: number): Promise<TelehealthSession[]>;
    static updateSessionStatus(sessionId: string, status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show', updateData?: {
        actualStartTime?: Date;
        actualEndTime?: Date;
        sessionNotes?: string;
    }): Promise<TelehealthSession>;
    static getUpcomingSessions(userId: string): Promise<TelehealthSession[]>;
    static deactivateIntegration(integrationId: string): Promise<TelehealthIntegration>;
    static generateSessionUrl(sessionId: string, platformName: string, integrationSettings: any): Promise<string>;
    private static generateZoomHealthcareUrl;
    private static generateTeladocUrl;
    private static generateAmwellUrl;
    static syncMedicalRecords(sessionId: string, platformName: string, integrationSettings: any): Promise<any>;
    private static syncZoomHealthcareRecords;
    private static syncTeladocRecords;
    private static syncAmwellRecords;
    static getTelehealthStats(userId: string): Promise<{
        totalSessions: number;
        completedSessions: number;
        upcomingSessions: number;
        cancelledSessions: number;
        averageSessionDuration: number;
    }>;
}
//# sourceMappingURL=TelehealthIntegration.d.ts.map