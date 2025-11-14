import { Request, Response } from 'express';
export declare function createMonitoringSession(req: Request, res: Response): Promise<void>;
export declare function getHealthDataForSession(req: Request, res: Response): Promise<void>;
export declare function getActiveAlerts(req: Request, res: Response): Promise<void>;
export declare function addRealTimeHealthData(req: Request, res: Response): Promise<void>;
export declare function acknowledgeAlert(req: Request, res: Response): Promise<void>;
export declare function shareDataWithHealthcareProvider(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=remoteMonitoringController.d.ts.map