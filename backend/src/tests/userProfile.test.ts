import { UserService } from '../services/userService';
import { CreateUserRequest, UpdateUserProfileRequest } from '../types/user';

// Mock the UserModel
jest.mock('../models/User');

describe('UserService Profile Management', () => {
  const mockUser: CreateUserRequest = {
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

  describe('Profile Updates', () => {
    it('should update basic profile information', async () => {
      const updateData: UpdateUserProfileRequest = {
        name: '김철수',
        bloodType: 'A+',
      };

      // Mock the UserModel methods
      const { UserModel } = require('../models/User');
      UserModel.validateProfile = jest.fn().mockReturnValue({ isValid: true, errors: [] });
      UserModel.calculateBMI = jest.fn().mockReturnValue({ bmi: 22.9, category: 'normal', description: '정상체중' });
      UserModel.updateProfile = jest.fn().mockResolvedValue({
        id: 'user-123',
        email: mockUser.email,
        name: updateData.name,
        birthDate: new Date(mockUser.birthDate),
        gender: mockUser.gender,
        bloodType: updateData.bloodType,
        height: mockUser.height,
        weight: mockUser.weight,
        lifestyleHabits: mockUser.lifestyleHabits,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await UserService.updateUserProfile('user-123', updateData);

      expect(result.name).toBe(updateData.name);
      expect(result.bloodType).toBe(updateData.bloodType);
      expect(result.bmi).toBeDefined();
    });

    it('should update physical information and recalculate BMI', async () => {
      const updateData: UpdateUserProfileRequest = {
        height: 180,
        weight: 75,
      };

      const { UserModel } = require('../models/User');
      UserModel.validateProfile = jest.fn().mockReturnValue({ isValid: true, errors: [] });
      UserModel.calculateBMI = jest.fn().mockReturnValue({ bmi: 23.1, category: 'normal', description: '정상체중' });
      UserModel.updateProfile = jest.fn().mockResolvedValue({
        id: 'user-123',
        email: mockUser.email,
        name: mockUser.name,
        birthDate: new Date(mockUser.birthDate),
        gender: mockUser.gender,
        bloodType: mockUser.bloodType,
        height: updateData.height,
        weight: updateData.weight,
        lifestyleHabits: mockUser.lifestyleHabits,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await UserService.updateUserProfile('user-123', updateData);

      expect(result.height).toBe(updateData.height);
      expect(result.weight).toBe(updateData.weight);
      expect(result.bmi).toBeDefined();
      
      // BMI should be calculated: 75 / (1.8)^2 ≈ 23.1
      expect(result.bmi).toBeCloseTo(23.1, 1);
    });

    it('should update lifestyle habits', async () => {
      const updateData: UpdateUserProfileRequest = {
        lifestyleHabits: {
          smoking: false,
          alcohol: 'none',
          exerciseFrequency: 5,
          dietType: 'healthy',
        },
      };

      const { UserModel } = require('../models/User');
      UserModel.validateProfile = jest.fn().mockReturnValue({ isValid: true, errors: [] });
      UserModel.calculateBMI = jest.fn().mockReturnValue({ bmi: 22.9, category: 'normal', description: '정상체중' });
      UserModel.updateProfile = jest.fn().mockResolvedValue({
        id: 'user-123',
        email: mockUser.email,
        name: mockUser.name,
        birthDate: new Date(mockUser.birthDate),
        gender: mockUser.gender,
        bloodType: mockUser.bloodType,
        height: mockUser.height,
        weight: mockUser.weight,
        lifestyleHabits: updateData.lifestyleHabits,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await UserService.updateUserProfile('user-123', updateData);

      expect(result.lifestyleHabits).toEqual(updateData.lifestyleHabits);
    });
  });

  describe('BMI Calculation', () => {
    beforeEach(() => {
      const { UserModel } = require('../models/User');
      UserModel.calculateBMI = jest.fn().mockImplementation((height: number, weight: number) => {
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
        
        return { bmi: roundedBMI, category, description };
      });
    });

    it('should calculate BMI correctly for normal weight', () => {
      const result = UserService.calculateUserBMI(175, 70);
      
      expect(result.bmi).toBeCloseTo(22.9, 1);
      expect(result.category).toBe('normal');
      expect(result.description).toBe('정상체중');
    });

    it('should calculate BMI correctly for underweight', () => {
      const result = UserService.calculateUserBMI(175, 50);
      
      expect(result.bmi).toBeCloseTo(16.3, 1);
      expect(result.category).toBe('underweight');
      expect(result.description).toBe('저체중');
    });

    it('should calculate BMI correctly for overweight', () => {
      const result = UserService.calculateUserBMI(175, 80);
      
      expect(result.bmi).toBeCloseTo(26.1, 1);
      expect(result.category).toBe('overweight');
      expect(result.description).toBe('과체중');
    });

    it('should calculate BMI correctly for obese', () => {
      const result = UserService.calculateUserBMI(175, 100);
      
      expect(result.bmi).toBeCloseTo(32.7, 1);
      expect(result.category).toBe('obese');
      expect(result.description).toBe('비만');
    });
  });

  describe('Profile Completeness', () => {
    it('should calculate profile completeness correctly', async () => {
      const { UserModel } = require('../models/User');
      UserModel.findById = jest.fn().mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: '홍길동',
        birthDate: new Date('1990-01-01'),
        gender: 'male',
        bloodType: 'A+',
        height: 175,
        weight: 70,
        lifestyleHabits: {
          smoking: false,
          alcohol: 'light',
          exerciseFrequency: 3,
          dietType: 'balanced',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await UserService.getProfileCompleteness('user-123');

      expect(result.completeness).toBe(100); // All fields filled
      expect(result.missingFields).toHaveLength(0);
      expect(result.recommendations).toBeDefined();
    });

    it('should identify missing fields correctly', async () => {
      const { UserModel } = require('../models/User');
      UserModel.findById = jest.fn().mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: '홍길동',
        birthDate: new Date('1990-01-01'),
        gender: 'male',
        bloodType: null, // Missing
        height: null, // Missing
        weight: null, // Missing
        lifestyleHabits: null, // Missing
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await UserService.getProfileCompleteness('user-123');

      expect(result.completeness).toBeLessThan(100);
      expect(result.missingFields).toContain('혈액형');
      expect(result.missingFields).toContain('키');
      expect(result.missingFields).toContain('몸무게');
      expect(result.missingFields).toContain('생활습관');
    });
  });

  describe('Validation', () => {
    it('should reject invalid profile updates', async () => {
      const invalidUpdateData: UpdateUserProfileRequest = {
        height: 500, // Invalid height
        weight: -10, // Invalid weight
      };

      const { UserModel } = require('../models/User');
      UserModel.validateProfile = jest.fn().mockReturnValue({
        isValid: false,
        errors: ['키는 50cm에서 300cm 사이여야 합니다', '몸무게는 10kg에서 500kg 사이여야 합니다'],
      });

      await expect(
        UserService.updateUserProfile('user-123', invalidUpdateData)
      ).rejects.toThrow('유효성 검사 실패');
    });

    it('should validate lifestyle habits correctly', async () => {
      const invalidLifestyleHabits = {
        lifestyleHabits: {
          smoking: false,
          alcohol: 'invalid' as any,
          exerciseFrequency: 20, // Too high
          dietType: 'balanced',
        },
      };

      const { UserModel } = require('../models/User');
      UserModel.validateProfile = jest.fn().mockReturnValue({
        isValid: false,
        errors: ['유효한 음주 수준을 선택해주세요', '주당 운동 횟수는 0회에서 14회 사이여야 합니다'],
      });

      await expect(
        UserService.updateUserProfile('user-123', invalidLifestyleHabits)
      ).rejects.toThrow('유효성 검사 실패');
    });
  });
});