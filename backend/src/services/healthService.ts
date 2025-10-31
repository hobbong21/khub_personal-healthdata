import prisma from '../config/database';
import { 
  VitalSignRequest, 
  HealthJournalRequest, 
  HealthRecordResponse 
} from '../types/health';

export class HealthService {
  /**
   * 바이탈 사인 기록 생성 (요구사항 2.1, 2.2)
   */
  static async createVitalSign(userId: string, vitalSignData: VitalSignRequest): Promise<HealthRecordResponse> {
    // 건강 기록 생성
    const healthRecord = await prisma.healthRecord.create({
      data: {
        userId,
        recordType: 'vital_sign',
        data: {
          type: vitalSignData.type,
          value: vitalSignData.value,
          unit: vitalSignData.unit,
          measuredAt: vitalSignData.measuredAt,
        },
        recordedDate: new Date(vitalSignData.measuredAt),
      },
    });

    // 바이탈 사인 상세 데이터 생성
    await prisma.vitalSign.create({
      data: {
        healthRecordId: healthRecord.id,
        type: vitalSignData.type,
        value: vitalSignData.value,
        unit: vitalSignData.unit,
        measuredAt: new Date(vitalSignData.measuredAt),
      },
    });

    return {
      id: healthRecord.id,
      userId: healthRecord.userId,
      recordType: healthRecord.recordType,
      data: healthRecord.data,
      recordedDate: healthRecord.recordedDate,
      createdAt: healthRecord.createdAt,
    };
  }

  /**
   * 건강 일지 기록 생성 (요구사항 3.1, 3.2, 3.3, 3.4, 3.5)
   */
  static async createHealthJournal(userId: string, journalData: HealthJournalRequest): Promise<HealthRecordResponse> {
    const healthRecord = await prisma.healthRecord.create({
      data: {
        userId,
        recordType: 'health_journal',
        data: {
          conditionRating: journalData.conditionRating,
          symptoms: journalData.symptoms,
          supplements: journalData.supplements,
          exercise: journalData.exercise,
          notes: journalData.notes,
        },
        recordedDate: new Date(journalData.recordedDate),
      },
    });

    return {
      id: healthRecord.id,
      userId: healthRecord.userId,
      recordType: healthRecord.recordType,
      data: healthRecord.data,
      recordedDate: healthRecord.recordedDate,
      createdAt: healthRecord.createdAt,
    };
  }

  /**
   * 사용자의 바이탈 사인 조회 (요구사항 2.1, 2.2, 2.3, 2.4)
   */
  static async getVitalSigns(
    userId: string, 
    type?: string, 
    startDate?: string, 
    endDate?: string,
    limit: number = 50
  ): Promise<HealthRecordResponse[]> {
    const where: any = {
      userId,
      recordType: 'vital_sign',
    };

    if (type) {
      where.data = {
        path: ['type'],
        equals: type,
      };
    }

    if (startDate || endDate) {
      where.recordedDate = {};
      if (startDate) {
        where.recordedDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.recordedDate.lte = new Date(endDate);
      }
    }

    const healthRecords = await prisma.healthRecord.findMany({
      where,
      orderBy: {
        recordedDate: 'desc',
      },
      take: limit,
      include: {
        vitalSigns: true,
      },
    });

    return healthRecords.map(record => ({
      id: record.id,
      userId: record.userId,
      recordType: record.recordType,
      data: record.data,
      recordedDate: record.recordedDate,
      createdAt: record.createdAt,
    }));
  }

  /**
   * 사용자의 건강 일지 조회 (요구사항 3.1, 3.2, 3.3, 3.4)
   */
  static async getHealthJournals(
    userId: string, 
    startDate?: string, 
    endDate?: string,
    limit: number = 30
  ): Promise<HealthRecordResponse[]> {
    const where: any = {
      userId,
      recordType: 'health_journal',
    };

    if (startDate || endDate) {
      where.recordedDate = {};
      if (startDate) {
        where.recordedDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.recordedDate.lte = new Date(endDate);
      }
    }

    const healthRecords = await prisma.healthRecord.findMany({
      where,
      orderBy: {
        recordedDate: 'desc',
      },
      take: limit,
    });

    return healthRecords.map(record => ({
      id: record.id,
      userId: record.userId,
      recordType: record.recordType,
      data: record.data,
      recordedDate: record.recordedDate,
      createdAt: record.createdAt,
    }));
  }

