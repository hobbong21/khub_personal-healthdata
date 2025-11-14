import { PersonalizedRecommendations, RecommendationEffectiveness } from '../types/recommendations';
export declare class RecommendationManager {
    static createRecommendations(userId: string, recommendations: Omit<PersonalizedRecommendations, 'id' | 'userId' | 'generatedAt'>): Promise<PersonalizedRecommendations>;
    static getLatestRecommendations(userId: string): Promise<PersonalizedRecommendations | null>;
    static getUserRecommendations(userId: string, limit?: number): Promise<PersonalizedRecommendations[]>;
    static updateRecommendationValidity(recommendationId: string, validUntil: Date): Promise<void>;
    static deleteExpiredRecommendations(): Promise<number>;
    static trackEffectiveness(effectiveness: Omit<RecommendationEffectiveness, 'lastUpdated'>): Promise<RecommendationEffectiveness>;
    static getEffectivenessData(userId: string, category?: string): Promise<RecommendationEffectiveness[]>;
    static getRecommendationStats(userId: string): Promise<{
        totalRecommendations: number;
        implementedRecommendations: number;
        implementationRate: number;
        averageAdherence: number;
    }>;
}
//# sourceMappingURL=Recommendation.d.ts.map