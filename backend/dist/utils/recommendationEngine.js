"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationEngine = void 0;
class RecommendationEngine {
    static async generatePersonalizedRecommendations(input, config = {
        includeGenomics: true,
        includeLifestyle: true,
        includeFamilyHistory: true,
        includeMedicalHistory: true,
        priorityThreshold: 'medium',
        maxRecommendationsPerCategory: 5,
    }) {
        const [nutrition, exercise, screening, lifestyle] = await Promise.all([
            this.generateNutritionRecommendations(input, config),
            this.generateExerciseRecommendations(input, config),
            this.generateScreeningRecommendations(input, config),
            this.generateLifestyleRecommendations(input, config),
        ]);
        const confidence = this.calculateOverallConfidence(input, config);
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
    static async generateNutritionRecommendations(input, config) {
        const recommendations = [];
        if (config.includeGenomics && input.genomicData) {
            recommendations.push(...this.getGenomicsBasedNutrition(input.genomicData));
        }
        if (input.healthData) {
            recommendations.push(...this.getHealthBasedNutrition(input.healthData));
        }
        if (config.includeLifestyle && input.lifestyleData) {
            recommendations.push(...this.getLifestyleBasedNutrition(input.lifestyleData));
        }
        if (config.includeFamilyHistory && input.familyHistory) {
            recommendations.push(...this.getFamilyHistoryBasedNutrition(input.familyHistory));
        }
        return this.prioritizeAndFilter(recommendations, config.priorityThreshold);
    }
    static async generateExerciseRecommendations(input, config) {
        const recommendations = [];
        if (config.includeGenomics && input.genomicData) {
            recommendations.push(...this.getGenomicsBasedExercise(input.genomicData));
        }
        if (input.healthData) {
            recommendations.push(...this.getHealthBasedExercise(input.healthData));
        }
        if (input.healthData?.age && input.healthData?.gender) {
            recommendations.push(...this.getAgeGenderBasedExercise(input.healthData.age, input.healthData.gender));
        }
        if (config.includeMedicalHistory && input.medicalHistory) {
            recommendations.push(...this.getMedicalHistoryBasedExercise(input.medicalHistory));
        }
        return this.prioritizeAndFilter(recommendations, config.priorityThreshold);
    }
    static async generateScreeningRecommendations(input, config) {
        const recommendations = [];
        if (input.healthData?.age && input.healthData?.gender) {
            recommendations.push(...this.getAgeGenderBasedScreening(input.healthData.age, input.healthData.gender));
        }
        if (config.includeFamilyHistory && input.familyHistory) {
            recommendations.push(...this.getFamilyHistoryBasedScreening(input.familyHistory));
        }
        if (config.includeGenomics && input.genomicData) {
            recommendations.push(...this.getGenomicsBasedScreening(input.genomicData));
        }
        if (input.healthData) {
            recommendations.push(...this.getRiskFactorBasedScreening(input.healthData));
        }
        return this.prioritizeAndFilter(recommendations, config.priorityThreshold);
    }
    static async generateLifestyleRecommendations(input, config) {
        const recommendations = [];
        if (input.healthData) {
            recommendations.push(...this.getHealthBasedLifestyle(input.healthData));
        }
        if (config.includeLifestyle && input.lifestyleData) {
            recommendations.push(...this.getLifestyleImprovements(input.lifestyleData));
        }
        if (config.includeMedicalHistory && input.medicalHistory) {
            recommendations.push(...this.getMedicalHistoryBasedLifestyle(input.medicalHistory));
        }
        return this.prioritizeAndFilter(recommendations, config.priorityThreshold);
    }
    static getGenomicsBasedNutrition(genomicData) {
        const recommendations = [];
        if (genomicData.traits?.some((t) => t.traitName === 'Lactose tolerance' && t.prediction.includes('intolerant'))) {
            recommendations.push({
                nutrientName: 'Calcium (non-dairy sources)',
                recommendedAmount: '1000-1200mg daily',
                reason: 'Genetic predisposition to lactose intolerance requires alternative calcium sources',
                geneticBasis: ['rs4988235'],
                priority: 'high',
                sources: ['Leafy greens', 'Almonds', 'Sardines', 'Fortified plant milks'],
            });
        }
        if (genomicData.traits?.some((t) => t.traitName === 'Caffeine metabolism' && t.prediction.includes('Slow'))) {
            recommendations.push({
                nutrientName: 'Caffeine limitation',
                recommendedAmount: 'Less than 200mg daily',
                reason: 'Slow caffeine metabolism increases risk of anxiety and sleep disruption',
                geneticBasis: ['rs762551'],
                priority: 'medium',
                sources: ['Limit coffee to 1-2 cups', 'Avoid afternoon caffeine', 'Consider decaf alternatives'],
            });
        }
        if (genomicData.diseaseRisks?.some((r) => r.diseaseType === 'cardiovascular_disease' && r.riskScore > 30)) {
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
    static getGenomicsBasedExercise(genomicData) {
        const recommendations = [];
        if (genomicData.diseaseRisks?.some((r) => r.diseaseType === 'cardiovascular_disease' && r.riskScore > 25)) {
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
        if (genomicData.diseaseRisks?.some((r) => r.diseaseType === 'type2_diabetes' && r.riskScore > 20)) {
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
    static getGenomicsBasedScreening(genomicData) {
        const recommendations = [];
        if (genomicData.diseaseRisks?.some((r) => r.diseaseType === 'alzheimer_disease' && r.riskScore > 25)) {
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
    static getHealthBasedNutrition(healthData) {
        const recommendations = [];
        if (healthData.bmi > 25) {
            recommendations.push({
                nutrientName: 'Caloric deficit',
                recommendedAmount: '500-750 calories below maintenance',
                reason: 'Elevated BMI indicates need for weight management',
                priority: 'high',
                sources: ['Increase vegetables', 'Reduce processed foods', 'Control portion sizes'],
            });
        }
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
    static getHealthBasedExercise(healthData) {
        const recommendations = [];
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
    static getAgeGenderBasedScreening(age, gender) {
        const recommendations = [];
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
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
    static getAgeGenderBasedExercise(age, gender) {
        const recommendations = [];
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
    static prioritizeAndFilter(recommendations, threshold) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const minPriority = priorityOrder[threshold] || 2;
        return recommendations
            .filter(rec => priorityOrder[rec.priority] >= minPriority)
            .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }
    static calculateOverallConfidence(input, config) {
        let confidence = 0.5;
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
        return Math.min(confidence, 0.95);
    }
    static getLifestyleBasedNutrition(lifestyleData) {
        return [];
    }
    static getFamilyHistoryBasedNutrition(familyHistory) {
        return [];
    }
    static getMedicalHistoryBasedExercise(medicalHistory) {
        return [];
    }
    static getFamilyHistoryBasedScreening(familyHistory) {
        return [];
    }
    static getRiskFactorBasedScreening(healthData) {
        return [];
    }
    static getHealthBasedLifestyle(healthData) {
        return [];
    }
    static getLifestyleImprovements(lifestyleData) {
        return [];
    }
    static getMedicalHistoryBasedLifestyle(medicalHistory) {
        return [];
    }
}
exports.RecommendationEngine = RecommendationEngine;
//# sourceMappingURL=recommendationEngine.js.map