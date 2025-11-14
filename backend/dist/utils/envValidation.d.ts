export interface EnvValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    missing: string[];
    recommendations: string[];
}
export declare function validateEnvironmentVariables(): EnvValidationResult;
export declare function setDefaultEnvironmentVariables(): void;
export declare function generateEnvironmentReport(): {
    environment: string;
    configuredVars: string[];
    missingVars: string[];
    securityLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
};
export declare function maskSensitiveEnvVars(): Record<string, string>;
export declare function initializeEnvironment(): boolean;
declare const _default: {
    validateEnvironmentVariables: typeof validateEnvironmentVariables;
    setDefaultEnvironmentVariables: typeof setDefaultEnvironmentVariables;
    generateEnvironmentReport: typeof generateEnvironmentReport;
    maskSensitiveEnvVars: typeof maskSensitiveEnvVars;
    initializeEnvironment: typeof initializeEnvironment;
};
export default _default;
//# sourceMappingURL=envValidation.d.ts.map