import { PrismaClient } from '@prisma/client';
import { RecommendationManager } from '../models/Recommendation';
import { RecommendationEngine } from '../utils/recommendationEngine';
import { GenomicsService } from './genomicsService';
import { 
  RecommendationInput,
  PersonalizedRecommendations,
  RecommendationEffectiveness,
  RecommendationGenerationConfig
} from '../types/recommendations';

const prisma = new PrismaClient();

export class RecommendationService {
  /**
   * Generate new personalized recommendations for a user
   */
  static async generatePersonalizedRecommendations(
    userId: string,
    config?: Partial<RecommendationGenerationConfig>
  ): Promise<PersonalizedRecommendations> {
    try {
      // Gather user data from various sources
      const input = await this.gatherUserData(userId);
      
      // Use default config if not provided
      const fullConfig: RecommendationGenerationConfig = {
        includeGenomics: true,
        includeLifestyle: true,
        includeFamilyHistory: true,
        includeMedicalHistory: true,
        priorityThreshold: 'medium',
        maxRecommendationsPerCategory: 5,
        ...config,
      };
      
      // Generate recommendations using the engine
      const recommendations = await RecommendationEngine.generatePersonalizedRecommendations(
        input,
        fullConfig
      );
      
      // Store recommendations in database
      const result = await RecommendationManager.createRecommendations(userId, recommendations);
      
      return result;
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      throw error;
    }
  }

  /**
   * Get latest valid recommendations for a user
   */
  static async getLatestRecommendations(userId: string): Promise<PersonalizedRecommendations | null> {
    return await RecommendationManager.getLatestRecommendations(userId);
  }

  /**
   * Get all recommendations history for a user
   */
  static async getRecommendationsHistory(
    userId: string,
    limit: number = 10
  ): Promise<PersonalizedRecommendations[]> {
    return await RecommendationManager.getUserRecommendations(userId, limit);
  }

  /**
   * Track recommendation implementation and effectiveness
   */
  static async trackRecommendationEffectiveness(
    effectiveness: Omit<RecommendationEffectiveness, 'lastUpdated'>
  ): Promise<RecommendationEffectiveness> {
    return await RecommendationManager.trackEffectiveness(effectiveness);
  }

  /**
   * Get effectiveness data for user's recommendations
   */
  static async getEffectivenessData(
    userId: string,
    category?: string
  ): Promise<RecommendationEffectiveness[]> {
    return await RecommendationManager.getEffectivenessData(userId, category);
  }

  /**
   * Get recommendation statistics for a user
   */
  static async getRecommendationStats(userId: string) {
    return await RecommendationManager.getRecommendationStats(userId);
  }

  /**
   * Update recommendation implementation status
   */
  static async updateImplementationStatus(
    recommendationId: string,
    userId: string,
    category: string,
    implemented: boolean,
    implementationDate?: Date
  ): Promise<RecommendationEffectiveness> {
    return await RecommendationManager.trackEffectiveness({
      recommendationId,
      userId,
      category,
      implemented,
      implementationDate,
    });
  }

  /**
   * Submit user feedback for recommendations
   */
  static async submitUserFeedback(
    recommendationId: string,
    userId: string,
    category: string,
    feedback: {
      rating: number;
      comments?: string;
    }
  ): Promise<RecommendationEffectiveness> {
    return await RecommendationManager.trackEffectiveness({
      recommendationId,
      userId,
      category,
      implemented: true, // Assume implemented if providing feedback
      userFeedback: feedback,
    });
  }

  /**
   * Update adherence score for a recommendation
   */
  static async updateAdherenceScore(
    recommendationId: string,
    userId: string,
    category: string,
    adherenceScore: number
  ): Promise<RecommendationEffectiveness> {
    return await RecommendationManager.trackEffectiveness({
      recommendationId,
      userId,
      category,
      implemented: true,
      adherenceScore,
    });
  }

  /**
   * Record measured outcome for a recommendation
   */
  static async recordMeasuredOutcome(
    recommendationId: string,
    userId: string,
    category: string,
    outcome: {
      metric: string;
      beforeValue: number;
      afterValue: number;
      improvementPercentage: number;
    }
  ): Promise<RecommendationEffectiveness> {
    return await RecommendationManager.trackEffectiveness({
      recommendationId,
      userId,
      category,
      implemented: true,
      measuredOutcome: outcome,
    });
  }

  /**
   * Get lifestyle improvement suggestions based on current data
   */
  static async getLifestyleImprovementSuggestions(userId: string) {
    try {
      // Get user's current health data
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get recent vital signs
      const recentVitalSigns = await prisma.vitalSign.findMany({
        where: {
          healthRecord: {
            userId: userId,
          },
        },
        orderBy: { measuredAt: 'desc' },
        take: 5,
      });

      // Get current medications
      const medications = await prisma.medication.findMany({
        where: { userId, isActive: true },
      });

      // Generate targeted lifestyle suggestions
      const suggestions = this.generateLifestyleSuggestions(
        user,
        recentVitalSigns,
        medications
      );

      return suggestions;
    } catch (error) {
      console.error('Error getting lifestyle improvement suggestions:', error);
      throw error;
    }
  }

