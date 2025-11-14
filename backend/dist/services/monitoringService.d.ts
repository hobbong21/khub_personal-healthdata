import { EventEmitter } from 'events';
export interface SystemMetrics {
    timestamp: Date;
    cpu: {
        usage: number;
        loadAverage: number[];
    };
    memory: {
        used: number;
        free: number;
        total: number;
        percentage: number;
    };
    database: {
        activeConnections: number;
        queryCount: number;
        avgQueryTime: number;
    };
    cache: {
        hitRate: number;
        keyCount: number;
        memoryUsage: string;
    };
    api: {
        requestCount: number;
        avgResponseTime: number;
        errorRate: number;
    };
}
export interface AlertRule {
    id: string;
    name: string;
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    duration: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    notificationChannels: string[];
}
export interface Alert {
    id: string;
    ruleId: string;
    ruleName: string;
    metric: string;
    currentValue: number;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    triggeredAt: Date;
    resolvedAt?: Date;
    status: 'active' | 'resolved' | 'acknowledged';
}
export interface UserBehaviorEvent {
    userId: string;
    sessionId: string;
    event: string;
    page: string;
    timestamp: Date;
    metadata?: any;
    userAgent?: string;
    ip?: string;
}
export declare class MonitoringService extends EventEmitter {
    private static instance;
    private metrics;
    private alerts;
    private alertRules;
    private userBehaviorEvents;
    private isMonitoring;
    private monitoringInterval?;
    private apiMetrics;
    constructor();
    static getInstance(): MonitoringService;
    startMonitoring(intervalMs?: number): void;
    stopMonitoring(): void;
    private collectSystemMetrics;
    private collectDatabaseMetrics;
    private collectCacheMetrics;
    private collectAPIMetrics;
    trackAPIRequest(responseTime: number, isError?: boolean): void;
    trackUserBehavior(event: Omit<UserBehaviorEvent, 'timestamp'>): void;
    private initializeDefaultAlertRules;
    private checkAlertRules;
    private getMetricValue;
    private evaluateCondition;
    private handleAlert;
    private resolveAlert;
    private sendNotification;
    private sendEmailNotification;
    private sendSlackNotification;
    private sendWebhookNotification;
    getRecentMetrics(count?: number): SystemMetrics[];
    getActiveAlerts(): Alert[];
    getAlertRules(): AlertRule[];
    analyzeUserBehavior(timeRange: {
        start: Date;
        end: Date;
    }): {
        totalEvents: number;
        uniqueUsers: number;
        topPages: Array<{
            page: string;
            count: number;
        }>;
        topEvents: Array<{
            event: string;
            count: number;
        }>;
        hourlyDistribution: Array<{
            hour: number;
            count: number;
        }>;
    };
    getSystemStatus(): {
        status: 'healthy' | 'warning' | 'critical';
        activeAlerts: number;
        lastMetricTime: Date | null;
        uptime: number;
    };
    cleanup(): void;
}
export declare const monitoringService: MonitoringService;
//# sourceMappingURL=monitoringService.d.ts.map