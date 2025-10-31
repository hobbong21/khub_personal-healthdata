import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { 
  CreateUserRequest, 
  UpdateUserProfileRequest, 
  UserProfile, 
  BMICalculation, 
  ProfileValidationResult 
} from '../types/user';

export class UserModel {
  /**
   * 사용자 생성 (요구사항 1.1, 1.2, 1.3)
   */
  static async create(userData: CreateUserRequest): Promise<UserProfile> {
    // 비밀번호 해싱 (요구사항 1.5)
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        birthDate: new Date(userData.birthDate),
        gender: userData.gender,
        bloodType: userData.bloodType || null,
        height: userData.height || null,
        weight: userData.weight || null,
        lifestyleHabits: userData.lifestyleHabits ? JSON.parse(JSON.stringify(userData.lifestyleHabits)) : null,
      },
    });

    // 비밀번호 제외하고 반환
    const { password, ...userProfile } = user;
    return {
      ...userProfile,
      lifestyleHabits: userProfile.lifestyleHabits as any,
    } as UserProfile;
  }

  /**
   * 이메일로 사용자 찾기 (요구사항 1.1)
   */
  static async findByEmail(email: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    const { password, ...userProfile } = user;
    return {
      ...userProfile,
      lifestyleHabits: userProfile.lifestyleHabits as any,
    } as UserProfile;
  }

  /**
   * 이메일과 비밀번호로 사용자 인증 (요구사항 1.1, 1.5)
   */
  static async authenticate(email: string, password: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    const { password: _, ...userProfile } = user;
    return {
      ...userProfile,
      lifestyleHabits: userProfile.lifestyleHabits as any,
    } as UserProfile;
  }

  /**
   * ID로 사용자 찾기 (요구사항 1.1)
   */
  static async findById(id: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    const { password, ...userProfile } = user;
    return {
      ...userProfile,
      lifestyleHabits: userProfile.lifestyleHabits as any,
    } as UserProfile;
  }

  /**
   * 사용자 프로필 업데이트 (요구사항 1.2, 1.3, 1.4)
   */
  static async updateProfile(id: string, updateData: UpdateUserProfileRequest): Promise<UserProfile> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.birthDate && { birthDate: new Date(updateData.birthDate) }),
        ...(updateData.gender && { gender: updateData.gender }),
        ...(updateData.bloodType !== undefined && { bloodType: updateData.bloodType }),
        ...(updateData.height !== undefined && { height: updateData.height }),
        ...(updateData.weight !== undefined && { weight: updateData.weight }),
        ...(updateData.lifestyleHabits && { lifestyleHabits: JSON.parse(JSON.stringify(updateData.lifestyleHabits)) }),
      },
    });

    const { password, ...userProfile } = user;
    return {
      ...userProfile,
      lifestyleHabits: userProfile.lifestyleHabits as any,
    } as UserProfile;
  }

  /**
   * BMI 자동 계산 (요구사항 1.4)
   */
  static calculateBMI(height: number, weight: number): BMICalculation {
    if (!height || !weight || height <= 0 || weight <= 0) {
      throw new Error('키와 몸무게는 양수여야 합니다');
    }

    // BMI = 체중(kg) / (신장(m))^2
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const roundedBMI = Math.round(bmi * 10) / 10;

    let category: 'underweight' | 'normal' | 'overweight' | 'obese';
    let description: string;

    if (roundedBMI < 18.5) {
      category = 'underweight';
      description = '저체중';
    } else if (roundedBMI < 25) {
      category = 'normal';
      description = '정상체중';
    } else if (roundedBMI < 30) {
      category = 'overweight';
      description = '과체중';
    } else {
      category = 'obese';
      description = '비만';
    }

    return {
      bmi: roundedBMI,
      category,
      description,
    };
  }

  /**
   * 프로필 유효성 검사 (요구사항 1.5)
   */
  static validateProfile(userData: CreateUserRequest | UpdateUserProfileRequest): ProfileValidationResult {
    const errors: string[] = [];

    // 이메일 검증 (생성 시에만)
    if ('email' in userData) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('유효한 이메일 주소를 입력해주세요');
      }
    }

    // 비밀번호 검증 (생성 시에만)
    if ('password' in userData) {
      if (userData.password.length < 8) {
        errors.push('비밀번호는 최소 8자 이상이어야 합니다');
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
        errors.push('비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다');
      }
    }

    // 이름 검증
    if (userData.name !== undefined) {
      if (!userData.name || userData.name.trim().length < 2) {
        errors.push('이름은 최소 2자 이상이어야 합니다');
      }
    }

    // 생년월일 검증
    if (userData.birthDate !== undefined) {
      const birthDate = new Date(userData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (isNaN(birthDate.getTime())) {
        errors.push('유효한 생년월일을 입력해주세요');
      } else if (age < 0 || age > 150) {
        errors.push('유효한 나이 범위를 벗어났습니다');
      }
    }

    // 성별 검증
    if (userData.gender !== undefined) {
      if (!['male', 'female', 'other'].includes(userData.gender)) {
        errors.push('유효한 성별을 선택해주세요');
      }
    }

    // 키 검증
    if (userData.height !== undefined && userData.height !== null) {
      if (userData.height < 50 || userData.height > 300) {
        errors.push('키는 50cm에서 300cm 사이여야 합니다');
      }
    }

    // 몸무게 검증
    if (userData.weight !== undefined && userData.weight !== null) {
      if (userData.weight < 10 || userData.weight > 500) {
        errors.push('몸무게는 10kg에서 500kg 사이여야 합니다');
      }
    }

    // 생활습관 검증
    if (userData.lifestyleHabits) {
      const habits = userData.lifestyleHabits;
      
      if (habits.exerciseFrequency !== undefined) {
        if (habits.exerciseFrequency < 0 || habits.exerciseFrequency > 14) {
          errors.push('주당 운동 횟수는 0회에서 14회 사이여야 합니다');
        }
      }

      if (habits.alcohol !== undefined) {
        if (!['none', 'light', 'moderate', 'heavy'].includes(habits.alcohol)) {
          errors.push('유효한 음주 수준을 선택해주세요');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 이메일 중복 확인 (요구사항 1.1)
   */
  static async isEmailTaken(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return !!user;
  }

  /**
   * 사용자 삭제
   */
  static async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * 비밀번호 변경 (요구사항 1.5)
   */
  static async changePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return false;

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) return false;

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return true;
  }
}