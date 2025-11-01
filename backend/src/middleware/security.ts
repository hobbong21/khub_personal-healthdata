import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createAuditHash, maskEmail, maskPII } from '../utils/encryption';
import prisma from '../config/database';

// 사용자 역할 정의
export enum UserRole {
  PATIENT = 'patient',
  HEALTHCARE_PROVIDER = 'healthcare_provider',
  RESEARCHER = 'researcher',
  ADMIN = 'admin'
}

// 리소스 접근 권한 정의
export enum Permission {
  READ_OWN_DATA = 'read_own_data',
  WRITE_OWN_DATA = 'write_own_data',
  READ_PATIENT_DATA = 'read_patient_data',
  WRITE_PATIENT_DATA = 'write_patient_data',
  ACCESS_ANONYMIZED_DATA = 'access_anonymized_data',
  MANAGE_USERS = 'manage_users',
  SYSTEM_ADMIN = 'system_admin'
}

// 역할별 권한 매핑
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.PATIENT]: [
    Permission.READ_OWN_DATA,
    Permission.WRITE_OWN_DATA
  ],
  [UserRole.HEALTHCARE_PROVIDER]: [
    Permission.READ_OWN_DATA,
    Permission.WRITE_OWN_DATA,
    Permission.READ_PATIENT_DATA,
    Permission.WRITE_PATIENT_DATA
  ],
  [UserRole.RESEARCHER]: [
    Permission.READ_OWN_DATA,
    Permission.WRITE_OWN_DATA,
    Permission.ACCESS_ANONYMIZED_DATA
  ],
  [UserRole.ADMIN]: [
    Permission.READ_OWN_DATA,
    Permission.WRITE_OWN_DATA,
    Permission.READ_PATIENT_DATA,
    Permission.WRITE_PATIENT_DATA,
    Permission.ACCESS_ANONYMIZED_DATA,
    Permission.MANAGE_USERS,
    Permission.SYSTEM_ADMIN
  ]
};

/**
 * HIPAA 준수 보안 헤더 설정
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Rate Limiting - API 남용 방지
 */
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      auditLog(req, 'RATE_LIMIT_EXCEEDED', { ip: req.ip });
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
        }
      });
    }
  });
};

// 일반 API용 Rate Limit
export const generalRateLimit = createRateLimit(15 * 60 * 1000, 100); // 15분에 100회

// 인증 API용 Rate Limit (더 엄격)
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 15분에 5회

// 민감한 데이터 API용 Rate Limit
export const sensitiveDataRateLimit = createRateLimit(15 * 60 * 1000, 50); // 15분에 50회

/**
 * 권한 기반 접근 제어 미들웨어
 */
export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        auditLog(req, 'UNAUTHORIZED_ACCESS_ATTEMPT', { permission });
        res.status(401).json({
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: '인증이 필요합니다'
          }
        });
        return;
      }

      // 사용자 역할 조회 (현재는 기본적으로 PATIENT로 설정)
      const userRole = UserRole.PATIENT; // TODO: 실제 사용자 역할 조회 로직 구현
      const userPermissions = ROLE_PERMISSIONS[userRole];

      if (!userPermissions.includes(permission)) {
        auditLog(req, 'PERMISSION_DENIED', { 
          userId: req.user.id, 
          permission, 
          userRole 
        });
        res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: '이 작업을 수행할 권한이 없습니다'
          }
        });
        return;
      }

      auditLog(req, 'PERMISSION_GRANTED', { 
        userId: req.user.id, 
        permission, 
        userRole 
      });
      next();
    } catch (error) {
      auditLog(req, 'PERMISSION_CHECK_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({
        error: {
          code: 'PERMISSION_CHECK_FAILED',
          message: '권한 확인 중 오류가 발생했습니다'
        }
      });
    }
  };
}

/**
 * 데이터 소유권 확인 미들웨어
 */
export function requireDataOwnership(resourceIdParam: string = 'id') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: '인증이 필요합니다'
          }
        });
        return;
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // 리소스가 사용자 소유인지 확인 (예: 건강 기록, 진료 기록 등)
      // 실제 구현에서는 리소스 타입에 따라 다른 테이블을 확인해야 함
      const isOwner = await verifyResourceOwnership(resourceId, userId);

      if (!isOwner) {
        auditLog(req, 'DATA_OWNERSHIP_VIOLATION', { 
          userId, 
          resourceId, 
          resourceType: req.route?.path 
        });
        res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: '해당 데이터에 접근할 권한이 없습니다'
          }
        });
        return;
      }

      next();
    } catch (error) {
      auditLog(req, 'OWNERSHIP_CHECK_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({
        error: {
          code: 'OWNERSHIP_CHECK_FAILED',
          message: '데이터 소유권 확인 중 오류가 발생했습니다'
        }
      });
    }
  };
}

