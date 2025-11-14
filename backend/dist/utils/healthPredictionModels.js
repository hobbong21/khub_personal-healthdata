"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthDeteriorationDetector = exports.DiseasePredictionModel = void 0;
class DiseasePredictionModel {
    static predictCardiovascularRisk(data) {
        let riskScore = 0;
        const riskFactors = [];
        if (data.age > 65) {
            riskScore += 0.3;
            riskFactors.push('Advanced age (>65)');
        }
        else if (data.age > 45) {
            riskScore += 0.15;
            riskFactors.push('Middle age (45-65)');
        }
        if (data.gender === 'male') {
            riskScore += 0.1;
            riskFactors.push('Male gender');
        }
        if (data.bmi > 30) {
            riskScore += 0.2;
            riskFactors.push('Obesity (BMI > 30)');
        }
        else if (data.bmi > 25) {
            riskScore += 0.1;
            riskFactors.push('Overweight (BMI 25-30)');
        }
        if (data.systolicBP > 140 || data.diastolicBP > 90) {
            riskScore += 0.25;
            riskFactors.push('High blood pressure');
        }
        else if (data.systolicBP > 130 || data.diastolicBP > 80) {
            riskScore += 0.1;
            riskFactors.push('Elevated blood pressure');
        }
        if (data.smokingStatus === 'current') {
            riskScore += 0.3;
            riskFactors.push('Current smoking');
        }
        else if (data.smokingStatus === 'former') {
            riskScore += 0.1;
            riskFactors.push('Former smoking');
        }
        if (data.alcoholConsumption === 'heavy') {
            riskScore += 0.15;
            riskFactors.push('Heavy alcohol consumption');
        }
        if (data.exerciseFrequency < 2) {
            riskScore += 0.15;
            riskFactors.push('Sedentary lifestyle');
        }
        if (data.hasHypertension) {
            riskScore += 0.2;
            riskFactors.push('History of hypertension');
        }
        if (data.hasDiabetes) {
            riskScore += 0.25;
            riskFactors.push('Diabetes mellitus');
        }
        if (data.hasHighCholesterol) {
            riskScore += 0.15;
            riskFactors.push('High cholesterol');
        }
        if (data.familyHistoryCardiovascular) {
            riskScore += 0.2;
            riskFactors.push('Family history of cardiovascular disease');
        }
        if (data.cholesterolLDL && data.cholesterolLDL > 160) {
            riskScore += 0.15;
            riskFactors.push('High LDL cholesterol');
        }
        if (data.cholesterolHDL && data.cholesterolHDL < 40) {
            riskScore += 0.1;
            riskFactors.push('Low HDL cholesterol');
        }
        riskScore = Math.min(riskScore, 1.0);
        const riskLevel = this.getRiskLevel(riskScore);
        const recommendations = this.getCardiovascularRecommendations(riskFactors, riskLevel);
        return {
            diseaseType: 'cardiovascular_disease',
            riskScore,
            riskLevel,
            timeframe: '10_years',
            contributingFactors: {
                genetic: data.familyHistoryCardiovascular ? 0.2 : 0,
                lifestyle: this.calculateLifestyleRisk(data),
                medical_history: this.calculateMedicalHistoryRisk(data),
                family_history: data.familyHistoryCardiovascular ? 0.2 : 0,
            },
            recommendations,
            confidence: 0.85,
        };
    }
    static predictDiabetesRisk(data) {
        let riskScore = 0;
        const riskFactors = [];
        if (data.age > 45) {
            riskScore += 0.2;
            riskFactors.push('Age over 45');
        }
        if (data.bmi > 30) {
            riskScore += 0.3;
            riskFactors.push('Obesity (BMI > 30)');
        }
        else if (data.bmi > 25) {
            riskScore += 0.15;
            riskFactors.push('Overweight (BMI 25-30)');
        }
        if (data.bloodSugar > 126) {
            riskScore += 0.4;
            riskFactors.push('Elevated fasting glucose');
        }
        else if (data.bloodSugar > 100) {
            riskScore += 0.2;
            riskFactors.push('Prediabetic glucose levels');
        }
        if (data.hba1c && data.hba1c > 6.5) {
            riskScore += 0.4;
            riskFactors.push('Elevated HbA1c');
        }
        else if (data.hba1c && data.hba1c > 5.7) {
            riskScore += 0.2;
            riskFactors.push('Prediabetic HbA1c');
        }
        if (data.exerciseFrequency < 2) {
            riskScore += 0.15;
            riskFactors.push('Sedentary lifestyle');
        }
        if (data.hasHypertension) {
            riskScore += 0.1;
            riskFactors.push('History of hypertension');
        }
        if (data.familyHistoryDiabetes) {
            riskScore += 0.25;
            riskFactors.push('Family history of diabetes');
        }
        riskScore = Math.min(riskScore, 1.0);
        const riskLevel = this.getRiskLevel(riskScore);
        const recommendations = this.getDiabetesRecommendations(riskFactors, riskLevel);
        return {
            diseaseType: 'type2_diabetes',
            riskScore,
            riskLevel,
            timeframe: '5_years',
            contributingFactors: {
                genetic: data.familyHistoryDiabetes ? 0.25 : 0,
                lifestyle: this.calculateLifestyleRisk(data),
                medical_history: this.calculateMedicalHistoryRisk(data),
                family_history: data.familyHistoryDiabetes ? 0.25 : 0,
            },
            recommendations,
            confidence: 0.82,
        };
    }
    static predictHealthDeterioration(data) {
        let riskScore = 0;
        const riskFactors = [];
        const riskFactorCount = [
            data.smokingStatus === 'current',
            data.bmi > 30,
            data.exerciseFrequency < 2,
            data.alcoholConsumption === 'heavy',
            data.sleepHours < 6 || data.sleepHours > 9,
            data.stressLevel > 7,
            data.hasHypertension,
            data.hasDiabetes,
            data.hasHeartDisease,
        ].filter(Boolean).length;
        riskScore = Math.min(riskFactorCount * 0.1, 1.0);
        if (riskFactorCount >= 3) {
            riskFactors.push('Multiple concurrent risk factors');
        }
        const riskLevel = this.getRiskLevel(riskScore);
        const recommendations = this.getGeneralHealthRecommendations(riskFactors, riskLevel);
        return {
            diseaseType: 'general_health_deterioration',
            riskScore,
            riskLevel,
            timeframe: '1_year',
            contributingFactors: {
                genetic: 0.1,
                lifestyle: this.calculateLifestyleRisk(data),
                medical_history: this.calculateMedicalHistoryRisk(data),
                family_history: 0.1,
            },
            recommendations,
            confidence: 0.75,
        };
    }
    static getRiskLevel(riskScore) {
        if (riskScore < 0.2)
            return 'low';
        if (riskScore < 0.4)
            return 'moderate';
        if (riskScore < 0.7)
            return 'high';
        return 'very_high';
    }
    static calculateLifestyleRisk(data) {
        let lifestyleRisk = 0;
        if (data.smokingStatus === 'current')
            lifestyleRisk += 0.3;
        if (data.alcoholConsumption === 'heavy')
            lifestyleRisk += 0.2;
        if (data.exerciseFrequency < 2)
            lifestyleRisk += 0.2;
        if (data.bmi > 30)
            lifestyleRisk += 0.2;
        if (data.sleepHours < 6 || data.sleepHours > 9)
            lifestyleRisk += 0.1;
        return Math.min(lifestyleRisk, 1.0);
    }
    static calculateMedicalHistoryRisk(data) {
        let medicalRisk = 0;
        if (data.hasHypertension)
            medicalRisk += 0.25;
        if (data.hasDiabetes)
            medicalRisk += 0.3;
        if (data.hasHeartDisease)
            medicalRisk += 0.35;
        if (data.hasHighCholesterol)
            medicalRisk += 0.2;
        return Math.min(medicalRisk, 1.0);
    }
    static getCardiovascularRecommendations(riskFactors, riskLevel) {
        const recommendations = [];
        if (riskLevel === 'high' || riskLevel === 'very_high') {
            recommendations.push('Consult with a cardiologist immediately');
            recommendations.push('Consider cardiac stress testing');
        }
        if (riskFactors.some(factor => factor.includes('blood pressure'))) {
            recommendations.push('Monitor blood pressure daily');
            recommendations.push('Reduce sodium intake to <2300mg/day');
        }
        if (riskFactors.some(factor => factor.includes('smoking'))) {
            recommendations.push('Quit smoking immediately - consider nicotine replacement therapy');
        }
        if (riskFactors.some(factor => factor.includes('cholesterol'))) {
            recommendations.push('Follow a heart-healthy diet (Mediterranean or DASH)');
            recommendations.push('Consider statin therapy consultation');
        }
        recommendations.push('Aim for 150 minutes of moderate exercise per week');
        recommendations.push('Maintain a healthy weight (BMI 18.5-24.9)');
        return recommendations;
    }
    static getDiabetesRecommendations(riskFactors, riskLevel) {
        const recommendations = [];
        if (riskLevel === 'high' || riskLevel === 'very_high') {
            recommendations.push('Consult with an endocrinologist');
            recommendations.push('Get HbA1c and glucose tolerance testing');
        }
        if (riskFactors.some(factor => factor.includes('glucose') || factor.includes('HbA1c'))) {
            recommendations.push('Monitor blood glucose regularly');
            recommendations.push('Follow a low-glycemic index diet');
        }
        if (riskFactors.some(factor => factor.includes('BMI') || factor.includes('weight'))) {
            recommendations.push('Aim for 5-10% weight loss');
            recommendations.push('Consider working with a nutritionist');
        }
        recommendations.push('Increase physical activity to 150+ minutes per week');
        recommendations.push('Limit refined carbohydrates and added sugars');
        recommendations.push('Include fiber-rich foods in your diet');
        return recommendations;
    }
    static getGeneralHealthRecommendations(riskFactors, riskLevel) {
        const recommendations = [];
        recommendations.push('Schedule regular health check-ups');
        recommendations.push('Maintain a balanced, nutrient-rich diet');
        recommendations.push('Get 7-9 hours of quality sleep nightly');
        recommendations.push('Practice stress management techniques');
        recommendations.push('Stay hydrated (8+ glasses of water daily)');
        recommendations.push('Avoid tobacco and limit alcohol consumption');
        if (riskLevel === 'high' || riskLevel === 'very_high') {
            recommendations.push('Consider comprehensive health screening');
            recommendations.push('Work with healthcare providers to address risk factors');
        }
        return recommendations;
    }
}
exports.DiseasePredictionModel = DiseasePredictionModel;
class HealthDeteriorationDetector {
    static analyzeHealthTrends(historicalData) {
        const patterns = [];
        if (historicalData.length < 7) {
            return patterns;
        }
        const sortedData = historicalData.sort((a, b) => a.date.getTime() - b.date.getTime());
        const vitalSignsPatterns = this.analyzeVitalSignsTrends(sortedData);
        patterns.push(...vitalSignsPatterns);
        const symptomPatterns = this.analyzeSymptomPatterns(sortedData);
        patterns.push(...symptomPatterns);
        const conditionPattern = this.analyzeOverallConditionTrend(sortedData);
        if (conditionPattern) {
            patterns.push(conditionPattern);
        }
        return patterns;
    }
    static analyzeVitalSignsTrends(data) {
        const patterns = [];
        const vitalSignsKeys = ['systolicBP', 'diastolicBP', 'heartRate', 'weight', 'bloodSugar'];
        for (const vitalSign of vitalSignsKeys) {
            const values = data
                .map(d => d.vitalSigns[vitalSign])
                .filter(v => v !== undefined && v !== null);
            if (values.length < 5)
                continue;
            const trend = this.calculateTrend(values);
            const severity = this.assessTrendSeverity(vitalSign, trend, values);
            if (severity !== 'mild') {
                patterns.push({
                    patternType: `${vitalSign}_trend`,
                    severity,
                    trendDirection: trend > 0.1 ? 'declining' : trend < -0.1 ? 'improving' : 'stable',
                    affectedMetrics: [vitalSign],
                    timeframe: `${data.length} days`,
                    confidence: Math.min(0.9, values.length / 10),
                    alertLevel: severity === 'severe' ? 'critical' : severity === 'moderate' ? 'warning' : 'info',
                });
            }
        }
        return patterns;
    }
    static analyzeSymptomPatterns(data) {
        const patterns = [];
        const symptomCounts = {};
        const recentSymptoms = {};
        data.forEach((entry, index) => {
            entry.symptoms.forEach(symptom => {
                symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                if (index >= data.length - 3) {
                    recentSymptoms[symptom] = (recentSymptoms[symptom] || 0) + 1;
                }
            });
        });
        for (const [symptom, recentCount] of Object.entries(recentSymptoms)) {
            const totalCount = symptomCounts[symptom];
            const frequency = recentCount / Math.min(3, data.length);
            if (frequency > 0.5) {
                patterns.push({
                    patternType: 'increasing_symptoms',
                    severity: frequency > 0.8 ? 'severe' : 'moderate',
                    trendDirection: 'declining',
                    affectedMetrics: [symptom],
                    timeframe: '3 days',
                    confidence: 0.7,
                    alertLevel: frequency > 0.8 ? 'warning' : 'info',
                });
            }
        }
        return patterns;
    }
    static analyzeOverallConditionTrend(data) {
        const conditions = data.map(d => d.overallCondition);
        const trend = this.calculateTrend(conditions);
        if (Math.abs(trend) < 0.1)
            return null;
        const avgCondition = conditions.reduce((sum, c) => sum + c, 0) / conditions.length;
        return {
            patternType: 'overall_health_trend',
            severity: avgCondition < 2.5 ? 'severe' : avgCondition < 3.5 ? 'moderate' : 'mild',
            trendDirection: trend < -0.1 ? 'declining' : trend > 0.1 ? 'improving' : 'stable',
            affectedMetrics: ['overall_condition'],
            timeframe: `${data.length} days`,
            confidence: Math.min(0.9, conditions.length / 14),
            alertLevel: trend < -0.2 ? 'warning' : 'info',
        };
    }
    static calculateTrend(values) {
        if (values.length < 2)
            return 0;
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, index) => sum + val * index, 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }
    static assessTrendSeverity(vitalSign, trend, values) {
        const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;
        const trendMagnitude = Math.abs(trend);
        const thresholds = {
            systolicBP: { moderate: 2, severe: 5 },
            diastolicBP: { moderate: 1.5, severe: 3 },
            heartRate: { moderate: 3, severe: 8 },
            weight: { moderate: 0.5, severe: 1.5 },
            bloodSugar: { moderate: 5, severe: 15 },
        };
        const threshold = thresholds[vitalSign] || { moderate: 1, severe: 3 };
        if (trendMagnitude > threshold.severe)
            return 'severe';
        if (trendMagnitude > threshold.moderate)
            return 'moderate';
        return 'mild';
    }
}
exports.HealthDeteriorationDetector = HealthDeteriorationDetector;
exports.default = { DiseasePredictionModel, HealthDeteriorationDetector };
//# sourceMappingURL=healthPredictionModels.js.map