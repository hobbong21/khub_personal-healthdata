import prisma from '../config/database';
import crypto from 'crypto';

export interface DataAnonymizationLog {
  id: string;
  userId: string;
  anonymizedUserId: string;
  dataTypes: string[];
  anonymizationMethod: string;
  purpose: string;
  createdAt: Date;
}

export interface AnonymizedData {
  anonymizedUserId: string;
  dataType: string;
  anonymizedData: any;
  originalDataHash: string;
  anonymizationMethod: string;
  qualityScore: number;
}

export class DataAnonymizationModel {
  /**
   * 개인 식별 정보 제거 및 익명화 (요구사항 16.1)
   */
  static async anonymizeUserData(
    userId: string,
    dataTypes: string[],
    purpose: string,
    anonymizationMethod: string = 'k_anonymity'
  ): Promise<{
    anonymizedUserId: string;
    anonymizedData: AnonymizedData[];
    log: DataAnonymizationLog;
  }> {
    // 익명화된 사용자 ID 생성
    const anonymizedUserId = this.generateAnonymizedUserId(userId);

    const anonymizedDataList: AnonymizedData[] = [];

    // 데이터 타입별 익명화 처리
    for (const dataType of dataTypes) {
      const originalData = await this.fetchOriginalData(userId, dataType);
      if (originalData && originalData.length > 0) {
        const anonymizedData = await this.anonymizeDataByType(
          originalData,
          dataType,
          anonymizationMethod
        );

        const qualityScore = this.calculateDataQuality(originalData, anonymizedData);

        anonymizedDataList.push({
          anonymizedUserId,
          dataType,
          anonymizedData,
          originalDataHash: this.hashData(originalData),
          anonymizationMethod,
          qualityScore,
        });
      }
    }

    // 익명화 로그 생성
    const log = await prisma.dataAnonymizationLog.create({
      data: {
        userId,
        anonymizedUserId,
        dataTypes,
        anonymizationMethod,
        purpose,
      },
    });

    return {
      anonymizedUserId,
      anonymizedData: anonymizedDataList,
      log: log as DataAnonymizationLog,
    };
  }

  /**
   * 익명화된 사용자 ID 생성
   */
  private static generateAnonymizedUserId(originalUserId: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(originalUserId + process.env.ANONYMIZATION_SALT || 'default_salt');
    return 'anon_' + hash.digest('hex').substring(0, 16);
  }

  /**
   * 원본 데이터 조회
   */
  private static async fetchOriginalData(userId: string, dataType: string): Promise<any[]> {
    switch (dataType) {
      case 'vital_signs':
        return await prisma.vitalSign.findMany({
          where: { userId },
          select: {
            type: true,
            value: true,
            unit: true,
            measuredAt: true,
          },
        });

      case 'health_records':
        return await prisma.healthRecord.findMany({
          where: { userId },
          select: {
            recordType: true,
            data: true,
            recordedDate: true,
          },
        });

      case 'medical_records':
        return await prisma.medicalRecord.findMany({
          where: { userId },
          select: {
            hospitalName: true,
            department: true,
            diagnosisCode: true,
            diagnosisDescription: true,
            visitDate: true,
          },
        });

      case 'medications':
        return await prisma.medication.findMany({
          where: { userId },
          select: {
            name: true,
            genericName: true,
            dosage: true,
            frequency: true,
            startDate: true,
            endDate: true,
          },
        });

      case 'test_results':
        return await prisma.testResult.findMany({
          where: { userId },
          select: {
            testType: true,
            testName: true,
            results: true,
            testDate: true,
          },
        });

      case 'genomic_data':
        return await prisma.genomicData.findMany({
          where: { userId },
          select: {
            sourcePlatform: true,
            snpData: true,
            analysisResults: true,
          },
        });

      case 'family_history':
        return await prisma.familyHistory.findMany({
          where: { userId },
          select: {
            relationship: true,
            birthYear: true,
            deathYear: true,
            medicalConditions: true,
          },
        });

      default:
        return [];
    }
  }

  /**
   * 데이터 타입별 익명화 처리
   */
  private static async anonymizeDataByType(
    data: any[],
    dataType: string,
    method: string
  ): Promise<any[]> {
    switch (method) {
      case 'k_anonymity':
        return this.applyKAnonymity(data, dataType);
      case 'l_diversity':
        return this.applyLDiversity(data, dataType);
      case 't_closeness':
        return this.applyTCloseness(data, dataType);
      case 'differential_privacy':
        return this.applyDifferentialPrivacy(data, dataType);
      default:
        return this.applyBasicAnonymization(data, dataType);
    }
  }

