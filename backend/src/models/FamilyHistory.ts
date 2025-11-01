import { PrismaClient, FamilyHistory as PrismaFamilyHistory } from '@prisma/client';
import { 
  FamilyMember, 
  CreateFamilyMemberRequest, 
  UpdateFamilyMemberRequest,
  FamilyTreeNode,
  MedicalCondition,
  FAMILY_RELATIONSHIPS
} from '../types/familyHistory';

const prisma = new PrismaClient();

export class FamilyHistoryModel {
  
  /**
   * Create a new family member
   */
  static async createFamilyMember(userId: string, data: CreateFamilyMemberRequest): Promise<FamilyMember> {
    // Determine generation based on relationship if not provided
    const generation = data.generation ?? this.getGenerationFromRelationship(data.relationship);
    
    // Auto-assign position within generation if not provided
    const position = data.position ?? await this.getNextPositionInGeneration(userId, generation);
    
    const familyMember = await prisma.familyHistory.create({
      data: {
        userId,
        relationship: data.relationship,
        name: data.name,
        gender: data.gender,
        birthYear: data.birthYear,
        deathYear: data.deathYear,
        isAlive: data.isAlive ?? true,
        generation,
        position,
        parentId: data.parentId,
        conditions: data.conditions || [],
        causeOfDeath: data.causeOfDeath,
        notes: data.notes
      }
    });

    return this.mapPrismaToFamilyMember(familyMember);
  }

  /**
   * Get all family members for a user
   */
  static async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    const familyMembers = await prisma.familyHistory.findMany({
      where: { userId },
      orderBy: [
        { generation: 'asc' },
        { position: 'asc' }
      ]
    });

