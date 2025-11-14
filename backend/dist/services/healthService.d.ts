import { VitalSignRequest, HealthJournalRequest, HealthRecordResponse } from '../types/health';
export declare class HealthService {
    static getHealthSummary(userId: string): Promise<any>;
    static getHealthData(userId: string, options: any): Promise<any>;
    static createVitalSign(userId: string, vitalSignData: VitalSignRequest): Promise<HealthRecordResponse>;
    static createHealthJournal(userId: string, journalData: HealthJournalRequest): Promise<HealthRecordResponse>;
    static getVitalSigns(userId: string, type?: string, startDate?: string, endDate?: string, limit?: number): Promise<HealthRecordResponse[]>;
    static getHealthJournals(userId: string, startDate?: string, endDate?: string, limit?: number): Promise<HealthRecordResponse[]>;
    static getVitalSignTrends(userId: string, type: string, period?: 'daily' | 'weekly' | 'monthly', days?: number): Promise<{
        type: string;
        period: string;
        data: Array<{
            date: string;
            value: number | {
                systolic: number;
                diastolic: number;
            };
            average?: number;
        }>;
        statistics: {
            min: number;
            max: number;
            average: number;
            trend: 'increasing' | 'decreasing' | 'stable';
        };
    }>;
    static updateHealthRecord(userId: string, recordId: string, updateData: any): Promise<HealthRecordResponse>;
    static deleteHealthRecord(userId: string, recordId: string): Promise<void>;
    static getDashboardSummary(userId: string): Promise<{
        healthMetrics: {
            latestVitalSigns: {
                [key: string]: any;
            };
            averageCondition: number | null;
            totalRecords: number;
            weeklyProgress: {
                vitalSignsCount: number;
                journalEntriesCount: number;
                exerciseSessionsCount: number;
            };
        };
        trends: {
            weightTrend: 'increasing' | 'decreasing' | 'stable';
            conditionTrend: 'improving' | 'declining' | 'stable';
            exerciseFrequency: number;
        };
        goals: {
            weightGoal?: {
                target: number;
                current: number;
                progress: number;
            };
            exerciseGoal?: {
                target: number;
                current: number;
                progress: number;
            };
        };
        todaysTasks: Array<{
            type: 'vital_sign' | 'exercise' | 'medication' | 'journal';
            description: string;
            completed: boolean;
            priority: 'high' | 'medium' | 'low';
        }>;
    }>;
    private static calculateHealthMetrics;
    private static analyzeTrends;
    private static calculateGoalProgress;
    private static generateTodaysTasks;
    private static groupVitalSignsByPeriod;
    private static calculateVitalSignStatistics;
}
//# sourceMappingURL=healthService.d.ts.map