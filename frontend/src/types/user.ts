// 생활 습관 인터페이스 (요구사항 1.3)
export interface LifestyleHabits {
  smoking: boolean;
  alcohol: 'none' | 'light' | 'moderate' | 'heavy';
  exerciseFrequency: number; // 주당 운동 횟수
  dietType: string;
}

// 사용자 프로필 (요구사항 1.1, 1.2, 1.3)
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  height?: number;
  weight?: number;
  bmi?: number; // BMI 자동 계산 (요구사항 1.4)
  lifestyleHabits?: LifestyleHabits;
  createdAt: Date;
  updatedAt: Date;
}

// 로그인 요청 (요구사항 1.1)
export interface LoginRequest {
  email: string;
  password: string;
}

// 회원가입 요청 (요구사항 1.1, 1.2, 1.3)
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  height?: number;
  weight?: number;
  lifestyleHabits?: LifestyleHabits;
}

// 프로필 업데이트 요청 (요구사항 1.2, 1.3, 1.4)
export interface UpdateProfileRequest {
  name?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  bloodType?: string;
  height?: number;
  weight?: number;
  lifestyleHabits?: LifestyleHabits;
}

// 인증 응답 (요구사항 1.1, 1.5)
export interface AuthResponse {
  user: UserProfile;
  token: string;
}

// API 응답 기본 구조
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// BMI 계산 결과 (요구사항 1.4)
export interface BMICalculation {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  description: string;
}

// 프로필 완성도 (요구사항 1.5)
export interface ProfileCompleteness {
  completeness: number;
  missingFields: string[];
  recommendations: string[];
}