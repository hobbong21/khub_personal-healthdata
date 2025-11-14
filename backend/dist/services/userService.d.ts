import { CreateUserRequest, UpdateUserProfileRequest, UserResponse, BMICalculation } from '../types/user';
export declare class UserService {
    static registerUser(userData: CreateUserRequest): Promise<UserResponse>;
    static getUserProfile(userId: string): Promise<UserResponse | null>;
    static updateUserProfile(userId: string, updateData: UpdateUserProfileRequest): Promise<UserResponse>;
    static authenticateUser(email: string, password: string): Promise<UserResponse | null>;
    static authenticateSocialUser(provider: string, accessToken: string): Promise<UserResponse | null>;
    static initiatePasswordReset(email: string): Promise<void>;
    static resetPassword(token: string, newPassword: string): Promise<void>;
    static calculateUserBMI(height: number, weight: number): BMICalculation;
    static getProfileCompleteness(userId: string): Promise<{
        completeness: number;
        missingFields: string[];
        recommendations: string[];
    }>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    static deleteUser(userId: string): Promise<void>;
}
//# sourceMappingURL=userService.d.ts.map