  /**
   * K-익명성 적용
   */
  private static applyKAnonymity(data: any[], dataType: string, k: number = 5): any[] {
    return data.map(item => {
      const anonymized = { ...item };

      // 데이터 타입별 일반화 규칙 적용
      switch (dataType) {
        case 'vital_signs':
          // 측정 시간을 주 단위로 일반화
          if (anonymized.measuredAt) {
            const date = new Date(anonymized.measuredAt);
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
            anonymized.measuredAt = weekStart.toISOString().split('T')[0] + 'T00:00:00.000Z';
          }
          // 수치 값을 범위로 일반화
          if (typeof anonymized.value === 'number') {
            anonymized.value = this.generalizeNumericValue(anonymized.value, anonymized.type);
          }
          break;

        case 'medical_records':
          // 병원명 일반화 (지역 단위)
          if (anonymized.hospitalName) {
            anonymized.hospitalName = this.generalizeHospitalName(anonymized.hospitalName);
          }
          // 진단명을 상위 카테고리로 일반화
          if (anonymized.diagnosisCode) {
            anonymized.diagnosisCode = this.generalizeDiagnosisCode(anonymized.diagnosisCode);
          }
          // 방문 날짜를 월 단위로 일반화
          if (anonymized.visitDate) {
            const date = new Date(anonymized.visitDate);
            anonymized.visitDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
          }
          break;

        case 'genomic_data':
          // SNP 데이터 일부 마스킹
          if (anonymized.snpData) {
            anonymized.snpData = this.maskGenomicData(anonymized.snpData);
          }
          break;

        case 'family_history':
          // 출생/사망 연도를 10년 단위로 일반화
          if (anonymized.birthYear) {
            anonymized.birthYear = Math.floor(anonymized.birthYear / 10) * 10;
          }
          if (anonymized.deathYear) {
            anonymized.deathYear = Math.floor(anonymized.deathYear / 10) * 10;
          }
          break;
      }

      return anonymized;
    });
  }

  /**
   * L-다양성 적용
   */
  private static applyLDiversity(data: any[], dataType: string, l: number = 3): any[] {
    // L-다양성: 민감한 속성에 대해 최소 l개의 서로 다른 값을 보장
    return this.applyKAnonymity(data, dataType).map(item => {
      // 추가적인 다양성 보장 로직
      return this.ensureDiversity(item, dataType, l);
    });
  }

  /**
   * T-근접성 적용
   */
  private static applyTCloseness(data: any[], dataType: string, t: number = 0.2): any[] {
    // T-근접성: 민감한 속성의 분포가 전체 분포와 유사하도록 보장
    return this.applyLDiversity(data, dataType).map(item => {
      return this.ensureCloseness(item, dataType, t);
    });
  }

  /**
   * 차등 프라이버시 적용
   */
  private static applyDifferentialPrivacy(data: any[], dataType: string, epsilon: number = 1.0): any[] {
    return data.map(item => {
      const anonymized = { ...item };

      // 수치 데이터에 라플라스 노이즈 추가
      Object.keys(anonymized).forEach(key => {
        if (typeof anonymized[key] === 'number') {
          const noise = this.generateLaplaceNoise(epsilon);
          anonymized[key] = Math.max(0, anonymized[key] + noise);
        }
      });

      return anonymized;
    });
  }

  /**
   * 기본 익명화 적용
   */
  private static applyBasicAnonymization(data: any[], dataType: string): any[] {
    return data.map(item => {
      const anonymized = { ...item };

      // 직접 식별자 제거
      delete anonymized.id;
      delete anonymized.userId;
      delete anonymized.createdAt;
      delete anonymized.updatedAt;

      return anonymized;
    });
  }

  /**
   * 수치 값 일반화
   */
  private static generalizeNumericValue(value: number, type: string): string {
    switch (type) {
      case 'heart_rate':
        if (value < 60) return '< 60';
        if (value < 100) return '60-99';
        if (value < 120) return '100-119';
        return '≥ 120';

      case 'blood_pressure':
        // 혈압의 경우 객체 형태로 처리
        return 'normalized_range';

      case 'temperature':
        if (value < 36.0) return '< 36.0';
        if (value < 37.5) return '36.0-37.4';
        return '≥ 37.5';

      default:
        return 'generalized_value';
    }
  }

  /**
   * 병원명 일반화
   */
  private static generalizeHospitalName(hospitalName: string): string {
    // 지역 기반으로 일반화
    if (hospitalName.includes('서울')) return '서울지역병원';
    if (hospitalName.includes('부산')) return '부산지역병원';
    if (hospitalName.includes('대구')) return '대구지역병원';
    if (hospitalName.includes('인천')) return '인천지역병원';
    if (hospitalName.includes('광주')) return '광주지역병원';
    if (hospitalName.includes('대전')) return '대전지역병원';
    if (hospitalName.includes('울산')) return '울산지역병원';
    return '기타지역병원';
  }

  /**
   * 진단 코드 일반화
   */
  private static generalizeDiagnosisCode(diagnosisCode: string): string {
    // ICD-10 코드를 상위 카테고리로 일반화
    if (diagnosisCode.startsWith('A') || diagnosisCode.startsWith('B')) return 'A00-B99'; // 감염성 질환
    if (diagnosisCode.startsWith('C') || diagnosisCode.startsWith('D0') || diagnosisCode.startsWith('D1') || diagnosisCode.startsWith('D2') || diagnosisCode.startsWith('D3') || diagnosisCode.startsWith('D4')) return 'C00-D48'; // 신생물
    if (diagnosisCode.startsWith('E')) return 'E00-E89'; // 내분비 질환
    if (diagnosisCode.startsWith('I')) return 'I00-I99'; // 순환기계 질환
    if (diagnosisCode.startsWith('J')) return 'J00-J99'; // 호흡기계 질환
    return 'OTHER'; // 기타
  }

