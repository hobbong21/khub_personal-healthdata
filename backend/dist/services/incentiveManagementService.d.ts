import { IncentiveTransaction, DataContribution } from '../models/IncentiveManagement';
export declare const IncentiveManagementService: {
    getUserIncentiveDashboard(userId: string): Promise<any>;
    getContributionHistory(userId: string, timeRange: {
        start: Date;
        end: Date;
    }): Promise<DataContribution[]>;
    redeemReward(userId: string, rewardId: string, pointsToRedeem: number): Promise<IncentiveTransaction>;
};
//# sourceMappingURL=incentiveManagementService.d.ts.map