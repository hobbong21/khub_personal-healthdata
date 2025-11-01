import { PrismaClient } from '@prisma/client';
import { AIModelManager } from '../models/AIModel';
import { PredictionManager } from '../models/Prediction';
import { DiseasePredictionModel, HealthDeteriorationDetector, HealthDataInput } from '../utils/healthPredictionModels';
import { RiskFactorIdentifier, RiskFactorAnalysis } from '../utils/riskFactorAnalysis';
import { 
  PredictionRequest, 
  PredictionResult, 
  HealthRiskPrediction, 
  HealthDeteriorationPattern,
  AIModelConfig 
} from '../types/ai';

const prisma = new PrismaClient();

export class AIService {
  /**
   * Generate health risk prediction for a user
   */
  static async generateHealthRiskPrediction(
    userId: string,
    predictionType: 'cardiovascular' | 'diabetes' | 'general_health'
  ): Promise<PredictionResult> {
    try {
      // Get user health data
      const healthData = await this.getUserHealthData(userId);
      
      // Get appropriate model
      const model = await AIModelManager.getLatestModelVersion(`${predictionType}_risk_model`);
      if (!model) {
        throw new Error(`Model not found for prediction type: ${predictionType}`);
      }
      
      // Generate prediction based on type
      let prediction: HealthRiskPrediction;
      
      switch (predictionType) {
        case 'cardiovascular':
          prediction = DiseasePredictionModel.predictCardiovascularRisk(healthData);
          break;
        case 'diabetes':
          prediction = DiseasePredictionModel.predictDiabetesRisk(healthData);
          break;
        case 'general_health':
          prediction = DiseasePredictionModel.predictHealthDeterioration(healthData);
          break;
        default:
          throw new Error(`Unsupported prediction type: ${predictionType}`);
      }
      
      // Store prediction result
      const result = await PredictionManager.createPrediction(
        userId,
        model.id,
        predictionType,
        healthData,
        prediction,
        prediction.confidence
      );
      
      return result;
    } catch (error) {
      console.error('Error generating health risk prediction:', error);
      throw error;
    }
  }

