import { PersonalizedRecommendations, RecommendationEffectiveness, RecommendationGenerationConfig } from '../types/recommendations';
export declare class RecommendationService {
    static generatePersonalizedRecommendations(userId: string, config?: Partial<RecommendationGenerationConfig>): Promise<PersonalizedRecommendations>;
    static getLatestRecommendations(userId: string): Promise<PersonalizedRecommendations | null>;
    static getRecommendationsHistory(userId: string, limit?: number): Promise<PersonalizedRecommendations[]>;
    static trackRecommendationEffectiveness(effectiveness: Omit<RecommendationEffectiveness, 'lastUpdated'>): Promise<RecommendationEffectiveness>;
    static getEffectivenessData(userId: string, category?: string): Promise<RecommendationEffectiveness[]>;
    static getRecommendationStats(userId: string): Promise<{
        totalRecommendations: number;
        implementedRecommendations: number;
        implementationRate: number;
        averageAdherence: number;
    }>;
    static updateImplementationStatus(recommendationId: string, userId: string, category: string, implemented: boolean, implementationDate?: Date): Promise<RecommendationEffectiveness>;
    static submitUserFeedback(recommendationId: string, userId: string, category: string, feedback: {
        rating: number;
        comments?: string;
    }): Promise<RecommendationEffectiveness>;
    static updateAdherenceScore(recommendationId: string, userId: string, category: string, adherenceScore: number): Promise<RecommendationEffectiveness>;
    static recordMeasuredOutcome(recommendationId: string, userId: string, category: string, outcome: {
        metric: string;
        beforeValue: number;
        afterValue: number;
        improvementPercentage: number;
    }): Promise<RecommendationEffectiveness>;
    static getLifestyleImprovementSuggestions(userId: string): Promise<{
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    }>;
    static getPersonalizedScreeningSchedule(userId: string): Promise<any[]>;
    private static gatherUserData;
    private static getUserHealthData;
    private static processVitalSigns;
    private static calculateAge;
    private static generateLifestyleSuggestions;
    private static generateScreeningSchedule;
    private static getAverageVitalSign;
}
//# sourceMappingURL=recommendationService.d.ts.map