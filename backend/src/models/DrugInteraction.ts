import prisma from '../config/database';
import { DrugInteractionCheck, DrugInteractionData } from '../types/medication';

export class DrugInteractionModel {
  /**
   * 약물 상호작용 데이터 추가 (요구사항 6.3)
   */
  static async create(interactionData: DrugInteractionData): Promise<any> {
    return await prisma.drugInteraction.create({
      data: {
        drug1Name: interactionData.drug1Name.toLowerCase(),
        drug2Name: interactionData.drug2Name.toLowerCase(),
        interactionType: interactionData.interactionType,
        severity: interactionData.severity,
        description: interactionData.description,
        clinicalEffect: interactionData.clinicalEffect,
        mechanism: interactionData.mechanism,
        management: interactionData.management,
      }
    });
  }

  /**
   * 두 약물 간 상호작용 확인 (요구사항 6.3)
   */
  static async checkInteraction(drug1: string, drug2: string): Promise<any | null> {
    const drug1Lower = drug1.toLowerCase();
    const drug2Lower = drug2.toLowerCase();

    // 양방향 검색 (drug1-drug2, drug2-drug1)
    const interaction = await prisma.drugInteraction.findFirst({
      where: {
        isActive: true,
        OR: [
          {
            drug1Name: drug1Lower,
            drug2Name: drug2Lower
          },
          {
            drug1Name: drug2Lower,
            drug2Name: drug1Lower
          }
        ]
      }
    });

    return interaction;
  }

  /**
   * 사용자의 모든 약물 간 상호작용 확인 (요구사항 6.3)
   */
  static async checkUserMedicationInteractions(userId: string): Promise<DrugInteractionCheck[]> {
    // 사용자의 활성 약물 목록 조회
    const medications = await prisma.medication.findMany({
      where: {
        userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        genericName: true
      }
    });

    const interactions: DrugInteractionCheck[] = [];

    // 모든 약물 조합에 대해 상호작용 확인
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i];
        const med2 = medications[j];

        // 상품명으로 확인
        let interaction = await this.checkInteraction(med1.name, med2.name);
        
        // 상품명으로 찾지 못하면 일반명으로 확인
        if (!interaction && med1.genericName && med2.genericName) {
          interaction = await this.checkInteraction(med1.genericName, med2.genericName);
        }

        // 상품명과 일반명 교차 확인
        if (!interaction && med1.genericName) {
          interaction = await this.checkInteraction(med1.genericName, med2.name);
        }
        
        if (!interaction && med2.genericName) {
          interaction = await this.checkInteraction(med1.name, med2.genericName);
        }

