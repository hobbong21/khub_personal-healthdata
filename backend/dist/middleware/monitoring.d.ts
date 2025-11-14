import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
            startTime?: number;
        }
    }
}
export declare function generateRequestId(req: Request, res: Response, next: NextFunction): void;
export declare function recordStartTime(req: Request, res: Response, next: NextFunction): void;
export declare function logAPIRequest(req: Request, res: Response, next: NextFunction): void;
export declare function logErrors(err: Error, req: Request, res: Response, next: NextFunction): void;
export declare function trackUserActivity(req: Request, res: Response, next: NextFunction): void;
export declare function logDataAccess(dataType: string, operation: 'read' | 'write' | 'delete'): (req: Request, res: Response, next: NextFunction) => void;
export declare function monitorPerformance(operationName?: string): (req: Request, res: Response, next: NextFunction) => void;
export declare function detectSecurityEvents(req: Request, res: Response, next: NextFunction): void;
export declare function healthCheckMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function monitorRequestSize(maxSize?: number): (req: Request, res: Response, next: NextFunction) => void;
declare global {
    var requestCounts: Map<string, number[]> | undefined;
}
//# sourceMappingURL=monitoring.d.ts.map