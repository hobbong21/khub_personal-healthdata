import { Request, Response } from 'express';
export declare class GoogleFitController {
    private googleFitService;
    constructor();
    getAuthUrl(req: Request, res: Response): Promise<void>;
    handleAuthCallback(req: Request, res: Response): Promise<void>;
    syncData(req: Request, res: Response): Promise<void>;
    getDataByType(req: Request, res: Response): Promise<void>;
    getConnectionStatus(req: Request, res: Response): Promise<void>;
    disconnectDevice(req: Request, res: Response): Promise<void>;
    private getUserGoogleFitConfig;
    private deactivateGoogleFitConfig;
    private isValidDataType;
    updateSyncSettings(req: Request, res: Response): Promise<void>;
    getUserProfile(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=googleFitController.d.ts.map