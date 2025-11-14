import { Response, NextFunction, Request } from 'express';
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRole: (requiredRole: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuthenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map