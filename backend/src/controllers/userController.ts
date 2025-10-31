import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { UpdateUserProfileRequest } from '../types/user';

/**
 * 사용자 프로필 업데이트 (요구사항 1.2, 1.3, 1.4)
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
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

    const updateData: UpdateUserProfileRequest = req.body;
    const updatedUser = await UserService.updateUserProfile(req.user.id, updateData);

    res.json({
      success: true,
      message: '프로필이 업데이트되었습니다',
      data: updatedUser,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다';
    
    res.status(400).json({
      success: false,
      error: {
        code: 'PROFILE_UPDATE_FAILED',
        message: errorMessage,
      },
    });
  }
}

/**
 * BMI 계산 (요구사항 1.4)
 */
export async function calculateBMI(req: Request, res: Response): Promise<void> {
  try {
    const { height, weight } = req.body;

    if (!height || !weight) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: '키와 몸무게를 입력해주세요',
        },
      });
      return;
    }

    const bmiResult = UserService.calculateUserBMI(height, weight);

    res.json({
      success: true,
      message: 'BMI가 계산되었습니다',
      data: bmiResult,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'BMI 계산에 실패했습니다';
    
    res.status(400).json({
      success: false,
      error: {
        code: 'BMI_CALCULATION_FAILED',
        message: errorMessage,
      },
    });
  }
}

/**
 * 프로필 완성도 조회 (요구사항 1.5)
 */
export async function getProfileCompleteness(req: Request, res: Response): Promise<void> {
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

    const completeness = await UserService.getProfileCompleteness(req.user.id);

    res.json({
      success: true,
      data: completeness,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '프로필 완성도 조회에 실패했습니다';
    
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPLETENESS_FETCH_FAILED',
        message: errorMessage,
      },
    });
  }
}

/**
 * 사용자 삭제 (계정 탈퇴)
 */
export async function deleteAccount(req: Request, res: Response): Promise<void> {
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

    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_REQUIRED',
          message: '계정 삭제를 위해 비밀번호를 입력해주세요',
        },
      });
      return;
    }

    // 비밀번호 확인
    const user = await UserService.authenticateUser(req.user.email, password);
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: '비밀번호가 올바르지 않습니다',
        },
      });
      return;
    }

    await UserService.deleteUser(req.user.id);

    res.json({
      success: true,
      message: '계정이 삭제되었습니다',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '계정 삭제에 실패했습니다';
    
    res.status(500).json({
      success: false,
      error: {
        code: 'ACCOUNT_DELETION_FAILED',
        message: errorMessage,
      },
    });
  }
}

/**
 * 생활습관 정보 업데이트 (요구사항 1.3)
 */
export async function updateLifestyleHabits(req: Request, res: Response): Promise<void> {
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

    const { lifestyleHabits } = req.body;

    if (!lifestyleHabits) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_LIFESTYLE_HABITS',
          message: '생활습관 정보를 입력해주세요',
        },
      });
      return;
    }

    const updatedUser = await UserService.updateUserProfile(req.user.id, {
      lifestyleHabits,
    });

    res.json({
      success: true,
      message: '생활습관 정보가 업데이트되었습니다',
      data: {
        lifestyleHabits: updatedUser.lifestyleHabits,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '생활습관 정보 업데이트에 실패했습니다';
    
    res.status(400).json({
      success: false,
      error: {
        code: 'LIFESTYLE_UPDATE_FAILED',
        message: errorMessage,
      },
    });
  }
}

/**
 * 기본 정보 업데이트 (요구사항 1.2)
 */
export async function updateBasicInfo(req: Request, res: Response): Promise<void> {
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

    const { name, birthDate, gender, bloodType } = req.body;

    const updateData: UpdateUserProfileRequest = {};
    if (name !== undefined) updateData.name = name;
    if (birthDate !== undefined) updateData.birthDate = birthDate;
    if (gender !== undefined) updateData.gender = gender;
    if (bloodType !== undefined) updateData.bloodType = bloodType;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATE_DATA',
          message: '업데이트할 정보를 입력해주세요',
        },
      });
      return;
    }

    const updatedUser = await UserService.updateUserProfile(req.user.id, updateData);

    res.json({
      success: true,
      message: '기본 정보가 업데이트되었습니다',
      data: {
        name: updatedUser.name,
        birthDate: updatedUser.birthDate,
        gender: updatedUser.gender,
        bloodType: updatedUser.bloodType,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '기본 정보 업데이트에 실패했습니다';
    
    res.status(400).json({
      success: false,
      error: {
        code: 'BASIC_INFO_UPDATE_FAILED',
        message: errorMessage,
      },
    });
  }
}

/**
 * 신체 정보 업데이트 (요구사항 1.2, 1.4)
 */
export async function updatePhysicalInfo(req: Request, res: Response): Promise<void> {
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

    const { height, weight } = req.body;

    const updateData: UpdateUserProfileRequest = {};
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATE_DATA',
          message: '업데이트할 신체 정보를 입력해주세요',
        },
      });
      return;
    }

    const updatedUser = await UserService.updateUserProfile(req.user.id, updateData);

    // BMI 계산 결과 포함
    let bmiResult = null;
    if (updatedUser.height && updatedUser.weight) {
      bmiResult = UserService.calculateUserBMI(updatedUser.height, updatedUser.weight);
    }

    res.json({
      success: true,
      message: '신체 정보가 업데이트되었습니다',
      data: {
        height: updatedUser.height,
        weight: updatedUser.weight,
        bmi: updatedUser.bmi,
        bmiDetails: bmiResult,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '신체 정보 업데이트에 실패했습니다';
    
    res.status(400).json({
      success: false,
      error: {
        code: 'PHYSICAL_INFO_UPDATE_FAILED',
        message: errorMessage,
      },
    });
  }
}