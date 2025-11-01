import { HealthRiskPrediction, HealthDeteriorationPattern } from '../types/ai';

export interface HealthDataInput {
  // Basic demographics
  age: number;
  gender: 'male' | 'female';
  bmi: number;
  
  // Vital signs (recent averages)
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  bloodSugar: number;
  
  // Lifestyle factors
  smokingStatus: 'never' | 'former' | 'current';
  alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy';
  exerciseFrequency: number; // times per week
  sleepHours: number;
  stressLevel: number; // 1-10 scale
  
  // Medical history
  hasHypertension: boolean;
  hasDiabetes: boolean;
  hasHeartDisease: boolean;
  hasHighCholesterol: boolean;
  
  // Family history
  familyHistoryCardiovascular: boolean;
  familyHistoryDiabetes: boolean;
  familyHistoryCancer: boolean;
  
  // Lab values (if available)
  cholesterolTotal?: number;
  cholesterolLDL?: number;
  cholesterolHDL?: number;
  triglycerides?: number;
  hba1c?: number;
}

export class DiseasePredictionModel {
  /**
   * Predict cardiovascular disease risk
   */
  static predictCardiovascularRisk(data: HealthDataInput): HealthRiskPrediction {
    let riskScore = 0;
    const riskFactors: string[] = [];
    
    // Age factor
    if (data.age > 65) {
      riskScore += 0.3;
      riskFactors.push('Advanced age (>65)');
    } else if (data.age > 45) {
      riskScore += 0.15;
      riskFactors.push('Middle age (45-65)');
    }
    
    // Gender factor
    if (data.gender === 'male') {
      riskScore += 0.1;
      riskFactors.push('Male gender');
    }
    
    // BMI factor
    if (data.bmi > 30) {
      riskScore += 0.2;
      riskFactors.push('Obesity (BMI > 30)');
    } else if (data.bmi > 25) {
      riskScore += 0.1;
      riskFactors.push('Overweight (BMI 25-30)');
    }
    
    // Blood pressure
    if (data.systolicBP > 140 || data.diastolicBP > 90) {
      riskScore += 0.25;
      riskFactors.push('High blood pressure');
    } else if (data.systolicBP > 130 || data.diastolicBP > 80) {
      riskScore += 0.1;
      riskFactors.push('Elevated blood pressure');
    }
    
    // Lifestyle factors
    if (data.smokingStatus === 'current') {
      riskScore += 0.3;
      riskFactors.push('Current smoking');
    } else if (data.smokingStatus === 'former') {
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
    
    // Medical history
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
    
    // Family history
    if (data.familyHistoryCardiovascular) {
      riskScore += 0.2;
      riskFactors.push('Family history of cardiovascular disease');
    }
    
    // Lab values
    if (data.cholesterolLDL && data.cholesterolLDL > 160) {
      riskScore += 0.15;
      riskFactors.push('High LDL cholesterol');
    }
    
    if (data.cholesterolHDL && data.cholesterolHDL < 40) {
      riskScore += 0.1;
      riskFactors.push('Low HDL cholesterol');
    }
    
    // Normalize risk score
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

  /**
   * Predict diabetes risk
   */
  static predictDiabetesRisk(data: HealthDataInput): HealthRiskPrediction {
    let riskScore = 0;
    const riskFactors: string[] = [];
    
    // Age factor
    if (data.age > 45) {
      riskScore += 0.2;
      riskFactors.push('Age over 45');
    }
    
    // BMI factor
    if (data.bmi > 30) {
      riskScore += 0.3;
      riskFactors.push('Obesity (BMI > 30)');
    } else if (data.bmi > 25) {
      riskScore += 0.15;
      riskFactors.push('Overweight (BMI 25-30)');
    }
    
    // Blood sugar
    if (data.bloodSugar > 126) {
      riskScore += 0.4;
      riskFactors.push('Elevated fasting glucose');
    } else if (data.bloodSugar > 100) {
      riskScore += 0.2;
      riskFactors.push('Prediabetic glucose levels');
    }
    
    // HbA1c
    if (data.hba1c && data.hba1c > 6.5) {
      riskScore += 0.4;
      riskFactors.push('Elevated HbA1c');
    } else if (data.hba1c && data.hba1c > 5.7) {
      riskScore += 0.2;
      riskFactors.push('Prediabetic HbA1c');
    }
    
    // Lifestyle factors
    if (data.exerciseFrequency < 2) {
      riskScore += 0.15;
      riskFactors.push('Sedentary lifestyle');
    }
    
    // Medical history
    if (data.hasHypertension) {
      riskScore += 0.1;
      riskFactors.push('History of hypertension');
    }
    
    // Family history
    if (data.familyHistoryDiabetes) {
      riskScore += 0.25;
      riskFactors.push('Family history of diabetes');
    }
    
    // Normalize risk score
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

  /**
   * Predict general health deterioration risk
   */
  static predictHealthDeterioration(data: HealthDataInput): HealthRiskPrediction {
    let riskScore = 0;
    const riskFactors: string[] = [];
    
    // Multiple risk factors compound
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

  private static getRiskLevel(riskScore: number): 'low' | 'moderate' | 'high' | 'very_high' {
    if (riskScore < 0.2) return 'low';
    if (riskScore < 0.4) return 'moderate';
    if (riskScore < 0.7) return 'high';
    return 'very_high';
  }

  private static calculateLifestyleRisk(data: HealthDataInput): number {
    let lifestyleRisk = 0;
    
    if (data.smokingStatus === 'current') lifestyleRisk += 0.3;
    if (data.alcoholConsumption === 'heavy') lifestyleRisk += 0.2;
    if (data.exerciseFrequency < 2) lifestyleRisk += 0.2;
    if (data.bmi > 30) lifestyleRisk += 0.2;
    if (data.sleepHours < 6 || data.sleepHours > 9) lifestyleRisk += 0.1;
    
    return Math.min(lifestyleRisk, 1.0);
  }

  private static calculateMedicalHistoryRisk(data: HealthDataInput): number {
    let medicalRisk = 0;
    
    if (data.hasHypertension) medicalRisk += 0.25;
    if (data.hasDiabetes) medicalRisk += 0.3;
    if (data.hasHeartDisease) medicalRisk += 0.35;
    if (data.hasHighCholesterol) medicalRisk += 0.2;
    
    return Math.min(medicalRisk, 1.0);
  }

  private static getCardiovascularRecommendations(
    riskFactors: string[],
    riskLevel: string
  ): string[] {
    const recommendations: string[] = [];
    
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

  private static getDiabetesRecommendations(
    riskFactors: string[],
    riskLevel: string
  ): string[] {
    const recommendations: string[] = [];
    
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

  private static getGeneralHealthRecommendations(
    riskFactors: string[],
    riskLevel: string
  ): string[] {
    const recommendations: string[] = [];
    
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

export class HealthDeteriorationDetector {
  /**
   * Analyze health trends for deterioration patterns
   */
  static analyzeHealthTrends(
    historicalData: Array<{
      date: Date;
      vitalSigns: Record<string, number>;
      symptoms: string[];
      overallCondition: number; // 1-5 scale
    }>
  ): HealthDeteriorationPattern[] {
    const patterns: HealthDeteriorationPattern[] = [];
    
    if (historicalData.length < 7) {
      return patterns; // Need at least a week of data
    }
    
    // Sort by date
    const sortedData = historicalData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Analyze vital signs trends
    const vitalSignsPatterns = this.analyzeVitalSignsTrends(sortedData);
    patterns.push(...vitalSignsPatterns);
    
    // Analyze symptom patterns
    const symptomPatterns = this.analyzeSymptomPatterns(sortedData);
    patterns.push(...symptomPatterns);
    
    // Analyze overall condition trend
    const conditionPattern = this.analyzeOverallConditionTrend(sortedData);
    if (conditionPattern) {
      patterns.push(conditionPattern);
    }
    
    return patterns;
  }

  private static analyzeVitalSignsTrends(
    data: Array<{
      date: Date;
      vitalSigns: Record<string, number>;
      symptoms: string[];
      overallCondition: number;
    }>
  ): HealthDeteriorationPattern[] {
    const patterns: HealthDeteriorationPattern[] = [];
    const vitalSignsKeys = ['systolicBP', 'diastolicBP', 'heartRate', 'weight', 'bloodSugar'];
    
    for (const vitalSign of vitalSignsKeys) {
      const values = data
        .map(d => d.vitalSigns[vitalSign])
        .filter(v => v !== undefined && v !== null);
      
      if (values.length < 5) continue;
      
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

  private static analyzeSymptomPatterns(
    data: Array<{
      date: Date;
      vitalSigns: Record<string, number>;
      symptoms: string[];
      overallCondition: number;
    }>
  ): HealthDeteriorationPattern[] {
    const patterns: HealthDeteriorationPattern[] = [];
    
    // Count symptom frequency
    const symptomCounts: Record<string, number> = {};
    const recentSymptoms: Record<string, number> = {};
    
    data.forEach((entry, index) => {
      entry.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        
        // Count symptoms in last 3 days
        if (index >= data.length - 3) {
          recentSymptoms[symptom] = (recentSymptoms[symptom] || 0) + 1;
        }
      });
    });
    
    // Identify increasing symptom patterns
    for (const [symptom, recentCount] of Object.entries(recentSymptoms)) {
      const totalCount = symptomCounts[symptom];
      const frequency = recentCount / Math.min(3, data.length);
      
      if (frequency > 0.5) { // Symptom appears in >50% of recent days
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

  private static analyzeOverallConditionTrend(
    data: Array<{
      date: Date;
      vitalSigns: Record<string, number>;
      symptoms: string[];
      overallCondition: number;
    }>
  ): HealthDeteriorationPattern | null {
    const conditions = data.map(d => d.overallCondition);
    const trend = this.calculateTrend(conditions);
    
    if (Math.abs(trend) < 0.1) return null; // No significant trend
    
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

  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + val * index, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private static assessTrendSeverity(
    vitalSign: string,
    trend: number,
    values: number[]
  ): 'mild' | 'moderate' | 'severe' {
    const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;
    const trendMagnitude = Math.abs(trend);
    
    // Define severity thresholds based on vital sign type
    const thresholds = {
      systolicBP: { moderate: 2, severe: 5 },
      diastolicBP: { moderate: 1.5, severe: 3 },
      heartRate: { moderate: 3, severe: 8 },
      weight: { moderate: 0.5, severe: 1.5 },
      bloodSugar: { moderate: 5, severe: 15 },
    };
    
    const threshold = thresholds[vitalSign as keyof typeof thresholds] || { moderate: 1, severe: 3 };
    
    if (trendMagnitude > threshold.severe) return 'severe';
    if (trendMagnitude > threshold.moderate) return 'moderate';
    return 'mild';
  }
}

export default { DiseasePredictionModel, HealthDeteriorationDetector };