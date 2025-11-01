import { PrismaClient, FamilyRiskAssessment as PrismaFamilyRiskAssessment } from '@prisma/client';
import { FamilyRiskAssessment, FamilyMember, MedicalCondition } from '../types/familyHistory';
import { FamilyHistoryModel } from './FamilyHistory';
import { GeneticConditionModel } from './GeneticCondition';

const prisma = new PrismaClient();

export class FamilyRiskAssessmentModel {
  
  /**
   * Calculate and create risk assessment for a user
   */
  static async calculateFamilyRiskAssessment(userId: string, conditionName: string): Promise<FamilyRiskAssessment> {
    // Get family members with the condition
    const affectedMembers = await FamilyHistoryModel.getFamilyMembersWithCondition(userId, conditionName);
    const allFamilyMembers = await FamilyHistoryModel.getFamilyMembers(userId);
    
    // Get genetic condition information
    const geneticCondition = await GeneticConditionModel.getGeneticConditionByName(conditionName);
    
    // Calculate risk score
    const riskScore = this.calculateRiskScore(affectedMembers, allFamilyMembers, geneticCondition);
    const riskLevel = this.determineRiskLevel(riskScore);
    const recommendations = this.generateRecommendations(conditionName, riskLevel, geneticCondition);

    // Create or update risk assessment
    const existingAssessment = await prisma.familyRiskAssessment.findFirst({
      where: { userId, conditionName }
    });

    let assessment: PrismaFamilyRiskAssessment;

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
    } else {
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

  /**
   * Get all risk assessments for a user
   */
  static async getFamilyRiskAssessments(userId: string): Promise<FamilyRiskAssessment[]> {
    const assessments = await prisma.familyRiskAssessment.findMany({
      where: { userId },
      orderBy: [
        { familyRiskScore: 'desc' },
        { conditionName: 'asc' }
      ]
    });

    return assessments.map(this.mapPrismaToFamilyRiskAssessment);
  }

  /**
   * Get risk assessment for specific condition
   */
  static async getRiskAssessmentForCondition(userId: string, conditionName: string): Promise<FamilyRiskAssessment | null> {
    const assessment = await prisma.familyRiskAssessment.findFirst({
      where: { userId, conditionName }
    });

    return assessment ? this.mapPrismaToFamilyRiskAssessment(assessment) : null;
  }

  /**
   * Get high-risk assessments
   */
  static async getHighRiskAssessments(userId: string): Promise<FamilyRiskAssessment[]> {
    const assessments = await prisma.familyRiskAssessment.findMany({
      where: { 
        userId,
        riskLevel: { in: ['high', 'very_high'] }
      },
      orderBy: { familyRiskScore: 'desc' }
    });

    return assessments.map(this.mapPrismaToFamilyRiskAssessment);
  }

  /**
   * Calculate comprehensive family risk for all conditions
   */
  static async calculateComprehensiveRiskAssessment(userId: string): Promise<FamilyRiskAssessment[]> {
    // Get all conditions present in family
    const commonConditions = await FamilyHistoryModel.getCommonFamilyConditions(userId);
    const assessments: FamilyRiskAssessment[] = [];

    // Calculate risk for each condition
    for (const conditionData of commonConditions) {
      const assessment = await this.calculateFamilyRiskAssessment(userId, conditionData.condition);
      assessments.push(assessment);
    }

    // Also check for common hereditary conditions even if not present in family
    const hereditaryConditions = await GeneticConditionModel.getHereditaryConditions();
    
    for (const condition of hereditaryConditions) {
      const existingAssessment = assessments.find(a => a.conditionName === condition.name);
      if (!existingAssessment) {
        const assessment = await this.calculateFamilyRiskAssessment(userId, condition.name);
        if (assessment.familyRiskScore > 0.1) { // Only include if there's some risk
          assessments.push(assessment);
        }
      }
    }

    return assessments.sort((a, b) => b.familyRiskScore - a.familyRiskScore);
  }

  /**
   * Delete risk assessment
   */
  static async deleteRiskAssessment(id: string, userId: string): Promise<boolean> {
    const result = await prisma.familyRiskAssessment.deleteMany({
      where: { id, userId }
    });

    return result.count > 0;
  }

  /**
   * Calculate risk score based on family history
   */
  private static calculateRiskScore(
    affectedMembers: FamilyMember[], 
    allFamilyMembers: FamilyMember[], 
    geneticCondition: any
  ): number {
    if (affectedMembers.length === 0) {
      return 0;
    }

    let riskScore = 0;
    const totalMembers = allFamilyMembers.length;

    // Base risk from affected family members
    const affectedRatio = affectedMembers.length / Math.max(totalMembers, 1);
    riskScore += affectedRatio * 0.4; // 40% weight for family prevalence

    // Weight by relationship closeness
    let relationshipWeight = 0;
    affectedMembers.forEach(member => {
      switch (member.generation) {
        case -1: // Parents
          relationshipWeight += 0.5;
          break;
        case 0: // Siblings
          relationshipWeight += 0.3;
          break;
        case 1: // Children
          relationshipWeight += 0.2;
          break;
        case -2: // Grandparents
          relationshipWeight += 0.2;
          break;
        default:
          relationshipWeight += 0.1;
      }
    });

    riskScore += Math.min(relationshipWeight, 1.0) * 0.4; // 40% weight for relationship closeness

    // Genetic condition factors
    if (geneticCondition) {
      if (geneticCondition.penetrance) {
        riskScore *= geneticCondition.penetrance;
      }
      
      if (geneticCondition.inheritancePattern === 'autosomal_dominant') {
        riskScore *= 1.2; // Higher risk for dominant conditions
      } else if (geneticCondition.inheritancePattern === 'autosomal_recessive') {
        riskScore *= 0.8; // Lower risk for recessive conditions
      }
    }

    // Age factor for affected members
    const earlyOnsetMembers = affectedMembers.filter(member => {
      const conditions = member.conditions || [];
      return conditions.some((condition: MedicalCondition) => 
        condition.diagnosedYear && member.birthYear && 
        (condition.diagnosedYear - member.birthYear) < 50
      );
    });

    if (earlyOnsetMembers.length > 0) {
      riskScore *= 1.3; // Higher risk for early onset
    }

    return Math.min(riskScore, 1.0); // Cap at 1.0
  }

  /**
   * Determine risk level from score
   */
  private static determineRiskLevel(riskScore: number): 'low' | 'moderate' | 'high' | 'very_high' {
    if (riskScore >= 0.7) return 'very_high';
    if (riskScore >= 0.4) return 'high';
    if (riskScore >= 0.2) return 'moderate';
    return 'low';
  }

  /**
   * Generate recommendations based on risk level and condition
   */
  private static generateRecommendations(
    conditionName: string, 
    riskLevel: string, 
    geneticCondition: any
  ): string[] {
    const recommendations: string[] = [];

    // General recommendations based on risk level
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

    // Condition-specific recommendations
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

  /**
   * Helper: Map Prisma model to TypeScript interface
   */
  private static mapPrismaToFamilyRiskAssessment(prismaAssessment: PrismaFamilyRiskAssessment): FamilyRiskAssessment {
    return {
      id: prismaAssessment.id,
      userId: prismaAssessment.userId,
      conditionName: prismaAssessment.conditionName,
      familyRiskScore: prismaAssessment.familyRiskScore,
      affectedRelatives: prismaAssessment.affectedRelatives,
      riskLevel: prismaAssessment.riskLevel as 'low' | 'moderate' | 'high' | 'very_high',
      recommendations: prismaAssessment.recommendations as string[] || [],
      calculatedAt: prismaAssessment.calculatedAt
    };
  }
}

export default FamilyRiskAssessmentModel;