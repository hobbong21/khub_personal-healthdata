import { HealthDataInput } from './healthPredictionModels';

export interface RiskFactor {
  id: string;
  name: string;
  category: 'lifestyle' | 'medical' | 'genetic' | 'environmental';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  impact: number; // 0-1 scale
  modifiable: boolean;
  description: string;
  recommendations: string[];
  timeToImpact: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
}

export interface RiskFactorAnalysis {
  totalRiskScore: number;
  riskFactors: RiskFactor[];
  protectiveFactors: RiskFactor[];
  priorityActions: string[];
  riskTrend: 'increasing' | 'stable' | 'decreasing';
}

export class RiskFactorIdentifier {
  /**
   * Comprehensive risk factor analysis
   */
  static analyzeRiskFactors(
    healthData: HealthDataInput,
    medicalHistory?: any[],
    familyHistory?: any[],
    genomicData?: any
  ): RiskFactorAnalysis {
    const riskFactors: RiskFactor[] = [];
    const protectiveFactors: RiskFactor[] = [];
    
    // Analyze lifestyle risk factors
    const lifestyleFactors = this.analyzeLifestyleFactors(healthData);
    riskFactors.push(...lifestyleFactors.risks);
    protectiveFactors.push(...lifestyleFactors.protective);
    
    // Analyze medical risk factors
    const medicalFactors = this.analyzeMedicalFactors(healthData, medicalHistory);
    riskFactors.push(...medicalFactors.risks);
    protectiveFactors.push(...medicalFactors.protective);
    
    // Analyze genetic risk factors
    if (familyHistory || genomicData) {
      const geneticFactors = this.analyzeGeneticFactors(healthData, familyHistory, genomicData);
      riskFactors.push(...geneticFactors.risks);
      protectiveFactors.push(...geneticFactors.protective);
    }
    
    // Calculate total risk score
    const totalRiskScore = this.calculateTotalRiskScore(riskFactors, protectiveFactors);
    
    // Generate priority actions
    const priorityActions = this.generatePriorityActions(riskFactors);
    
    // Determine risk trend
    const riskTrend = this.assessRiskTrend(riskFactors);
    
    return {
      totalRiskScore,
      riskFactors: riskFactors.sort((a, b) => b.impact - a.impact),
      protectiveFactors,
      priorityActions,
      riskTrend,
    };
  }

