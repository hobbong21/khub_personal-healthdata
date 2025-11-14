import { Request, Response } from 'express';
export declare function getSystemStatus(req: Request, res: Response): Promise<void>;
export declare function getRealtimeMetrics(req: Request, res: Response): Promise<void>;
export declare function getActiveAlerts(req: Request, res: Response): Promise<void>;
export declare function getAlertRules(req: Request, res: Response): Promise<void>;
export declare function getUserBehaviorAnalysis(req: Request, res: Response): Promise<void>;
export declare function trackUserBehavior(req: Request, res: Response): Promise<void>;
export declare function searchLogs(req: Request, res: Response): Promise<void>;
export declare function getLogStatistics(req: Request, res: Response): Promise<void>;
export declare function startMonitoring(req: Request, res: Response): Promise<void>;
export declare function stopMonitoring(req: Request, res: Response): Promise<void>;
export declare function exportLogs(req: Request, res: Response): Promise<void>;
export declare function cleanupSystem(req: Request, res: Response): Promise<void>;
export declare function healthCheck(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=monitoringController.d.ts.map