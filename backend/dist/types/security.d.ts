export interface AuthenticatedUser {
    id: string;
    email: string;
    role?: string;
    permissions?: string[];
}
export interface SecurityEvent {
    id: string;
    timestamp: Date;
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    sessionId?: string;
    ip: string;
    userAgent: string;
    details: any;
    hash: string;
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
}
export interface SecurityMetrics {
    totalEvents: number;
    criticalEvents: number;
    highSeverityEvents: number;
    unresolvedEvents: number;
    topThreats: Array<{
        type: string;
        count: number;
    }>;
    ipAddresses: Array<{
        ip: string;
        eventCount: number;
        severity: string;
    }>;
    timeDistribution: Array<{
        hour: number;
        count: number;
    }>;
}
export declare enum UserRole {
    PATIENT = "patient",
    HEALTHCARE_PROVIDER = "healthcare_provider",
    RESEARCHER = "researcher",
    ADMIN = "admin"
}
export declare enum Permission {
    READ_OWN_DATA = "read_own_data",
    WRITE_OWN_DATA = "write_own_data",
    READ_PATIENT_DATA = "read_patient_data",
    WRITE_PATIENT_DATA = "write_patient_data",
    ACCESS_ANONYMIZED_DATA = "access_anonymized_data",
    MANAGE_USERS = "manage_users",
    SYSTEM_ADMIN = "system_admin"
}
export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    action: string;
    userId: string;
    resourceType: string;
    resourceId: string;
    ip: string;
    userAgent: string;
    details?: any;
    hash: string;
}
export interface SecurityConfig {
    encryption: {
        algorithm: string;
        keyLength: number;
        ivLength: number;
    };
    session: {
        timeoutMinutes: number;
        maxConcurrentSessions: number;
    };
    rateLimits: {
        general: {
            windowMs: number;
            maxRequests: number;
        };
        auth: {
            windowMs: number;
            maxRequests: number;
        };
        sensitiveData: {
            windowMs: number;
            maxRequests: number;
        };
    };
    intrusionDetection: {
        failedLoginThreshold: number;
        suspiciousActivityThreshold: number;
        ipBlockDurationMinutes: number;
    };
}
export interface PerformanceMetrics {
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
export interface OptimizationRecommendation {
    id: string;
    category: 'database' | 'cache' | 'api' | 'memory' | 'network';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact: string;
    implementation: string;
    estimatedGain: number;
    effort: 'low' | 'medium' | 'high';
    automated: boolean;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        timestamp: Date;
        requestId: string;
        version: string;
    };
}
export interface MonitoringAlert {
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
declare const _default: {};
export default _default;
//# sourceMappingURL=security.d.ts.map