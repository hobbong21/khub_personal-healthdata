import { 
  RecommendationInput,
  NutritionRecommendation,
  ExerciseRecommendation,
  ScreeningRecommendation,
  LifestyleRecommendation,
  PersonalizedRecommendations,
  RecommendationGenerationConfig
} from '../types/recommendations';

export class RecommendationEngine {
  /**
   * Generate comprehensive personalized recommendations
   */
  static async generatePersonalizedRecommendations(
    input: RecommendationInput,
    config: RecommendationGenerationConfig = {
      includeGenomics: true,
      includeLifestyle: true,
      includeFamilyHistory: true,
      includeMedicalHistory: true,
      priorityThreshold: 'medium',
      maxRecommendationsPerCategory: 5,
    }
  ): Promise<Omit<PersonalizedRecommendations, 'id' | 'userId' | 'generatedAt'>> {
    const [nutrition, exercise, screening, lifestyle] = await Promise.all([
      this.generateNutritionRecommendations(input, config),
      this.generateExerciseRecommendations(input, config),
      this.generateScreeningRecommendations(input, config),
      this.generateLifestyleRecommendations(input, config),
    ]);

    // Calculate overall confidence based on available data
    const confidence = this.calculateOverallConfidence(input, config);

    // Set validity period (3 months for most recommendations)
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 3);

