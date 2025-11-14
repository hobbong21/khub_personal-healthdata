import { Request, Response } from 'express';
export declare class AppleHealthController {
    static receiveHealthKitData(req: Request, res: Response): Promise<void>;
    static checkPermissions(req: Request, res: Response): Promise<void>;
    static getRealTimeSyncStatus(req: Request, res: Response): Promise<void>;
    static processPendingData(req: Request, res: Response): Promise<void>;
    static getLatestData(req: Request, res: Response): Promise<void>;
    static validateHealthKitData(req: Request, res: Response): Promise<void>;
    static getSupportedTypes(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=appleHealthController.d.ts.map