/**
 * 리소스 소유권 확인 헬퍼 함수
 */
async function verifyResourceOwnership(resourceId: string, userId: string): Promise<boolean> {
  try {
    // 건강 기록 확인
    const healthRecord = await prisma.healthRecord.findFirst({
      where: { id: resourceId, userId },
      select: { id: true }
    });
    if (healthRecord) return true;

    // 진료 기록 확인
    const medicalRecord = await prisma.medicalRecord.findFirst({
      where: { id: resourceId, userId },
      select: { id: true }
    });
    if (medicalRecord) return true;

    // 약물 기록 확인
    const medication = await prisma.medication.findFirst({
      where: { id: resourceId, userId },
      select: { id: true }
    });
    if (medication) return true;

    // 유전체 데이터 확인
    const genomicData = await prisma.genomicData.findFirst({
      where: { id: resourceId, userId },
      select: { id: true }
    });
    if (genomicData) return true;

    return false;
  } catch (error) {
    console.error('Resource ownership verification error:', error);
    return false;
  }
}

/**
 * HIPAA 준수 감사 로그 기록
 */
export function auditLog(
  req: Request, 
  action: string, 
  details?: any
): void {
  try {
    const timestamp = new Date();
    const userId = req.user?.id || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    const auditData = {
      timestamp: timestamp.toISOString(),
      action,
      userId: req.user ? maskPII(userId) : 'anonymous',
      ip: maskPII(ip),
      userAgent: maskPII(userAgent),
      path: req.path,
      method: req.method,
      details: details ? JSON.stringify(details) : null
    };

    // 감사 해시 생성
    const auditHash = createAuditHash(action, userId, timestamp, details);
    
    // 실제 환경에서는 별도의 감사 로그 시스템에 저장
    console.log(`[AUDIT] ${JSON.stringify({ ...auditData, hash: auditHash })}`);
    
    // 데이터베이스에 감사 로그 저장 (선택적)
    // await prisma.auditLog.create({ data: auditData });
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}

/**
 * 민감한 데이터 접근 로깅 미들웨어
 */
export function logSensitiveDataAccess(dataType: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    auditLog(req, 'SENSITIVE_DATA_ACCESS', { 
      dataType,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    next();
  };
}

/**
 * IP 화이트리스트 미들웨어 (관리자 기능용)
 */
export function requireWhitelistedIP(allowedIPs: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!clientIP || !allowedIPs.includes(clientIP)) {
      auditLog(req, 'IP_WHITELIST_VIOLATION', { 
        clientIP: maskPII(clientIP || 'unknown'),
        allowedIPs: allowedIPs.length 
      });
      res.status(403).json({
        error: {
          code: 'IP_NOT_ALLOWED',
          message: '허용되지 않은 IP 주소입니다'
        }
      });
      return;
    }

    next();
  };
}

/**
 * 세션 타임아웃 확인 미들웨어
 */
export function checkSessionTimeout(timeoutMinutes: number = 30) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // JWT 기반 인증에서는 토큰 만료 시간으로 세션 관리
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // JWT 토큰 검증 로직 (실제 구현에서는 jwt.verify 사용)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const now = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < now) {
          auditLog(req, 'TOKEN_EXPIRED', { 
            userId: req.user?.id,
            expiredAt: new Date(payload.exp * 1000).toISOString()
          });
          res.status(401).json({
            error: {
              code: 'TOKEN_EXPIRED',
              message: '토큰이 만료되었습니다. 다시 로그인해주세요.'
            }
          });
          return;
        }
      } catch (error) {
        // 토큰 파싱 실패 시 무시하고 다음 미들웨어로
      }
    }

    next();
  };
}

/**
 * 데이터 무결성 검증 미들웨어
 */
export function validateDataIntegrity() {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 요청 본문의 무결성 검증
    if (req.body && Object.keys(req.body).length > 0) {
      try {
        // 악성 스크립트 검사
        const bodyString = JSON.stringify(req.body);
        const suspiciousPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /eval\s*\(/gi,
          /expression\s*\(/gi
        ];

        for (const pattern of suspiciousPatterns) {
          if (pattern.test(bodyString)) {
            auditLog(req, 'MALICIOUS_INPUT_DETECTED', { 
              pattern: pattern.source,
              userId: req.user?.id 
            });
            res.status(400).json({
              error: {
                code: 'INVALID_INPUT',
                message: '유효하지 않은 입력 데이터입니다'
              }
            });
            return;
          }
        }
      } catch (error) {
        auditLog(req, 'DATA_VALIDATION_ERROR', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    next();
  };
}

// JWT 토큰 페이로드 타입 정의
interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  userId: string;
}