  private static analyzeLifestyleFactors(data: HealthDataInput): {
    risks: RiskFactor[];
    protective: RiskFactor[];
  } {
    const risks: RiskFactor[] = [];
    const protective: RiskFactor[] = [];
    
    // Smoking
    if (data.smokingStatus === 'current') {
      risks.push({
        id: 'smoking_current',
        name: 'Current Smoking',
        category: 'lifestyle',
        severity: 'critical',
        impact: 0.9,
        modifiable: true,
        description: 'Active tobacco smoking significantly increases risk of cardiovascular disease, cancer, and respiratory conditions',
        recommendations: [
          'Quit smoking immediately',
          'Consider nicotine replacement therapy',
          'Join a smoking cessation program',
          'Avoid secondhand smoke exposure'
        ],
        timeToImpact: 'immediate',
      });
    } else if (data.smokingStatus === 'never') {
      protective.push({
        id: 'never_smoked',
        name: 'Never Smoked',
        category: 'lifestyle',
        severity: 'low',
        impact: 0.3,
        modifiable: true,
        description: 'Never smoking tobacco provides significant protection against multiple diseases',
        recommendations: ['Continue to avoid tobacco products'],
        timeToImpact: 'long_term',
      });
    }
    
    // Physical Activity
    if (data.exerciseFrequency < 2) {
      risks.push({
        id: 'sedentary_lifestyle',
        name: 'Sedentary Lifestyle',
        category: 'lifestyle',
        severity: 'high',
        impact: 0.7,
        modifiable: true,
        description: 'Insufficient physical activity increases risk of cardiovascular disease, diabetes, and mental health issues',
        recommendations: [
          'Aim for 150 minutes of moderate exercise per week',
          'Start with 10-minute walks and gradually increase',
          'Include both cardio and strength training',
          'Find enjoyable physical activities'
        ],
        timeToImpact: 'short_term',
      });
    } else if (data.exerciseFrequency >= 5) {
      protective.push({
        id: 'regular_exercise',
        name: 'Regular Exercise',
        category: 'lifestyle',
        severity: 'low',
        impact: 0.4,
        modifiable: true,
        description: 'Regular physical activity provides protection against multiple chronic diseases',
        recommendations: ['Maintain current exercise routine', 'Consider varying workout types'],
        timeToImpact: 'medium_term',
      });
    }
    
    // BMI
    if (data.bmi > 30) {
      risks.push({
        id: 'obesity',
        name: 'Obesity',
        category: 'lifestyle',
        severity: 'high',
        impact: 0.8,
        modifiable: true,
        description: 'Obesity significantly increases risk of diabetes, cardiovascular disease, and certain cancers',
        recommendations: [
          'Aim for 5-10% weight loss initially',
          'Focus on sustainable dietary changes',
          'Increase physical activity gradually',
          'Consider working with a nutritionist'
        ],
        timeToImpact: 'medium_term',
      });
    } else if (data.bmi >= 18.5 && data.bmi <= 24.9) {
      protective.push({
        id: 'healthy_weight',
        name: 'Healthy Weight',
        category: 'lifestyle',
        severity: 'low',
        impact: 0.3,
        modifiable: true,
        description: 'Maintaining a healthy weight reduces risk of multiple chronic diseases',
        recommendations: ['Maintain current weight through balanced diet and exercise'],
        timeToImpact: 'long_term',
      });
    }
    
    // Alcohol Consumption
    if (data.alcoholConsumption === 'heavy') {
      risks.push({
        id: 'heavy_drinking',
        name: 'Heavy Alcohol Consumption',
        category: 'lifestyle',
        severity: 'high',
        impact: 0.6,
        modifiable: true,
        description: 'Heavy alcohol consumption increases risk of liver disease, cardiovascular problems, and certain cancers',
        recommendations: [
          'Reduce alcohol intake to moderate levels',
          'Consider alcohol counseling if needed',
          'Have alcohol-free days each week',
          'Monitor liver function regularly'
        ],
        timeToImpact: 'short_term',
      });
    }
    
    // Sleep
    if (data.sleepHours < 6 || data.sleepHours > 9) {
      risks.push({
        id: 'poor_sleep',
        name: 'Poor Sleep Duration',
        category: 'lifestyle',
        severity: 'moderate',
        impact: 0.4,
        modifiable: true,
        description: 'Inadequate or excessive sleep increases risk of cardiovascular disease, diabetes, and mental health issues',
        recommendations: [
          'Aim for 7-9 hours of sleep nightly',
          'Maintain consistent sleep schedule',
          'Create a relaxing bedtime routine',
          'Limit screen time before bed'
        ],
        timeToImpact: 'short_term',
      });
    }
    
    // Stress
    if (data.stressLevel > 7) {
      risks.push({
        id: 'high_stress',
        name: 'High Stress Levels',
        category: 'lifestyle',
        severity: 'moderate',
        impact: 0.5,
        modifiable: true,
        description: 'Chronic high stress increases risk of cardiovascular disease, mental health issues, and immune dysfunction',
        recommendations: [
          'Practice stress management techniques',
          'Consider meditation or mindfulness',
          'Engage in regular physical activity',
          'Seek professional help if needed'
        ],
        timeToImpact: 'immediate',
      });
    }
    
    return { risks, protective };
  }

  private static analyzeMedicalFactors(
    data: HealthDataInput,
    medicalHistory?: any[]
  ): {
    risks: RiskFactor[];
    protective: RiskFactor[];
  } {
    const risks: RiskFactor[] = [];
    const protective: RiskFactor[] = [];
    
    // Hypertension
    if (data.hasHypertension || data.systolicBP > 140 || data.diastolicBP > 90) {
      risks.push({
        id: 'hypertension',
        name: 'Hypertension',
        category: 'medical',
        severity: 'high',
        impact: 0.7,
        modifiable: true,
        description: 'High blood pressure increases risk of heart attack, stroke, and kidney disease',
        recommendations: [
          'Monitor blood pressure regularly',
          'Take prescribed medications as directed',
          'Reduce sodium intake',
          'Maintain healthy weight'
        ],
        timeToImpact: 'immediate',
      });
    }
    
    // Diabetes
    if (data.hasDiabetes || data.bloodSugar > 126 || (data.hba1c && data.hba1c > 6.5)) {
      risks.push({
        id: 'diabetes',
        name: 'Diabetes Mellitus',
        category: 'medical',
        severity: 'critical',
        impact: 0.8,
        modifiable: true,
        description: 'Diabetes significantly increases risk of cardiovascular disease, kidney disease, and neuropathy',
        recommendations: [
          'Monitor blood glucose regularly',
          'Follow prescribed medication regimen',
          'Maintain healthy diet and exercise',
          'Regular eye and foot examinations'
        ],
        timeToImpact: 'immediate',
      });
    }
    
    // Heart Disease
    if (data.hasHeartDisease) {
      risks.push({
        id: 'heart_disease',
        name: 'Existing Heart Disease',
        category: 'medical',
        severity: 'critical',
        impact: 0.9,
        modifiable: true,
        description: 'Existing cardiovascular disease requires ongoing management to prevent complications',
        recommendations: [
          'Follow cardiology treatment plan',
          'Take prescribed medications consistently',
          'Monitor symptoms closely',
          'Regular cardiac follow-ups'
        ],
        timeToImpact: 'immediate',
      });
    }
    
    // High Cholesterol
    if (data.hasHighCholesterol || (data.cholesterolLDL && data.cholesterolLDL > 160)) {
      risks.push({
        id: 'high_cholesterol',
        name: 'High Cholesterol',
        category: 'medical',
        severity: 'moderate',
        impact: 0.6,
        modifiable: true,
        description: 'Elevated cholesterol increases risk of atherosclerosis and cardiovascular events',
        recommendations: [
          'Follow heart-healthy diet',
          'Consider statin therapy if recommended',
          'Regular lipid monitoring',
          'Increase physical activity'
        ],
        timeToImpact: 'medium_term',
      });
    }
    
    return { risks, protective };
  }

