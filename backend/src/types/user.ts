// 생활 습관 인터페이스 (요구사항 1.3)
export interface LifestyleHabits {
  smoking: boolean;
  alcohol: 'none' | 'light' | 'moderate' | 'heavy';
  exerciseFrequency: number; // 주당 운동 횟수
  dietType: string;
}

// 사용자 생성 요청 (요구사항 1.1, 1.2, 1.3)
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  birthDate: string; // ISO 날짜 문자열
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  height?: number; // cm 단위
  weight?: number; // kg 단위
  lifestyleHabits?: LifestyleHabits;
}

// 로그인 요청 (요구사항 1.1)
export interface LoginRequest {
  email: string;
  password: string;
}

// 사용자 프로필 업데이트 요청 (요구사항 1.2, 1.3, 1.4)
export interface UpdateUserProfileRequest {
  name?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  bloodType?: string;
  height?: number;
  weight?: number;
  lifestyleHabits?: LifestyleHabits;
}

// 사용자 응답 (요구사항 1.1, 1.2, 1.3)
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  birthDate: Date;
  gender: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  bmi?: number; // BMI 자동 계산 (요구사항 1.4)
  lifestyleHabits?: LifestyleHabits;
  createdAt: Date;
  updatedAt: Date;
}

// 인증 응답 (요구사항 1.1, 1.5)
export interface AuthResponse {
  user: UserResponse;
  token: string;
}

// 사용자 프로필 (내부 사용)
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  height?: number;
  weight?: number;
  lifestyleHabits?: LifestyleHabits;
  createdAt: Date;
  updatedAt: Date;
}

// BMI 계산 결과 (요구사항 1.4)
export interface BMICalculation {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  description: string;
}

// 프로필 유효성 검사 결과 (요구사항 1.5)
export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
}

// JWT 페이로드
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}