import { JWTPayload } from '../types/user';
export declare function generateToken(payload: {
    userId: string;
    email: string;
}): string;
export declare function verifyToken(token: string): JWTPayload;
export declare function extractTokenFromHeader(authHeader: string | undefined): string | null;
export declare function getTokenExpirationTime(token: string): Date | null;
export declare function shouldRefreshToken(token: string): boolean;
export declare function refreshToken(oldToken: string): string;
//# sourceMappingURL=jwt.d.ts.map