  /**
   * Get personalized screening schedule
   */
  static async getPersonalizedScreeningSchedule(userId: string) {
    try {
      // Get user profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get family history
      const familyHistory = await prisma.familyHistory.findMany({
        where: { userId },
      });

      // Get genomic data if available
      const genomicData = await prisma.genomicData.findFirst({
        where: { userId },
      });

      // Calculate age
      const age = this.calculateAge(user.birthDate);

      // Generate screening schedule
      const schedule = this.generateScreeningSchedule(
        age,
        user.gender,
        familyHistory,
        genomicData
      );

      return schedule;
    } catch (error) {
      console.error('Error getting personalized screening schedule:', error);
      throw error;
    }
  }

  // Private helper methods

  private static async gatherUserData(userId: string): Promise<RecommendationInput> {
    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get health data
    const healthData = await this.getUserHealthData(userId);

    // Get genomic data
    let genomicData = null;
    try {
      genomicData = await GenomicsService.getGenomicDataByUserId(userId);
    } catch (error) {
      console.log('No genomic data available for user');
    }

    // Get family history
    const familyHistory = await prisma.familyHistory.findMany({
      where: { userId },
    });

    // Get medical history
    const medicalHistory = await prisma.medicalRecord.findMany({
      where: { userId },
      include: { testResults: true, prescriptions: true },
      orderBy: { visitDate: 'desc' },
      take: 10,
    });

    // Get lifestyle data from user profile
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

  private static async getUserHealthData(userId: string) {
    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get recent vital signs
    const recentVitalSigns = await prisma.vitalSign.findMany({
      where: {
        healthRecord: {
          userId: userId,
        },
      },
      orderBy: { measuredAt: 'desc' },
      take: 10,
    });

    // Process vital signs
    const vitalSignsMap = this.processVitalSigns(recentVitalSigns);

    // Calculate age
    const age = this.calculateAge(user.birthDate);

    // Calculate BMI
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

  private static processVitalSigns(vitalSigns: any[]): Record<string, number> {
    const processed: Record<string, number[]> = {};
    
    vitalSigns.forEach(vs => {
      if (!processed[vs.type]) {
        processed[vs.type] = [];
      }
      
      if (vs.type === 'blood_pressure' && typeof vs.value === 'object') {
        processed['systolicBP'] = processed['systolicBP'] || [];
        processed['diastolicBP'] = processed['diastolicBP'] || [];
        processed['systolicBP'].push(vs.value.systolic);
        processed['diastolicBP'].push(vs.value.diastolic);
      } else if (typeof vs.value === 'number') {
        processed[vs.type].push(vs.value);
      }
    });
    
    // Calculate averages
    const averages: Record<string, number> = {};
    Object.entries(processed).forEach(([type, values]) => {
      if (values.length > 0) {
        averages[type] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });
    
    return averages;
  }

  private static calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private static generateLifestyleSuggestions(
    user: any,
    vitalSigns: any[],
    medications: any[]
  ) {
    const suggestions = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[],
    };

    // BMI-based suggestions
    const bmi = user.height && user.weight ? 
      user.weight / Math.pow(user.height / 100, 2) : null;

    if (bmi && bmi > 25) {
      suggestions.immediate.push('Focus on portion control and increase daily physical activity');
      suggestions.shortTerm.push('Aim for 1-2 pounds of weight loss per week through diet and exercise');
    }

    // Blood pressure-based suggestions
    const avgSystolic = this.getAverageVitalSign(vitalSigns, 'systolicBP');
    if (avgSystolic && avgSystolic > 130) {
      suggestions.immediate.push('Reduce sodium intake and increase potassium-rich foods');
      suggestions.shortTerm.push('Implement stress reduction techniques like meditation or yoga');
    }

    // Lifestyle habits suggestions
    const lifestyle = user.lifestyleHabits as any;
    if (lifestyle?.smoking) {
      suggestions.immediate.push('Quit smoking - this is the most important step for your health');
    }

    if (lifestyle?.exerciseFrequency < 3) {
      suggestions.shortTerm.push('Gradually increase exercise to at least 150 minutes per week');
    }

    return suggestions;
  }

  private static generateScreeningSchedule(
    age: number,
    gender: string,
    familyHistory: any[],
    genomicData: any
  ) {
    const schedule = [];
    const currentDate = new Date();

    // Age-based screening
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

    // Family history-based screening
    const hasCardiovascularHistory = familyHistory.some(fh => 
      (fh.conditions as any[])?.some(c => c.category === 'cardiovascular')
    );

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

  private static getAverageVitalSign(vitalSigns: any[], type: string): number | null {
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