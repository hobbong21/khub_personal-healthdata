export declare const basicRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const apiSpecificRateLimit: {
    healthData: import("express-rate-limit").RateLimitRequestHandler;
    fileUpload: import("express-rate-limit").RateLimitRequestHandler;
    aiAnalysis: import("express-rate-limit").RateLimitRequestHandler;
};
export declare const dynamicRateLimit: (req: any, res: any, next: any) => void;
export declare const rateLimitMonitor: (req: any, res: any, next: any) => void;
//# sourceMappingURL=rateLimit.d.ts.map