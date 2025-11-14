"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
const client_1 = require("@prisma/client");
const Recommendation_1 = require("../models/Recommendation");
const recommendationEngine_1 = require("../utils/recommendationEngine");
const genomicsService_1 = require("./genomicsService");
const prisma = new client_1.PrismaClient();
class RecommendationService {
    static async generatePersonalizedRecommendations(userId, config) {
        try {
            const input = await this.gatherUserData(userId);
            const fullConfig = {
                includeGenomics: true,
                includeLifestyle: true,
                includeFamilyHistory: true,
                includeMedicalHistory: true,
                priorityThreshold: 'medium',
                maxRecommendationsPerCategory: 5,
                ...config,
            };
            const recommendations = await recommendationEngine_1.RecommendationEngine.generatePersonalizedRecommendations(input, fullConfig);
            const result = await Recommendation_1.RecommendationManager.createRecommendations(userId, recommendations);
            return result;
        }
        catch (error) {
            console.error('Error generating personalized recommendations:', error);
            throw error;
        }
    }
    static async getLatestRecommendations(userId) {
        return await Recommendation_1.RecommendationManager.getLatestRecommendations(userId);
    }
    static async getRecommendationsHistory(userId, limit = 10) {
        return await Recommendation_1.RecommendationManager.getUserRecommendations(userId, limit);
    }
    static async trackRecommendationEffectiveness(effectiveness) {
        return await Recommendation_1.RecommendationManager.trackEffectiveness(effectiveness);
    }
    static async getEffectivenessData(userId, category) {
        return await Recommendation_1.RecommendationManager.getEffectivenessData(userId, category);
    }
    static async getRecommendationStats(userId) {
        return await Recommendation_1.RecommendationManager.getRecommendationStats(userId);
    }
    static async updateImplementationStatus(recommendationId, userId, category, implemented, implementationDate) {
        return await Recommendation_1.RecommendationManager.trackEffectiveness({
            recommendationId,
            userId,
            category,
            implemented,
            implementationDate,
        });
    }
    static async submitUserFeedback(recommendationId, userId, category, feedback) {
        return await Recommendation_1.RecommendationManager.trackEffectiveness({
            recommendationId,
            userId,
            category,
            implemented: true,
            userFeedback: feedback,
        });
    }
    static async updateAdherenceScore(recommendationId, userId, category, adherenceScore) {
        return await Recommendation_1.RecommendationManager.trackEffectiveness({
            recommendationId,
            userId,
            category,
            implemented: true,
            adherenceScore,
        });
    }
    static async recordMeasuredOutcome(recommendationId, userId, category, outcome) {
        return await Recommendation_1.RecommendationManager.trackEffectiveness({
            recommendationId,
            userId,
            category,
            implemented: true,
            measuredOutcome: outcome,
        });
    }
    static async getLifestyleImprovementSuggestions(userId) {
        try {
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
                take: 5,
            });
            const medications = await prisma.medication.findMany({
                where: { userId, isActive: true },
            });
            const suggestions = this.generateLifestyleSuggestions(user, recentVitalSigns, medications);
            return suggestions;
        }
        catch (error) {
            console.error('Error getting lifestyle improvement suggestions:', error);
            throw error;
        }
    }
    static async getPersonalizedScreeningSchedule(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const familyHistory = await prisma.familyHistory.findMany({
                where: { userId },
            });
            const genomicData = await prisma.genomicData.findFirst({
                where: { userId },
            });
            const age = this.calculateAge(user.birthDate);
            const schedule = this.generateScreeningSchedule(age, user.gender, familyHistory, genomicData);
            return schedule;
        }
        catch (error) {
            console.error('Error getting personalized screening schedule:', error);
            throw error;
        }
    }
    static async gatherUserData(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const healthData = await this.getUserHealthData(userId);
        let genomicData = null;
        try {
            genomicData = await genomicsService_1.GenomicsService.getGenomicDataByUserId(userId);
        }
        catch (error) {
            console.log('No genomic data available for user');
        }
        const familyHistory = await prisma.familyHistory.findMany({
            where: { userId },
        });
        const medicalHistory = await prisma.medicalRecord.findMany({
            where: { userId },
            include: { testResults: true, prescriptions: true },
            orderBy: { visitDate: 'desc' },
            take: 10,
        });
        const lifestyleData = user.lifestyleHabits;
        return {
            userId,
            healthData,
            genomicData: genomicData?.[0] || null,
            familyHistory,
            medicalHistory,
            lifestyleData,
        };
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
        const vitalSignsMap = this.processVitalSigns(recentVitalSigns);
        const age = this.calculateAge(user.birthDate);
        const bmi = user.height && user.weight ?
            user.weight / Math.pow(user.height / 100, 2) : null;
        return {
            age,
            gender: user.gender,
            height: user.height,
            weight: user.weight,
            bmi,
            bloodType: user.bloodType,
            vitalSigns: vitalSignsMap,
            lifestyleHabits: user.lifestyleHabits,
        };
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
    static generateLifestyleSuggestions(user, vitalSigns, medications) {
        const suggestions = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
        };
        const bmi = user.height && user.weight ?
            user.weight / Math.pow(user.height / 100, 2) : null;
        if (bmi && bmi > 25) {
            suggestions.immediate.push('Focus on portion control and increase daily physical activity');
            suggestions.shortTerm.push('Aim for 1-2 pounds of weight loss per week through diet and exercise');
        }
        const avgSystolic = this.getAverageVitalSign(vitalSigns, 'systolicBP');
        if (avgSystolic && avgSystolic > 130) {
            suggestions.immediate.push('Reduce sodium intake and increase potassium-rich foods');
            suggestions.shortTerm.push('Implement stress reduction techniques like meditation or yoga');
        }
        const lifestyle = user.lifestyleHabits;
        if (lifestyle?.smoking) {
            suggestions.immediate.push('Quit smoking - this is the most important step for your health');
        }
        if (lifestyle?.exerciseFrequency < 3) {
            suggestions.shortTerm.push('Gradually increase exercise to at least 150 minutes per week');
        }
        return suggestions;
    }
    static generateScreeningSchedule(age, gender, familyHistory, genomicData) {
        const schedule = [];
        const currentDate = new Date();
        if (age >= 40) {
            schedule.push({
                test: 'Annual physical exam',
                frequency: 'Yearly',
                nextDue: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()),
                priority: 'high',
            });
        }
        if (gender === 'female' && age >= 40) {
            schedule.push({
                test: 'Mammography',
                frequency: age >= 50 ? 'Every 2 years' : 'Yearly',
                nextDue: new Date(currentDate.getFullYear() + (age >= 50 ? 2 : 1), currentDate.getMonth(), currentDate.getDate()),
                priority: 'high',
            });
        }
        if (gender === 'male' && age >= 50) {
            schedule.push({
                test: 'PSA screening',
                frequency: 'Every 2 years',
                nextDue: new Date(currentDate.getFullYear() + 2, currentDate.getMonth(), currentDate.getDate()),
                priority: 'medium',
            });
        }
        const hasCardiovascularHistory = familyHistory.some(fh => fh.conditions?.some(c => c.category === 'cardiovascular'));
        if (hasCardiovascularHistory && age >= 30) {
            schedule.push({
                test: 'Lipid panel',
                frequency: 'Every 2 years',
                nextDue: new Date(currentDate.getFullYear() + 2, currentDate.getMonth(), currentDate.getDate()),
                priority: 'high',
            });
        }
        return schedule;
    }
    static getAverageVitalSign(vitalSigns, type) {
        const values = vitalSigns
            .filter(vs => vs.type === type || (type === 'systolicBP' && vs.type === 'blood_pressure'))
            .map(vs => {
            if (type === 'systolicBP' && vs.type === 'blood_pressure') {
                return vs.value?.systolic;
            }
            return vs.value;
        })
            .filter(v => typeof v === 'number');
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : null;
    }
}
exports.RecommendationService = RecommendationService;
//# sourceMappingURL=recommendationService.js.map