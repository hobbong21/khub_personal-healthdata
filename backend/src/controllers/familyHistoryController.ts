import { Request, Response } from 'express';
import { FamilyHistoryService } from '../services/familyHistoryService';
import { CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from '../types/familyHistory';

export class FamilyHistoryController {
  
  /**
   * Create a new family member
   */
  static async createFamilyMember(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const data: CreateFamilyMemberRequest = req.body;
      
      // Validate required fields
      if (!data.relationship) {
        return res.status(400).json({ error: 'Relationship is required' });
      }

      const familyMember = await FamilyHistoryService.createFamilyMember(userId, data);
      
      res.status(201).json({
        success: true,
        data: familyMember
      });
    } catch (error) {
      console.error('Error in createFamilyMember:', error);
      res.status(500).json({ 
        error: 'Failed to create family member',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all family members
   */
  static async getFamilyMembers(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const familyMembers = await FamilyHistoryService.getFamilyMembers(userId);
      
      res.json({
        success: true,
        data: familyMembers
      });
    } catch (error) {
      console.error('Error in getFamilyMembers:', error);
      res.status(500).json({ 
        error: 'Failed to fetch family members',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a specific family member
   */
  static async getFamilyMemberById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;
      const familyMember = await FamilyHistoryService.getFamilyMemberById(id, userId);
      
      if (!familyMember) {
        return res.status(404).json({ error: 'Family member not found' });
      }

      res.json({
        success: true,
        data: familyMember
      });
    } catch (error) {
      console.error('Error in getFamilyMemberById:', error);
      res.status(500).json({ 
        error: 'Failed to fetch family member',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update a family member
   */
  static async updateFamilyMember(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;
      const data: UpdateFamilyMemberRequest = req.body;
      
      const familyMember = await FamilyHistoryService.updateFamilyMember(id, userId, data);
      
      if (!familyMember) {
        return res.status(404).json({ error: 'Family member not found' });
      }

      res.json({
        success: true,
        data: familyMember
      });
    } catch (error) {
      console.error('Error in updateFamilyMember:', error);
      res.status(500).json({ 
        error: 'Failed to update family member',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete a family member
   */
  static async deleteFamilyMember(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { id } = req.params;
      const success = await FamilyHistoryService.deleteFamilyMember(id, userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Family member not found' });
      }

      res.json({
        success: true,
        message: 'Family member deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteFamilyMember:', error);
      res.status(500).json({ 
        error: 'Failed to delete family member',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get family tree structure
   */
  static async getFamilyTree(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const familyTree = await FamilyHistoryService.getFamilyTree(userId);
      
      res.json({
        success: true,
        data: familyTree
      });
    } catch (error) {
      console.error('Error in getFamilyTree:', error);
      res.status(500).json({ 
        error: 'Failed to build family tree',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get family members by generation
   */
  static async getFamilyMembersByGeneration(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const generation = parseInt(req.params.generation);
      if (isNaN(generation)) {
        return res.status(400).json({ error: 'Invalid generation parameter' });
      }

      const familyMembers = await FamilyHistoryService.getFamilyMembersByGeneration(userId, generation);
      
      res.json({
        success: true,
        data: familyMembers
      });
    } catch (error) {
      console.error('Error in getFamilyMembersByGeneration:', error);
      res.status(500).json({ 
        error: 'Failed to fetch family members by generation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get family members with specific condition
   */
  static async getFamilyMembersWithCondition(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { condition } = req.params;
      const familyMembers = await FamilyHistoryService.getFamilyMembersWithCondition(userId, condition);
      
      res.json({
        success: true,
        data: familyMembers
      });
    } catch (error) {
      console.error('Error in getFamilyMembersWithCondition:', error);
      res.status(500).json({ 
        error: 'Failed to fetch family members with condition',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get family history statistics
   */
  static async getFamilyHistoryStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const stats = await FamilyHistoryService.getFamilyHistoryStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getFamilyHistoryStats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch family history statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all genetic conditions
   */
  static async getGeneticConditions(req: Request, res: Response) {
    try {
      const { category, search } = req.query;
      
      let conditions;
      if (search) {
        conditions = await FamilyHistoryService.searchGeneticConditions(search as string);
      } else if (category) {
        conditions = await FamilyHistoryService.getGeneticConditionsByCategory(category as string);
      } else {
        conditions = await FamilyHistoryService.getGeneticConditions();
      }
      
      res.json({
        success: true,
        data: conditions
      });
    } catch (error) {
      console.error('Error in getGeneticConditions:', error);
      res.status(500).json({ 
        error: 'Failed to fetch genetic conditions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get family risk assessments
   */
  static async getFamilyRiskAssessments(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const assessments = await FamilyHistoryService.getFamilyRiskAssessments(userId);
      
      res.json({
        success: true,
        data: assessments
      });
    } catch (error) {
      console.error('Error in getFamilyRiskAssessments:', error);
      res.status(500).json({ 
        error: 'Failed to fetch family risk assessments',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get risk assessment for specific condition
   */
  static async getRiskAssessmentForCondition(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { condition } = req.params;
      const assessment = await FamilyHistoryService.getRiskAssessmentForCondition(userId, condition);
      
      if (!assessment) {
        return res.status(404).json({ error: 'Risk assessment not found for this condition' });
      }

      res.json({
        success: true,
        data: assessment
      });
    } catch (error) {
      console.error('Error in getRiskAssessmentForCondition:', error);
      res.status(500).json({ 
        error: 'Failed to fetch risk assessment for condition',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Calculate comprehensive risk assessment
   */
  static async calculateComprehensiveRiskAssessment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const assessments = await FamilyHistoryService.calculateComprehensiveRiskAssessment(userId);
      
      res.json({
        success: true,
        data: assessments
      });
    } catch (error) {
      console.error('Error in calculateComprehensiveRiskAssessment:', error);
      res.status(500).json({ 
        error: 'Failed to calculate comprehensive risk assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get high-risk assessments
   */
  static async getHighRiskAssessments(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const assessments = await FamilyHistoryService.getHighRiskAssessments(userId);
      
      res.json({
        success: true,
        data: assessments
      });
    } catch (error) {
      console.error('Error in getHighRiskAssessments:', error);
      res.status(500).json({ 
        error: 'Failed to fetch high-risk assessments',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Calculate genetic risk score for a specific condition
   */
  static async calculateGeneticRiskScore(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { condition } = req.params;
      const riskScore = await FamilyHistoryService.calculateGeneticRiskScore(userId, condition);
      
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
    } catch (error) {
      console.error('Error in calculateGeneticRiskScore:', error);
      res.status(500).json({ 
        error: 'Failed to calculate genetic risk score',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get family health summary
   */
  static async getFamilyHealthSummary(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const summary = await FamilyHistoryService.getFamilyHealthSummary(userId);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error in getFamilyHealthSummary:', error);
      res.status(500).json({ 
        error: 'Failed to generate family health summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Initialize genetic conditions database
   */
  static async initializeGeneticConditions(req: Request, res: Response) {
    try {
      await FamilyHistoryService.initializeGeneticConditions();
      
      res.json({
        success: true,
        message: 'Genetic conditions database initialized successfully'
      });
    } catch (error) {
      console.error('Error in initializeGeneticConditions:', error);
      res.status(500).json({ 
        error: 'Failed to initialize genetic conditions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default FamilyHistoryController;