  /**
   * Analyze health deterioration patterns
   */
  static async analyzeHealthDeterioration(userId: string): Promise<PredictionResult> {
    try {
      // Get historical health data
      const historicalData = await this.getUserHistoricalData(userId);
      
      // Get deterioration detection model
      const model = await AIModelManager.getLatestModelVersion('health_deterioration_model');
      if (!model) {
        throw new Error('Health deterioration model not found');
      }
      
      // Analyze patterns
      const patterns = HealthDeteriorationDetector.analyzeHealthTrends(historicalData);
      
      // Store prediction result
      const result = await PredictionManager.createPrediction(
        userId,
        model.id,
        'health_deterioration',
        { historicalDataPoints: historicalData.length },
        { patterns, alertLevel: this.getHighestAlertLevel(patterns) },
        this.calculatePatternsConfidence(patterns)
      );
      
      return result;
    } catch (error) {
      console.error('Error analyzing health deterioration:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive risk factor analysis
   */
  static async performRiskFactorAnalysis(userId: string): Promise<PredictionResult> {
    try {
      // Get user data
      const healthData = await this.getUserHealthData(userId);
      const medicalHistory = await this.getUserMedicalHistory(userId);
      const familyHistory = await this.getUserFamilyHistory(userId);
      const genomicData = await this.getUserGenomicData(userId);
      
      // Get risk analysis model
      const model = await AIModelManager.getLatestModelVersion('risk_factor_analysis_model');
      if (!model) {
        throw new Error('Risk factor analysis model not found');
      }
      
      // Perform analysis
      const analysis = RiskFactorIdentifier.analyzeRiskFactors(
        healthData,
        medicalHistory,
        familyHistory,
        genomicData
      );
      
      // Store prediction result
      const result = await PredictionManager.createPrediction(
        userId,
        model.id,
        'risk_factor_analysis',
        { 
          healthDataIncluded: true,
          medicalHistoryIncluded: !!medicalHistory?.length,
          familyHistoryIncluded: !!familyHistory?.length,
          genomicDataIncluded: !!genomicData
        },
        analysis,
        0.85 // Base confidence for risk factor analysis
      );
      
      return result;
    } catch (error) {
      console.error('Error performing risk factor analysis:', error);
      throw error;
    }
  }

  /**
   * Get personalized health recommendations
   */
  static async getPersonalizedRecommendations(userId: string): Promise<PredictionResult> {
    try {
      // Get recent predictions
      const recentPredictions = await PredictionManager.getUserPredictions(userId, undefined, 5);
      
      // Get user health data
      const healthData = await this.getUserHealthData(userId);
      
      // Get recommendations model
      const model = await AIModelManager.getLatestModelVersion('health_recommendations_model');
      if (!model) {
        throw new Error('Health recommendations model not found');
      }
      
      // Generate recommendations based on predictions and health data
      const recommendations = await this.generateRecommendations(healthData, recentPredictions);
      
      // Store recommendation result
      const result = await PredictionManager.createPrediction(
        userId,
        model.id,
        'health_recommendations',
        { 
          basedOnPredictions: recentPredictions.length,
          healthDataTimestamp: new Date()
        },
        recommendations,
        0.8
      );
      
      return result;
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      throw error;
    }
  }

  /**
   * Get user predictions history
   */
  static async getUserPredictionsHistory(
    userId: string,
    predictionType?: string,
    limit: number = 10
  ): Promise<PredictionResult[]> {
    return await PredictionManager.getUserPredictions(userId, predictionType, limit);
  }

  /**
   * Get prediction statistics for user
   */
  static async getUserPredictionStats(userId: string) {
    return await PredictionManager.getPredictionStats(userId);
  }

  /**
   * Update model performance
   */
  static async updateModelPerformance(modelId: string, accuracy: number): Promise<void> {
    await AIModelManager.updateModelAccuracy(modelId, accuracy);
  }

  /**
   * Get available AI models
   */
  static async getAvailableModels(): Promise<AIModelConfig[]> {
    const result = await AIModelManager.listModels(1, 50);
    return result.models;
  }

  // Private helper methods

  private static async getUserHealthData(userId: string): Promise<HealthDataInput> {
    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get recent vital signs
    const recentVitalSigns = await prisma.vitalSign.findMany({
      where: {
        healthRecord: {
          userId: userId,
        },
      },
      orderBy: { measuredAt: 'desc' },
      take: 10,
    });

    // Get medications
    const medications = await prisma.medication.findMany({
      where: { userId, isActive: true },
    });

    // Calculate averages and extract data
    const vitalSignsMap = this.processVitalSigns(recentVitalSigns);
    const lifestyleHabits = user.lifestyleHabits as any || {};

    const healthData: HealthDataInput = {
      age: this.calculateAge(user.birthDate),
      gender: user.gender as 'male' | 'female',
      bmi: user.height && user.weight ? user.weight / Math.pow(user.height / 100, 2) : 25,
      
      systolicBP: vitalSignsMap.systolicBP || 120,
      diastolicBP: vitalSignsMap.diastolicBP || 80,
      heartRate: vitalSignsMap.heartRate || 70,
      bloodSugar: vitalSignsMap.bloodSugar || 90,
      
      smokingStatus: lifestyleHabits.smoking || 'never',
      alcoholConsumption: lifestyleHabits.alcohol || 'none',
      exerciseFrequency: lifestyleHabits.exerciseFrequency || 0,
      sleepHours: lifestyleHabits.sleepHours || 8,
      stressLevel: lifestyleHabits.stressLevel || 5,
      
      hasHypertension: medications.some(m => m.purpose?.toLowerCase().includes('hypertension')),
      hasDiabetes: medications.some(m => m.purpose?.toLowerCase().includes('diabetes')),
      hasHeartDisease: medications.some(m => m.purpose?.toLowerCase().includes('heart')),
      hasHighCholesterol: medications.some(m => m.purpose?.toLowerCase().includes('cholesterol')),
      
      familyHistoryCardiovascular: false, // Will be updated with actual family history
      familyHistoryDiabetes: false,
      familyHistoryCancer: false,
    };

    return healthData;
  }

  private static async getUserHistoricalData(userId: string) {
    const healthRecords = await prisma.healthRecord.findMany({
      where: { userId },
      include: { vitalSigns: true },
      orderBy: { recordedDate: 'desc' },
      take: 30, // Last 30 records
    });

    return healthRecords.map(record => ({
      date: record.recordedDate,
      vitalSigns: this.processVitalSigns(record.vitalSigns),
      symptoms: (record.data as any)?.symptoms || [],
      overallCondition: (record.data as any)?.overallCondition || 3,
    }));
  }

  private static async getUserMedicalHistory(userId: string) {
    return await prisma.medicalRecord.findMany({
      where: { userId },
      include: { testResults: true, prescriptions: true },
      orderBy: { visitDate: 'desc' },
    });
  }

  private static async getUserFamilyHistory(userId: string) {
    return await prisma.familyHistory.findMany({
      where: { userId },
    });
  }

  private static async getUserGenomicData(userId: string) {
    return await prisma.genomicData.findFirst({
      where: { userId },
      include: { riskAssessments: true },
    });
  }

  private static processVitalSigns(vitalSigns: any[]): Record<string, number> {
    const processed: Record<string, number[]> = {};
    
    vitalSigns.forEach(vs => {
      if (!processed[vs.type]) {
        processed[vs.type] = [];
      }
      
      if (vs.type === 'blood_pressure' && typeof vs.value === 'object') {
        processed['systolicBP'] = processed['systolicBP'] || [];
        processed['diastolicBP'] = processed['diastolicBP'] || [];
        processed['systolicBP'].push(vs.value.systolic);
        processed['diastolicBP'].push(vs.value.diastolic);
      } else if (typeof vs.value === 'number') {
        processed[vs.type].push(vs.value);
      }
    });
    
    // Calculate averages
    const averages: Record<string, number> = {};
    Object.entries(processed).forEach(([type, values]) => {
      if (values.length > 0) {
        averages[type] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });
    
    return averages;
  }

  private static calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private static getHighestAlertLevel(patterns: HealthDeteriorationPattern[]): string {
    if (patterns.some(p => p.alertLevel === 'critical')) return 'critical';
    if (patterns.some(p => p.alertLevel === 'warning')) return 'warning';
    return 'info';
  }

  private static calculatePatternsConfidence(patterns: HealthDeteriorationPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    return avgConfidence;
  }

  private static async generateRecommendations(
    healthData: HealthDataInput,
    recentPredictions: PredictionResult[]
  ): Promise<any> {
    const recommendations = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[],
      lifestyle: [] as string[],
      medical: [] as string[],
    };

    // Analyze recent predictions for recommendations
    recentPredictions.forEach(prediction => {
      if (prediction.predictionResult?.recommendations) {
        recommendations.immediate.push(...prediction.predictionResult.recommendations.slice(0, 2));
      }
    });

    // Add general health recommendations based on health data
    if (healthData.bmi > 25) {
      recommendations.lifestyle.push('Focus on weight management through diet and exercise');
    }
    
    if (healthData.exerciseFrequency < 3) {
      recommendations.lifestyle.push('Increase physical activity to at least 150 minutes per week');
    }
    
    if (healthData.smokingStatus === 'current') {
      recommendations.immediate.push('Quit smoking - this is the most important step for your health');
    }
    
    // Remove duplicates and limit recommendations
    Object.keys(recommendations).forEach(key => {
      recommendations[key as keyof typeof recommendations] = [
        ...new Set(recommendations[key as keyof typeof recommendations])
      ].slice(0, 5);
    });

    return recommendations;
  }
}

export default AIService;