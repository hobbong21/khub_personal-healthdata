"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyRiskAssessmentModel = void 0;
const client_1 = require("@prisma/client");
const FamilyHistory_1 = require("./FamilyHistory");
const GeneticCondition_1 = require("./GeneticCondition");
const prisma = new client_1.PrismaClient();
class FamilyRiskAssessmentModel {
    static async calculateFamilyRiskAssessment(userId, conditionName) {
        const affectedMembers = await FamilyHistory_1.FamilyHistoryModel.getFamilyMembersWithCondition(userId, conditionName);
        const allFamilyMembers = await FamilyHistory_1.FamilyHistoryModel.getFamilyMembers(userId);
        const geneticCondition = await GeneticCondition_1.GeneticConditionModel.getGeneticConditionByName(conditionName);
        const riskScore = this.calculateRiskScore(affectedMembers, allFamilyMembers, geneticCondition);
        const riskLevel = this.determineRiskLevel(riskScore);
        const recommendations = this.generateRecommendations(conditionName, riskLevel, geneticCondition);
        const existingAssessment = await prisma.familyRiskAssessment.findFirst({
            where: { userId, conditionName }
        });
        let assessment;
        if (existingAssessment) {
            assessment = await prisma.familyRiskAssessment.update({
                where: { id: existingAssessment.id },
                data: {
                    familyRiskScore: riskScore,
                    affectedRelatives: affectedMembers.length,
                    riskLevel,
                    recommendations,
                    calculatedAt: new Date()
                }
            });
        }
        else {
            assessment = await prisma.familyRiskAssessment.create({
                data: {
                    userId,
                    conditionName,
                    familyRiskScore: riskScore,
                    affectedRelatives: affectedMembers.length,
                    riskLevel,
                    recommendations
                }
            });
        }
        return this.mapPrismaToFamilyRiskAssessment(assessment);
    }
    static async getFamilyRiskAssessments(userId) {
        const assessments = await prisma.familyRiskAssessment.findMany({
            where: { userId },
            orderBy: [
                { familyRiskScore: 'desc' },
                { conditionName: 'asc' }
            ]
        });
        return assessments.map(this.mapPrismaToFamilyRiskAssessment);
    }
    static async getRiskAssessmentForCondition(userId, conditionName) {
        const assessment = await prisma.familyRiskAssessment.findFirst({
            where: { userId, conditionName }
        });
        return assessment ? this.mapPrismaToFamilyRiskAssessment(assessment) : null;
    }
    static async getHighRiskAssessments(userId) {
        const assessments = await prisma.familyRiskAssessment.findMany({
            where: {
                userId,
                riskLevel: { in: ['high', 'very_high'] }
            },
            orderBy: { familyRiskScore: 'desc' }
        });
        return assessments.map(this.mapPrismaToFamilyRiskAssessment);
    }
    static async calculateComprehensiveRiskAssessment(userId) {
        const commonConditions = await FamilyHistory_1.FamilyHistoryModel.getCommonFamilyConditions(userId);
        const assessments = [];
        for (const conditionData of commonConditions) {
            const assessment = await this.calculateFamilyRiskAssessment(userId, conditionData.condition);
            assessments.push(assessment);
        }
        const hereditaryConditions = await GeneticCondition_1.GeneticConditionModel.getHereditaryConditions();
        for (const condition of hereditaryConditions) {
            const existingAssessment = assessments.find(a => a.conditionName === condition.name);
            if (!existingAssessment) {
                const assessment = await this.calculateFamilyRiskAssessment(userId, condition.name);
                if (assessment.familyRiskScore > 0.1) {
                    assessments.push(assessment);
                }
            }
        }
        return assessments.sort((a, b) => b.familyRiskScore - a.familyRiskScore);
    }
    static async deleteRiskAssessment(id, userId) {
        const result = await prisma.familyRiskAssessment.deleteMany({
            where: { id, userId }
        });
        return result.count > 0;
    }
    static calculateRiskScore(affectedMembers, allFamilyMembers, geneticCondition) {
        if (affectedMembers.length === 0) {
            return 0;
        }
        let riskScore = 0;
        const totalMembers = allFamilyMembers.length;
        const affectedRatio = affectedMembers.length / Math.max(totalMembers, 1);
        riskScore += affectedRatio * 0.4;
        let relationshipWeight = 0;
        affectedMembers.forEach(member => {
            switch (member.generation) {
                case -1:
                    relationshipWeight += 0.5;
                    break;
                case 0:
                    relationshipWeight += 0.3;
                    break;
                case 1:
                    relationshipWeight += 0.2;
                    break;
                case -2:
                    relationshipWeight += 0.2;
                    break;
                default:
                    relationshipWeight += 0.1;
            }
        });
        riskScore += Math.min(relationshipWeight, 1.0) * 0.4;
        if (geneticCondition) {
            if (geneticCondition.penetrance) {
                riskScore *= geneticCondition.penetrance;
            }
            if (geneticCondition.inheritancePattern === 'autosomal_dominant') {
                riskScore *= 1.2;
            }
            else if (geneticCondition.inheritancePattern === 'autosomal_recessive') {
                riskScore *= 0.8;
            }
        }
        const earlyOnsetMembers = affectedMembers.filter(member => {
            const conditions = member.conditions || [];
            return conditions.some((condition) => condition.diagnosedYear && member.birthYear &&
                (condition.diagnosedYear - member.birthYear) < 50);
        });
        if (earlyOnsetMembers.length > 0) {
            riskScore *= 1.3;
        }
        return Math.min(riskScore, 1.0);
    }
    static determineRiskLevel(riskScore) {
        if (riskScore >= 0.7)
            return 'very_high';
        if (riskScore >= 0.4)
            return 'high';
        if (riskScore >= 0.2)
            return 'moderate';
        return 'low';
    }
    static generateRecommendations(conditionName, riskLevel, geneticCondition) {
        const recommendations = [];
        switch (riskLevel) {
            case 'very_high':
                recommendations.push('Consider genetic counseling and testing');
                recommendations.push('Discuss with healthcare provider about enhanced screening');
                recommendations.push('Consider preventive measures if available');
                break;
            case 'high':
                recommendations.push('Discuss family history with healthcare provider');
                recommendations.push('Consider earlier or more frequent screening');
                break;
            case 'moderate':
                recommendations.push('Inform healthcare provider about family history');
                recommendations.push('Follow standard screening guidelines');
                break;
            case 'low':
                recommendations.push('Continue routine health maintenance');
                break;
        }
        if (geneticCondition) {
            switch (geneticCondition.category) {
                case 'cardiovascular':
                    recommendations.push('Maintain healthy diet and exercise regularly');
                    recommendations.push('Monitor blood pressure and cholesterol');
                    break;
                case 'cancer':
                    recommendations.push('Follow cancer screening guidelines');
                    recommendations.push('Consider genetic testing if appropriate');
                    break;
                case 'neurological':
                    recommendations.push('Maintain cognitive health through mental exercises');
                    recommendations.push('Consider neurological evaluation if symptoms develop');
                    break;
                case 'metabolic':
                    recommendations.push('Maintain healthy weight and diet');
                    recommendations.push('Monitor relevant metabolic markers');
                    break;
            }
        }
        return recommendations;
    }
    static mapPrismaToFamilyRiskAssessment(prismaAssessment) {
        return {
            id: prismaAssessment.id,
            userId: prismaAssessment.userId,
            conditionName: prismaAssessment.conditionName,
            familyRiskScore: prismaAssessment.familyRiskScore,
            affectedRelatives: prismaAssessment.affectedRelatives,
            riskLevel: prismaAssessment.riskLevel,
            recommendations: prismaAssessment.recommendations || [],
            calculatedAt: prismaAssessment.calculatedAt
        };
    }
}
exports.FamilyRiskAssessmentModel = FamilyRiskAssessmentModel;
exports.default = FamilyRiskAssessmentModel;
//# sourceMappingURL=FamilyRiskAssessment.js.map