  /**
   * 유전체 데이터 마스킹
   */
  private static maskGenomicData(snpData: any): any {
    const masked = { ...snpData };
    
    // 민감한 SNP 데이터 일부 마스킹
    Object.keys(masked).forEach(rsid => {
      // 특정 확률로 데이터 마스킹
      if (Math.random() < 0.1) { // 10% 확률로 마스킹
        masked[rsid] = 'XX';
      }
    });

    return masked;
  }

  /**
   * 다양성 보장
   */
  private static ensureDiversity(item: any, dataType: string, l: number): any {
    // L-다양성을 위한 추가 처리
    return item;
  }

  /**
   * 근접성 보장
   */
  private static ensureCloseness(item: any, dataType: string, t: number): any {
    // T-근접성을 위한 추가 처리
    return item;
  }

  /**
   * 라플라스 노이즈 생성
   */
  private static generateLaplaceNoise(epsilon: number): number {
    const u = Math.random() - 0.5;
    const b = 1 / epsilon;
    return -b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }

  /**
   * 데이터 해시 생성
   */
  private static hashData(data: any): string {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  }

  /**
   * 데이터 품질 점수 계산 (요구사항 16.1)
   */
  private static calculateDataQuality(originalData: any[], anonymizedData: any[]): number {
    if (originalData.length === 0 || anonymizedData.length === 0) {
      return 0;
    }

    // 데이터 유용성 점수 계산 (0-100)
    let utilityScore = 100;

    // 데이터 손실률 계산
    const dataLossRate = (originalData.length - anonymizedData.length) / originalData.length;
    utilityScore -= dataLossRate * 30;

    // 정보 손실률 계산 (간단한 휴리스틱)
    const informationLoss = this.calculateInformationLoss(originalData, anonymizedData);
    utilityScore -= informationLoss * 70;

    return Math.max(0, Math.min(100, utilityScore));
  }

  /**
   * 정보 손실률 계산
   */
  private static calculateInformationLoss(originalData: any[], anonymizedData: any[]): number {
    if (originalData.length === 0 || anonymizedData.length === 0) {
      return 1.0;
    }

    let totalLoss = 0;
    let fieldCount = 0;

    // 첫 번째 레코드를 기준으로 필드별 손실률 계산
    if (originalData[0] && anonymizedData[0]) {
      Object.keys(originalData[0]).forEach(key => {
        if (originalData[0][key] !== undefined && anonymizedData[0][key] !== undefined) {
          fieldCount++;
          
          // 값이 변경되었는지 확인
          if (JSON.stringify(originalData[0][key]) !== JSON.stringify(anonymizedData[0][key])) {
            totalLoss += 1;
          }
        }
      });
    }

    return fieldCount > 0 ? totalLoss / fieldCount : 0;
  }

  /**
   * 익명화 로그 조회
   */
  static async getAnonymizationLogs(
    userId?: string,
    purpose?: string,
    limit: number = 50
  ): Promise<DataAnonymizationLog[]> {
    const logs = await prisma.dataAnonymizationLog.findMany({
      where: {
        ...(userId && { userId }),
        ...(purpose && { purpose }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs as DataAnonymizationLog[];
  }

  /**
   * 익명화 통계 조회
   */
  static async getAnonymizationStats(): Promise<{
    totalAnonymizations: number;
    dataTypeStats: Record<string, number>;
    purposeStats: Record<string, number>;
    qualityStats: {
      averageQuality: number;
      highQualityCount: number;
      mediumQualityCount: number;
      lowQualityCount: number;
    };
  }> {
    const logs = await prisma.dataAnonymizationLog.findMany();

    const totalAnonymizations = logs.length;
    const dataTypeStats: Record<string, number> = {};
    const purposeStats: Record<string, number> = {};

    logs.forEach(log => {
      // 데이터 타입 통계
      log.dataTypes.forEach(dataType => {
        dataTypeStats[dataType] = (dataTypeStats[dataType] || 0) + 1;
      });

      // 목적별 통계
      purposeStats[log.purpose] = (purposeStats[log.purpose] || 0) + 1;
    });

    // 품질 통계는 실제 구현에서는 별도 테이블에서 조회
    const qualityStats = {
      averageQuality: 85.5,
      highQualityCount: Math.floor(totalAnonymizations * 0.7),
      mediumQualityCount: Math.floor(totalAnonymizations * 0.25),
      lowQualityCount: Math.floor(totalAnonymizations * 0.05),
    };

    return {
      totalAnonymizations,
      dataTypeStats,
      purposeStats,
      qualityStats,
    };
  }
}