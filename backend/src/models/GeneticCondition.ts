import { PrismaClient, GeneticCondition as PrismaGeneticCondition } from '@prisma/client';
import { GeneticCondition, GENETIC_CONDITION_CATEGORIES } from '../types/familyHistory';

const prisma = new PrismaClient();

export class GeneticConditionModel {
  
  /**
   * Create a new genetic condition
   */
  static async createGeneticCondition(data: Omit<GeneticCondition, 'id' | 'createdAt' | 'updatedAt'>): Promise<GeneticCondition> {
    const condition = await prisma.geneticCondition.create({
      data: {
        name: data.name,
        icd10Code: data.icd10Code,
        category: data.category,
        inheritancePattern: data.inheritancePattern,
        prevalence: data.prevalence,
        penetrance: data.penetrance,
        description: data.description,
        riskFactors: data.riskFactors || [],
        symptoms: data.symptoms || [],
        isHereditary: data.isHereditary
      }
    });

    return this.mapPrismaToGeneticCondition(condition);
  }

  /**
   * Get all genetic conditions
   */
  static async getAllGeneticConditions(): Promise<GeneticCondition[]> {
    const conditions = await prisma.geneticCondition.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    return conditions.map(this.mapPrismaToGeneticCondition);
  }

  /**
   * Get genetic conditions by category
   */
  static async getGeneticConditionsByCategory(category: string): Promise<GeneticCondition[]> {
    const conditions = await prisma.geneticCondition.findMany({
      where: { category },
      orderBy: { name: 'asc' }
    });

    return conditions.map(this.mapPrismaToGeneticCondition);
  }

