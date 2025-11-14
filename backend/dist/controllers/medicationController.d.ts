import { Request, Response } from 'express';
export declare class MedicationController {
    static createMedication(req: Request, res: Response): Promise<void>;
    static getMedications(req: Request, res: Response): Promise<void>;
    static updateMedication(req: Request, res: Response): Promise<void>;
    static deleteMedication(req: Request, res: Response): Promise<void>;
    static createSchedule(req: Request, res: Response): Promise<void>;
    static logDosage(req: Request, res: Response): Promise<void>;
    static reportSideEffect(req: Request, res: Response): Promise<void>;
    static getTodaySchedule(req: Request, res: Response): Promise<void>;
    static checkInteractions(req: Request, res: Response): Promise<void>;
    static getAdherence(req: Request, res: Response): Promise<void>;
    static getStats(req: Request, res: Response): Promise<void>;
    static getReminders(req: Request, res: Response): Promise<void>;
    static searchMedications(req: Request, res: Response): Promise<void>;
    static getExpiringMedications(req: Request, res: Response): Promise<void>;
    static checkNewMedicationInteractions(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=medicationController.d.ts.map