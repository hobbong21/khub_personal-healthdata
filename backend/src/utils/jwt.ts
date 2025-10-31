import * as jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d' as string;

/**
 * JWT 토큰 생성 (요구사항 1.1, 1.5)
 */
export function generateToken(payload: { userId: string; email: string }): string {
  const tokenPayload = {
    userId: payload.userId,
    email: payload.email,
  };

  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'health-platform',
    audience: 'health-platform-users',
  } as jwt.SignOptions;

  return jwt.sign(tokenPayload, JWT_SECRET, options);
}

/**
 * JWT 토큰 검증 (요구사항 1.1, 1.5)
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const options: jwt.VerifyOptions = {
      issuer: 'health-platform',
      audience: 'health-platform-users',
    };

    const decoded = jwt.verify(token, JWT_SECRET, options) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('토큰이 만료되었습니다');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('유효하지 않은 토큰입니다');
    } else {
      throw new Error('토큰 검증에 실패했습니다');
    }
  }
}

/**
 * Authorization 헤더에서 토큰 추출
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * 토큰 만료 시간 확인
 */
export function getTokenExpirationTime(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
}

/**
 * 토큰 갱신이 필요한지 확인 (만료 1시간 전)
 */
export function shouldRefreshToken(token: string): boolean {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) {
    return true;
  }

  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  return expirationTime <= oneHourFromNow;
}

/**
 * 토큰 갱신
 */
export function refreshToken(oldToken: string): string {
  const decoded = verifyToken(oldToken);
  return generateToken({
    userId: decoded.userId,
    email: decoded.email,
  });
}