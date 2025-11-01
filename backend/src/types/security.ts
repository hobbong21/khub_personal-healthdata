import { Request } from 'express';

// 사용자 인증 정보 타입
export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
  permissions?: string[];
}

// Express Request 확장은 다른 파일에서 처리

// 보안 이벤트 타입
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

// 보안 메트릭 타입
export interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  unresolvedEvents: number;
  topThreats: Array<{ type: string; count: number }>;
  ipAddresses: Array<{ ip: string; eventCount: number; severity: string }>;
  timeDistribution: Array<{ hour: number; count: number }>;
}

// 권한 타입
export enum UserRole {
  PATIENT = 'patient',
  HEALTHCARE_PROVIDER = 'healthcare_provider',
  RESEARCHER = 'researcher',
  ADMIN = 'admin'
}

export enum Permission {
  READ_OWN_DATA = 'read_own_data',
  WRITE_OWN_DATA = 'write_own_data',
  READ_PATIENT_DATA = 'read_patient_data',
  WRITE_PATIENT_DATA = 'write_patient_data',
  ACCESS_ANONYMIZED_DATA = 'access_anonymized_data',
  MANAGE_USERS = 'manage_users',
  SYSTEM_ADMIN = 'system_admin'
}

// 감사 로그 타입
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

// 보안 설정 타입
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
    general: { windowMs: number; maxRequests: number };
    auth: { windowMs: number; maxRequests: number };
    sensitiveData: { windowMs: number; maxRequests: number };
  };
  intrusionDetection: {
    failedLoginThreshold: number;
    suspiciousActivityThreshold: number;
    ipBlockDurationMinutes: number;
  };
}

// 성능 메트릭 타입
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

// 최적화 권장사항 타입
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

// API 응답 타입
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

// 모니터링 알림 타입
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

// 사용자 행동 이벤트 타입
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

export default {};