        if (interaction) {
          interactions.push({
            medication1: {
              id: med1.id,
              name: med1.name,
              genericName: med1.genericName
            },
            medication2: {
              id: med2.id,
              name: med2.name,
              genericName: med2.genericName
            },
            interaction: {
              id: interaction.id,
              interactionType: interaction.interactionType,
              severity: interaction.severity,
              description: interaction.description,
              clinicalEffect: interaction.clinicalEffect,
              mechanism: interaction.mechanism,
              management: interaction.management
            }
          });
        }
      }
    }

    return interactions;
  }

  /**
   * 새 약물 추가 시 기존 약물과의 상호작용 확인 (요구사항 6.3)
   */
  static async checkNewMedicationInteractions(
    userId: string, 
    newMedicationName: string, 
    newMedicationGenericName?: string
  ): Promise<DrugInteractionCheck[]> {
    const existingMedications = await prisma.medication.findMany({
      where: {
        userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        genericName: true
      }
    });

    const interactions: DrugInteractionCheck[] = [];

    for (const med of existingMedications) {
      // 상품명으로 확인
      let interaction = await this.checkInteraction(newMedicationName, med.name);
      
      // 일반명으로 확인
      if (!interaction && newMedicationGenericName && med.genericName) {
        interaction = await this.checkInteraction(newMedicationGenericName, med.genericName);
      }

      // 교차 확인
      if (!interaction && newMedicationGenericName) {
        interaction = await this.checkInteraction(newMedicationGenericName, med.name);
      }
      
      if (!interaction && med.genericName) {
        interaction = await this.checkInteraction(newMedicationName, med.genericName);
      }

      if (interaction) {
        interactions.push({
          medication1: {
            id: 'new',
            name: newMedicationName,
            genericName: newMedicationGenericName
          },
          medication2: {
            id: med.id,
            name: med.name,
            genericName: med.genericName
          },
          interaction: {
            id: interaction.id,
            interactionType: interaction.interactionType,
            severity: interaction.severity,
            description: interaction.description,
            clinicalEffect: interaction.clinicalEffect,
            mechanism: interaction.mechanism,
            management: interaction.management
          }
        });
      }
    }

    return interactions;
  }

  /**
   * 상호작용 데이터 업데이트 (요구사항 6.3)
   */
  static async update(id: string, updateData: Partial<DrugInteractionData>): Promise<any> {
    return await prisma.drugInteraction.update({
      where: { id },
      data: {
        ...(updateData.interactionType && { interactionType: updateData.interactionType }),
        ...(updateData.severity && { severity: updateData.severity }),
        ...(updateData.description && { description: updateData.description }),
        ...(updateData.clinicalEffect !== undefined && { clinicalEffect: updateData.clinicalEffect }),
        ...(updateData.mechanism !== undefined && { mechanism: updateData.mechanism }),
        ...(updateData.management !== undefined && { management: updateData.management }),
      }
    });
  }

  /**
   * 상호작용 데이터 비활성화
   */
  static async deactivate(id: string): Promise<void> {
    await prisma.drugInteraction.update({
      where: { id },
      data: { isActive: false }
    });
  }

  /**
   * 심각도별 상호작용 통계 (요구사항 6.3)
   */
  static async getInteractionStats(userId: string): Promise<any> {
    const interactions = await this.checkUserMedicationInteractions(userId);
    
    const stats = {
      total: interactions.length,
      contraindicated: 0,
      serious: 0,
      significant: 0,
      minor: 0
    };

    interactions.forEach(interaction => {
      switch (interaction.interaction.severity) {
        case 'contraindicated':
          stats.contraindicated++;
          break;
        case 'serious':
          stats.serious++;
          break;
        case 'significant':
          stats.significant++;
          break;
        case 'minor':
          stats.minor++;
          break;
      }
    });

    return stats;
  }

  /**
   * 기본 상호작용 데이터 시드 (개발용)
   */
  static async seedBasicInteractions(): Promise<void> {
    const basicInteractions = [
      {
        drug1Name: 'warfarin',
        drug2Name: 'aspirin',
        interactionType: 'major',
        severity: 'serious',
        description: '출혈 위험 증가',
        clinicalEffect: '항응고 효과 증강으로 인한 출혈 위험 증가',
        mechanism: '혈소판 응집 억제 및 항응고 작용의 상승효과',
        management: '정기적인 INR 모니터링 및 출혈 징후 관찰'
      },
      {
        drug1Name: 'metformin',
        drug2Name: 'contrast media',
        interactionType: 'major',
        severity: 'serious',
        description: '유산산증 위험',
        clinicalEffect: '신기능 저하 시 메트포르민 축적으로 인한 유산산증',
        mechanism: '조영제로 인한 신기능 저하',
        management: '조영제 사용 전후 메트포르민 중단'
      },
      {
        drug1Name: 'digoxin',
        drug2Name: 'furosemide',
        interactionType: 'moderate',
        severity: 'significant',
        description: '디곡신 독성 위험',
        clinicalEffect: '저칼륨혈증으로 인한 디곡신 독성 증가',
        mechanism: '이뇨제로 인한 칼륨 손실',
        management: '칼륨 수치 모니터링 및 보충'
      }
    ];

    for (const interaction of basicInteractions) {
      await this.create(interaction);
    }
  }
}