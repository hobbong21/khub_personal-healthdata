export interface AuditLogEntry {
    id?: string;
    timestamp: Date;
    action: string;
    userId?: string;
    ip: string;
    userAgent: string;
    path: string;
    method: string;
    details?: any;
    hash: string;
    createdAt?: Date;
}
export interface AuditLogQuery {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}
export declare class AuditLogModel {
    static create(logData: Omit<AuditLogEntry, 'id' | 'createdAt' | 'hash'>): Promise<AuditLogEntry>;
    static findMany(query: AuditLogQuery): Promise<AuditLogEntry[]>;
    static findByUserId(userId: string, limit?: number): Promise<AuditLogEntry[]>;
    static findByAction(action: string, limit?: number): Promise<AuditLogEntry[]>;
    static findSecurityEvents(startDate?: Date, endDate?: Date): Promise<AuditLogEntry[]>;
    static findDataAccessLogs(userId?: string, dataType?: string): Promise<AuditLogEntry[]>;
    static getStatistics(startDate?: Date, endDate?: Date): Promise<{
        totalLogs: number;
        securityEvents: number;
        dataAccess: number;
        uniqueUsers: number;
        topActions: Array<{
            action: string;
            count: number;
        }>;
    }>;
    static verifyIntegrity(logId: string): Promise<boolean>;
    static cleanup(retentionDays?: number): Promise<number>;
    static exportLogs(startDate: Date, endDate: Date, format?: 'json' | 'csv'): Promise<string>;
}
//# sourceMappingURL=AuditLog.d.ts.map