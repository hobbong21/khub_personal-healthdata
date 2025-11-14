export interface IncentiveRule {
    id: string;
    name: string;
    description: string;
    incentiveType: string;
    triggerCondition: any;
    pointsAwarded: number;
    maxPointsPerDay?: number;
    maxPointsPerMonth?: number;
    isActive: boolean;
    validFrom: Date;
    validUntil?: Date;
    createdAt: Date;
}
export interface DataContribution {
    userId: string;
    dataType: string;
    recordCount: number;
    qualityScore: number;
    contributionDate: Date;
    pointsEarned: number;
}
export interface IncentiveTransaction {
    id: string;
    userId: string;
    transactionType: 'earn' | 'redeem' | 'expire' | 'bonus';
    points: number;
    description: string;
    referenceType?: string;
    referenceId?: string;
    metadata?: any;
    createdAt: Date;
}
export declare class IncentiveManagementModel {
    static calculateDataContribution(userId: string, dataType: string, timeRange: {
        start: Date;
        end: Date;
    }): Promise<DataContribution>;
    private static calculateVitalSignsQuality;
    private static calculateHealthRecordsQuality;
    private static calculateMedicalRecordsQuality;
    private static calculateGenomicDataQuality;
    private static calculateWearableDataQuality;
    private static isReasonableVitalSign;
    private static isReasonableWearableValue;
    private static calculateContributionPoints;
    static processIncentiveRules(userId: string): Promise<IncentiveTransaction[]>;
    private static getActiveIncentiveRules;
    private static evaluateIncentiveRule;
    private static evaluateDailyActivity;
    private static evaluateWeeklyGoal;
    private static evaluateQualityBonus;
    private static evaluateMilestone;
    private static checkIncentiveLimits;
    private static getTotalPointsInPeriod;
    private static createIncentiveTransaction;
    static processIncentivePayments(): Promise<{
        processedUsers: number;
        totalPointsAwarded: number;
        transactions: IncentiveTransaction[];
    }>;
    static getUserIncentiveDashboard(userId: string): Promise<{
        currentBalance: number;
        totalEarned: number;
        totalRedeemed: number;
        recentTransactions: IncentiveTransaction[];
        availableRewards: any[];
        achievements: any[];
        nextMilestones: any[];
    }>;
    private static getAvailableRewards;
    private static getUserAchievements;
    private static getNextMilestones;
    static getIncentiveStats(): Promise<{
        totalPointsIssued: number;
        totalPointsRedeemed: number;
        activeUsers: number;
        topContributors: any[];
        popularRewards: any[];
        monthlyTrends: any[];
    }>;
}
//# sourceMappingURL=IncentiveManagement.d.ts.map