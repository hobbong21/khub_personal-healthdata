import { Request, Response } from 'express';
export declare class NotificationController {
    static getNotifications(req: Request, res: Response): Promise<void>;
    static createMedicationReminders(req: Request, res: Response): Promise<void>;
    static markAsRead(req: Request, res: Response): Promise<void>;
    static getUnreadCount(req: Request, res: Response): Promise<void>;
    static getStats(req: Request, res: Response): Promise<void>;
    static testPushNotification(req: Request, res: Response): Promise<void>;
    static createInteractionAlert(req: Request, res: Response): Promise<void>;
    static createRefillReminder(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=notificationController.d.ts.map