    return {
      nutrition: nutrition.slice(0, config.maxRecommendationsPerCategory),
      exercise: exercise.slice(0, config.maxRecommendationsPerCategory),
      screening: screening.slice(0, config.maxRecommendationsPerCategory),
      lifestyle: lifestyle.slice(0, config.maxRecommendationsPerCategory),
      validUntil,
      confidence,
    };
  }

  /**
   * Generate nutrition recommendations based on genetic and health data
   */
  static async generateNutritionRecommendations(
    input: RecommendationInput,
    config: RecommendationGenerationConfig
  ): Promise<NutritionRecommendation[]> {
    const recommendations: NutritionRecommendation[] = [];

    // Genomics-based nutrition recommendations
    if (config.includeGenomics && input.genomicData) {
      recommendations.push(...this.getGenomicsBasedNutrition(input.genomicData));
    }

    // Health data-based recommendations
    if (input.healthData) {
      recommendations.push(...this.getHealthBasedNutrition(input.healthData));
    }

    // Lifestyle-based recommendations
    if (config.includeLifestyle && input.lifestyleData) {
      recommendations.push(...this.getLifestyleBasedNutrition(input.lifestyleData));
    }

    // Family history-based recommendations
    if (config.includeFamilyHistory && input.familyHistory) {
      recommendations.push(...this.getFamilyHistoryBasedNutrition(input.familyHistory));
    }

    return this.prioritizeAndFilter(recommendations, config.priorityThreshold);
  }

  /**
   * Generate exercise recommendations
   */
  static async generateExerciseRecommendations(
    input: RecommendationInput,
    config: RecommendationGenerationConfig
  ): Promise<ExerciseRecommendation[]> {
    const recommendations: ExerciseRecommendation[] = [];

    // Genomics-based exercise recommendations
    if (config.includeGenomics && input.genomicData) {
      recommendations.push(...this.getGenomicsBasedExercise(input.genomicData));
    }

    // Health data-based recommendations
    if (input.healthData) {
      recommendations.push(...this.getHealthBasedExercise(input.healthData));
    }

    // Age and gender-based recommendations
    if (input.healthData?.age && input.healthData?.gender) {
      recommendations.push(...this.getAgeGenderBasedExercise(input.healthData.age, input.healthData.gender));
    }

    // Medical history considerations
    if (config.includeMedicalHistory && input.medicalHistory) {
      recommendations.push(...this.getMedicalHistoryBasedExercise(input.medicalHistory));
    }

    return this.prioritizeAndFilter(recommendations, config.priorityThreshold);
  }

  /**
   * Generate screening recommendations
   */
  static async generateScreeningRecommendations(
    input: RecommendationInput,
    config: RecommendationGenerationConfig
  ): Promise<ScreeningRecommendation[]> {
    const recommendations: ScreeningRecommendation[] = [];

    // Age and gender-based screening
    if (input.healthData?.age && input.healthData?.gender) {
      recommendations.push(...this.getAgeGenderBasedScreening(input.healthData.age, input.healthData.gender));
    }

    // Family history-based screening
    if (config.includeFamilyHistory && input.familyHistory) {
      recommendations.push(...this.getFamilyHistoryBasedScreening(input.familyHistory));
    }

    // Genomics-based screening
    if (config.includeGenomics && input.genomicData) {
      recommendations.push(...this.getGenomicsBasedScreening(input.genomicData));
    }

    // Risk factor-based screening
    if (input.healthData) {
      recommendations.push(...this.getRiskFactorBasedScreening(input.healthData));
    }

    return this.prioritizeAndFilter(recommendations, config.priorityThreshold);
  }

  /**
   * Generate lifestyle recommendations
   */
  static async generateLifestyleRecommendations(
    input: RecommendationInput,
    config: RecommendationGenerationConfig
  ): Promise<LifestyleRecommendation[]> {
    const recommendations: LifestyleRecommendation[] = [];

    // Health data-based lifestyle recommendations
    if (input.healthData) {
      recommendations.push(...this.getHealthBasedLifestyle(input.healthData));
    }

    // Current lifestyle improvement recommendations
    if (config.includeLifestyle && input.lifestyleData) {
      recommendations.push(...this.getLifestyleImprovements(input.lifestyleData));
    }

    // Medical history-based lifestyle recommendations
    if (config.includeMedicalHistory && input.medicalHistory) {
      recommendations.push(...this.getMedicalHistoryBasedLifestyle(input.medicalHistory));
    }

    return this.prioritizeAndFilter(recommendations, config.priorityThreshold);
  }

  // Private helper methods for genomics-based recommendations

  private static getGenomicsBasedNutrition(genomicData: any): NutritionRecommendation[] {
    const recommendations: NutritionRecommendation[] = [];

    // Check for lactose intolerance
    if (genomicData.traits?.some((t: any) => t.traitName === 'Lactose tolerance' && t.prediction.includes('intolerant'))) {
      recommendations.push({
        nutrientName: 'Calcium (non-dairy sources)',
        recommendedAmount: '1000-1200mg daily',
        reason: 'Genetic predisposition to lactose intolerance requires alternative calcium sources',
        geneticBasis: ['rs4988235'],
        priority: 'high',
        sources: ['Leafy greens', 'Almonds', 'Sardines', 'Fortified plant milks'],
      });
    }

    // Check for caffeine metabolism
    if (genomicData.traits?.some((t: any) => t.traitName === 'Caffeine metabolism' && t.prediction.includes('Slow'))) {
      recommendations.push({
        nutrientName: 'Caffeine limitation',
        recommendedAmount: 'Less than 200mg daily',
        reason: 'Slow caffeine metabolism increases risk of anxiety and sleep disruption',
        geneticBasis: ['rs762551'],
        priority: 'medium',
        sources: ['Limit coffee to 1-2 cups', 'Avoid afternoon caffeine', 'Consider decaf alternatives'],
      });
    }

    // Check for cardiovascular risk variants
    if (genomicData.diseaseRisks?.some((r: any) => r.diseaseType === 'cardiovascular_disease' && r.riskScore > 30)) {
      recommendations.push({
        nutrientName: 'Omega-3 fatty acids',
        recommendedAmount: '1-2g EPA+DHA daily',
        reason: 'Elevated genetic cardiovascular risk benefits from omega-3 supplementation',
        geneticBasis: ['rs1333049'],
        priority: 'high',
        sources: ['Fatty fish', 'Fish oil supplements', 'Algae oil', 'Walnuts'],
      });
    }

    return recommendations;
  }

  private static getGenomicsBasedExercise(genomicData: any): ExerciseRecommendation[] {
    const recommendations: ExerciseRecommendation[] = [];

    // Check for cardiovascular risk
    if (genomicData.diseaseRisks?.some((r: any) => r.diseaseType === 'cardiovascular_disease' && r.riskScore > 25)) {
      recommendations.push({
        exerciseType: 'Cardiovascular endurance training',
        frequency: '5 days per week',
        duration: '30-45 minutes',
        intensity: 'moderate',
        reason: 'Elevated genetic cardiovascular risk requires regular cardio exercise',
        geneticBasis: ['rs1333049'],
        priority: 'high',
        precautions: ['Start gradually', 'Monitor heart rate', 'Consult physician if chest pain occurs'],
      });
    }

    // Check for diabetes risk
    if (genomicData.diseaseRisks?.some((r: any) => r.diseaseType === 'type2_diabetes' && r.riskScore > 20)) {
      recommendations.push({
        exerciseType: 'Resistance training',
        frequency: '3 days per week',
        duration: '45-60 minutes',
        intensity: 'moderate',
        reason: 'Genetic diabetes risk benefits from muscle-building exercises for glucose control',
        geneticBasis: ['rs7903146', 'rs12255372'],
        priority: 'high',
        precautions: ['Focus on major muscle groups', 'Progressive overload', 'Monitor blood sugar if diabetic'],
      });
    }

    return recommendations;
  }

  private static getGenomicsBasedScreening(genomicData: any): ScreeningRecommendation[] {
    const recommendations: ScreeningRecommendation[] = [];

    // Check for Alzheimer's risk
    if (genomicData.diseaseRisks?.some((r: any) => r.diseaseType === 'alzheimer_disease' && r.riskScore > 25)) {
      const nextDue = new Date();
      nextDue.setFullYear(nextDue.getFullYear() + 1);
      
      recommendations.push({
        testName: 'Cognitive assessment',
        frequency: 'Annually after age 50',
        nextDueDate: nextDue,
        reason: 'Elevated genetic Alzheimer\'s risk warrants regular cognitive monitoring',
        riskFactors: ['APOE4 variant', 'Family history'],
        priority: 'medium',
        ageRange: { min: 50 },
      });
    }

    return recommendations;
  }

  // Health data-based recommendations

  private static getHealthBasedNutrition(healthData: any): NutritionRecommendation[] {
    const recommendations: NutritionRecommendation[] = [];

    // BMI-based recommendations
    if (healthData.bmi > 25) {
      recommendations.push({
        nutrientName: 'Caloric deficit',
        recommendedAmount: '500-750 calories below maintenance',
        reason: 'Elevated BMI indicates need for weight management',
        priority: 'high',
        sources: ['Increase vegetables', 'Reduce processed foods', 'Control portion sizes'],
      });
    }

    // Blood pressure-based recommendations
    if (healthData.systolicBP > 130 || healthData.diastolicBP > 80) {
      recommendations.push({
        nutrientName: 'Sodium reduction',
        recommendedAmount: 'Less than 2300mg daily',
        reason: 'Elevated blood pressure requires sodium restriction',
        priority: 'high',
        sources: ['Avoid processed foods', 'Use herbs and spices', 'Read nutrition labels'],
      });
    }

    return recommendations;
  }

  private static getHealthBasedExercise(healthData: any): ExerciseRecommendation[] {
    const recommendations: ExerciseRecommendation[] = [];

    // BMI-based exercise recommendations
    if (healthData.bmi > 25) {
      recommendations.push({
        exerciseType: 'Low-impact cardio',
        frequency: '5-6 days per week',
        duration: '45-60 minutes',
        intensity: 'moderate',
        reason: 'Weight management requires regular cardiovascular exercise',
        priority: 'high',
        precautions: ['Start slowly', 'Protect joints', 'Stay hydrated'],
      });
    }

    // Blood pressure-based recommendations
    if (healthData.systolicBP > 130) {
      recommendations.push({
        exerciseType: 'Aerobic exercise',
        frequency: '4-5 days per week',
        duration: '30-40 minutes',
        intensity: 'moderate',
        reason: 'Regular aerobic exercise helps lower blood pressure',
        priority: 'high',
        precautions: ['Monitor blood pressure', 'Avoid heavy lifting initially'],
      });
    }

    return recommendations;
  }

  // Age and gender-based recommendations

  private static getAgeGenderBasedScreening(age: number, gender: string): ScreeningRecommendation[] {
    const recommendations: ScreeningRecommendation[] = [];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    // Mammography for women
    if (gender === 'female' && age >= 40) {
      recommendations.push({
        testName: 'Mammography',
        frequency: age >= 50 ? 'Every 2 years' : 'Annually',
        nextDueDate: nextYear,
        reason: 'Breast cancer screening for women over 40',
        riskFactors: ['Age', 'Gender'],
        priority: 'high',
        ageRange: { min: 40 },
      });
    }

    // Prostate screening for men
    if (gender === 'male' && age >= 50) {
      recommendations.push({
        testName: 'PSA test',
        frequency: 'Every 2 years',
        nextDueDate: nextYear,
        reason: 'Prostate cancer screening for men over 50',
        riskFactors: ['Age', 'Gender'],
        priority: 'medium',
        ageRange: { min: 50 },
      });
    }

    // Colonoscopy for all adults
    if (age >= 45) {
      const nextColonoscopy = new Date();
      nextColonoscopy.setFullYear(nextColonoscopy.getFullYear() + 10);
      
      recommendations.push({
        testName: 'Colonoscopy',
        frequency: 'Every 10 years',
        nextDueDate: nextColonoscopy,
        reason: 'Colorectal cancer screening for adults over 45',
        riskFactors: ['Age'],
        priority: 'high',
        ageRange: { min: 45 },
      });
    }

    return recommendations;
  }

  private static getAgeGenderBasedExercise(age: number, gender: string): ExerciseRecommendation[] {
    const recommendations: ExerciseRecommendation[] = [];

    // Bone health for older adults
    if (age >= 65) {
      recommendations.push({
        exerciseType: 'Balance and flexibility training',
        frequency: '2-3 days per week',
        duration: '20-30 minutes',
        intensity: 'low',
        reason: 'Fall prevention and mobility maintenance for older adults',
        priority: 'high',
        precautions: ['Use support if needed', 'Progress gradually', 'Avoid sudden movements'],
      });
    }

    // Bone density for postmenopausal women
    if (gender === 'female' && age >= 50) {
      recommendations.push({
        exerciseType: 'Weight-bearing exercise',
        frequency: '3-4 days per week',
        duration: '30-45 minutes',
        intensity: 'moderate',
        reason: 'Bone density maintenance for postmenopausal women',
        priority: 'high',
        precautions: ['Include impact activities', 'Progressive resistance', 'Adequate calcium intake'],
      });
    }

    return recommendations;
  }

  // Utility methods

  private static prioritizeAndFilter<T extends { priority: string }>(
    recommendations: T[],
    threshold: string
  ): T[] {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const minPriority = priorityOrder[threshold as keyof typeof priorityOrder] || 2;

    return recommendations
      .filter(rec => priorityOrder[rec.priority as keyof typeof priorityOrder] >= minPriority)
      .sort((a, b) => priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]);
  }

  private static calculateOverallConfidence(
    input: RecommendationInput,
    config: RecommendationGenerationConfig
  ): number {
    let confidence = 0.5; // Base confidence
    let factors = 0;

    if (config.includeGenomics && input.genomicData) {
      confidence += 0.2;
      factors++;
    }

    if (input.healthData) {
      confidence += 0.15;
      factors++;
    }

    if (config.includeLifestyle && input.lifestyleData) {
      confidence += 0.1;
      factors++;
    }

    if (config.includeFamilyHistory && input.familyHistory) {
      confidence += 0.1;
      factors++;
    }

    if (config.includeMedicalHistory && input.medicalHistory) {
      confidence += 0.1;
      factors++;
    }

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  // Placeholder methods for additional recommendation types
  private static getLifestyleBasedNutrition(lifestyleData: any): NutritionRecommendation[] {
    return [];
  }

  private static getFamilyHistoryBasedNutrition(familyHistory: any): NutritionRecommendation[] {
    return [];
  }

  private static getMedicalHistoryBasedExercise(medicalHistory: any): ExerciseRecommendation[] {
    return [];
  }

  private static getFamilyHistoryBasedScreening(familyHistory: any): ScreeningRecommendation[] {
    return [];
  }

  private static getRiskFactorBasedScreening(healthData: any): ScreeningRecommendation[] {
    return [];
  }

  private static getHealthBasedLifestyle(healthData: any): LifestyleRecommendation[] {
    return [];
  }

  private static getLifestyleImprovements(lifestyleData: any): LifestyleRecommendation[] {
    return [];
  }

  private static getMedicalHistoryBasedLifestyle(medicalHistory: any): LifestyleRecommendation[] {
    return [];
  }
}