  /**
   * 바이탈 사인 트렌드 분석 (요구사항 2.3, 2.4)
   */
  static async getVitalSignTrends(
    userId: string, 
    type: string, 
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    days: number = 30
  ): Promise<{
    type: string;
    period: string;
    data: Array<{
      date: string;
      value: number | { systolic: number; diastolic: number };
      average?: number;
    }>;
    statistics: {
      min: number;
      max: number;
      average: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const vitalSigns = await prisma.healthRecord.findMany({
      where: {
        userId,
        recordType: 'vital_sign',
        recordedDate: {
          gte: startDate,
        },
        data: {
          path: ['type'],
          equals: type,
        },
      },
      orderBy: {
        recordedDate: 'asc',
      },
    });

    // 데이터 그룹화 및 평균 계산
    const groupedData = this.groupVitalSignsByPeriod(vitalSigns, period);
    
    // 통계 계산
    const values = vitalSigns.map(record => {
      const value = record.data as any;
      if (type === 'blood_pressure') {
        return (value.value.systolic + value.value.diastolic) / 2;
      }
      return value.value as number;
    });

    const statistics = this.calculateVitalSignStatistics(values);

    return {
      type,
      period,
      data: groupedData,
      statistics,
    };
  }

  /**
   * 건강 기록 업데이트 (요구사항 2.5)
   */
  static async updateHealthRecord(
    userId: string, 
    recordId: string, 
    updateData: any
  ): Promise<HealthRecordResponse> {
    // 사용자 권한 확인
    const existingRecord = await prisma.healthRecord.findFirst({
      where: {
        id: recordId,
        userId,
      },
    });

    if (!existingRecord) {
      throw new Error('건강 기록을 찾을 수 없거나 접근 권한이 없습니다');
    }

    // 기존 데이터와 업데이트 데이터 병합
    const existingData = existingRecord.data as any;
    const updatedData = {
      ...existingData,
      ...updateData,
    };

    const recordUpdateData: any = {
      data: updatedData,
    };

    // 날짜 업데이트 처리
    if (updateData.measuredAt) {
      recordUpdateData.recordedDate = new Date(updateData.measuredAt);
    } else if (updateData.recordedDate) {
      recordUpdateData.recordedDate = new Date(updateData.recordedDate);
    }

    const updatedRecord = await prisma.healthRecord.update({
      where: { id: recordId },
      data: recordUpdateData,
    });

    // 바이탈 사인인 경우 관련 데이터도 업데이트
    if (existingRecord.recordType === 'vital_sign' && updateData.type) {
      const vitalSignUpdateData: any = {};
      
      if (updateData.type) vitalSignUpdateData.type = updateData.type;
      if (updateData.value !== undefined) vitalSignUpdateData.value = updateData.value;
      if (updateData.unit) vitalSignUpdateData.unit = updateData.unit;
      if (updateData.measuredAt) vitalSignUpdateData.measuredAt = new Date(updateData.measuredAt);

      await prisma.vitalSign.updateMany({
        where: { healthRecordId: recordId },
        data: vitalSignUpdateData,
      });
    }

    return {
      id: updatedRecord.id,
      userId: updatedRecord.userId,
      recordType: updatedRecord.recordType,
      data: updatedRecord.data,
      recordedDate: updatedRecord.recordedDate,
      createdAt: updatedRecord.createdAt,
    };
  }

  /**
   * 건강 기록 삭제
   */
  static async deleteHealthRecord(userId: string, recordId: string): Promise<void> {
    const existingRecord = await prisma.healthRecord.findFirst({
      where: {
        id: recordId,
        userId,
      },
    });

    if (!existingRecord) {
      throw new Error('건강 기록을 찾을 수 없거나 접근 권한이 없습니다');
    }

    await prisma.healthRecord.delete({
      where: { id: recordId },
    });
  }

  /**
   * 기간별 바이탈 사인 데이터 그룹화
   */
  private static groupVitalSignsByPeriod(
    vitalSigns: any[], 
    period: 'daily' | 'weekly' | 'monthly'
  ): Array<{
    date: string;
    value: number | { systolic: number; diastolic: number };
    average?: number;
  }> {
    const grouped: { [key: string]: any[] } = {};

    vitalSigns.forEach((record: any) => {
      const date = new Date(record.recordedDate);
      let key: string;

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(record.data);
    });

    return Object.entries(grouped).map(([date, records]) => {
      if (records.length === 1) {
        return {
          date,
          value: records[0].value,
        };
      }

      // 여러 기록이 있는 경우 평균 계산
      const values = records.map((r: any) => {
        if (typeof r.value === 'object' && r.value.systolic) {
          return (r.value.systolic + r.value.diastolic) / 2;
        }
        return r.value;
      });

      const average = values.reduce((sum, val) => sum + val, 0) / values.length;

      return {
        date,
        value: records[0].value, // 첫 번째 값 표시
        average: Math.round(average * 10) / 10,
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * 바이탈 사인 통계 계산
   */
  private static calculateVitalSignStatistics(values: number[]): {
    min: number;
    max: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (values.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        trend: 'stable',
      };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    // 트렌드 계산 (최근 30% vs 이전 30%)
    const recentCount = Math.floor(values.length * 0.3);
    if (recentCount < 2) {
      return {
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10,
        average: Math.round(average * 10) / 10,
        trend: 'stable',
      };
    }

    const recentValues = values.slice(-recentCount);
    const earlierValues = values.slice(0, recentCount);

    const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const earlierAvg = earlierValues.reduce((sum, val) => sum + val, 0) / earlierValues.length;

    const difference = recentAvg - earlierAvg;
    const threshold = average * 0.05; // 5% 변화를 기준으로 트렌드 판단

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (difference > threshold) {
      trend = 'increasing';
    } else if (difference < -threshold) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return {
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      average: Math.round(average * 10) / 10,
      trend,
    };
  }
}