    return familyMembers.map(this.mapPrismaToFamilyMember);
  }

  /**
   * Get a specific family member by ID
   */
  static async getFamilyMemberById(id: string, userId: string): Promise<FamilyMember | null> {
    const familyMember = await prisma.familyHistory.findFirst({
      where: { id, userId }
    });

    return familyMember ? this.mapPrismaToFamilyMember(familyMember) : null;
  }

  /**
   * Update a family member
   */
  static async updateFamilyMember(
    id: string, 
    userId: string, 
    data: UpdateFamilyMemberRequest
  ): Promise<FamilyMember | null> {
    const updateData: any = { ...data };
    
    // Update generation if relationship changed
    if (data.relationship) {
      updateData.generation = this.getGenerationFromRelationship(data.relationship);
    }

    const familyMember = await prisma.familyHistory.updateMany({
      where: { id, userId },
      data: updateData
    });

    if (familyMember.count === 0) {
      return null;
    }

    return this.getFamilyMemberById(id, userId);
  }

  /**
   * Delete a family member
   */
  static async deleteFamilyMember(id: string, userId: string): Promise<boolean> {
    const result = await prisma.familyHistory.deleteMany({
      where: { id, userId }
    });

    return result.count > 0;
  }

  /**
   * Build family tree structure
   */
  static async getFamilyTree(userId: string): Promise<FamilyTreeNode[]> {
    const familyMembers = await this.getFamilyMembers(userId);
    
    // Create a map for quick lookup
    const memberMap = new Map<string, FamilyTreeNode>();
    
    // Convert to tree nodes
    familyMembers.forEach(member => {
      memberMap.set(member.id, {
        id: member.id,
        name: member.name,
        gender: member.gender,
        relationship: member.relationship,
        generation: member.generation,
        position: member.position,
        isAlive: member.isAlive,
        birthYear: member.birthYear,
        deathYear: member.deathYear,
        conditions: member.conditions || [],
        children: []
      });
    });

    // Build parent-child relationships
    const rootNodes: FamilyTreeNode[] = [];
    
    familyMembers.forEach(member => {
      const node = memberMap.get(member.id)!;
      
      if (member.parentId) {
        const parent = memberMap.get(member.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    // Sort by generation and position
    return rootNodes.sort((a, b) => {
      if (a.generation !== b.generation) {
        return a.generation - b.generation;
      }
      return a.position - b.position;
    });
  }

  /**
   * Get family members by generation
   */
  static async getFamilyMembersByGeneration(userId: string, generation: number): Promise<FamilyMember[]> {
    const familyMembers = await prisma.familyHistory.findMany({
      where: { userId, generation },
      orderBy: { position: 'asc' }
    });

    return familyMembers.map(this.mapPrismaToFamilyMember);
  }

  /**
   * Get family members with specific condition
   */
  static async getFamilyMembersWithCondition(userId: string, conditionName: string): Promise<FamilyMember[]> {
    const familyMembers = await prisma.familyHistory.findMany({
      where: {
        userId,
        conditions: {
          path: '$[*].name',
          array_contains: conditionName
        }
      }
    });

    return familyMembers.map(this.mapPrismaToFamilyMember);
  }

  /**
   * Get common conditions in family
   */
  static async getCommonFamilyConditions(userId: string): Promise<Array<{ condition: string; count: number; members: string[] }>> {
    const familyMembers = await this.getFamilyMembers(userId);
    const conditionMap = new Map<string, { count: number; members: string[] }>();

    familyMembers.forEach(member => {
      const conditions = member.conditions || [];
      conditions.forEach((condition: MedicalCondition) => {
        if (!conditionMap.has(condition.name)) {
          conditionMap.set(condition.name, { count: 0, members: [] });
        }
        const entry = conditionMap.get(condition.name)!;
        entry.count++;
        entry.members.push(member.name || member.relationship);
      });
    });

    return Array.from(conditionMap.entries())
      .map(([condition, data]) => ({
        condition,
        count: data.count,
        members: data.members
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate family history statistics
   */
  static async getFamilyHistoryStats(userId: string) {
    const familyMembers = await this.getFamilyMembers(userId);
    const livingMembers = familyMembers.filter(m => m.isAlive).length;
    const deceasedMembers = familyMembers.filter(m => !m.isAlive).length;
    
    const generations = new Set(familyMembers.map(m => m.generation));
    const commonConditions = await this.getCommonFamilyConditions(userId);

    return {
      totalMembers: familyMembers.length,
      livingMembers,
      deceasedMembers,
      generationsTracked: generations.size,
      commonConditions: commonConditions.map(c => ({
        condition: c.condition,
        count: c.count,
        percentage: (c.count / familyMembers.length) * 100
      }))
    };
  }

  /**
   * Helper: Determine generation from relationship
   */
  private static getGenerationFromRelationship(relationship: string): number {
    const relationshipGenerationMap: Record<string, number> = {
      // Grandparents generation (-2)
      [FAMILY_RELATIONSHIPS.PATERNAL_GRANDFATHER]: -2,
      [FAMILY_RELATIONSHIPS.PATERNAL_GRANDMOTHER]: -2,
      [FAMILY_RELATIONSHIPS.MATERNAL_GRANDFATHER]: -2,
      [FAMILY_RELATIONSHIPS.MATERNAL_GRANDMOTHER]: -2,
      
      // Parents generation (-1)
      [FAMILY_RELATIONSHIPS.FATHER]: -1,
      [FAMILY_RELATIONSHIPS.MOTHER]: -1,
      [FAMILY_RELATIONSHIPS.STEPFATHER]: -1,
      [FAMILY_RELATIONSHIPS.STEPMOTHER]: -1,
      [FAMILY_RELATIONSHIPS.UNCLE]: -1,
      [FAMILY_RELATIONSHIPS.AUNT]: -1,
      
      // Same generation (0)
      [FAMILY_RELATIONSHIPS.BROTHER]: 0,
      [FAMILY_RELATIONSHIPS.SISTER]: 0,
      [FAMILY_RELATIONSHIPS.HALF_BROTHER]: 0,
      [FAMILY_RELATIONSHIPS.HALF_SISTER]: 0,
      [FAMILY_RELATIONSHIPS.STEPBROTHER]: 0,
      [FAMILY_RELATIONSHIPS.STEPSISTER]: 0,
      [FAMILY_RELATIONSHIPS.COUSIN]: 0,
      
      // Children generation (+1)
      [FAMILY_RELATIONSHIPS.SON]: 1,
      [FAMILY_RELATIONSHIPS.DAUGHTER]: 1,
      [FAMILY_RELATIONSHIPS.STEPSON]: 1,
      [FAMILY_RELATIONSHIPS.STEPDAUGHTER]: 1,
      [FAMILY_RELATIONSHIPS.NEPHEW]: 1,
      [FAMILY_RELATIONSHIPS.NIECE]: 1,
      
      // Grandchildren generation (+2)
      [FAMILY_RELATIONSHIPS.GRANDSON]: 2,
      [FAMILY_RELATIONSHIPS.GRANDDAUGHTER]: 2
    };

    return relationshipGenerationMap[relationship] || 0;
  }

  /**
   * Helper: Get next position in generation
   */
  private static async getNextPositionInGeneration(userId: string, generation: number): Promise<number> {
    const maxPosition = await prisma.familyHistory.findFirst({
      where: { userId, generation },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    return (maxPosition?.position || 0) + 1;
  }

  /**
   * Helper: Map Prisma model to TypeScript interface
   */
  private static mapPrismaToFamilyMember(prismaFamilyHistory: PrismaFamilyHistory): FamilyMember {
    return {
      id: prismaFamilyHistory.id,
      userId: prismaFamilyHistory.userId,
      relationship: prismaFamilyHistory.relationship,
      name: prismaFamilyHistory.name || undefined,
      gender: prismaFamilyHistory.gender as 'male' | 'female' | 'unknown' | undefined,
      birthYear: prismaFamilyHistory.birthYear || undefined,
      deathYear: prismaFamilyHistory.deathYear || undefined,
      isAlive: prismaFamilyHistory.isAlive,
      generation: prismaFamilyHistory.generation,
      position: prismaFamilyHistory.position,
      parentId: prismaFamilyHistory.parentId || undefined,
      conditions: prismaFamilyHistory.conditions as MedicalCondition[] || [],
      causeOfDeath: prismaFamilyHistory.causeOfDeath || undefined,
      notes: prismaFamilyHistory.notes || undefined,
      createdAt: prismaFamilyHistory.createdAt,
      updatedAt: prismaFamilyHistory.updatedAt
    };
  }
}

export default FamilyHistoryModel;