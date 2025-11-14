import { RecommendationInput, NutritionRecommendation, ExerciseRecommendation, ScreeningRecommendation, LifestyleRecommendation, PersonalizedRecommendations, RecommendationGenerationConfig } from '../types/recommendations';
export declare class RecommendationEngine {
    static generatePersonalizedRecommendations(input: RecommendationInput, config?: RecommendationGenerationConfig): Promise<Omit<PersonalizedRecommendations, 'id' | 'userId' | 'generatedAt'>>;
    static generateNutritionRecommendations(input: RecommendationInput, config: RecommendationGenerationConfig): Promise<NutritionRecommendation[]>;
    static generateExerciseRecommendations(input: RecommendationInput, config: RecommendationGenerationConfig): Promise<ExerciseRecommendation[]>;
    static generateScreeningRecommendations(input: RecommendationInput, config: RecommendationGenerationConfig): Promise<ScreeningRecommendation[]>;
    static generateLifestyleRecommendations(input: RecommendationInput, config: RecommendationGenerationConfig): Promise<LifestyleRecommendation[]>;
    private static getGenomicsBasedNutrition;
    private static getGenomicsBasedExercise;
    private static getGenomicsBasedScreening;
    private static getHealthBasedNutrition;
    private static getHealthBasedExercise;
    private static getAgeGenderBasedScreening;
    private static getAgeGenderBasedExercise;
    private static prioritizeAndFilter;
    private static calculateOverallConfidence;
    private static getLifestyleBasedNutrition;
    private static getFamilyHistoryBasedNutrition;
    private static getMedicalHistoryBasedExercise;
    private static getFamilyHistoryBasedScreening;
    private static getRiskFactorBasedScreening;
    private static getHealthBasedLifestyle;
    private static getLifestyleImprovements;
    private static getMedicalHistoryBasedLifestyle;
}
//# sourceMappingURL=recommendationEngine.d.ts.map