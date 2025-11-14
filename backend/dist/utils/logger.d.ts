import winston from 'winston';
export declare const logger: winston.Logger;
export declare const httpLogger: (req: any, res: any, next: any) => void;
export declare class PerformanceLogger {
    private static metrics;
    static logApiResponse(endpoint: string, duration: number): void;
    static getMetrics(): Record<string, any>;
    static clearMetrics(): void;
}
export declare const logError: (error: Error, context?: any) => void;
export declare const logSecurityEvent: (event: string, details: any) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map