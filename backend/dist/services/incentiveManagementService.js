"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncentiveManagementService = void 0;
const IncentiveManagement_1 = require("../models/IncentiveManagement");
exports.IncentiveManagementService = {
    async getUserIncentiveDashboard(userId) {
        return IncentiveManagement_1.IncentiveManagementModel.getUserIncentiveDashboard(userId);
    },
    async getContributionHistory(userId, timeRange) {
        const dataTypes = ['vital_signs', 'health_records', 'medical_records', 'genomic_data', 'wearable_data'];
        const contributions = [];
        for (const dataType of dataTypes) {
            const contribution = await IncentiveManagement_1.IncentiveManagementModel.calculateDataContribution(userId, dataType, timeRange);
            if (contribution.recordCount > 0) {
                contributions.push(contribution);
            }
        }
        return contributions;
    },
    async redeemReward(userId, rewardId, pointsToRedeem) {
        const transaction = IncentiveManagement_1.IncentiveManagementModel.createIncentiveTransaction({
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
//# sourceMappingURL=incentiveManagementService.js.map