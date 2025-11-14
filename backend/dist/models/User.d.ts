import { CreateUserRequest, UpdateUserProfileRequest, UserProfile, BMICalculation, ProfileValidationResult } from '../types/user';
export declare class UserModel {
    static create(userData: CreateUserRequest): Promise<UserProfile>;
    static findByEmail(email: string): Promise<UserProfile | null>;
    static authenticate(email: string, password: string): Promise<UserProfile | null>;
    static findById(id: string): Promise<UserProfile | null>;
    static updateProfile(id: string, updateData: UpdateUserProfileRequest): Promise<UserProfile>;
    static calculateBMI(height: number, weight: number): BMICalculation;
    static validateProfile(userData: CreateUserRequest | UpdateUserProfileRequest): ProfileValidationResult;
    static isEmailTaken(email: string): Promise<boolean>;
    static delete(id: string): Promise<void>;
    static changePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean>;
}
//# sourceMappingURL=User.d.ts.map