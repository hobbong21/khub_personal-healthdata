export interface LifestyleHabits {
  smoking: boolean;
  alcohol: 'none' | 'light' | 'moderate' | 'heavy';
  exerciseFrequency: number;
  dietType: string;
}

export interface CreateUserRequest {
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  bloodType?: string;
  height?: number;
  weight?: number;
  lifestyleHabits?: LifestyleHabits;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  lifestyleHabits?: LifestyleHabits;
  createdAt: Date;
  updatedAt: Date;
  role?: string; // Added role
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

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
  role?: string; // Added role
}

export interface BMICalculation {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  description: string;
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
