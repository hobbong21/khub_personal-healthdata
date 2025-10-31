import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { generateToken, refreshToken } from '../utils/jwt';
import { CreateUserRequest, LoginRequest, AuthResponse } from '../types/user';

/**
 * 사용자 회원가입 (요구사항 1.1, 1.2, 1.3, 1.5)
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const userData: CreateUserRequest = req.body;

    // 사용자 등록
    const user = await UserService.registerUser(userData);

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    const response: AuthResponse = {
      user,
      token,
    };

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다',
      data: response,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다';
    
    res.status(400).json({
      success: false,
      error: {
        code: 'REGISTRATION_FAILED',
        message: errorMessage,
      },
    });
  }
}

/**
 * 사용자 로그인 (요구사항 1.1, 1.5)
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password }: LoginRequest = req.body;

    // 입력 유효성 검사
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: '이메일과 비밀번호를 입력해주세요',
        },
      });
      return;
    }

    // 사용자 인증
    const user = await UserService.authenticateUser(email, password);
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '이메일 또는 비밀번호가 올바르지 않습니다',
        },
      });
      return;
    }

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    const response: AuthResponse = {
      user,
      token,
    };

    res.json({
      success: true,
      message: '로그인이 완료되었습니다',
      data: response,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다';
    
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: errorMessage,
      },
    });
  }
}

/**
 * 사용자 로그아웃 (요구사항 1.1, 1.5)
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  try {
    // JWT는 stateless이므로 서버에서 토큰을 무효화할 수 없음
    // 클라이언트에서 토큰을 삭제하도록 안내
    res.json({
      success: true,
      message: '로그아웃이 완료되었습니다',
      data: {
        instruction: '클라이언트에서 토큰을 삭제해주세요',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_FAILED',
        message: '로그아웃에 실패했습니다',
      },
    });
  }
}

/**
 * 현재 사용자 프로필 조회 (요구사항 1.1, 1.2, 1.3)
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: '인증이 필요합니다',
        },
      });
      return;
    }

    const user = await UserService.getUserProfile(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '프로필 조회에 실패했습니다';
    
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_FETCH_FAILED',
        message: errorMessage,
      },
    });
  }
}

/**
 * 토큰 갱신 (요구사항 1.5)
 */
export async function refreshAuthToken(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: '갱신할 토큰이 필요합니다',
        },
      });
      return;
    }

    // 토큰 갱신
    const newToken = refreshToken(token);

    res.json({
      success: true,
      message: '토큰이 갱신되었습니다',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '토큰 갱신에 실패했습니다';
    
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_REFRESH_FAILED',
        message: errorMessage,
      },
    });
  }
}

/**
 * 토큰 유효성 검사 (요구사항 1.5)
 */
export async function validateToken(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '유효하지 않은 토큰입니다',
        },
      });
      return;
    }

    res.json({
      success: true,
      message: '유효한 토큰입니다',
      data: {
        userId: req.user.id,
        email: req.user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'TOKEN_VALIDATION_FAILED',
        message: '토큰 검증에 실패했습니다',
      },
    });
  }
}

/**
 * 비밀번호 변경 (요구사항 1.5)
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: '인증이 필요합니다',
        },
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PASSWORDS',
          message: '현재 비밀번호와 새 비밀번호를 입력해주세요',
        },
      });
      return;
    }

    await UserService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: '비밀번호가 변경되었습니다',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다';
    
    res.status(400).json({
      success: false,
      error: {
        code: 'PASSWORD_CHANGE_FAILED',
        message: errorMessage,
      },
    });
  }
}