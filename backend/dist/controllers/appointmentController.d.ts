import { Request, Response } from 'express';
export declare class AppointmentController {
    static createAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAppointments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getUpcomingAppointments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAppointmentStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateAppointmentStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static cancelAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAppointmentsForCalendar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static searchAppointments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static rescheduleAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getTodaysAppointments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=appointmentController.d.ts.map