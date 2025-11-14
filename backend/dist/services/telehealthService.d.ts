import { Appointment } from '../types/appointment';
export declare const TelehealthService: {
    scheduleTelehealthSession(userId: string, dateTime: string, providerId: string): Promise<Appointment>;
    getTelehealthSessions(userId: string): Promise<Appointment[]>;
    getTelehealthSessionDetails(sessionId: string, userId: string): Promise<Appointment | null>;
    cancelTelehealthSession(sessionId: string, userId: string): Promise<Appointment | null>;
    connectToTelehealthSession(sessionId: string, userId: string): Promise<{
        connectUrl: string;
        status: string;
    }>;
};
//# sourceMappingURL=telehealthService.d.ts.map