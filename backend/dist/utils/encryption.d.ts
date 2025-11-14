export declare function encryptSensitiveData(text: string): string;
export declare function decryptSensitiveData(encryptedData: string): string;
export declare function encryptGenomicData(data: object): string;
export declare function decryptGenomicData(encryptedData: string): object;
export declare function createDataHash(data: string): string;
export declare function verifyDataHash(data: string, hash: string): boolean;
export declare function generateSecureToken(length?: number): string;
export declare function maskPII(data: string, maskChar?: string): string;
export declare function maskEmail(email: string): string;
export declare function maskPhoneNumber(phone: string): string;
export declare function createAnonymousHash(userId: string, salt?: string): string;
export declare function createAuditHash(action: string, userId: string, timestamp: Date, data?: any): string;
//# sourceMappingURL=encryption.d.ts.map