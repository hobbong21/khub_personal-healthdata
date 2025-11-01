import { RiskCalculationInput, DiseaseRiskFactors, SupportedDisease } from '../types/genomics';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RiskCalculationEngine {
  // Disease-specific risk calculation algorithms
  
  static async calculateCardiovascularRisk(input: RiskCalculationInput): Promise<DiseaseRiskFactors> {
    const factors: DiseaseRiskFactors = {
      geneticRisk: 0.5,
      lifestyleRisk: 0.5,
      familyHistoryRisk: 0.5,
      environmentalRisk: 0.5,
      ageRisk: 0.5,
      genderRisk: 0.5,
    };

    // Genetic risk factors
    if (input.genomicData?.diseaseRisks) {
      const cvdRisk = input.genomicData.diseaseRisks.find(r => r.diseaseType === 'cardiovascular_disease');
      if (cvdRisk) {
        factors.geneticRisk = Math.min(cvdRisk.riskScore / 100, 1);
      }
    }

    // Lifestyle risk factors
    if (input.userProfile?.lifestyle) {
      const lifestyle = input.userProfile.lifestyle;
      let lifestyleScore = 0.3; // Base score

      if (lifestyle.smoking) lifestyleScore += 0.3;
      if (lifestyle.alcohol === 'heavy') lifestyleScore += 0.15;
      if (lifestyle.exerciseFrequency < 2) lifestyleScore += 0.2;
      if (lifestyle.dietType === 'high_fat' || lifestyle.dietType === 'high_sodium') lifestyleScore += 0.15;

      factors.lifestyleRisk = Math.min(lifestyleScore, 1);
    }

    // Family history risk
    if (input.familyHistory) {
      let familyScore = 0.3;
      const cvdRelatives = input.familyHistory.filter(relative => 
        relative.conditions?.some((condition: string) => 
          condition.toLowerCase().includes('heart') || 
          condition.toLowerCase().includes('cardiovascular') ||
          condition.toLowerCase().includes('stroke')
        )
      );

      cvdRelatives.forEach(relative => {
        switch (relative.relationship) {
          case 'parent':
          case 'sibling':
            familyScore += 0.2;
            break;
          case 'grandparent':
            familyScore += 0.1;
            break;
          default:
            familyScore += 0.05;
        }
      });

      factors.familyHistoryRisk = Math.min(familyScore, 1);
    }

    // Age and gender risk
    if (input.userProfile) {
      const { age, gender } = input.userProfile;
      
      // Age risk
      if (age > 65) factors.ageRisk = 0.8;
      else if (age > 55) factors.ageRisk = 0.6;
      else if (age > 45) factors.ageRisk = 0.4;
      else factors.ageRisk = 0.2;

      // Gender risk (males have higher risk)
      factors.genderRisk = gender === 'male' ? 0.6 : 0.4;
    }

    return factors;
  }

  static async calculateDiabetesRisk(input: RiskCalculationInput): Promise<DiseaseRiskFactors> {
    const factors: DiseaseRiskFactors = {
      geneticRisk: 0.5,
      lifestyleRisk: 0.5,
      familyHistoryRisk: 0.5,
      environmentalRisk: 0.5,
      ageRisk: 0.5,
      genderRisk: 0.5,
    };

    // Genetic risk factors (TCF7L2, PPARG, etc.)
    if (input.genomicData?.diseaseRisks) {
      const diabetesRisk = input.genomicData.diseaseRisks.find(r => r.diseaseType === 'type2_diabetes');
      if (diabetesRisk) {
        factors.geneticRisk = Math.min(diabetesRisk.riskScore / 100, 1);
      }
    }

    // Lifestyle risk factors
    if (input.userProfile?.lifestyle) {
      const lifestyle = input.userProfile.lifestyle;
      let lifestyleScore = 0.3;

      if (lifestyle.exerciseFrequency < 3) lifestyleScore += 0.25;
      if (lifestyle.dietType === 'high_sugar' || lifestyle.dietType === 'processed') lifestyleScore += 0.2;
      if (lifestyle.alcohol === 'heavy') lifestyleScore += 0.1;
      
      // BMI factor (if available)
      if (input.userProfile.bmi && input.userProfile.bmi > 30) lifestyleScore += 0.2;
      else if (input.userProfile.bmi && input.userProfile.bmi > 25) lifestyleScore += 0.1;

      factors.lifestyleRisk = Math.min(lifestyleScore, 1);
    }

    // Family history
    if (input.familyHistory) {
      let familyScore = 0.3;
      const diabetesRelatives = input.familyHistory.filter(relative => 
        relative.conditions?.some((condition: string) => 
          condition.toLowerCase().includes('diabetes')
        )
      );

      diabetesRelatives.forEach(relative => {
        switch (relative.relationship) {
          case 'parent':
          case 'sibling':
            familyScore += 0.25;
            break;
          case 'grandparent':
            familyScore += 0.15;
            break;
          default:
            familyScore += 0.08;
        }
      });

      factors.familyHistoryRisk = Math.min(familyScore, 1);
    }

    // Age risk
    if (input.userProfile?.age) {
      const age = input.userProfile.age;
      if (age > 65) factors.ageRisk = 0.7;
      else if (age > 45) factors.ageRisk = 0.5;
      else factors.ageRisk = 0.3;
    }

    // Gender (slightly higher in males)
    factors.genderRisk = input.userProfile?.gender === 'male' ? 0.55 : 0.45;

    return factors;
  }

  static async calculateAlzheimerRisk(input: RiskCalculationInput): Promise<DiseaseRiskFactors> {
    const factors: DiseaseRiskFactors = {
      geneticRisk: 0.5,
      lifestyleRisk: 0.5,
      familyHistoryRisk: 0.5,
      environmentalRisk: 0.5,
      ageRisk: 0.5,
      genderRisk: 0.5,
    };

    // APOE genetic risk
    if (input.genomicData?.diseaseRisks) {
      const alzheimerRisk = input.genomicData.diseaseRisks.find(r => r.diseaseType === 'alzheimer_disease');
      if (alzheimerRisk) {
        factors.geneticRisk = Math.min(alzheimerRisk.riskScore / 100, 1);
      }
    }

    // Lifestyle factors
    if (input.userProfile?.lifestyle) {
      const lifestyle = input.userProfile.lifestyle;
      let lifestyleScore = 0.4;

      if (lifestyle.exerciseFrequency < 2) lifestyleScore += 0.15;
      if (lifestyle.smoking) lifestyleScore += 0.1;
      if (lifestyle.alcohol === 'heavy') lifestyleScore += 0.1;
      
      // Cognitive activities (if tracked)
      if (lifestyle.cognitiveActivities === 'low') lifestyleScore += 0.1;

      factors.lifestyleRisk = Math.min(lifestyleScore, 1);
    }

    // Family history
    if (input.familyHistory) {
      let familyScore = 0.3;
      const alzheimerRelatives = input.familyHistory.filter(relative => 
        relative.conditions?.some((condition: string) => 
          condition.toLowerCase().includes('alzheimer') ||
          condition.toLowerCase().includes('dementia')
        )
      );

      alzheimerRelatives.forEach(relative => {
        switch (relative.relationship) {
          case 'parent':
          case 'sibling':
            familyScore += 0.3;
            break;
          case 'grandparent':
            familyScore += 0.15;
            break;
          default:
            familyScore += 0.08;
        }
      });

      factors.familyHistoryRisk = Math.min(familyScore, 1);
    }

    // Age is the strongest risk factor
    if (input.userProfile?.age) {
      const age = input.userProfile.age;
      if (age > 85) factors.ageRisk = 0.9;
      else if (age > 75) factors.ageRisk = 0.7;
      else if (age > 65) factors.ageRisk = 0.5;
      else if (age > 55) factors.ageRisk = 0.3;
      else factors.ageRisk = 0.1;
    }

    // Gender (slightly higher in females)
    factors.genderRisk = input.userProfile?.gender === 'female' ? 0.55 : 0.45;

    return factors;
  }

  static async calculateCancerRisk(input: RiskCalculationInput, cancerType: 'breast' | 'prostate' | 'colorectal' | 'lung'): Promise<DiseaseRiskFactors> {
    const factors: DiseaseRiskFactors = {
      geneticRisk: 0.5,
      lifestyleRisk: 0.5,
      familyHistoryRisk: 0.5,
      environmentalRisk: 0.5,
      ageRisk: 0.5,
      genderRisk: 0.5,
    };

    // Genetic risk
    if (input.genomicData?.diseaseRisks) {
      const cancerRisk = input.genomicData.diseaseRisks.find(r => r.diseaseType === `${cancerType}_cancer`);
      if (cancerRisk) {
        factors.geneticRisk = Math.min(cancerRisk.riskScore / 100, 1);
      }
    }

    // Cancer-specific lifestyle factors
    if (input.userProfile?.lifestyle) {
      const lifestyle = input.userProfile.lifestyle;
      let lifestyleScore = 0.3;

      switch (cancerType) {
        case 'lung':
          if (lifestyle.smoking) lifestyleScore += 0.5;
          if (lifestyle.secondhandSmoke) lifestyleScore += 0.1;
          break;
        case 'breast':
          if (lifestyle.alcohol === 'heavy') lifestyleScore += 0.15;
          if (lifestyle.exerciseFrequency < 2) lifestyleScore += 0.1;
          if (lifestyle.hormonalFactors?.hrt) lifestyleScore += 0.1;
          break;
        case 'colorectal':
          if (lifestyle.dietType === 'high_red_meat') lifestyleScore += 0.15;
          if (lifestyle.exerciseFrequency < 2) lifestyleScore += 0.1;
          if (lifestyle.smoking) lifestyleScore += 0.1;
          break;
        case 'prostate':
          if (lifestyle.dietType === 'high_fat') lifestyleScore += 0.1;
          break;
      }

      factors.lifestyleRisk = Math.min(lifestyleScore, 1);
    }

    // Family history
    if (input.familyHistory) {
      let familyScore = 0.3;
      const cancerRelatives = input.familyHistory.filter(relative => 
        relative.conditions?.some((condition: string) => 
          condition.toLowerCase().includes(cancerType) ||
          condition.toLowerCase().includes('cancer')
        )
      );

      cancerRelatives.forEach(relative => {
        switch (relative.relationship) {
          case 'parent':
          case 'sibling':
            familyScore += 0.25;
            break;
          case 'grandparent':
            familyScore += 0.15;
            break;
          default:
            familyScore += 0.08;
        }
      });

      factors.familyHistoryRisk = Math.min(familyScore, 1);
    }

    // Age and gender factors
    if (input.userProfile) {
      const { age, gender } = input.userProfile;
      
      // Age-specific risk
      switch (cancerType) {
        case 'breast':
          if (age > 60) factors.ageRisk = 0.7;
          else if (age > 50) factors.ageRisk = 0.5;
          else if (age > 40) factors.ageRisk = 0.3;
          else factors.ageRisk = 0.1;
          factors.genderRisk = gender === 'female' ? 0.9 : 0.1;
          break;
        case 'prostate':
          if (age > 70) factors.ageRisk = 0.8;
          else if (age > 60) factors.ageRisk = 0.6;
          else if (age > 50) factors.ageRisk = 0.4;
          else factors.ageRisk = 0.1;
          factors.genderRisk = gender === 'male' ? 1.0 : 0.0;
          break;
        default:
          if (age > 65) factors.ageRisk = 0.7;
          else if (age > 50) factors.ageRisk = 0.5;
          else factors.ageRisk = 0.3;
          factors.genderRisk = 0.5;
      }
    }

    return factors;
  }

  static async calculateIntegratedRisk(input: RiskCalculationInput): Promise<number> {
    let riskFactors: DiseaseRiskFactors;

    switch (input.diseaseType) {
      case 'cardiovascular_disease':
        riskFactors = await this.calculateCardiovascularRisk(input);
        break;
      case 'type2_diabetes':
        riskFactors = await this.calculateDiabetesRisk(input);
        break;
      case 'alzheimer_disease':
        riskFactors = await this.calculateAlzheimerRisk(input);
        break;
      case 'breast_cancer':
        riskFactors = await this.calculateCancerRisk(input, 'breast');
        break;
      case 'prostate_cancer':
        riskFactors = await this.calculateCancerRisk(input, 'prostate');
        break;
      case 'colorectal_cancer':
        riskFactors = await this.calculateCancerRisk(input, 'colorectal');
        break;
      case 'lung_cancer':
        riskFactors = await this.calculateCancerRisk(input, 'lung');
        break;
      default:
        // Generic risk calculation
        riskFactors = {
          geneticRisk: 0.5,
          lifestyleRisk: 0.5,
          familyHistoryRisk: 0.5,
          environmentalRisk: 0.5,
          ageRisk: 0.5,
          genderRisk: 0.5,
        };
    }

    // Weighted combination based on disease type
    const weights = this.getWeightsForDisease(input.diseaseType);
    
    const integratedRisk = 
      riskFactors.geneticRisk * weights.genetic +
      riskFactors.lifestyleRisk * weights.lifestyle +
      riskFactors.familyHistoryRisk * weights.familyHistory +
      riskFactors.ageRisk * weights.age +
      riskFactors.genderRisk * weights.gender +
      riskFactors.environmentalRisk * weights.environmental;

    return Math.min(Math.max(integratedRisk, 0), 1);
  }

  private static getWeightsForDisease(diseaseType: string) {
    const weightMap: Record<string, any> = {
      'cardiovascular_disease': {
        genetic: 0.25,
        lifestyle: 0.35,
        familyHistory: 0.15,
        age: 0.15,
        gender: 0.05,
        environmental: 0.05,
      },
      'type2_diabetes': {
        genetic: 0.30,
        lifestyle: 0.40,
        familyHistory: 0.15,
        age: 0.10,
        gender: 0.03,
        environmental: 0.02,
      },
      'alzheimer_disease': {
        genetic: 0.40,
        lifestyle: 0.20,
        familyHistory: 0.20,
        age: 0.15,
        gender: 0.03,
        environmental: 0.02,
      },
      'breast_cancer': {
        genetic: 0.35,
        lifestyle: 0.25,
        familyHistory: 0.20,
        age: 0.15,
        gender: 0.05,
        environmental: 0.00,
      },
      'prostate_cancer': {
        genetic: 0.30,
        lifestyle: 0.20,
        familyHistory: 0.25,
        age: 0.20,
        gender: 0.05,
        environmental: 0.00,
      },
      'lung_cancer': {
        genetic: 0.20,
        lifestyle: 0.50,
        familyHistory: 0.15,
        age: 0.10,
        gender: 0.03,
        environmental: 0.02,
      },
    };

    return weightMap[diseaseType] || {
      genetic: 0.25,
      lifestyle: 0.25,
      familyHistory: 0.20,
      age: 0.15,
      gender: 0.10,
      environmental: 0.05,
    };
  }

  static calculatePercentile(riskScore: number, diseaseType: string, userAge: number, userGender: string): number {
    // Population-based percentile calculation
    // This would ideally use real population data
    const populationData = this.getPopulationRiskData(diseaseType, userAge, userGender);
    
    // Simple percentile calculation
    if (riskScore <= populationData.p10) return 10;
    if (riskScore <= populationData.p25) return 25;
    if (riskScore <= populationData.p50) return 50;
    if (riskScore <= populationData.p75) return 75;
    if (riskScore <= populationData.p90) return 90;
    return 95;
  }

  private static getPopulationRiskData(diseaseType: string, age: number, gender: string) {
    // Simplified population risk data
    // In a real implementation, this would come from epidemiological databases
    const baseRisks: Record<string, any> = {
      'cardiovascular_disease': {
        p10: 0.05, p25: 0.10, p50: 0.20, p75: 0.35, p90: 0.50
      },
      'type2_diabetes': {
        p10: 0.03, p25: 0.06, p50: 0.11, p75: 0.20, p90: 0.35
      },
      'alzheimer_disease': {
        p10: 0.02, p25: 0.05, p50: 0.10, p75: 0.18, p90: 0.30
      },
      'breast_cancer': {
        p10: 0.03, p25: 0.06, p50: 0.12, p75: 0.20, p90: 0.30
      },
      'prostate_cancer': {
        p10: 0.04, p25: 0.08, p50: 0.13, p75: 0.22, p90: 0.35
      },
    };

    let risks = baseRisks[diseaseType] || baseRisks['cardiovascular_disease'];

    // Adjust for age
    const ageMultiplier = age > 65 ? 1.5 : age > 50 ? 1.2 : 1.0;
    
    // Adjust for gender if applicable
    let genderMultiplier = 1.0;
    if (diseaseType === 'cardiovascular_disease' && gender === 'male') genderMultiplier = 1.2;
    if (diseaseType === 'breast_cancer' && gender === 'female') genderMultiplier = 1.0;
    if (diseaseType === 'prostate_cancer' && gender === 'male') genderMultiplier = 1.0;

    const multiplier = ageMultiplier * genderMultiplier;

    return {
      p10: risks.p10 * multiplier,
      p25: risks.p25 * multiplier,
      p50: risks.p50 * multiplier,
      p75: risks.p75 * multiplier,
      p90: risks.p90 * multiplier,
    };
  }

  static generateRiskRecommendations(diseaseType: string, riskFactors: DiseaseRiskFactors, riskScore: number): string[] {
    const recommendations: string[] = [];

    // High-risk genetic factors
    if (riskFactors.geneticRisk > 0.7) {
      recommendations.push('유전적 위험도가 높습니다. 정기적인 검진과 유전 상담을 받으시기 바랍니다.');
      recommendations.push('가족력과 유전적 요인에 대해 의료진과 상의하세요.');
    }

    // Lifestyle recommendations
    if (riskFactors.lifestyleRisk > 0.6) {
      switch (diseaseType) {
        case 'cardiovascular_disease':
          recommendations.push('금연, 규칙적인 운동, 건강한 식단으로 심혈관 건강을 개선하세요.');
          recommendations.push('혈압과 콜레스테롤 수치를 정기적으로 확인하세요.');
          break;
        case 'type2_diabetes':
          recommendations.push('체중 관리와 규칙적인 운동으로 당뇨병 위험을 줄이세요.');
          recommendations.push('당분 섭취를 줄이고 균형 잡힌 식단을 유지하세요.');
          break;
        case 'lung_cancer':
          recommendations.push('금연은 폐암 위험을 크게 줄일 수 있습니다.');
          recommendations.push('간접흡연을 피하고 실내 공기질을 개선하세요.');
          break;
      }
    }

    // Family history recommendations
    if (riskFactors.familyHistoryRisk > 0.6) {
      recommendations.push('가족력으로 인한 위험이 높으므로 조기 검진을 고려하세요.');
      recommendations.push('가족의 의료 이력을 정확히 파악하고 의료진과 공유하세요.');
    }

    // Age-related recommendations
    if (riskFactors.ageRisk > 0.6) {
      recommendations.push('연령 관련 위험이 증가하고 있습니다. 정기 검진 주기를 단축하세요.');
    }

    // Overall risk level recommendations
    if (riskScore > 0.7) {
      recommendations.push('전체적인 위험도가 높습니다. 즉시 의료진과 상담하세요.');
      recommendations.push('예방적 치료나 약물 요법에 대해 논의하세요.');
    } else if (riskScore > 0.5) {
      recommendations.push('중등도 위험 수준입니다. 생활습관 개선과 정기 검진이 중요합니다.');
    } else {
      recommendations.push('현재 위험도는 낮은 편입니다. 건강한 생활습관을 유지하세요.');
    }

    // General recommendations
    recommendations.push('정기적인 건강검진을 받으세요.');
    recommendations.push('건강한 생활습관을 유지하고 스트레스를 관리하세요.');

    return recommendations;
  }
}