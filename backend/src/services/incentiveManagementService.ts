import { IncentiveManagementModel, IncentiveTransaction, DataContribution } from '../models/IncentiveManagement';

export const IncentiveManagementService = {
  async getUserIncentiveDashboard(userId: string): Promise<any> {
    return IncentiveManagementModel.getUserIncentiveDashboard(userId);
  },

  async getContributionHistory(userId: string, timeRange: { start: Date; end: Date }): Promise<DataContribution[]> {
    const dataTypes = ['vital_signs', 'health_records', 'medical_records', 'genomic_data', 'wearable_data'];
    const contributions: DataContribution[] = [];

    for (const dataType of dataTypes) {
      const contribution = await IncentiveManagementModel.calculateDataContribution(userId, dataType, timeRange);
      if (contribution.recordCount > 0) {
        contributions.push(contribution);
      }
    }

    return contributions;
  },

  async redeemReward(
    userId: string, 
    rewardId: string, 
    pointsToRedeem: number
  ): Promise<IncentiveTransaction> {
    // In a real application, you would first validate the rewardId and points
    // against an available rewards list.

    // Create a redemption transaction
    const transaction = (IncentiveManagementModel as any).createIncentiveTransaction({
      userId,
      transactionType: 'redeem',
      points: pointsToRedeem,
      description: `Redeemed reward: ${rewardId}`,
      referenceType: 'reward',
      referenceId: rewardId,
    });

    return transaction;
  },
};