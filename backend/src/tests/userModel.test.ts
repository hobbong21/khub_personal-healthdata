import { UserModel } from '../models/User';
import { CreateUserRequest, UpdateUserProfileRequest } from '../types/user';

// Mock Prisma for testing
jest.mock('../config/database', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('UserModel', () => {
  describe('validateProfile', () => {
    it('should validate a correct user profile', () => {
      const userData: CreateUserRequest = {
        email: 'test@example.com',
        password: 'Password123',
        name: '홍길동',
        birthDate: '1990-01-01',
        gender: 'male',
        height: 175,
        weight: 70,
        lifestyleHabits: {
          smoking: false,
          alcohol: 'light',
          exerciseFrequency: 3,
          dietType: 'balanced',
        },
      };

      const result = UserModel.validateProfile(userData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email', () => {
      const userData: CreateUserRequest = {
        email: 'invalid-email',
        password: 'Password123',
        name: '홍길동',
        birthDate: '1990-01-01',
        gender: 'male',
      };

      const result = UserModel.validateProfile(userData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('유효한 이메일 주소를 입력해주세요');
    });

    it('should reject weak password', () => {
      const userData: CreateUserRequest = {
        email: 'test@example.com',
        password: '123',
        name: '홍길동',
        birthDate: '1990-01-01',
        gender: 'male',
      };

      const result = UserModel.validateProfile(userData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('비밀번호는 최소 8자 이상이어야 합니다');
    });

    it('should reject invalid height and weight', () => {
      const userData: UpdateUserProfileRequest = {
        height: 500, // 너무 큰 키
        weight: 1000, // 너무 큰 몸무게
      };

      const result = UserModel.validateProfile(userData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('키는 50cm에서 300cm 사이여야 합니다');
      expect(result.errors).toContain('몸무게는 10kg에서 500kg 사이여야 합니다');
    });
  });

  describe('calculateBMI', () => {
    it('should calculate BMI correctly', () => {
      const result = UserModel.calculateBMI(175, 70);
      
      expect(result.bmi).toBeCloseTo(22.9, 1);
      expect(result.category).toBe('normal');
      expect(result.description).toBe('정상체중');
    });

    it('should categorize BMI correctly', () => {
      // 저체중
      const underweight = UserModel.calculateBMI(175, 50);
      expect(underweight.category).toBe('underweight');
      expect(underweight.description).toBe('저체중');

      // 과체중
      const overweight = UserModel.calculateBMI(175, 80);
      expect(overweight.category).toBe('overweight');
      expect(overweight.description).toBe('과체중');

      // 비만
      const obese = UserModel.calculateBMI(175, 100);
      expect(obese.category).toBe('obese');
      expect(obese.description).toBe('비만');
    });

    it('should throw error for invalid inputs', () => {
      expect(() => UserModel.calculateBMI(0, 70)).toThrow('키와 몸무게는 양수여야 합니다');
      expect(() => UserModel.calculateBMI(175, 0)).toThrow('키와 몸무게는 양수여야 합니다');
      expect(() => UserModel.calculateBMI(-175, 70)).toThrow('키와 몸무게는 양수여야 합니다');
    });
  });
});

describe('User Profile Validation Edge Cases', () => {
  it('should handle missing optional fields', () => {
    const userData: CreateUserRequest = {
      email: 'test@example.com',
      password: 'Password123',
      name: '홍길동',
      birthDate: '1990-01-01',
      gender: 'male',
    };

    const result = UserModel.validateProfile(userData);
    expect(result.isValid).toBe(true);
  });

  it('should validate lifestyle habits', () => {
    const userData: CreateUserRequest = {
      email: 'test@example.com',
      password: 'Password123',
      name: '홍길동',
      birthDate: '1990-01-01',
      gender: 'male',
      lifestyleHabits: {
        smoking: false,
        alcohol: 'invalid' as any, // 잘못된 값
        exerciseFrequency: 20, // 너무 큰 값
        dietType: 'balanced',
      },
    };

    const result = UserModel.validateProfile(userData);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('유효한 음주 수준을 선택해주세요');
    expect(result.errors).toContain('주당 운동 횟수는 0회에서 14회 사이여야 합니다');
  });

  it('should validate age range', () => {
    const futureDate: CreateUserRequest = {
      email: 'test@example.com',
      password: 'Password123',
      name: '홍길동',
      birthDate: '2030-01-01', // 미래 날짜
      gender: 'male',
    };

    const result = UserModel.validateProfile(futureDate);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('유효한 나이 범위를 벗어났습니다');
  });
});