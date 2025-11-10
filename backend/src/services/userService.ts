import { UserModel } from '../models/User';
import { 
  CreateUserRequest, 
  UpdateUserProfileRequest, 
  UserResponse, 
  BMICalculation
} from '../types/user';

export class UserService {
  /**
   * 사용자 등록 (요구사항 1.1, 1.2, 1.3, 1.5)
   */
  static async registerUser(userData: CreateUserRequest): Promise<UserResponse> {
    // 프로필 유효성 검사
    const validation = UserModel.validateProfile(userData);
    if (!validation.isValid) {
      throw new Error(`유효성 검사 실패: ${validation.errors.join(', ')}`);
    }

    // 이메일 중복 확인
    const isEmailTaken = await UserModel.isEmailTaken(userData.email);
    if (isEmailTaken) {
      throw new Error('이미 사용 중인 이메일입니다');
    }

    // 사용자 생성
    const user = await UserModel.create(userData);
    
    // BMI 계산 (키와 몸무게가 있는 경우)
    let bmi: number | undefined = undefined;
    if (user.height && user.weight) {
      const bmiCalculation = UserModel.calculateBMI(user.height, user.weight);
      bmi = bmiCalculation.bmi;
    }

    return {
      ...user,
      bmi,
    } as UserResponse;
  }

  /**
   * 사용자 프로필 조회 (요구사항 1.1, 1.2, 1.3)
   */
  static async getUserProfile(userId: string): Promise<UserResponse | null> {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    // BMI 계산 (키와 몸무게가 있는 경우)
    let bmi: number | undefined = undefined;
    if (user.height && user.weight) {
      const bmiCalculation = UserModel.calculateBMI(user.height, user.weight);
      bmi = bmiCalculation.bmi;
    }

    return {
      ...user,
      bmi,
    } as UserResponse;
  }

  /**
   * 사용자 프로필 업데이트 (요구사항 1.2, 1.3, 1.4)
   */
  static async updateUserProfile(userId: string, updateData: UpdateUserProfileRequest): Promise<UserResponse> {
    // 프로필 유효성 검사
    const validation = UserModel.validateProfile(updateData);
    if (!validation.isValid) {
      throw new Error(`유효성 검사 실패: ${validation.errors.join(', ')}`);
    }

    // 프로필 업데이트
    const user = await UserModel.updateProfile(userId, updateData);
    
    // BMI 재계산 (키와 몸무게가 있는 경우)
    let bmi: number | undefined = undefined;
    if (user.height && user.weight) {
      const bmiCalculation = UserModel.calculateBMI(user.height, user.weight);
      bmi = bmiCalculation.bmi;
    }

    return {
      ...user,
      bmi,
    } as UserResponse;
  }

  /**
   * 사용자 인증 (요구사항 1.1, 1.5)
   */
  static async authenticateUser(email: string, password: string): Promise<UserResponse | null> {
    const user = await UserModel.authenticate(email, password);
    if (!user) return null;

    // BMI 계산 (키와 몸무게가 있는 경우)
    let bmi: number | undefined = undefined;
    if (user.height && user.weight) {
      const bmiCalculation = UserModel.calculateBMI(user.height, user.weight);
      bmi = bmiCalculation.bmi;
    }

    return {
      ...user,
      bmi,
    } as UserResponse;
  }

  static async authenticateSocialUser(provider: string, accessToken: string): Promise<UserResponse | null> {
    console.log(provider, accessToken);
    return null;
  }
  
  static async initiatePasswordReset(email: string): Promise<void> {
    console.log(email);
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    console.log(token, newPassword);
  }

  /**
   * BMI 계산 및 분석 (요구사항 1.4)
   */
  static calculateUserBMI(height: number, weight: number): BMICalculation {
    return UserModel.calculateBMI(height, weight);
  }

  /**
   * 프로필 완성도 확인 (요구사항 1.5)
   */
  static async getProfileCompleteness(userId: string): Promise<{
    completeness: number;
    missingFields: string[];
    recommendations: string[];
  }> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다');
    }

    const requiredFields = [
      { field: 'name', value: user.name, label: '이름' },
      { field: 'birthDate', value: user.birthDate, label: '생년월일' },
      { field: 'gender', value: user.gender, label: '성별' },
      { field: 'height', value: user.height, label: '키' },
      { field: 'weight', value: user.weight, label: '몸무게' },
    ];

    const optionalFields = [
      { field: 'bloodType', value: user.bloodType, label: '혈액형' },
      { field: 'lifestyleHabits', value: user.lifestyleHabits, label: '생활습관' },
    ];

    const completedRequired = requiredFields.filter(field => 
      field.value !== null && field.value !== undefined && field.value !== ''
    );

    const completedOptional = optionalFields.filter(field => 
      field.value !== null && field.value !== undefined && field.value !== ''
    );

    const totalFields = requiredFields.length + optionalFields.length;
    const completedFields = completedRequired.length + completedOptional.length;
    const completeness = Math.round((completedFields / totalFields) * 100);

    const missingFields = [
      ...requiredFields.filter(field => 
        field.value === null || field.value === undefined || field.value === ''
      ).map(field => field.label),
      ...optionalFields.filter(field => 
        field.value === null || field.value === undefined || field.value === ''
      ).map(field => field.label),
    ];

    const recommendations: string[] = [];
    
    if (!user.height || !user.weight) {
      recommendations.push('키와 몸무게를 입력하면 BMI를 자동으로 계산해드립니다');
    }
    
    if (!user.lifestyleHabits) {
      recommendations.push('생활습관 정보를 입력하면 더 정확한 건강 분석을 받을 수 있습니다');
    }
    
    if (!user.bloodType) {
      recommendations.push('혈액형 정보는 응급상황에서 유용할 수 있습니다');
    }

    return {
      completeness,
      missingFields,
      recommendations,
    };
  }

  /**
   * 비밀번호 변경 (요구사항 1.5)
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // 새 비밀번호 유효성 검사
    const validation = UserModel.validateProfile({ password: newPassword } as CreateUserRequest);
    if (!validation.isValid) {
      throw new Error(`비밀번호 유효성 검사 실패: ${validation.errors.join(', ')}`);
    }

    const success = await UserModel.changePassword(userId, currentPassword, newPassword);
    if (!success) {
      throw new Error('현재 비밀번호가 올바르지 않습니다');
    }
  }

  /**
   * 사용자 계정 삭제
   */
  static async deleteUser(userId: string): Promise<void> {
    await UserModel.delete(userId);
  }
}