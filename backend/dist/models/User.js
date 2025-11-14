"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserModel {
    static async create(userData) {
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
        const user = await database_1.default.user.create({
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
        const { password, ...userProfile } = user;
        return {
            ...userProfile,
            lifestyleHabits: userProfile.lifestyleHabits,
        };
    }
    static async findByEmail(email) {
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user)
            return null;
        const { password, ...userProfile } = user;
        return {
            ...userProfile,
            lifestyleHabits: userProfile.lifestyleHabits,
        };
    }
    static async authenticate(email, password) {
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user)
            return null;
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid)
            return null;
        const { password: _, ...userProfile } = user;
        return {
            ...userProfile,
            lifestyleHabits: userProfile.lifestyleHabits,
        };
    }
    static async findById(id) {
        const user = await database_1.default.user.findUnique({
            where: { id },
        });
        if (!user)
            return null;
        const { password, ...userProfile } = user;
        return {
            ...userProfile,
            lifestyleHabits: userProfile.lifestyleHabits,
        };
    }
    static async updateProfile(id, updateData) {
        const user = await database_1.default.user.update({
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
            lifestyleHabits: userProfile.lifestyleHabits,
        };
    }
    static calculateBMI(height, weight) {
        if (!height || !weight || height <= 0 || weight <= 0) {
            throw new Error('키와 몸무게는 양수여야 합니다');
        }
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        const roundedBMI = Math.round(bmi * 10) / 10;
        let category;
        let description;
        if (roundedBMI < 18.5) {
            category = 'underweight';
            description = '저체중';
        }
        else if (roundedBMI < 25) {
            category = 'normal';
            description = '정상체중';
        }
        else if (roundedBMI < 30) {
            category = 'overweight';
            description = '과체중';
        }
        else {
            category = 'obese';
            description = '비만';
        }
        return {
            bmi: roundedBMI,
            category,
            description,
        };
    }
    static validateProfile(userData) {
        const errors = [];
        if ('email' in userData) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                errors.push('유효한 이메일 주소를 입력해주세요');
            }
        }
        if ('password' in userData) {
            if (userData.password.length < 8) {
                errors.push('비밀번호는 최소 8자 이상이어야 합니다');
            }
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
                errors.push('비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다');
            }
        }
        if (userData.name !== undefined) {
            if (!userData.name || userData.name.trim().length < 2) {
                errors.push('이름은 최소 2자 이상이어야 합니다');
            }
        }
        if (userData.birthDate !== undefined) {
            const birthDate = new Date(userData.birthDate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (isNaN(birthDate.getTime())) {
                errors.push('유효한 생년월일을 입력해주세요');
            }
            else if (age < 0 || age > 150) {
                errors.push('유효한 나이 범위를 벗어났습니다');
            }
        }
        if (userData.gender !== undefined) {
            if (!['male', 'female', 'other'].includes(userData.gender)) {
                errors.push('유효한 성별을 선택해주세요');
            }
        }
        if (userData.height !== undefined && userData.height !== null) {
            if (userData.height < 50 || userData.height > 300) {
                errors.push('키는 50cm에서 300cm 사이여야 합니다');
            }
        }
        if (userData.weight !== undefined && userData.weight !== null) {
            if (userData.weight < 10 || userData.weight > 500) {
                errors.push('몸무게는 10kg에서 500kg 사이여야 합니다');
            }
        }
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
    static async isEmailTaken(email) {
        const user = await database_1.default.user.findUnique({
            where: { email },
            select: { id: true },
        });
        return !!user;
    }
    static async delete(id) {
        await database_1.default.user.delete({
            where: { id },
        });
    }
    static async changePassword(id, currentPassword, newPassword) {
        const user = await database_1.default.user.findUnique({
            where: { id },
        });
        if (!user)
            return false;
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid)
            return false;
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await database_1.default.user.update({
            where: { id },
            data: { password: hashedNewPassword },
        });
        return true;
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map