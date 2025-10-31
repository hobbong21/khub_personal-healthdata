import { VitalSignRequest, HealthJournalRequest } from '../types/health';

// Mock Prisma client
const mockPrisma = {
  healthRecord: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  vitalSign: {
    create: jest.fn(),
    updateMany: jest.fn(),
  },
};

jest.mock('../config/database', () => mockPrisma);

import { HealthService } from '../services/healthService';

describe('HealthService', () => {
  const mockUserId = 'test-user-id';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createVitalSign', () => {
    it('should create a vital sign record successfully', async () => {
      const vitalSignData: VitalSignRequest = {
        type: 'blood_pressure',
        value: { systolic: 120, diastolic: 80 },
        unit: 'mmHg',
        measuredAt: '2024-01-01T10:00:00Z',
      };

      const mockHealthRecord = {
        id: 'health-record-id',
        userId: mockUserId,
        recordType: 'vital_sign',
        data: {
          type: vitalSignData.type,
          value: vitalSignData.value,
          unit: vitalSignData.unit,
          measuredAt: vitalSignData.measuredAt,
        },
        recordedDate: new Date(vitalSignData.measuredAt),
        createdAt: new Date(),
      };

      mockPrisma.healthRecord.create.mockResolvedValue(mockHealthRecord);
      mockPrisma.vitalSign.create.mockResolvedValue({});

      const result = await HealthService.createVitalSign(mockUserId, vitalSignData);

      expect(mockPrisma.healthRecord.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
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

      expect(mockPrisma.vitalSign.create).toHaveBeenCalledWith({
        data: {
          healthRecordId: mockHealthRecord.id,
          type: vitalSignData.type,
          value: vitalSignData.value,
          unit: vitalSignData.unit,
          measuredAt: new Date(vitalSignData.measuredAt),
        },
      });

      expect(result).toEqual({
        id: mockHealthRecord.id,
        userId: mockHealthRecord.userId,
        recordType: mockHealthRecord.recordType,
        data: mockHealthRecord.data,
        recordedDate: mockHealthRecord.recordedDate,
        createdAt: mockHealthRecord.createdAt,
      });
    });

    it('should handle heart rate vital sign', async () => {
      const vitalSignData: VitalSignRequest = {
        type: 'heart_rate',
        value: 72,
        unit: 'bpm',
        measuredAt: '2024-01-01T10:00:00Z',
      };

      const mockHealthRecord = {
        id: 'health-record-id',
        userId: mockUserId,
        recordType: 'vital_sign',
        data: vitalSignData,
        recordedDate: new Date(vitalSignData.measuredAt),
        createdAt: new Date(),
      };

      mockPrisma.healthRecord.create.mockResolvedValue(mockHealthRecord);
      mockPrisma.vitalSign.create.mockResolvedValue({});

      const result = await HealthService.createVitalSign(mockUserId, vitalSignData);

      expect(result.data).toEqual(vitalSignData);
    });
  });

  describe('createHealthJournal', () => {
    it('should create a health journal record successfully', async () => {
      const journalData: HealthJournalRequest = {
        conditionRating: 4,
        symptoms: {
          pain: 2,
          fatigue: 3,
          sleepQuality: 7,
        },
        supplements: ['Vitamin D', 'Omega-3'],
        exercise: [
          {
            type: 'Running',
            duration: 30,
            intensity: 'moderate',
          },
        ],
        notes: 'Feeling good today',
        recordedDate: '2024-01-01',
      };

      const mockHealthRecord = {
        id: 'health-record-id',
        userId: mockUserId,
        recordType: 'health_journal',
        data: {
          conditionRating: journalData.conditionRating,
          symptoms: journalData.symptoms,
          supplements: journalData.supplements,
          exercise: journalData.exercise,
          notes: journalData.notes,
        },
        recordedDate: new Date(journalData.recordedDate),
        createdAt: new Date(),
      };

      mockPrisma.healthRecord.create.mockResolvedValue(mockHealthRecord);

      const result = await HealthService.createHealthJournal(mockUserId, journalData);

      expect(mockPrisma.healthRecord.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
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

      expect(result).toEqual({
        id: mockHealthRecord.id,
        userId: mockHealthRecord.userId,
        recordType: mockHealthRecord.recordType,
        data: mockHealthRecord.data,
        recordedDate: mockHealthRecord.recordedDate,
        createdAt: mockHealthRecord.createdAt,
      });
    });
  });

  describe('getVitalSigns', () => {
    it('should retrieve vital signs with filters', async () => {
      const mockHealthRecords = [
        {
          id: 'record-1',
          userId: mockUserId,
          recordType: 'vital_sign',
          data: { type: 'blood_pressure', value: { systolic: 120, diastolic: 80 } },
          recordedDate: new Date('2024-01-01'),
          createdAt: new Date(),
          vitalSigns: [],
        },
      ];

      mockPrisma.healthRecord.findMany.mockResolvedValue(mockHealthRecords);

      const result = await HealthService.getVitalSigns(
        mockUserId,
        'blood_pressure',
        '2024-01-01',
        '2024-01-31',
        10
      );

      expect(mockPrisma.healthRecord.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          recordType: 'vital_sign',
          data: {
            path: ['type'],
            equals: 'blood_pressure',
          },
          recordedDate: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          },
        },
        orderBy: {
          recordedDate: 'desc',
        },
        take: 10,
        include: {
          vitalSigns: true,
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('record-1');
    });

    it('should retrieve vital signs without filters', async () => {
      const mockHealthRecords = [
        {
          id: 'record-1',
          userId: mockUserId,
          recordType: 'vital_sign',
          data: { type: 'heart_rate', value: 72 },
          recordedDate: new Date('2024-01-01'),
          createdAt: new Date(),
          vitalSigns: [],
        },
      ];

      mockPrisma.healthRecord.findMany.mockResolvedValue(mockHealthRecords);

      const result = await HealthService.getVitalSigns(mockUserId);

      expect(mockPrisma.healthRecord.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          recordType: 'vital_sign',
        },
        orderBy: {
          recordedDate: 'desc',
        },
        take: 50,
        include: {
          vitalSigns: true,
        },
      });

      expect(result).toHaveLength(1);
    });
  });

  describe('getHealthJournals', () => {
    it('should retrieve health journals with date filters', async () => {
      const mockHealthRecords = [
        {
          id: 'record-1',
          userId: mockUserId,
          recordType: 'health_journal',
          data: { conditionRating: 4, symptoms: { pain: 2, fatigue: 3, sleepQuality: 7 } },
          recordedDate: new Date('2024-01-01'),
          createdAt: new Date(),
        },
      ];

      mockPrisma.healthRecord.findMany.mockResolvedValue(mockHealthRecords);

      const result = await HealthService.getHealthJournals(
        mockUserId,
        '2024-01-01',
        '2024-01-31',
        20
      );

      expect(mockPrisma.healthRecord.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          recordType: 'health_journal',
          recordedDate: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          },
        },
        orderBy: {
          recordedDate: 'desc',
        },
        take: 20,
      });

      expect(result).toHaveLength(1);
    });
  });

  describe('updateHealthRecord', () => {
    it('should update health record successfully', async () => {
      const recordId = 'record-id';
      const updateData = {
        type: 'heart_rate' as const,
        value: 75,
        unit: 'bpm',
        measuredAt: '2024-01-01T11:00:00Z',
      };

      const existingRecord = {
        id: recordId,
        userId: mockUserId,
        recordType: 'vital_sign',
        data: { type: 'heart_rate', value: 72, unit: 'bpm' },
        recordedDate: new Date('2024-01-01T10:00:00Z'),
        createdAt: new Date(),
      };

      const updatedRecord = {
        ...existingRecord,
        data: { ...existingRecord.data, ...updateData },
        recordedDate: new Date(updateData.measuredAt),
      };

      mockPrisma.healthRecord.findFirst.mockResolvedValue(existingRecord);
      mockPrisma.healthRecord.update.mockResolvedValue(updatedRecord);
      mockPrisma.vitalSign.updateMany.mockResolvedValue({});

      const result = await HealthService.updateHealthRecord(mockUserId, recordId, updateData);

      expect(mockPrisma.healthRecord.findFirst).toHaveBeenCalledWith({
        where: {
          id: recordId,
          userId: mockUserId,
        },
      });

      expect(mockPrisma.healthRecord.update).toHaveBeenCalledWith({
        where: { id: recordId },
        data: {
          data: { ...existingRecord.data, ...updateData },
          recordedDate: new Date(updateData.measuredAt),
        },
      });

      expect(result.data).toEqual({ ...existingRecord.data, ...updateData });
    });

    it('should throw error when record not found', async () => {
      const recordId = 'non-existent-record';
      const updateData = { type: 'heart_rate' as const, value: 75 };

      mockPrisma.healthRecord.findFirst.mockResolvedValue(null);

      await expect(
        HealthService.updateHealthRecord(mockUserId, recordId, updateData)
      ).rejects.toThrow('건강 기록을 찾을 수 없거나 접근 권한이 없습니다');
    });
  });

  describe('deleteHealthRecord', () => {
    it('should delete health record successfully', async () => {
      const recordId = 'record-id';
      const existingRecord = {
        id: recordId,
        userId: mockUserId,
        recordType: 'vital_sign',
        data: {},
        recordedDate: new Date(),
        createdAt: new Date(),
      };

      mockPrisma.healthRecord.findFirst.mockResolvedValue(existingRecord);
      mockPrisma.healthRecord.delete.mockResolvedValue(existingRecord);

      await HealthService.deleteHealthRecord(mockUserId, recordId);

      expect(mockPrisma.healthRecord.findFirst).toHaveBeenCalledWith({
        where: {
          id: recordId,
          userId: mockUserId,
        },
      });

      expect(mockPrisma.healthRecord.delete).toHaveBeenCalledWith({
        where: { id: recordId },
      });
    });

    it('should throw error when record not found', async () => {
      const recordId = 'non-existent-record';

      mockPrisma.healthRecord.findFirst.mockResolvedValue(null);

      await expect(
        HealthService.deleteHealthRecord(mockUserId, recordId)
      ).rejects.toThrow('건강 기록을 찾을 수 없거나 접근 권한이 없습니다');
    });
  });

  describe('getVitalSignTrends', () => {
    it('should calculate vital sign trends correctly', async () => {
      const mockVitalSigns = [
        {
          id: 'record-1',
          userId: mockUserId,
          recordType: 'vital_sign',
          data: { type: 'heart_rate', value: 70 },
          recordedDate: new Date('2024-01-01'),
          createdAt: new Date(),
        },
        {
          id: 'record-2',
          userId: mockUserId,
          recordType: 'vital_sign',
          data: { type: 'heart_rate', value: 72 },
          recordedDate: new Date('2024-01-02'),
          createdAt: new Date(),
        },
        {
          id: 'record-3',
          userId: mockUserId,
          recordType: 'vital_sign',
          data: { type: 'heart_rate', value: 75 },
          recordedDate: new Date('2024-01-03'),
          createdAt: new Date(),
        },
      ];

      mockPrisma.healthRecord.findMany.mockResolvedValue(mockVitalSigns);

      const result = await HealthService.getVitalSignTrends(
        mockUserId,
        'heart_rate',
        'daily',
        30
      );

      expect(result.type).toBe('heart_rate');
      expect(result.period).toBe('daily');
      expect(result.data).toHaveLength(3);
      expect(result.statistics.min).toBe(70);
      expect(result.statistics.max).toBe(75);
      expect(result.statistics.average).toBe(72.3);
      expect(['increasing', 'stable']).toContain(result.statistics.trend);
    });

    it('should handle blood pressure trends', async () => {
      const mockVitalSigns = [
        {
          id: 'record-1',
          userId: mockUserId,
          recordType: 'vital_sign',
          data: { type: 'blood_pressure', value: { systolic: 120, diastolic: 80 } },
          recordedDate: new Date('2024-01-01'),
          createdAt: new Date(),
        },
        {
          id: 'record-2',
          userId: mockUserId,
          recordType: 'vital_sign',
          data: { type: 'blood_pressure', value: { systolic: 125, diastolic: 85 } },
          recordedDate: new Date('2024-01-02'),
          createdAt: new Date(),
        },
      ];

      mockPrisma.healthRecord.findMany.mockResolvedValue(mockVitalSigns);

      const result = await HealthService.getVitalSignTrends(
        mockUserId,
        'blood_pressure',
        'daily',
        30
      );

      expect(result.type).toBe('blood_pressure');
      expect(result.statistics.min).toBe(100); // (120+80)/2
      expect(result.statistics.max).toBe(105); // (125+85)/2
      expect(result.statistics.average).toBe(102.5);
    });
  });
});

describe('HealthService Data Validation', () => {
  it('should handle empty vital signs data', async () => {
    mockPrisma.healthRecord.findMany.mockResolvedValue([]);

    const result = await HealthService.getVitalSigns('user-id');

    expect(result).toEqual([]);
  });

  it('should handle empty health journals data', async () => {
    mockPrisma.healthRecord.findMany.mockResolvedValue([]);

    const result = await HealthService.getHealthJournals('user-id');

    expect(result).toEqual([]);
  });

  it('should handle trends with no data', async () => {
    mockPrisma.healthRecord.findMany.mockResolvedValue([]);

    const result = await HealthService.getVitalSignTrends('user-id', 'heart_rate');

    expect(result.statistics.min).toBe(0);
    expect(result.statistics.max).toBe(0);
    expect(result.statistics.average).toBe(0);
    expect(result.statistics.trend).toBe('stable');
  });
});