import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { UserModel } from '../models/User';

// Express Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * JWT 토큰 검증 미들웨어 (요구사항 1.1, 1.5)
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: '인증 토큰이 필요합니다',
        },
      });
      return;
    }

    // 토큰 검증
    const decoded = verifyToken(token);

    // 사용자 존재 확인
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다',
        },
      });
      return;
    }

    // 요청 객체에 사용자 정보 추가
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '인증에 실패했습니다';
    
    res.status(401).json({
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: errorMessage,
      },
    });
  }
}

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      const user = await UserModel.findById(decoded.userId);
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
        };
      }
    }

    next();
  } catch (error) {
    // 선택적 인증이므로 에러가 발생해도 계속 진행
    next();
  }
}

/**
 * 관리자 권한 확인 미들웨어 (향후 확장용)
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: '인증이 필요합니다',
      },
    });
    return;
  }

  // 향후 사용자 역할 시스템 구현 시 확장
  // 현재는 모든 인증된 사용자를 허용
  next();
}

/**
 * Rate limiting을 위한 사용자 식별 미들웨어
 */
export function identifyUser(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      // 토큰이 유효하지 않아도 IP 기반으로 rate limiting 적용
    }
  }

  next();
}