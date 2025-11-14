"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyHistoryService = void 0;
const FamilyHistory_1 = require("../models/FamilyHistory");
const GeneticCondition_1 = require("../models/GeneticCondition");
const FamilyRiskAssessment_1 = require("../models/FamilyRiskAssessment");
class FamilyHistoryService {
    static async createFamilyMember(userId, data) {
        try {
            const familyMember = await FamilyHistory_1.FamilyHistoryModel.createFamilyMember(userId, data);
            if (data.conditions && data.conditions.length > 0) {
                for (const condition of data.conditions) {
                    await FamilyRiskAssessment_1.FamilyRiskAssessmentModel.calculateFamilyRiskAssessment(userId, condition.name);
                }
            }
            return familyMember;
        }
        catch (error) {
            console.error('Error creating family member:', error);
            throw new Error('Failed to create family member');
        }
    }
    static async getFamilyMembers(userId) {
        try {
            return await FamilyHistory_1.FamilyHistoryModel.getFamilyMembers(userId);
        }
        catch (error) {
            console.error('Error fetching family members:', error);
            throw new Error('Failed to fetch family members');
        }
    }
    static async getFamilyMemberById(id, userId) {
        try {
            return await FamilyHistory_1.FamilyHistoryModel.getFamilyMemberById(id, userId);
        }
        catch (error) {
            console.error('Error fetching family member:', error);
            throw new Error('Failed to fetch family member');
        }
    }
    static async updateFamilyMember(id, userId, data) {
        try {
            const updatedMember = await FamilyHistory_1.FamilyHistoryModel.updateFamilyMember(id, userId, data);
            if (data.conditions) {
                for (const condition of data.conditions) {
                    await FamilyRiskAssessment_1.FamilyRiskAssessmentModel.calculateFamilyRiskAssessment(userId, condition.name);
                }
            }
            return updatedMember;
        }
        catch (error) {
            console.error('Error updating family member:', error);
            throw new Error('Failed to update family member');
        }
    }
    static async deleteFamilyMember(id, userId) {
        try {
            const success = await FamilyHistory_1.FamilyHistoryModel.deleteFamilyMember(id, userId);
            if (success) {
                await this.recalculateAllRiskAssessments(userId);
            }
            return success;
        }
        catch (error) {
            console.error('Error deleting family member:', error);
            throw new Error('Failed to delete family member');
        }
    }
    static async getFamilyTree(userId) {
        try {
            return await FamilyHistory_1.FamilyHistoryModel.getFamilyTree(userId);
        }
        catch (error) {
            console.error('Error building family tree:', error);
            throw new Error('Failed to build family tree');
        }
    }
    static async getFamilyMembersByGeneration(userId, generation) {
        try {
            return await FamilyHistory_1.FamilyHistoryModel.getFamilyMembersByGeneration(userId, generation);
        }
        catch (error) {
            console.error('Error fetching family members by generation:', error);
            throw new Error('Failed to fetch family members by generation');
        }
    }
    static async getFamilyMembersWithCondition(userId, conditionName) {
        try {
            return await FamilyHistory_1.FamilyHistoryModel.getFamilyMembersWithCondition(userId, conditionName);
        }
        catch (error) {
            console.error('Error fetching family members with condition:', error);
            throw new Error('Failed to fetch family members with condition');
        }
    }
    static async getFamilyHistoryStats(userId) {
        try {
            const stats = await FamilyHistory_1.FamilyHistoryModel.getFamilyHistoryStats(userId);
            const riskAssessments = await FamilyRiskAssessment_1.FamilyRiskAssessmentModel.getFamilyRiskAssessments(userId);
            return {
                ...stats,
                riskAssessments
            };
        }
        catch (error) {
            console.error('Error fetching family history stats:', error);
            throw new Error('Failed to fetch family history statistics');
        }
    }
    static async getGeneticConditions() {
        try {
            return await GeneticCondition_1.GeneticConditionModel.getAllGeneticConditions();
        }
        catch (error) {
            console.error('Error fetching genetic conditions:', error);
            throw new Error('Failed to fetch genetic conditions');
        }
    }
    static async getGeneticConditionsByCategory(category) {
        try {
            return await GeneticCondition_1.GeneticConditionModel.getGeneticConditionsByCategory(category);
        }
        catch (error) {
            console.error('Error fetching genetic conditions by category:', error);
            throw new Error('Failed to fetch genetic conditions by category');
        }
    }
    static async searchGeneticConditions(searchTerm) {
        try {
            return await GeneticCondition_1.GeneticConditionModel.searchGeneticConditions(searchTerm);
        }
        catch (error) {
            console.error('Error searching genetic conditions:', error);
            throw new Error('Failed to search genetic conditions');
        }
    }
    static async getFamilyRiskAssessments(userId) {
        try {
            return await FamilyRiskAssessment_1.FamilyRiskAssessmentModel.getFamilyRiskAssessments(userId);
        }
        catch (error) {
            console.error('Error fetching family risk assessments:', error);
            throw new Error('Failed to fetch family risk assessments');
        }
    }
    static async getRiskAssessmentForCondition(userId, conditionName) {
        try {
            return await FamilyRiskAssessment_1.FamilyRiskAssessmentModel.getRiskAssessmentForCondition(userId, conditionName);
        }
        catch (error) {
            console.error('Error fetching risk assessment for condition:', error);
            throw new Error('Failed to fetch risk assessment for condition');
        }
    }
    static async calculateComprehensiveRiskAssessment(userId) {
        try {
            return await FamilyRiskAssessment_1.FamilyRiskAssessmentModel.calculateComprehensiveRiskAssessment(userId);
        }
        catch (error) {
            console.error('Error calculating comprehensive risk assessment:', error);
            throw new Error('Failed to calculate comprehensive risk assessment');
        }
    }
    static async getHighRiskAssessments(userId) {
        try {
            return await FamilyRiskAssessment_1.FamilyRiskAssessmentModel.getHighRiskAssessments(userId);
        }
        catch (error) {
            console.error('Error fetching high-risk assessments:', error);
            throw new Error('Failed to fetch high-risk assessments');
        }
    }
    static async calculateGeneticRiskScore(userId, conditionName) {
        try {
            const assessment = await FamilyRiskAssessment_1.FamilyRiskAssessmentModel.calculateFamilyRiskAssessment(userId, conditionName);
            return assessment.familyRiskScore;
        }
        catch (error) {
            console.error('Error calculating genetic risk score:', error);
            throw new Error('Failed to calculate genetic risk score');
        }
    }
    static async getFamilyHealthSummary(userId) {
        try {
            const stats = await this.getFamilyHistoryStats(userId);
            const highRiskAssessments = await this.getHighRiskAssessments(userId);
            const commonConditions = await FamilyHistory_1.FamilyHistoryModel.getCommonFamilyConditions(userId);
            return {
                overview: {
                    totalMembers: stats.totalMembers,
                    livingMembers: stats.livingMembers,
                    deceasedMembers: stats.deceasedMembers,
                    generationsTracked: stats.generationsTracked
                },
                riskProfile: {
                    highRiskConditions: highRiskAssessments.length,
                    totalAssessments: stats.riskAssessments.length,
                    topRisks: highRiskAssessments.slice(0, 5)
                },
                familyPatterns: {
                    commonConditions: commonConditions.slice(0, 10),
                    hereditaryRisk: highRiskAssessments.filter(r => r.riskLevel === 'very_high').length
                }
            };
        }
        catch (error) {
            console.error('Error generating family health summary:', error);
            throw new Error('Failed to generate family health summary');
        }
    }
    static async initializeGeneticConditions() {
        try {
            await GeneticCondition_1.GeneticConditionModel.seedCommonGeneticConditions();
        }
        catch (error) {
            console.error('Error initializing genetic conditions:', error);
            throw new Error('Failed to initialize genetic conditions');
        }
    }
    static async recalculateAllRiskAssessments(userId) {
        try {
            const commonConditions = await FamilyHistory_1.FamilyHistoryModel.getCommonFamilyConditions(userId);
            for (const conditionData of commonConditions) {
                await FamilyRiskAssessment_1.FamilyRiskAssessmentModel.calculateFamilyRiskAssessment(userId, conditionData.condition);
            }
        }
        catch (error) {
            console.error('Error recalculating risk assessments:', error);
        }
    }
}
exports.FamilyHistoryService = FamilyHistoryService;
exports.default = FamilyHistoryService;
//# sourceMappingURL=familyHistoryService.js.map