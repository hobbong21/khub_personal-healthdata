"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_1 = require("../models/User");
class UserService {
    static async registerUser(userData) {
        const validation = User_1.UserModel.validateProfile(userData);
        if (!validation.isValid) {
            throw new Error(`유효성 검사 실패: ${validation.errors.join(', ')}`);
        }
        const isEmailTaken = await User_1.UserModel.isEmailTaken(userData.email);
        if (isEmailTaken) {
            throw new Error('이미 사용 중인 이메일입니다');
        }
        const user = await User_1.UserModel.create(userData);
        let bmi = undefined;
        if (user.height && user.weight) {
            const bmiCalculation = User_1.UserModel.calculateBMI(user.height, user.weight);
            bmi = bmiCalculation.bmi;
        }
        return {
            ...user,
            bmi,
        };
    }
    static async getUserProfile(userId) {
        const user = await User_1.UserModel.findById(userId);
        if (!user)
            return null;
        let bmi = undefined;
        if (user.height && user.weight) {
            const bmiCalculation = User_1.UserModel.calculateBMI(user.height, user.weight);
            bmi = bmiCalculation.bmi;
        }
        return {
            ...user,
            bmi,
        };
    }
    static async updateUserProfile(userId, updateData) {
        const validation = User_1.UserModel.validateProfile(updateData);
        if (!validation.isValid) {
            throw new Error(`유효성 검사 실패: ${validation.errors.join(', ')}`);
        }
        const user = await User_1.UserModel.updateProfile(userId, updateData);
        let bmi = undefined;
        if (user.height && user.weight) {
            const bmiCalculation = User_1.UserModel.calculateBMI(user.height, user.weight);
            bmi = bmiCalculation.bmi;
        }
        return {
            ...user,
            bmi,
        };
    }
    static async authenticateUser(email, password) {
        const user = await User_1.UserModel.authenticate(email, password);
        if (!user)
            return null;
        let bmi = undefined;
        if (user.height && user.weight) {
            const bmiCalculation = User_1.UserModel.calculateBMI(user.height, user.weight);
            bmi = bmiCalculation.bmi;
        }
        return {
            ...user,
            bmi,
        };
    }
    static async authenticateSocialUser(provider, accessToken) {
        console.log(provider, accessToken);
        return null;
    }
    static async initiatePasswordReset(email) {
        console.log(email);
    }
    static async resetPassword(token, newPassword) {
        console.log(token, newPassword);
    }
    static calculateUserBMI(height, weight) {
        return User_1.UserModel.calculateBMI(height, weight);
    }
    static async getProfileCompleteness(userId) {
        const user = await User_1.UserModel.findById(userId);
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
        const completedRequired = requiredFields.filter(field => field.value !== null && field.value !== undefined && field.value !== '');
        const completedOptional = optionalFields.filter(field => field.value !== null && field.value !== undefined && field.value !== '');
        const totalFields = requiredFields.length + optionalFields.length;
        const completedFields = completedRequired.length + completedOptional.length;
        const completeness = Math.round((completedFields / totalFields) * 100);
        const missingFields = [
            ...requiredFields.filter(field => field.value === null || field.value === undefined || field.value === '').map(field => field.label),
            ...optionalFields.filter(field => field.value === null || field.value === undefined || field.value === '').map(field => field.label),
        ];
        const recommendations = [];
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
    static async changePassword(userId, currentPassword, newPassword) {
        const validation = User_1.UserModel.validateProfile({ password: newPassword });
        if (!validation.isValid) {
            throw new Error(`비밀번호 유효성 검사 실패: ${validation.errors.join(', ')}`);
        }
        const success = await User_1.UserModel.changePassword(userId, currentPassword, newPassword);
        if (!success) {
            throw new Error('현재 비밀번호가 올바르지 않습니다');
        }
    }
    static async deleteUser(userId) {
        await User_1.UserModel.delete(userId);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map