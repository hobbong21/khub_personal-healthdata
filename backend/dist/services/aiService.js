"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const client_1 = require("@prisma/client");
const AIModel_1 = require("../models/AIModel");
const Prediction_1 = require("../models/Prediction");
const healthPredictionModels_1 = require("../utils/healthPredictionModels");
const riskFactorAnalysis_1 = require("../utils/riskFactorAnalysis");
const prisma = new client_1.PrismaClient();
class AIService {
    static async getPersonalizedInsights(userId) {
        try {
            return await this.getPersonalizedRecommendations(userId);
        }
        catch (error) {
            console.error('Error getting personalized insights:', error);
            throw error;
        }
    }
    static async generateHealthRiskPrediction(userId, predictionType) {
        try {
            const healthData = await this.getUserHealthData(userId);
            const model = await AIModel_1.AIModelManager.getLatestModelVersion(`${predictionType}_risk_model`);
            if (!model) {
                throw new Error(`Model not found for prediction type: ${predictionType}`);
            }
            let prediction;
            switch (predictionType) {
                case 'cardiovascular':
                    prediction = healthPredictionModels_1.DiseasePredictionModel.predictCardiovascularRisk(healthData);
                    break;
                case 'diabetes':
                    prediction = healthPredictionModels_1.DiseasePredictionModel.predictDiabetesRisk(healthData);
                    break;
                case 'general_health':
                    prediction = healthPredictionModels_1.DiseasePredictionModel.predictHealthDeterioration(healthData);
                    break;
                default:
                    throw new Error(`Unsupported prediction type: ${predictionType}`);
            }
            const result = await Prediction_1.PredictionManager.createPrediction(userId, model.id, predictionType, healthData, prediction, prediction.confidence);
            return result;
        }
        catch (error) {
            console.error('Error generating health risk prediction:', error);
            throw error;
        }
    }
    static async analyzeHealthDeterioration(userId) {
        try {
            const historicalData = await this.getUserHistoricalData(userId);
            const model = await AIModel_1.AIModelManager.getLatestModelVersion('health_deterioration_model');
            if (!model) {
                throw new Error('Health deterioration model not found');
            }
            const patterns = healthPredictionModels_1.HealthDeteriorationDetector.analyzeHealthTrends(historicalData);
            const result = await Prediction_1.PredictionManager.createPrediction(userId, model.id, 'health_deterioration', { historicalDataPoints: historicalData.length }, { patterns, alertLevel: this.getHighestAlertLevel(patterns) }, this.calculatePatternsConfidence(patterns));
            return result;
        }
        catch (error) {
            console.error('Error analyzing health deterioration:', error);
            throw error;
        }
    }
    static async performRiskFactorAnalysis(userId) {
        try {
            const healthData = await this.getUserHealthData(userId);
            const medicalHistory = await this.getUserMedicalHistory(userId);
            const familyHistory = await this.getUserFamilyHistory(userId);
            const genomicData = await this.getUserGenomicData(userId);
            const model = await AIModel_1.AIModelManager.getLatestModelVersion('risk_factor_analysis_model');
            if (!model) {
                throw new Error('Risk factor analysis model not found');
            }
            const analysis = riskFactorAnalysis_1.RiskFactorIdentifier.analyzeRiskFactors(healthData, medicalHistory, familyHistory, genomicData);
            const result = await Prediction_1.PredictionManager.createPrediction(userId, model.id, 'risk_factor_analysis', {
                healthDataIncluded: true,
                medicalHistoryIncluded: !!medicalHistory?.length,
                familyHistoryIncluded: !!familyHistory?.length,
                genomicDataIncluded: !!genomicData
            }, analysis, 0.85);
            return result;
        }
        catch (error) {
            console.error('Error performing risk factor analysis:', error);
            throw error;
        }
    }
    static async getPersonalizedRecommendations(userId) {
        try {
            const recentPredictions = await Prediction_1.PredictionManager.getUserPredictions(userId, undefined, 5);
            const healthData = await this.getUserHealthData(userId);
            const model = await AIModel_1.AIModelManager.getLatestModelVersion('health_recommendations_model');
            if (!model) {
                throw new Error('Health recommendations model not found');
            }
            const recommendations = await this.generateRecommendations(healthData, recentPredictions);
            const result = await Prediction_1.PredictionManager.createPrediction(userId, model.id, 'health_recommendations', {
                basedOnPredictions: recentPredictions.length,
                healthDataTimestamp: new Date()
            }, recommendations, 0.8);
            return result;
        }
        catch (error) {
            console.error('Error generating personalized recommendations:', error);
            throw error;
        }
    }
    static async getUserPredictionsHistory(userId, predictionType, limit = 10) {
        return await Prediction_1.PredictionManager.getUserPredictions(userId, predictionType, limit);
    }
    static async getUserPredictionStats(userId) {
        return await Prediction_1.PredictionManager.getPredictionStats(userId);
    }
    static async updateModelPerformance(modelId, accuracy) {
        await AIModel_1.AIModelManager.updateModelAccuracy(modelId, accuracy);
    }
    static async getAvailableModels() {
        const result = await AIModel_1.AIModelManager.listModels(1, 50);
        return result.models;
    }
    static async getUserHealthData(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const recentVitalSigns = await prisma.vitalSign.findMany({
            where: {
                healthRecord: {
                    userId: userId,
                },
            },
            orderBy: { measuredAt: 'desc' },
            take: 10,
        });
        const medications = await prisma.medication.findMany({
            where: { userId, isActive: true },
        });
        const vitalSignsMap = this.processVitalSigns(recentVitalSigns);
        const lifestyleHabits = user.lifestyleHabits || {};
        const healthData = {
            age: this.calculateAge(user.birthDate),
            gender: user.gender,
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
            familyHistoryCardiovascular: false,
            familyHistoryDiabetes: false,
            familyHistoryCancer: false,
        };
        return healthData;
    }
    static async getUserHistoricalData(userId) {
        const healthRecords = await prisma.healthRecord.findMany({
            where: { userId },
            include: { vitalSigns: true },
            orderBy: { recordedDate: 'desc' },
            take: 30,
        });
        return healthRecords.map(record => ({
            date: record.recordedDate,
            vitalSigns: this.processVitalSigns(record.vitalSigns),
            symptoms: record.data?.symptoms || [],
            overallCondition: record.data?.overallCondition || 3,
        }));
    }
    static async getUserMedicalHistory(userId) {
        return await prisma.medicalRecord.findMany({
            where: { userId },
            include: { testResults: true, prescriptions: true },
            orderBy: { visitDate: 'desc' },
        });
    }
    static async getUserFamilyHistory(userId) {
        return await prisma.familyHistory.findMany({
            where: { userId },
        });
    }
    static async getUserGenomicData(userId) {
        return await prisma.genomicData.findFirst({
            where: { userId },
            include: { riskAssessments: true },
        });
    }
    static processVitalSigns(vitalSigns) {
        const processed = {};
        vitalSigns.forEach(vs => {
            if (!processed[vs.type]) {
                processed[vs.type] = [];
            }
            if (vs.type === 'blood_pressure' && typeof vs.value === 'object') {
                processed['systolicBP'] = processed['systolicBP'] || [];
                processed['diastolicBP'] = processed['diastolicBP'] || [];
                processed['systolicBP'].push(vs.value.systolic);
                processed['diastolicBP'].push(vs.value.diastolic);
            }
            else if (typeof vs.value === 'number') {
                processed[vs.type].push(vs.value);
            }
        });
        const averages = {};
        Object.entries(processed).forEach(([type, values]) => {
            if (values.length > 0) {
                averages[type] = values.reduce((sum, val) => sum + val, 0) / values.length;
            }
        });
        return averages;
    }
    static calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
    static getHighestAlertLevel(patterns) {
        if (patterns.some(p => p.alertLevel === 'critical'))
            return 'critical';
        if (patterns.some(p => p.alertLevel === 'warning'))
            return 'warning';
        return 'info';
    }
    static calculatePatternsConfidence(patterns) {
        if (patterns.length === 0)
            return 0;
        const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
        return avgConfidence;
    }
    static async generateRecommendations(healthData, recentPredictions) {
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            lifestyle: [],
            medical: [],
        };
        recentPredictions.forEach(prediction => {
            if (prediction.predictionResult?.recommendations) {
                recommendations.immediate.push(...prediction.predictionResult.recommendations.slice(0, 2));
            }
        });
        if (healthData.bmi > 25) {
            recommendations.lifestyle.push('Focus on weight management through diet and exercise');
        }
        if (healthData.exerciseFrequency < 3) {
            recommendations.lifestyle.push('Increase physical activity to at least 150 minutes per week');
        }
        if (healthData.smokingStatus === 'current') {
            recommendations.immediate.push('Quit smoking - this is the most important step for your health');
        }
        Object.keys(recommendations).forEach(key => {
            recommendations[key] = [
                ...new Set(recommendations[key])
            ].slice(0, 5);
        });
        return recommendations;
    }
}
exports.AIService = AIService;
exports.default = AIService;
//# sourceMappingURL=aiService.js.map