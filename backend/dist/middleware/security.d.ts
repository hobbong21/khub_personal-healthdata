import { Request, Response, NextFunction } from 'express';
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
export declare const securityHeaders: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare const createRateLimit: (windowMs: number, max: number, message?: string) => import("express-rate-limit").RateLimitRequestHandler;
export declare const generalRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const sensitiveDataRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare function requirePermission(permission: Permission): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function requireDataOwnership(resourceIdParam?: string): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function auditLog(req: Request, action: string, details?: any): void;
export declare function logSensitiveDataAccess(dataType: string): (req: Request, res: Response, next: NextFunction) => void;
export declare function requireWhitelistedIP(allowedIPs: string[]): (req: Request, res: Response, next: NextFunction) => void;
export declare function checkSessionTimeout(timeoutMinutes?: number): (req: Request, res: Response, next: NextFunction) => void;
export declare function validateDataIntegrity(): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=security.d.ts.map