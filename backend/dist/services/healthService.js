"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const database_1 = __importDefault(require("../config/database"));
class HealthService {
    static async getHealthSummary(userId) {
        return this.getDashboardSummary(userId);
    }
    static async getHealthData(userId, options) {
        return this.getDashboardSummary(userId);
    }
    static async createVitalSign(userId, vitalSignData) {
        const healthRecord = await database_1.default.healthRecord.create({
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
        await database_1.default.vitalSign.create({
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
    static async createHealthJournal(userId, journalData) {
        const healthRecord = await database_1.default.healthRecord.create({
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
    static async getVitalSigns(userId, type, startDate, endDate, limit = 50) {
        const where = {
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
        const healthRecords = await database_1.default.healthRecord.findMany({
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
    static async getHealthJournals(userId, startDate, endDate, limit = 30) {
        const where = {
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
        const healthRecords = await database_1.default.healthRecord.findMany({
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
    static async getVitalSignTrends(userId, type, period = 'daily', days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const vitalSigns = await database_1.default.healthRecord.findMany({
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
        const groupedData = this.groupVitalSignsByPeriod(vitalSigns, period);
        const values = vitalSigns.map(record => {
            const value = record.data;
            if (type === 'blood_pressure') {
                return (value.value.systolic + value.value.diastolic) / 2;
            }
            return value.value;
        });
        const statistics = this.calculateVitalSignStatistics(values);
        return {
            type,
            period,
            data: groupedData,
            statistics,
        };
    }
    static async updateHealthRecord(userId, recordId, updateData) {
        const existingRecord = await database_1.default.healthRecord.findFirst({
            where: {
                id: recordId,
                userId,
            },
        });
        if (!existingRecord) {
            throw new Error('건강 기록을 찾을 수 없거나 접근 권한이 없습니다');
        }
        const existingData = existingRecord.data;
        const updatedData = {
            ...existingData,
            ...updateData,
        };
        const recordUpdateData = {
            data: updatedData,
        };
        if (updateData.measuredAt) {
            recordUpdateData.recordedDate = new Date(updateData.measuredAt);
        }
        else if (updateData.recordedDate) {
            recordUpdateData.recordedDate = new Date(updateData.recordedDate);
        }
        const updatedRecord = await database_1.default.healthRecord.update({
            where: { id: recordId },
            data: recordUpdateData,
        });
        if (existingRecord.recordType === 'vital_sign' && updateData.type) {
            const vitalSignUpdateData = {};
            if (updateData.type)
                vitalSignUpdateData.type = updateData.type;
            if (updateData.value !== undefined)
                vitalSignUpdateData.value = updateData.value;
            if (updateData.unit)
                vitalSignUpdateData.unit = updateData.unit;
            if (updateData.measuredAt)
                vitalSignUpdateData.measuredAt = new Date(updateData.measuredAt);
            await database_1.default.vitalSign.updateMany({
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
    static async deleteHealthRecord(userId, recordId) {
        const existingRecord = await database_1.default.healthRecord.findFirst({
            where: {
                id: recordId,
                userId,
            },
        });
        if (!existingRecord) {
            throw new Error('건강 기록을 찾을 수 없거나 접근 권한이 없습니다');
        }
        await database_1.default.healthRecord.delete({
            where: { id: recordId },
        });
    }
    static async getDashboardSummary(userId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [recentVitalSigns, recentJournals, todayRecords] = await Promise.all([
            this.getVitalSigns(userId, undefined, thirtyDaysAgo.toISOString(), undefined, 200),
            this.getHealthJournals(userId, thirtyDaysAgo.toISOString(), undefined, 30),
            database_1.default.healthRecord.findMany({
                where: {
                    userId,
                    recordedDate: {
                        gte: today,
                    },
                },
            }),
        ]);
        const weeklyVitalSigns = recentVitalSigns.filter(record => new Date(record.recordedDate) >= sevenDaysAgo);
        const weeklyJournals = recentJournals.filter(record => new Date(record.recordedDate) >= sevenDaysAgo);
        const healthMetrics = this.calculateHealthMetrics(recentVitalSigns, recentJournals, weeklyVitalSigns, weeklyJournals);
        const trends = this.analyzeTrends(recentVitalSigns, recentJournals);
        const goals = await this.calculateGoalProgress(userId, recentVitalSigns, recentJournals);
        const todaysTasks = this.generateTodaysTasks(todayRecords, recentVitalSigns, recentJournals);
        return {
            healthMetrics,
            trends,
            goals,
            todaysTasks,
        };
    }
    static calculateHealthMetrics(recentVitalSigns, recentJournals, weeklyVitalSigns, weeklyJournals) {
        const latestVitalSigns = {};
        recentVitalSigns.forEach(record => {
            const data = record.data;
            if (!latestVitalSigns[data.type] ||
                new Date(record.recordedDate) > new Date(latestVitalSigns[data.type].recordedDate)) {
                latestVitalSigns[data.type] = {
                    value: data.value,
                    unit: data.unit,
                    recordedDate: record.recordedDate,
                };
            }
        });
        const conditionRatings = recentJournals
            .map(journal => journal.data.conditionRating)
            .filter(rating => typeof rating === 'number');
        const averageCondition = conditionRatings.length > 0
            ? conditionRatings.reduce((sum, rating) => sum + rating, 0) / conditionRatings.length
            : null;
        const exerciseSessionsCount = weeklyJournals.reduce((count, journal) => {
            const data = journal.data;
            return count + (data.exercise ? data.exercise.length : 0);
        }, 0);
        return {
            latestVitalSigns,
            averageCondition: averageCondition ? Math.round(averageCondition * 10) / 10 : null,
            totalRecords: recentVitalSigns.length + recentJournals.length,
            weeklyProgress: {
                vitalSignsCount: weeklyVitalSigns.length,
                journalEntriesCount: weeklyJournals.length,
                exerciseSessionsCount,
            },
        };
    }
    static analyzeTrends(recentVitalSigns, recentJournals) {
        const weightRecords = recentVitalSigns
            .filter(record => record.data.type === 'weight')
            .sort((a, b) => new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime());
        let weightTrend = 'stable';
        if (weightRecords.length >= 2) {
            const recent = weightRecords.slice(-3);
            const earlier = weightRecords.slice(0, 3);
            if (recent.length > 0 && earlier.length > 0) {
                const recentAvg = recent.reduce((sum, r) => sum + r.data.value, 0) / recent.length;
                const earlierAvg = earlier.reduce((sum, r) => sum + r.data.value, 0) / earlier.length;
                const difference = recentAvg - earlierAvg;
                if (difference > 1)
                    weightTrend = 'increasing';
                else if (difference < -1)
                    weightTrend = 'decreasing';
            }
        }
        const conditionRecords = recentJournals
            .map(journal => ({
            rating: journal.data.conditionRating,
            date: journal.recordedDate,
        }))
            .filter(record => typeof record.rating === 'number')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let conditionTrend = 'stable';
        if (conditionRecords.length >= 4) {
            const recent = conditionRecords.slice(-2);
            const earlier = conditionRecords.slice(0, 2);
            const recentAvg = recent.reduce((sum, r) => sum + r.rating, 0) / recent.length;
            const earlierAvg = earlier.reduce((sum, r) => sum + r.rating, 0) / earlier.length;
            const difference = recentAvg - earlierAvg;
            if (difference > 0.5)
                conditionTrend = 'improving';
            else if (difference < -0.5)
                conditionTrend = 'declining';
        }
        const exerciseFrequency = recentJournals
            .slice(-7)
            .reduce((count, journal) => {
            const data = journal.data;
            return count + (data.exercise && data.exercise.length > 0 ? 1 : 0);
        }, 0);
        return {
            weightTrend,
            conditionTrend,
            exerciseFrequency,
        };
    }
    static async calculateGoalProgress(_userId, recentVitalSigns, recentJournals) {
        const goals = {};
        const weightRecords = recentVitalSigns
            .filter(record => record.data.type === 'weight')
            .sort((a, b) => new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime());
        if (weightRecords.length > 0) {
            const currentWeight = weightRecords[0].data.value;
            const targetWeight = currentWeight * 0.95;
            const progress = Math.max(0, Math.min(100, ((currentWeight - targetWeight) / (currentWeight - targetWeight)) * 100));
            goals.weightGoal = {
                target: Math.round(targetWeight * 10) / 10,
                current: Math.round(currentWeight * 10) / 10,
                progress: Math.round(progress * 10) / 10,
            };
        }
        const weeklyExerciseCount = recentJournals
            .slice(-7)
            .reduce((count, journal) => {
            const data = journal.data;
            return count + (data.exercise && data.exercise.length > 0 ? 1 : 0);
        }, 0);
        goals.exerciseGoal = {
            target: 3,
            current: weeklyExerciseCount,
            progress: Math.round((weeklyExerciseCount / 3) * 100),
        };
        return goals;
    }
    static generateTodaysTasks(todayRecords, _recentVitalSigns, recentJournals) {
        const tasks = [];
        const todayVitalSigns = todayRecords.filter(record => record.recordType === 'vital_sign');
        if (todayVitalSigns.length === 0) {
            tasks.push({
                type: 'vital_sign',
                description: '오늘의 바이탈 사인 측정하기',
                completed: false,
                priority: 'high',
            });
        }
        const todayJournals = todayRecords.filter(record => record.recordType === 'health_journal');
        if (todayJournals.length === 0) {
            tasks.push({
                type: 'journal',
                description: '오늘의 건강 일지 작성하기',
                completed: false,
                priority: 'medium',
            });
        }
        const recentExercise = recentJournals
            .slice(-3)
            .some(journal => {
            const data = journal.data;
            return data.exercise && data.exercise.length > 0;
        });
        if (!recentExercise) {
            tasks.push({
                type: 'exercise',
                description: '30분 이상 운동하기',
                completed: false,
                priority: 'medium',
            });
        }
        return tasks;
    }
    static groupVitalSignsByPeriod(vitalSigns, period) {
        const grouped = {};
        vitalSigns.forEach((record) => {
            const date = new Date(record.recordedDate);
            let key;
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
            const values = records.map((r) => {
                if (typeof r.value === 'object' && r.value.systolic) {
                    return (r.value.systolic + r.value.diastolic) / 2;
                }
                return r.value;
            });
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;
            return {
                date,
                value: records[0].value,
                average: Math.round(average * 10) / 10,
            };
        }).sort((a, b) => a.date.localeCompare(b.date));
    }
    static calculateVitalSignStatistics(values) {
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
        const threshold = average * 0.05;
        let trend;
        if (difference > threshold) {
            trend = 'increasing';
        }
        else if (difference < -threshold) {
            trend = 'decreasing';
        }
        else {
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
exports.HealthService = HealthService;
//# sourceMappingURL=healthService.js.map