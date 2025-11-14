import { LifestyleHabits, UserProfile } from '../types/user';
export declare function calculateAge(birthDate: Date): number;
export declare function calculateLifestyleScore(habits: LifestyleHabits): number;
export declare function assessBasicHealthRisk(user: UserProfile): {
    riskLevel: 'low' | 'moderate' | 'high';
    factors: string[];
    recommendations: string[];
};
export declare function maskSensitiveData(user: UserProfile): Partial<UserProfile>;
export declare function calculateProfileCompleteness(user: UserProfile): number;
export declare function extractEmailDomain(email: string): string;
export declare function generateDisplayName(user: UserProfile): string;
export declare function recommendHealthGoals(user: UserProfile): string[];
//# sourceMappingURL=userUtils.d.ts.map