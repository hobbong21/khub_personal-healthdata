"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncentiveManagementModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class IncentiveManagementModel {
    static async calculateDataContribution(userId, dataType, timeRange) {
        let recordCount = 0;
        let qualityScore = 0;
        switch (dataType) {
            case 'vital_signs':
                const vitalSigns = await database_1.default.vitalSign.findMany({
                    where: {
                        userId,
                        measuredAt: {
                            gte: timeRange.start,
                            lte: timeRange.end,
                        },
                    },
                });
                recordCount = vitalSigns.length;
                qualityScore = this.calculateVitalSignsQuality(vitalSigns);
                break;
            case 'health_records':
                const healthRecords = await database_1.default.healthRecord.findMany({
                    where: {
                        userId,
                        recordedDate: {
                            gte: timeRange.start,
                            lte: timeRange.end,
                        },
                    },
                });
                recordCount = healthRecords.length;
                qualityScore = this.calculateHealthRecordsQuality(healthRecords);
                break;
            case 'medical_records':
                const medicalRecords = await database_1.default.medicalRecord.findMany({
                    where: {
                        userId,
                        visitDate: {
                            gte: timeRange.start,
                            lte: timeRange.end,
                        },
                    },
                });
                recordCount = medicalRecords.length;
                qualityScore = this.calculateMedicalRecordsQuality(medicalRecords);
                break;
            case 'genomic_data':
                const genomicData = await database_1.default.genomicData.findMany({
                    where: {
                        userId,
                        uploadedAt: {
                            gte: timeRange.start,
                            lte: timeRange.end,
                        },
                    },
                });
                recordCount = genomicData.length;
                qualityScore = this.calculateGenomicDataQuality(genomicData);
                break;
            case 'wearable_data':
                const wearableData = await database_1.default.wearableDataPoint.findMany({
                    where: {
                        userId,
                        recordedAt: {
                            gte: timeRange.start,
                            lte: timeRange.end,
                        },
                    },
                });
                recordCount = wearableData.length;
                qualityScore = this.calculateWearableDataQuality(wearableData);
                break;
            default:
                recordCount = 0;
                qualityScore = 0;
        }
        const pointsEarned = this.calculateContributionPoints(dataType, recordCount, qualityScore);
        return {
            userId,
            dataType,
            recordCount,
            qualityScore,
            contributionDate: new Date(),
            pointsEarned,
        };
    }
    static calculateVitalSignsQuality(vitalSigns) {
        if (vitalSigns.length === 0)
            return 0;
        let qualityScore = 0;
        let totalChecks = 0;
        vitalSigns.forEach(vs => {
            totalChecks += 4;
            if (vs.value !== null && vs.value !== undefined) {
                qualityScore += 25;
            }
            const hour = new Date(vs.measuredAt).getHours();
            if (hour >= 6 && hour <= 22) {
                qualityScore += 25;
            }
            if (this.isReasonableVitalSign(vs.type, vs.value)) {
                qualityScore += 25;
            }
            if (vs.unit) {
                qualityScore += 25;
            }
        });
        return totalChecks > 0 ? qualityScore / totalChecks : 0;
    }
    static calculateHealthRecordsQuality(healthRecords) {
        if (healthRecords.length === 0)
            return 0;
        let qualityScore = 0;
        let totalChecks = 0;
        healthRecords.forEach(record => {
            totalChecks += 3;
            if (record.data && Object.keys(record.data).length > 0) {
                qualityScore += 40;
            }
            if (record.recordType) {
                qualityScore += 30;
            }
            if (record.recordedDate && new Date(record.recordedDate) <= new Date()) {
                qualityScore += 30;
            }
        });
        return totalChecks > 0 ? qualityScore / totalChecks : 0;
    }
    static calculateMedicalRecordsQuality(medicalRecords) {
        if (medicalRecords.length === 0)
            return 0;
        let qualityScore = 0;
        let totalChecks = 0;
        medicalRecords.forEach(record => {
            totalChecks += 5;
            if (record.hospitalName)
                qualityScore += 20;
            if (record.diagnosisCode)
                qualityScore += 20;
            if (record.diagnosisDescription)
                qualityScore += 20;
            if (record.doctorNotes)
                qualityScore += 20;
            if (record.visitDate && new Date(record.visitDate) <= new Date()) {
                qualityScore += 20;
            }
        });
        return totalChecks > 0 ? qualityScore / totalChecks : 0;
    }
    static calculateGenomicDataQuality(genomicData) {
        if (genomicData.length === 0)
            return 0;
        let qualityScore = 0;
        let totalChecks = 0;
        genomicData.forEach(data => {
            totalChecks += 3;
            if (data.snpData && Object.keys(data.snpData).length > 100000) {
                qualityScore += 40;
            }
            else if (data.snpData && Object.keys(data.snpData).length > 10000) {
                qualityScore += 20;
            }
            if (data.analysisResults && Object.keys(data.analysisResults).length > 0) {
                qualityScore += 30;
            }
            if (data.sourcePlatform) {
                qualityScore += 30;
            }
        });
        return totalChecks > 0 ? qualityScore / totalChecks : 0;
    }
    static calculateWearableDataQuality(wearableData) {
        if (wearableData.length === 0)
            return 0;
        let qualityScore = 0;
        let totalChecks = 0;
        const dataByType = wearableData.reduce((acc, data) => {
            if (!acc[data.dataType])
                acc[data.dataType] = [];
            acc[data.dataType].push(data);
            return acc;
        }, {});
        Object.keys(dataByType).forEach(dataType => {
            const typeData = dataByType[dataType];
            totalChecks += 2;
            if (typeData.length > 1) {
                const intervals = [];
                for (let i = 1; i < typeData.length; i++) {
                    const interval = new Date(typeData[i].recordedAt).getTime() - new Date(typeData[i - 1].recordedAt).getTime();
                    intervals.push(interval);
                }
                const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
                const consistency = intervals.filter(interval => Math.abs(interval - avgInterval) < avgInterval * 0.5).length / intervals.length;
                qualityScore += consistency * 50;
            }
            const reasonableValues = typeData.filter(data => this.isReasonableWearableValue(dataType, data.value)).length;
            qualityScore += (reasonableValues / typeData.length) * 50;
        });
        return totalChecks > 0 ? qualityScore / totalChecks : 0;
    }
    static isReasonableVitalSign(type, value) {
        switch (type) {
            case 'heart_rate':
                return typeof value === 'number' && value >= 30 && value <= 220;
            case 'blood_pressure':
                return value && value.systolic >= 70 && value.systolic <= 250 &&
                    value.diastolic >= 40 && value.diastolic <= 150;
            case 'temperature':
                return typeof value === 'number' && value >= 35.0 && value <= 42.0;
            case 'oxygen_saturation':
                return typeof value === 'number' && value >= 70 && value <= 100;
            default:
                return true;
        }
    }
    static isReasonableWearableValue(dataType, value) {
        switch (dataType) {
            case 'steps':
                return typeof value === 'number' && value >= 0 && value <= 50000;
            case 'calories':
                return typeof value === 'number' && value >= 0 && value <= 10000;
            case 'distance':
                return typeof value === 'number' && value >= 0 && value <= 100;
            case 'sleep_duration':
                return typeof value === 'number' && value >= 0 && value <= 24;
            default:
                return true;
        }
    }
    static calculateContributionPoints(dataType, recordCount, qualityScore) {
        const basePoints = {
            vital_signs: 2,
            health_records: 5,
            medical_records: 10,
            genomic_data: 50,
            wearable_data: 1,
        };
        const base = basePoints[dataType] || 1;
        let points = base * recordCount * (qualityScore / 100);
        if (qualityScore >= 90) {
            points *= 1.5;
        }
        else if (qualityScore >= 80) {
            points *= 1.2;
        }
        if (recordCount >= 100) {
            points *= 1.3;
        }
        else if (recordCount >= 50) {
            points *= 1.1;
        }
        return Math.round(points);
    }
    static async processIncentiveRules(userId) {
        const transactions = [];
        const activeRules = await this.getActiveIncentiveRules();
        for (const rule of activeRules) {
            const earnedPoints = await this.evaluateIncentiveRule(userId, rule);
            if (earnedPoints > 0) {
                const canAward = await this.checkIncentiveLimits(userId, rule, earnedPoints);
                if (canAward) {
                    const transaction = await this.createIncentiveTransaction({
                        userId,
                        transactionType: 'earn',
                        points: earnedPoints,
                        description: `${rule.name}: ${rule.description}`,
                        referenceType: 'incentive_rule',
                        referenceId: rule.id,
                        metadata: { ruleId: rule.id, ruleName: rule.name },
                    });
                    transactions.push(transaction);
                }
            }
        }
        return transactions;
    }
    static async getActiveIncentiveRules() {
        const now = new Date();
        return [
            {
                id: 'daily_vitals',
                name: '일일 바이탈 사인 기록',
                description: '하루에 3회 이상 바이탈 사인 기록 시 보너스',
                incentiveType: 'daily_activity',
                triggerCondition: {
                    dataType: 'vital_signs',
                    minRecords: 3,
                    timeWindow: 'daily',
                },
                pointsAwarded: 50,
                maxPointsPerDay: 50,
                isActive: true,
                validFrom: new Date('2024-01-01'),
                createdAt: new Date('2024-01-01'),
            },
            {
                id: 'weekly_exercise',
                name: '주간 운동 목표 달성',
                description: '주 5회 이상 운동 기록 시 보너스',
                incentiveType: 'weekly_goal',
                triggerCondition: {
                    dataType: 'exercise_log',
                    minRecords: 5,
                    timeWindow: 'weekly',
                },
                pointsAwarded: 200,
                maxPointsPerMonth: 800,
                isActive: true,
                validFrom: new Date('2024-01-01'),
                createdAt: new Date('2024-01-01'),
            },
            {
                id: 'data_quality_bonus',
                name: '고품질 데이터 기여',
                description: '데이터 품질 점수 90점 이상 달성 시 보너스',
                incentiveType: 'quality_bonus',
                triggerCondition: {
                    qualityThreshold: 90,
                    timeWindow: 'monthly',
                },
                pointsAwarded: 500,
                maxPointsPerMonth: 1500,
                isActive: true,
                validFrom: new Date('2024-01-01'),
                createdAt: new Date('2024-01-01'),
            },
            {
                id: 'research_participation',
                name: '연구 참여 완료',
                description: '연구 프로젝트 참여 완료 시 보너스',
                incentiveType: 'milestone',
                triggerCondition: {
                    eventType: 'research_completed',
                },
                pointsAwarded: 1000,
                isActive: true,
                validFrom: new Date('2024-01-01'),
                createdAt: new Date('2024-01-01'),
            },
        ];
    }
    static async evaluateIncentiveRule(userId, rule) {
        const condition = rule.triggerCondition;
        switch (rule.incentiveType) {
            case 'daily_activity':
                return await this.evaluateDailyActivity(userId, condition);
            case 'weekly_goal':
                return await this.evaluateWeeklyGoal(userId, condition);
            case 'quality_bonus':
                return await this.evaluateQualityBonus(userId, condition);
            case 'milestone':
                return await this.evaluateMilestone(userId, condition);
            default:
                return 0;
        }
    }
    static async evaluateDailyActivity(userId, condition) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        if (condition.dataType === 'vital_signs') {
            const count = await database_1.default.vitalSign.count({
                where: {
                    userId,
                    measuredAt: {
                        gte: startOfDay,
                        lt: endOfDay,
                    },
                },
            });
            return count >= condition.minRecords ? 1 : 0;
        }
        return 0;
    }
    static async evaluateWeeklyGoal(userId, condition) {
        const today = new Date();
        const startOfWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
        const endOfWeek = new Date(startOfWeek.getTime() + (7 * 24 * 60 * 60 * 1000));
        const exerciseCount = await database_1.default.healthRecord.count({
            where: {
                userId,
                recordType: 'exercise',
                recordedDate: {
                    gte: startOfWeek,
                    lt: endOfWeek,
                },
            },
        });
        return exerciseCount >= condition.minRecords ? 1 : 0;
    }
    static async evaluateQualityBonus(userId, condition) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const monthlyContribution = await this.calculateDataContribution(userId, 'vital_signs', { start: startOfMonth, end: endOfMonth });
        return monthlyContribution.qualityScore >= condition.qualityThreshold ? 1 : 0;
    }
    static async evaluateMilestone(userId, condition) {
        if (condition.eventType === 'research_completed') {
            const recentCompletion = await database_1.default.researchParticipation.findFirst({
                where: {
                    userId,
                    status: 'completed',
                    participationEndDate: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            });
            return recentCompletion ? 1 : 0;
        }
        return 0;
    }
    static async checkIncentiveLimits(userId, rule, points) {
        const today = new Date();
        if (rule.maxPointsPerDay) {
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const dailyPoints = await this.getTotalPointsInPeriod(userId, rule.id, startOfDay, today);
            if (dailyPoints + points > rule.maxPointsPerDay) {
                return false;
            }
        }
        if (rule.maxPointsPerMonth) {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthlyPoints = await this.getTotalPointsInPeriod(userId, rule.id, startOfMonth, today);
            if (monthlyPoints + points > rule.maxPointsPerMonth) {
                return false;
            }
        }
        return true;
    }
    static async getTotalPointsInPeriod(userId, ruleId, startDate, endDate) {
        const transactions = await database_1.default.userIncentive.findMany({
            where: {
                userId,
                earnedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        return transactions.reduce((sum, transaction) => sum + transaction.pointsEarned, 0);
    }
    static async createIncentiveTransaction(data) {
        const transaction = await database_1.default.userIncentive.create({
            data: {
                userId: data.userId,
                incentiveType: data.referenceType || 'general',
                pointsEarned: data.transactionType === 'earn' || data.transactionType === 'bonus' ? data.points : 0,
                pointsRedeemed: data.transactionType === 'redeem' ? data.points : 0,
                description: data.description,
                referenceId: data.referenceId,
            },
        });
        return {
            id: transaction.id,
            userId: transaction.userId,
            transactionType: data.transactionType,
            points: data.points,
            description: transaction.description,
            referenceType: data.referenceType,
            referenceId: data.referenceId,
            metadata: data.metadata,
            createdAt: transaction.earnedAt,
        };
    }
    static async processIncentivePayments() {
        const allUsers = await database_1.default.user.findMany({
            select: { id: true },
        });
        let totalPointsAwarded = 0;
        const allTransactions = [];
        for (const user of allUsers) {
            try {
                const userTransactions = await this.processIncentiveRules(user.id);
                allTransactions.push(...userTransactions);
                const userPoints = userTransactions.reduce((sum, t) => sum + t.points, 0);
                totalPointsAwarded += userPoints;
            }
            catch (error) {
                console.error(`Error processing incentives for user ${user.id}:`, error);
            }
        }
        return {
            processedUsers: allUsers.length,
            totalPointsAwarded,
            transactions: allTransactions,
        };
    }
    static async getUserIncentiveDashboard(userId) {
        const incentives = await database_1.default.userIncentive.findMany({
            where: { userId },
            orderBy: { earnedAt: 'desc' },
        });
        const totalEarned = incentives.reduce((sum, i) => sum + i.pointsEarned, 0);
        const totalRedeemed = incentives.reduce((sum, i) => sum + i.pointsRedeemed, 0);
        const currentBalance = totalEarned - totalRedeemed;
        const recentTransactions = incentives.slice(0, 10).map(i => ({
            id: i.id,
            userId: i.userId,
            transactionType: i.pointsEarned > 0 ? 'earn' : 'redeem',
            points: i.pointsEarned > 0 ? i.pointsEarned : i.pointsRedeemed,
            description: i.description,
            createdAt: i.earnedAt,
        }));
        const availableRewards = await this.getAvailableRewards(currentBalance);
        const achievements = await this.getUserAchievements(userId);
        const nextMilestones = await this.getNextMilestones(userId);
        return {
            currentBalance,
            totalEarned,
            totalRedeemed,
            recentTransactions,
            availableRewards,
            achievements,
            nextMilestones,
        };
    }
    static async getAvailableRewards(currentBalance) {
        const allRewards = [
            { id: 'coffee', name: '커피 쿠폰', points: 100, category: 'food' },
            { id: 'health_checkup', name: '건강검진 할인', points: 500, category: 'healthcare' },
            { id: 'fitness_tracker', name: '피트니스 트래커', points: 1000, category: 'device' },
            { id: 'gift_card', name: '기프트카드 10,000원', points: 300, category: 'gift' },
            { id: 'premium_subscription', name: '프리미엄 구독 1개월', points: 800, category: 'service' },
        ];
        return allRewards.filter(reward => reward.points <= currentBalance);
    }
    static async getUserAchievements(userId) {
        return [
            {
                id: 'first_week',
                name: '첫 주 완주',
                description: '7일 연속 건강 데이터 기록',
                earnedAt: '2024-01-07',
                points: 100,
            },
            {
                id: 'data_contributor',
                name: '데이터 기여자',
                description: '총 1000개 이상의 건강 데이터 기록',
                earnedAt: '2024-02-15',
                points: 500,
            },
        ];
    }
    static async getNextMilestones(userId) {
        return [
            {
                id: 'monthly_champion',
                name: '월간 챔피언',
                description: '한 달 동안 매일 건강 데이터 기록',
                progress: 23,
                target: 30,
                reward: 1000,
            },
            {
                id: 'quality_master',
                name: '품질 마스터',
                description: '데이터 품질 점수 95점 이상 달성',
                progress: 87,
                target: 95,
                reward: 800,
            },
        ];
    }
    static async getIncentiveStats() {
        const allIncentives = await database_1.default.userIncentive.findMany();
        const totalPointsIssued = allIncentives.reduce((sum, i) => sum + i.pointsEarned, 0);
        const totalPointsRedeemed = allIncentives.reduce((sum, i) => sum + i.pointsRedeemed, 0);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const activeUsers = await database_1.default.userIncentive.groupBy({
            by: ['userId'],
            where: {
                earnedAt: { gte: thirtyDaysAgo },
            },
        });
        const topContributors = await database_1.default.userIncentive.groupBy({
            by: ['userId'],
            _sum: { pointsEarned: true },
            orderBy: { _sum: { pointsEarned: 'desc' } },
            take: 10,
        });
        return {
            totalPointsIssued,
            totalPointsRedeemed,
            activeUsers: activeUsers.length,
            topContributors: topContributors.map(tc => ({
                userId: tc.userId,
                totalPoints: tc._sum.pointsEarned || 0,
            })),
            popularRewards: [],
            monthlyTrends: [],
        };
    }
}
exports.IncentiveManagementModel = IncentiveManagementModel;
//# sourceMappingURL=IncentiveManagement.js.map