import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { generateToken, refreshToken } from '../utils/jwt';
import { CreateUserRequest, LoginRequest, AuthResponse } from '../types/user';

// ... (기존 register, login, logout, getProfile, refreshAuthToken, validateToken, changePassword 함수)

/**
 * 소셜 로그인 (요구사항 1.1, 1.5)
 */
export async function socialLogin(req: Request, res: Response): Promise<void> {
  try {
    const { provider, accessToken } = req.body;

    // 소셜 로그인 서비스 로직 호출 (추상화된 서비스)
    const user = await UserService.authenticateSocialUser(provider, accessToken);

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'SOCIAL_LOGIN_FAILED',
          message: '소셜 로그인에 실패했습니다. 유효하지 않은 정보입니다.',
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
      message: '소셜 로그인이 완료되었습니다',
      data: response,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '소셜 로그인 처리 중 오류가 발생했습니다';
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SOCIAL_LOGIN_ERROR',
        message: errorMessage,
      },
    });
  }
}

/**
 * 비밀번호 재설정 요청 (요구사항 1.5)
 */
export async function requestPasswordReset(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: '이메일을 입력해주세요',
        },
      });
      return;
    }

    await UserService.initiatePasswordReset(email);

    res.json({
      success: true,
      message: '비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요.',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '비밀번호 재설정 요청에 실패했습니다';
    
    res.status(400).json({
      success: false,
      error: {
        code: 'PASSWORD_RESET_REQUEST_FAILED',
        message: errorMessage,
      },
    });
  }
}

/**
 * 비밀번호 재설정 (요구사항 1.5)
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_RESET_DATA',
          message: '재설정 토큰과 새 비밀번호를 입력해주세요',
        },
      });
      return;
    }

    await UserService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: '비밀번호가 성공적으로 재설정되었습니다',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '비밀번호 재설정에 실패했습니다';
    
    res.status(400).json({
      success: false,
      error: {
        code: 'PASSWORD_RESET_FAILED',
        message: errorMessage,
      },
    });
  }
}
