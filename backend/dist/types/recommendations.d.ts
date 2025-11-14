export interface RecommendationInput {
    userId: string;
    genomicData?: any;
    healthData?: any;
    lifestyleData?: any;
    familyHistory?: any;
    medicalHistory?: any;
}
export interface NutritionRecommendation {
    nutrientName: string;
    recommendedAmount: string;
    reason: string;
    geneticBasis?: string[];
    priority: 'low' | 'medium' | 'high';
    sources: string[];
}
export interface ExerciseRecommendation {
    exerciseType: string;
    frequency: string;
    duration: string;
    intensity: 'low' | 'moderate' | 'high';
    reason: string;
    geneticBasis?: string[];
    priority: 'low' | 'medium' | 'high';
    precautions?: string[];
}
export interface ScreeningRecommendation {
    testName: string;
    frequency: string;
    nextDueDate: Date;
    reason: string;
    riskFactors: string[];
    priority: 'low' | 'medium' | 'high';
    ageRange?: {
        min: number;
        max?: number;
    };
}
export interface LifestyleRecommendation {
    category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'habits';
    recommendation: string;
    reason: string;
    priority: 'low' | 'medium' | 'high';
    difficulty: 'easy' | 'moderate' | 'challenging';
    expectedBenefit: string;
    timeframe: string;
}
export interface PersonalizedRecommendations {
    id: string;
    userId: string;
    nutrition: NutritionRecommendation[];
    exercise: ExerciseRecommendation[];
    screening: ScreeningRecommendation[];
    lifestyle: LifestyleRecommendation[];
    generatedAt: Date;
    validUntil: Date;
    confidence: number;
}
export interface RecommendationEffectiveness {
    recommendationId: string;
    userId: string;
    category: string;
    implemented: boolean;
    implementationDate?: Date;
    adherenceScore?: number;
    measuredOutcome?: {
        metric: string;
        beforeValue: number;
        afterValue: number;
        improvementPercentage: number;
    };
    userFeedback?: {
        rating: number;
        comments?: string;
    };
    lastUpdated: Date;
}
export interface RecommendationGenerationConfig {
    includeGenomics: boolean;
    includeLifestyle: boolean;
    includeFamilyHistory: boolean;
    includeMedicalHistory: boolean;
    priorityThreshold: 'low' | 'medium' | 'high';
    maxRecommendationsPerCategory: number;
}
//# sourceMappingURL=recommendations.d.ts.map