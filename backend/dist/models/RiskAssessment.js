"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAssessment = void 0;
const client_1 = require("@prisma/client");
const riskCalculationEngine_1 = require("../utils/riskCalculationEngine");
const prisma = new client_1.PrismaClient();
class RiskAssessment {
    static async create(data) {
        return await prisma.riskAssessment.create({
            data: {
                userId: data.userId,
                genomicDataId: data.genomicDataId,
                diseaseType: data.diseaseType,
                riskScore: 0,
                contributingFactors: data.contributingFactors,
            },
        });
    }
    static async findByUserId(userId) {
        return await prisma.riskAssessment.findMany({
            where: { userId },
            include: {
                genomicData: {
                    select: {
                        id: true,
                        sourcePlatform: true,
                        uploadedAt: true,
                    },
                },
            },
            orderBy: { calculatedAt: 'desc' },
        });
    }
    static async findByUserIdAndDisease(userId, diseaseType) {
        return await prisma.riskAssessment.findMany({
            where: {
                userId,
                diseaseType,
            },
            include: {
                genomicData: {
                    select: {
                        id: true,
                        sourcePlatform: true,
                        uploadedAt: true,
                    },
                },
            },
            orderBy: { calculatedAt: 'desc' },
        });
    }
    static async update(id, data) {
        return await prisma.riskAssessment.update({
            where: { id },
            data: {
                ...data,
                calculatedAt: new Date(),
            },
        });
    }
    static async delete(id) {
        return await prisma.riskAssessment.delete({
            where: { id },
        });
    }
    static async calculateGeneticRisk(input) {
        if (!input.genomicData?.diseaseRisks)
            return 0.5;
        const diseaseRisk = input.genomicData.diseaseRisks.find(risk => risk.diseaseType === input.diseaseType);
        if (!diseaseRisk)
            return 0.5;
        return Math.min(Math.max(diseaseRisk.riskScore / 100, 0), 1);
    }
    static async calculateLifestyleRisk(input) {
        if (!input.userProfile?.lifestyle)
            return 0.5;
        const lifestyle = input.userProfile.lifestyle;
        let riskScore = 0.5;
        switch (input.diseaseType) {
            case 'cardiovascular_disease':
                if (lifestyle.smoking)
                    riskScore += 0.2;
                if (lifestyle.alcohol === 'heavy')
                    riskScore += 0.1;
                if (lifestyle.exerciseFrequency < 2)
                    riskScore += 0.15;
                if (lifestyle.dietType === 'high_fat')
                    riskScore += 0.1;
                break;
            case 'type2_diabetes':
                if (lifestyle.exerciseFrequency < 3)
                    riskScore += 0.2;
                if (lifestyle.dietType === 'high_sugar')
                    riskScore += 0.15;
                if (lifestyle.alcohol === 'heavy')
                    riskScore += 0.05;
                break;
            case 'lung_cancer':
                if (lifestyle.smoking)
                    riskScore += 0.4;
                break;
            case 'breast_cancer':
                if (lifestyle.alcohol === 'heavy')
                    riskScore += 0.1;
                if (lifestyle.exerciseFrequency < 2)
                    riskScore += 0.05;
                break;
            default:
                if (lifestyle.smoking)
                    riskScore += 0.1;
                if (lifestyle.alcohol === 'heavy')
                    riskScore += 0.05;
                if (lifestyle.exerciseFrequency < 2)
                    riskScore += 0.1;
        }
        return Math.min(Math.max(riskScore, 0), 1);
    }
    static async calculateFamilyHistoryRisk(input) {
        if (!input.familyHistory?.length)
            return 0.5;
        let riskScore = 0.5;
        let affectedRelatives = 0;
        input.familyHistory.forEach(relative => {
            if (relative.conditions?.includes(input.diseaseType)) {
                affectedRelatives++;
                switch (relative.relationship) {
                    case 'parent':
                    case 'sibling':
                        riskScore += 0.15;
                        break;
                    case 'grandparent':
                    case 'aunt':
                    case 'uncle':
                        riskScore += 0.08;
                        break;
                    case 'cousin':
                        riskScore += 0.03;
                        break;
                }
            }
        });
        if (affectedRelatives > 1) {
            riskScore += 0.1 * (affectedRelatives - 1);
        }
        return Math.min(Math.max(riskScore, 0), 1);
    }
    static async calculateAgeGenderRisk(input) {
        if (!input.userProfile)
            return 0.5;
        const { age, gender } = input.userProfile;
        let riskScore = 0.5;
        switch (input.diseaseType) {
            case 'cardiovascular_disease':
                if (age > 65)
                    riskScore += 0.2;
                else if (age > 50)
                    riskScore += 0.1;
                if (gender === 'male')
                    riskScore += 0.1;
                break;
            case 'breast_cancer':
                if (gender === 'female') {
                    if (age > 50)
                        riskScore += 0.15;
                    else if (age > 40)
                        riskScore += 0.08;
                }
                break;
            case 'prostate_cancer':
                if (gender === 'male') {
                    if (age > 65)
                        riskScore += 0.25;
                    else if (age > 50)
                        riskScore += 0.15;
                }
                break;
            case 'alzheimer_disease':
                if (age > 75)
                    riskScore += 0.3;
                else if (age > 65)
                    riskScore += 0.15;
                break;
            default:
                if (age > 65)
                    riskScore += 0.1;
                else if (age > 50)
                    riskScore += 0.05;
        }
        return Math.min(Math.max(riskScore, 0), 1);
    }
    static async calculateComprehensiveRisk(input) {
        const overallRisk = await riskCalculationEngine_1.RiskCalculationEngine.calculateIntegratedRisk(input);
        let riskFactors;
        switch (input.diseaseType) {
            case 'cardiovascular_disease':
                riskFactors = await riskCalculationEngine_1.RiskCalculationEngine.calculateCardiovascularRisk(input);
                break;
            case 'type2_diabetes':
                riskFactors = await riskCalculationEngine_1.RiskCalculationEngine.calculateDiabetesRisk(input);
                break;
            case 'alzheimer_disease':
                riskFactors = await riskCalculationEngine_1.RiskCalculationEngine.calculateAlzheimerRisk(input);
                break;
            case 'breast_cancer':
                riskFactors = await riskCalculationEngine_1.RiskCalculationEngine.calculateCancerRisk(input, 'breast');
                break;
            case 'prostate_cancer':
                riskFactors = await riskCalculationEngine_1.RiskCalculationEngine.calculateCancerRisk(input, 'prostate');
                break;
            case 'colorectal_cancer':
                riskFactors = await riskCalculationEngine_1.RiskCalculationEngine.calculateCancerRisk(input, 'colorectal');
                break;
            case 'lung_cancer':
                riskFactors = await riskCalculationEngine_1.RiskCalculationEngine.calculateCancerRisk(input, 'lung');
                break;
            default:
                riskFactors = {
                    geneticRisk: await this.calculateGeneticRisk(input),
                    lifestyleRisk: await this.calculateLifestyleRisk(input),
                    familyHistoryRisk: await this.calculateFamilyHistoryRisk(input),
                    environmentalRisk: 0.5,
                    ageRisk: await this.calculateAgeGenderRisk(input),
                    genderRisk: 0.5,
                };
        }
        const percentile = input.userProfile ?
            riskCalculationEngine_1.RiskCalculationEngine.calculatePercentile(overallRisk, input.diseaseType, input.userProfile.age, input.userProfile.gender) : this.calculatePercentile(overallRisk, input.diseaseType);
        const recommendations = riskCalculationEngine_1.RiskCalculationEngine.generateRiskRecommendations(input.diseaseType, riskFactors, overallRisk);
        const existingAssessment = await prisma.riskAssessment.findFirst({
            where: {
                userId: input.userId,
                diseaseType: input.diseaseType,
            },
        });
        const assessmentData = {
            userId: input.userId,
            diseaseType: input.diseaseType,
            riskScore: overallRisk,
            percentile,
            contributingFactors: {
                genetic: riskFactors.geneticRisk,
                lifestyle: riskFactors.lifestyleRisk,
                familyHistory: riskFactors.familyHistoryRisk,
                environmental: riskFactors.environmentalRisk,
            },
        };
        let result;
        if (existingAssessment) {
            result = await prisma.riskAssessment.update({
                where: { id: existingAssessment.id },
                data: assessmentData,
            });
        }
        else {
            result = await prisma.riskAssessment.create({
                data: assessmentData,
            });
        }
        return {
            ...result,
            recommendations,
        };
    }
    static calculatePercentile(riskScore, diseaseType) {
        const baselineRisks = {
            'cardiovascular_disease': 0.25,
            'type2_diabetes': 0.11,
            'breast_cancer': 0.12,
            'prostate_cancer': 0.13,
            'alzheimer_disease': 0.10,
            'lung_cancer': 0.06,
        };
        const baseline = baselineRisks[diseaseType] || 0.1;
        const relativeRisk = riskScore / baseline;
        if (relativeRisk <= 0.5)
            return Math.max(relativeRisk * 20, 1);
        if (relativeRisk <= 1.0)
            return 20 + (relativeRisk - 0.5) * 60;
        if (relativeRisk <= 2.0)
            return 80 + (relativeRisk - 1.0) * 15;
        return Math.min(95 + (relativeRisk - 2.0) * 2.5, 99);
    }
    static generateRecommendations(diseaseType, risks) {
        const recommendations = [];
        if (risks.genetic > 0.7) {
            recommendations.push(`높은 유전적 위험도로 인해 정기적인 검진이 필요합니다.`);
            recommendations.push(`가족력과 유전적 요인에 대해 의료진과 상담하세요.`);
        }
        if (risks.lifestyle > 0.6) {
            switch (diseaseType) {
                case 'cardiovascular_disease':
                    recommendations.push('금연과 규칙적인 운동을 통해 심혈관 건강을 개선하세요.');
                    recommendations.push('저염식과 건강한 식단을 유지하세요.');
                    break;
                case 'type2_diabetes':
                    recommendations.push('체중 관리와 규칙적인 운동으로 당뇨병 위험을 줄이세요.');
                    recommendations.push('당분 섭취를 줄이고 균형 잡힌 식단을 유지하세요.');
                    break;
                case 'lung_cancer':
                    recommendations.push('금연은 폐암 위험을 크게 줄일 수 있습니다.');
                    break;
            }
        }
        if (risks.familyHistory > 0.6) {
            recommendations.push('가족력으로 인한 위험이 높으므로 조기 검진을 고려하세요.');
            recommendations.push('유전 상담을 받아보시는 것을 권장합니다.');
        }
        recommendations.push('정기적인 건강검진을 받으세요.');
        recommendations.push('건강한 생활습관을 유지하세요.');
        return recommendations;
    }
    static async getPopulationRiskDistribution(diseaseType) {
        return {
            mean: 0.15,
            median: 0.12,
            percentiles: {
                10: 0.05,
                25: 0.08,
                50: 0.12,
                75: 0.20,
                90: 0.35,
                95: 0.50,
            },
        };
    }
    static async bulkCalculateRisks(userId, diseaseTypes) {
        const results = [];
        for (const diseaseType of diseaseTypes) {
            const input = {
                userId,
                diseaseType,
            };
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    genomicData: true,
                    familyHistory: true,
                },
            });
            if (user) {
                input.userProfile = {
                    age: new Date().getFullYear() - new Date(user.birthDate).getFullYear(),
                    gender: user.gender,
                    lifestyle: user.lifestyleHabits,
                };
                if (user.genomicData.length > 0) {
                    const latestGenomicData = user.genomicData[user.genomicData.length - 1];
                    input.genomicData = latestGenomicData.analysisResults;
                }
                input.familyHistory = user.familyHistory;
                const result = await this.calculateComprehensiveRisk(input);
                results.push(result);
            }
        }
        return results;
    }
}
exports.RiskAssessment = RiskAssessment;
//# sourceMappingURL=RiskAssessment.js.map