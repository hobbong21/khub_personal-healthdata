import { FamilyHistoryModel } from '../models/FamilyHistory';
import { GeneticConditionModel } from '../models/GeneticCondition';
import { FamilyRiskAssessmentModel } from '../models/FamilyRiskAssessment';
import { 
  FamilyMember, 
  CreateFamilyMemberRequest, 
  UpdateFamilyMemberRequest,
  FamilyTreeNode,
  FamilyHistoryStats,
  FamilyRiskAssessment,
  GeneticCondition
} from '../types/familyHistory';

export class FamilyHistoryService {
  
  /**
   * Create a new family member
   */
  static async createFamilyMember(userId: string, data: CreateFamilyMemberRequest): Promise<FamilyMember> {
    try {
      const familyMember = await FamilyHistoryModel.createFamilyMember(userId, data);
      
      // If the member has conditions, calculate risk assessments
      if (data.conditions && data.conditions.length > 0) {
        for (const condition of data.conditions) {
          await FamilyRiskAssessmentModel.calculateFamilyRiskAssessment(userId, condition.name);
        }
      }
      
      return familyMember;
    } catch (error) {
      console.error('Error creating family member:', error);
      throw new Error('Failed to create family member');
    }
  }

  /**
   * Get all family members for a user
   */
  static async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    try {
      return await FamilyHistoryModel.getFamilyMembers(userId);
    } catch (error) {
      console.error('Error fetching family members:', error);
      throw new Error('Failed to fetch family members');
    }
  }

  /**
   * Get a specific family member
   */
  static async getFamilyMemberById(id: string, userId: string): Promise<FamilyMember | null> {
    try {
      return await FamilyHistoryModel.getFamilyMemberById(id, userId);
    } catch (error) {
      console.error('Error fetching family member:', error);
      throw new Error('Failed to fetch family member');
    }
  }

  /**
   * Update a family member
   */
  static async updateFamilyMember(
    id: string, 
    userId: string, 
    data: UpdateFamilyMemberRequest
  ): Promise<FamilyMember | null> {
    try {
      const updatedMember = await FamilyHistoryModel.updateFamilyMember(id, userId, data);
      
      // Recalculate risk assessments if conditions were updated
      if (data.conditions) {
        for (const condition of data.conditions) {
          await FamilyRiskAssessmentModel.calculateFamilyRiskAssessment(userId, condition.name);
        }
      }
      
      return updatedMember;
    } catch (error) {
      console.error('Error updating family member:', error);
      throw new Error('Failed to update family member');
    }
  }

  /**
   * Delete a family member
   */
  static async deleteFamilyMember(id: string, userId: string): Promise<boolean> {
    try {
      const success = await FamilyHistoryModel.deleteFamilyMember(id, userId);
      
      if (success) {
        // Recalculate all risk assessments after deletion
        await this.recalculateAllRiskAssessments(userId);
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting family member:', error);
      throw new Error('Failed to delete family member');
    }
  }

  /**
   * Get family tree structure
   */
  static async getFamilyTree(userId: string): Promise<FamilyTreeNode[]> {
    try {
      return await FamilyHistoryModel.getFamilyTree(userId);
    } catch (error) {
      console.error('Error building family tree:', error);
      throw new Error('Failed to build family tree');
    }
  }

  /**
   * Get family members by generation
   */
  static async getFamilyMembersByGeneration(userId: string, generation: number): Promise<FamilyMember[]> {
    try {
      return await FamilyHistoryModel.getFamilyMembersByGeneration(userId, generation);
    } catch (error) {
      console.error('Error fetching family members by generation:', error);
      throw new Error('Failed to fetch family members by generation');
    }
  }

  /**
   * Get family members with specific condition
   */
  static async getFamilyMembersWithCondition(userId: string, conditionName: string): Promise<FamilyMember[]> {
    try {
      return await FamilyHistoryModel.getFamilyMembersWithCondition(userId, conditionName);
    } catch (error) {
      console.error('Error fetching family members with condition:', error);
      throw new Error('Failed to fetch family members with condition');
    }
  }

  /**
   * Get family history statistics
   */
  static async getFamilyHistoryStats(userId: string): Promise<FamilyHistoryStats> {
    try {
      const stats = await FamilyHistoryModel.getFamilyHistoryStats(userId);
      const riskAssessments = await FamilyRiskAssessmentModel.getFamilyRiskAssessments(userId);
      
      return {
        ...stats,
        riskAssessments
      };
    } catch (error) {
      console.error('Error fetching family history stats:', error);
      throw new Error('Failed to fetch family history statistics');
    }
  }

  /**
   * Get all genetic conditions
   */
  static async getGeneticConditions(): Promise<GeneticCondition[]> {
    try {
      return await GeneticConditionModel.getAllGeneticConditions();
    } catch (error) {
      console.error('Error fetching genetic conditions:', error);
      throw new Error('Failed to fetch genetic conditions');
    }
  }

  /**
   * Get genetic conditions by category
   */
  static async getGeneticConditionsByCategory(category: string): Promise<GeneticCondition[]> {
    try {
      return await GeneticConditionModel.getGeneticConditionsByCategory(category);
    } catch (error) {
      console.error('Error fetching genetic conditions by category:', error);
      throw new Error('Failed to fetch genetic conditions by category');
    }
  }

  /**
   * Search genetic conditions
   */
  static async searchGeneticConditions(searchTerm: string): Promise<GeneticCondition[]> {
    try {
      return await GeneticConditionModel.searchGeneticConditions(searchTerm);
    } catch (error) {
      console.error('Error searching genetic conditions:', error);
      throw new Error('Failed to search genetic conditions');
    }
  }

  /**
   * Get family risk assessments
   */
  static async getFamilyRiskAssessments(userId: string): Promise<FamilyRiskAssessment[]> {
    try {
      return await FamilyRiskAssessmentModel.getFamilyRiskAssessments(userId);
    } catch (error) {
      console.error('Error fetching family risk assessments:', error);
      throw new Error('Failed to fetch family risk assessments');
    }
  }

  /**
   * Get risk assessment for specific condition
   */
  static async getRiskAssessmentForCondition(userId: string, conditionName: string): Promise<FamilyRiskAssessment | null> {
    try {
      return await FamilyRiskAssessmentModel.getRiskAssessmentForCondition(userId, conditionName);
    } catch (error) {
      console.error('Error fetching risk assessment for condition:', error);
      throw new Error('Failed to fetch risk assessment for condition');
    }
  }

  /**
   * Calculate comprehensive risk assessment
   */
  static async calculateComprehensiveRiskAssessment(userId: string): Promise<FamilyRiskAssessment[]> {
    try {
      return await FamilyRiskAssessmentModel.calculateComprehensiveRiskAssessment(userId);
    } catch (error) {
      console.error('Error calculating comprehensive risk assessment:', error);
      throw new Error('Failed to calculate comprehensive risk assessment');
    }
  }

  /**
   * Get high-risk assessments
   */
  static async getHighRiskAssessments(userId: string): Promise<FamilyRiskAssessment[]> {
    try {
      return await FamilyRiskAssessmentModel.getHighRiskAssessments(userId);
    } catch (error) {
      console.error('Error fetching high-risk assessments:', error);
      throw new Error('Failed to fetch high-risk assessments');
    }
  }

  /**
   * Calculate genetic risk score for a specific condition
   */
  static async calculateGeneticRiskScore(userId: string, conditionName: string): Promise<number> {
    try {
      const assessment = await FamilyRiskAssessmentModel.calculateFamilyRiskAssessment(userId, conditionName);
      return assessment.familyRiskScore;
    } catch (error) {
      console.error('Error calculating genetic risk score:', error);
      throw new Error('Failed to calculate genetic risk score');
    }
  }

  /**
   * Get family health summary
   */
  static async getFamilyHealthSummary(userId: string) {
    try {
      const stats = await this.getFamilyHistoryStats(userId);
      const highRiskAssessments = await this.getHighRiskAssessments(userId);
      const commonConditions = await FamilyHistoryModel.getCommonFamilyConditions(userId);

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
    } catch (error) {
      console.error('Error generating family health summary:', error);
      throw new Error('Failed to generate family health summary');
    }
  }

  /**
   * Initialize genetic conditions database
   */
  static async initializeGeneticConditions(): Promise<void> {
    try {
      await GeneticConditionModel.seedCommonGeneticConditions();
    } catch (error) {
      console.error('Error initializing genetic conditions:', error);
      throw new Error('Failed to initialize genetic conditions');
    }
  }

  /**
   * Private helper: Recalculate all risk assessments for a user
   */
  private static async recalculateAllRiskAssessments(userId: string): Promise<void> {
    try {
      const commonConditions = await FamilyHistoryModel.getCommonFamilyConditions(userId);
      
      for (const conditionData of commonConditions) {
        await FamilyRiskAssessmentModel.calculateFamilyRiskAssessment(userId, conditionData.condition);
      }
    } catch (error) {
      console.error('Error recalculating risk assessments:', error);
      // Don't throw here as this is a background operation
    }
  }
}

export default FamilyHistoryService;