  private static analyzeGeneticFactors(
    data: HealthDataInput,
    familyHistory?: any[],
    genomicData?: any
  ): {
    risks: RiskFactor[];
    protective: RiskFactor[];
  } {
    const risks: RiskFactor[] = [];
    const protective: RiskFactor[] = [];
    
    // Family History - Cardiovascular
    if (data.familyHistoryCardiovascular) {
      risks.push({
        id: 'family_history_cvd',
        name: 'Family History of Cardiovascular Disease',
        category: 'genetic',
        severity: 'moderate',
        impact: 0.5,
        modifiable: false,
        description: 'Family history of cardiovascular disease increases personal risk',
        recommendations: [
          'Enhanced cardiovascular screening',
          'Aggressive lifestyle modifications',
          'Regular cardiac risk assessment',
          'Early intervention strategies'
        ],
        timeToImpact: 'long_term',
      });
    }
    
    // Family History - Diabetes
    if (data.familyHistoryDiabetes) {
      risks.push({
        id: 'family_history_diabetes',
        name: 'Family History of Diabetes',
        category: 'genetic',
        severity: 'moderate',
        impact: 0.4,
        modifiable: false,
        description: 'Family history of diabetes increases risk of developing type 2 diabetes',
        recommendations: [
          'Regular glucose screening',
          'Maintain healthy weight',
          'Follow low-glycemic diet',
          'Regular physical activity'
        ],
        timeToImpact: 'long_term',
      });
    }
    
    // Family History - Cancer
    if (data.familyHistoryCancer) {
      risks.push({
        id: 'family_history_cancer',
        name: 'Family History of Cancer',
        category: 'genetic',
        severity: 'moderate',
        impact: 0.4,
        modifiable: false,
        description: 'Family history of cancer may indicate genetic predisposition',
        recommendations: [
          'Enhanced cancer screening protocols',
          'Genetic counseling consideration',
          'Lifestyle modifications for cancer prevention',
          'Regular oncology consultations'
        ],
        timeToImpact: 'long_term',
      });
    }
    
    return { risks, protective };
  }

  private static calculateTotalRiskScore(
    riskFactors: RiskFactor[],
    protectiveFactors: RiskFactor[]
  ): number {
    const riskScore = riskFactors.reduce((sum, factor) => sum + factor.impact, 0);
    const protectiveScore = protectiveFactors.reduce((sum, factor) => sum + factor.impact, 0);
    
    // Normalize to 0-1 scale
    const totalRisk = Math.max(0, Math.min(1, riskScore - (protectiveScore * 0.5)));
    
    return totalRisk;
  }

  private static generatePriorityActions(riskFactors: RiskFactor[]): string[] {
    const actions: string[] = [];
    
    // Sort by impact and modifiability
    const prioritizedFactors = riskFactors
      .filter(factor => factor.modifiable)
      .sort((a, b) => {
        const aScore = a.impact * (a.severity === 'critical' ? 1.5 : 1);
        const bScore = b.impact * (b.severity === 'critical' ? 1.5 : 1);
        return bScore - aScore;
      });
    
    // Take top 5 most impactful modifiable factors
    prioritizedFactors.slice(0, 5).forEach(factor => {
      actions.push(...factor.recommendations.slice(0, 2)); // Top 2 recommendations per factor
    });
    
    return actions.slice(0, 8); // Limit to 8 total actions
  }

  private static assessRiskTrend(riskFactors: RiskFactor[]): 'increasing' | 'stable' | 'decreasing' {
    // This would typically analyze historical data
    // For now, return based on immediate vs long-term factors
    const immediateFactors = riskFactors.filter(f => f.timeToImpact === 'immediate').length;
    const totalFactors = riskFactors.length;
    
    if (immediateFactors / totalFactors > 0.5) {
      return 'increasing';
    } else if (immediateFactors / totalFactors < 0.2) {
      return 'decreasing';
    }
    
    return 'stable';
  }
}

export default RiskFactorIdentifier;