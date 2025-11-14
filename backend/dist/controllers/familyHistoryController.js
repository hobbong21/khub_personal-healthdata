"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyHistoryController = void 0;
const familyHistoryService_1 = require("../services/familyHistoryService");
class FamilyHistoryController {
    static async createFamilyMember(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const data = req.body;
            if (!data.relationship) {
                return res.status(400).json({ error: 'Relationship is required' });
            }
            const familyMember = await familyHistoryService_1.FamilyHistoryService.createFamilyMember(userId, data);
            res.status(201).json({
                success: true,
                data: familyMember
            });
        }
        catch (error) {
            console.error('Error in createFamilyMember:', error);
            res.status(500).json({
                error: 'Failed to create family member',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getFamilyMembers(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const familyMembers = await familyHistoryService_1.FamilyHistoryService.getFamilyMembers(userId);
            res.json({
                success: true,
                data: familyMembers
            });
        }
        catch (error) {
            console.error('Error in getFamilyMembers:', error);
            res.status(500).json({
                error: 'Failed to fetch family members',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getFamilyMemberById(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { id } = req.params;
            const familyMember = await familyHistoryService_1.FamilyHistoryService.getFamilyMemberById(id, userId);
            if (!familyMember) {
                return res.status(404).json({ error: 'Family member not found' });
            }
            res.json({
                success: true,
                data: familyMember
            });
        }
        catch (error) {
            console.error('Error in getFamilyMemberById:', error);
            res.status(500).json({
                error: 'Failed to fetch family member',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async updateFamilyMember(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { id } = req.params;
            const data = req.body;
            const familyMember = await familyHistoryService_1.FamilyHistoryService.updateFamilyMember(id, userId, data);
            if (!familyMember) {
                return res.status(404).json({ error: 'Family member not found' });
            }
            res.json({
                success: true,
                data: familyMember
            });
        }
        catch (error) {
            console.error('Error in updateFamilyMember:', error);
            res.status(500).json({
                error: 'Failed to update family member',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async deleteFamilyMember(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { id } = req.params;
            const success = await familyHistoryService_1.FamilyHistoryService.deleteFamilyMember(id, userId);
            if (!success) {
                return res.status(404).json({ error: 'Family member not found' });
            }
            res.json({
                success: true,
                message: 'Family member deleted successfully'
            });
        }
        catch (error) {
            console.error('Error in deleteFamilyMember:', error);
            res.status(500).json({
                error: 'Failed to delete family member',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getFamilyTree(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const familyTree = await familyHistoryService_1.FamilyHistoryService.getFamilyTree(userId);
            res.json({
                success: true,
                data: familyTree
            });
        }
        catch (error) {
            console.error('Error in getFamilyTree:', error);
            res.status(500).json({
                error: 'Failed to build family tree',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getFamilyMembersByGeneration(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const generation = parseInt(req.params.generation);
            if (isNaN(generation)) {
                return res.status(400).json({ error: 'Invalid generation parameter' });
            }
            const familyMembers = await familyHistoryService_1.FamilyHistoryService.getFamilyMembersByGeneration(userId, generation);
            res.json({
                success: true,
                data: familyMembers
            });
        }
        catch (error) {
            console.error('Error in getFamilyMembersByGeneration:', error);
            res.status(500).json({
                error: 'Failed to fetch family members by generation',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getFamilyMembersWithCondition(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { condition } = req.params;
            const familyMembers = await familyHistoryService_1.FamilyHistoryService.getFamilyMembersWithCondition(userId, condition);
            res.json({
                success: true,
                data: familyMembers
            });
        }
        catch (error) {
            console.error('Error in getFamilyMembersWithCondition:', error);
            res.status(500).json({
                error: 'Failed to fetch family members with condition',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getFamilyHistoryStats(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const stats = await familyHistoryService_1.FamilyHistoryService.getFamilyHistoryStats(userId);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error in getFamilyHistoryStats:', error);
            res.status(500).json({
                error: 'Failed to fetch family history statistics',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getGeneticConditions(req, res) {
        try {
            const { category, search } = req.query;
            let conditions;
            if (search) {
                conditions = await familyHistoryService_1.FamilyHistoryService.searchGeneticConditions(search);
            }
            else if (category) {
                conditions = await familyHistoryService_1.FamilyHistoryService.getGeneticConditionsByCategory(category);
            }
            else {
                conditions = await familyHistoryService_1.FamilyHistoryService.getGeneticConditions();
            }
            res.json({
                success: true,
                data: conditions
            });
        }
        catch (error) {
            console.error('Error in getGeneticConditions:', error);
            res.status(500).json({
                error: 'Failed to fetch genetic conditions',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getFamilyRiskAssessments(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const assessments = await familyHistoryService_1.FamilyHistoryService.getFamilyRiskAssessments(userId);
            res.json({
                success: true,
                data: assessments
            });
        }
        catch (error) {
            console.error('Error in getFamilyRiskAssessments:', error);
            res.status(500).json({
                error: 'Failed to fetch family risk assessments',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getRiskAssessmentForCondition(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { condition } = req.params;
            const assessment = await familyHistoryService_1.FamilyHistoryService.getRiskAssessmentForCondition(userId, condition);
            if (!assessment) {
                return res.status(404).json({ error: 'Risk assessment not found for this condition' });
            }
            res.json({
                success: true,
                data: assessment
            });
        }
        catch (error) {
            console.error('Error in getRiskAssessmentForCondition:', error);
            res.status(500).json({
                error: 'Failed to fetch risk assessment for condition',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async calculateComprehensiveRiskAssessment(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const assessments = await familyHistoryService_1.FamilyHistoryService.calculateComprehensiveRiskAssessment(userId);
            res.json({
                success: true,
                data: assessments
            });
        }
        catch (error) {
            console.error('Error in calculateComprehensiveRiskAssessment:', error);
            res.status(500).json({
                error: 'Failed to calculate comprehensive risk assessment',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getHighRiskAssessments(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const assessments = await familyHistoryService_1.FamilyHistoryService.getHighRiskAssessments(userId);
            res.json({
                success: true,
                data: assessments
            });
        }
        catch (error) {
            console.error('Error in getHighRiskAssessments:', error);
            res.status(500).json({
                error: 'Failed to fetch high-risk assessments',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async calculateGeneticRiskScore(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { condition } = req.params;
            const riskScore = await familyHistoryService_1.FamilyHistoryService.calculateGeneticRiskScore(userId, condition);
            res.json({
                success: true,
                data: {
                    condition,
                    riskScore,
                    riskLevel: riskScore >= 0.7 ? 'very_high' :
                        riskScore >= 0.4 ? 'high' :
                            riskScore >= 0.2 ? 'moderate' : 'low'
                }
            });
        }
        catch (error) {
            console.error('Error in calculateGeneticRiskScore:', error);
            res.status(500).json({
                error: 'Failed to calculate genetic risk score',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getFamilyHealthSummary(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const summary = await familyHistoryService_1.FamilyHistoryService.getFamilyHealthSummary(userId);
            res.json({
                success: true,
                data: summary
            });
        }
        catch (error) {
            console.error('Error in getFamilyHealthSummary:', error);
            res.status(500).json({
                error: 'Failed to generate family health summary',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async initializeGeneticConditions(req, res) {
        try {
            await familyHistoryService_1.FamilyHistoryService.initializeGeneticConditions();
            res.json({
                success: true,
                message: 'Genetic conditions database initialized successfully'
            });
        }
        catch (error) {
            console.error('Error in initializeGeneticConditions:', error);
            res.status(500).json({
                error: 'Failed to initialize genetic conditions',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.FamilyHistoryController = FamilyHistoryController;
exports.default = FamilyHistoryController;
//# sourceMappingURL=familyHistoryController.js.map