  /**
   * Get hereditary conditions only
   */
  static async getHereditaryConditions(): Promise<GeneticCondition[]> {
    const conditions = await prisma.geneticCondition.findMany({
      where: { isHereditary: true },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    return conditions.map(this.mapPrismaToGeneticCondition);
  }

  /**
   * Search genetic conditions by name
   */
  static async searchGeneticConditions(searchTerm: string): Promise<GeneticCondition[]> {
    const conditions = await prisma.geneticCondition.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { icd10Code: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' }
    });

    return conditions.map(this.mapPrismaToGeneticCondition);
  }

  /**
   * Get genetic condition by name
   */
  static async getGeneticConditionByName(name: string): Promise<GeneticCondition | null> {
    const condition = await prisma.geneticCondition.findUnique({
      where: { name }
    });

    return condition ? this.mapPrismaToGeneticCondition(condition) : null;
  }

  /**
   * Update genetic condition
   */
  static async updateGeneticCondition(
    id: string, 
    data: Partial<Omit<GeneticCondition, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<GeneticCondition | null> {
    try {
      const condition = await prisma.geneticCondition.update({
        where: { id },
        data
      });

      return this.mapPrismaToGeneticCondition(condition);
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete genetic condition
   */
  static async deleteGeneticCondition(id: string): Promise<boolean> {
    try {
      await prisma.geneticCondition.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get conditions by inheritance pattern
   */
  static async getConditionsByInheritancePattern(pattern: string): Promise<GeneticCondition[]> {
    const conditions = await prisma.geneticCondition.findMany({
      where: { inheritancePattern: pattern },
      orderBy: { name: 'asc' }
    });

    return conditions.map(this.mapPrismaToGeneticCondition);
  }

  /**
   * Get high-risk conditions (high prevalence or penetrance)
   */
  static async getHighRiskConditions(
    minPrevalence: number = 0.01, 
    minPenetrance: number = 0.5
  ): Promise<GeneticCondition[]> {
    const conditions = await prisma.geneticCondition.findMany({
      where: {
        OR: [
          { prevalence: { gte: minPrevalence } },
          { penetrance: { gte: minPenetrance } }
        ],
        isHereditary: true
      },
      orderBy: [
        { prevalence: 'desc' },
        { penetrance: 'desc' }
      ]
    });

    return conditions.map(this.mapPrismaToGeneticCondition);
  }

  /**
   * Seed database with common genetic conditions
   */
  static async seedCommonGeneticConditions(): Promise<void> {
    const commonConditions = [
      // Cardiovascular
      {
        name: 'Hypertrophic Cardiomyopathy',
        category: GENETIC_CONDITION_CATEGORIES.CARDIOVASCULAR,
        inheritancePattern: 'autosomal_dominant',
        prevalence: 0.002,
        penetrance: 0.8,
        isHereditary: true,
        description: 'A genetic condition causing thickening of the heart muscle',
        riskFactors: ['Family history', 'Male gender', 'Age'],
        symptoms: ['Chest pain', 'Shortness of breath', 'Fainting', 'Heart palpitations']
      },
      {
        name: 'Familial Hypercholesterolemia',
        category: GENETIC_CONDITION_CATEGORIES.CARDIOVASCULAR,
        inheritancePattern: 'autosomal_dominant',
        prevalence: 0.003,
        penetrance: 0.9,
        isHereditary: true,
        description: 'Genetic disorder causing high cholesterol levels',
        riskFactors: ['Family history', 'Diet', 'Lifestyle'],
        symptoms: ['High cholesterol', 'Early heart disease', 'Xanthomas']
      },
      
      // Cancer
      {
        name: 'BRCA1/BRCA2 Breast Cancer',
        category: GENETIC_CONDITION_CATEGORIES.CANCER,
        inheritancePattern: 'autosomal_dominant',
        prevalence: 0.0025,
        penetrance: 0.7,
        isHereditary: true,
        description: 'Hereditary breast and ovarian cancer syndrome',
        riskFactors: ['Family history', 'Female gender', 'Age'],
        symptoms: ['Breast lumps', 'Breast pain', 'Changes in breast appearance']
      },
      {
        name: 'Lynch Syndrome',
        category: GENETIC_CONDITION_CATEGORIES.CANCER,
        inheritancePattern: 'autosomal_dominant',
        prevalence: 0.003,
        penetrance: 0.8,
        isHereditary: true,
        description: 'Hereditary colorectal cancer syndrome',
        riskFactors: ['Family history', 'Age', 'Diet'],
        symptoms: ['Colorectal polyps', 'Early colorectal cancer', 'Endometrial cancer']
      },
      
      // Neurological
      {
        name: 'Huntington Disease',
        category: GENETIC_CONDITION_CATEGORIES.NEUROLOGICAL,
        inheritancePattern: 'autosomal_dominant',
        prevalence: 0.00005,
        penetrance: 1.0,
        isHereditary: true,
        description: 'Progressive neurodegenerative disorder',
        riskFactors: ['Family history', 'CAG repeat expansion'],
        symptoms: ['Movement disorders', 'Cognitive decline', 'Psychiatric symptoms']
      },
      {
        name: 'Alzheimer Disease (Early-Onset)',
        category: GENETIC_CONDITION_CATEGORIES.NEUROLOGICAL,
        inheritancePattern: 'autosomal_dominant',
        prevalence: 0.0001,
        penetrance: 0.9,
        isHereditary: true,
        description: 'Early-onset familial Alzheimer disease',
        riskFactors: ['Family history', 'Age', 'APOE genotype'],
        symptoms: ['Memory loss', 'Cognitive decline', 'Behavioral changes']
      },
      
      // Metabolic
      {
        name: 'Type 1 Diabetes',
        category: GENETIC_CONDITION_CATEGORIES.METABOLIC,
        inheritancePattern: 'multifactorial',
        prevalence: 0.005,
        penetrance: 0.3,
        isHereditary: true,
        description: 'Autoimmune destruction of pancreatic beta cells',
        riskFactors: ['Family history', 'HLA genotype', 'Environmental factors'],
        symptoms: ['High blood sugar', 'Frequent urination', 'Excessive thirst', 'Weight loss']
      },
      {
        name: 'Hemochromatosis',
        category: GENETIC_CONDITION_CATEGORIES.METABOLIC,
        inheritancePattern: 'autosomal_recessive',
        prevalence: 0.005,
        penetrance: 0.4,
        isHereditary: true,
        description: 'Iron overload disorder',
        riskFactors: ['Family history', 'Male gender', 'Age'],
        symptoms: ['Fatigue', 'Joint pain', 'Skin darkening', 'Liver problems']
      }
    ];

    for (const condition of commonConditions) {
      const existing = await prisma.geneticCondition.findUnique({
        where: { name: condition.name }
      });

      if (!existing) {
        await prisma.geneticCondition.create({
          data: condition
        });
      }
    }
  }

  /**
   * Helper: Map Prisma model to TypeScript interface
   */
  private static mapPrismaToGeneticCondition(prismaCondition: PrismaGeneticCondition): GeneticCondition {
    return {
      id: prismaCondition.id,
      name: prismaCondition.name,
      icd10Code: prismaCondition.icd10Code || undefined,
      category: prismaCondition.category,
      inheritancePattern: prismaCondition.inheritancePattern as any,
      prevalence: prismaCondition.prevalence || undefined,
      penetrance: prismaCondition.penetrance || undefined,
      description: prismaCondition.description || undefined,
      riskFactors: prismaCondition.riskFactors as string[] || [],
      symptoms: prismaCondition.symptoms as string[] || [],
      isHereditary: prismaCondition.isHereditary,
      createdAt: prismaCondition.createdAt,
      updatedAt: prismaCondition.updatedAt
    };
  }
}

export default GeneticConditionModel;