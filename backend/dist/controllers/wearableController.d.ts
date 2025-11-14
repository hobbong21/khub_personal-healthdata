import { Request, Response } from 'express';
export declare class WearableController {
    static authenticateDevice(req: Request, res: Response): Promise<void>;
    static syncWearableData(req: Request, res: Response): Promise<void>;
    static getUserDevices(req: Request, res: Response): Promise<void>;
    static updateDeviceConfig(req: Request, res: Response): Promise<void>;
    static disconnectDevice(req: Request, res: Response): Promise<void>;
    static getSyncStatus(req: Request, res: Response): Promise<void>;
    static getDeviceData(req: Request, res: Response): Promise<void>;
    static configureAutoSync(req: Request, res: Response): Promise<void>;
    static triggerManualSync(req: Request, res: Response): Promise<void>;
    static getSupportedDataTypes(req: Request, res: Response): Promise<void>;
    private static getDataTypeName;
    private static getDataTypeUnit;
    private static getDataTypeCategory;
}
//# sourceMappingURL=wearableController.d.ts.map