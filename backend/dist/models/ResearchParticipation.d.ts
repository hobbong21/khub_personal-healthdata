export interface ResearchParticipation {
    id: string;
    userId: string;
    studyId: string;
    studyTitle: string;
    studyType: string;
    participationDate: Date;
    status: 'pending' | 'active' | 'completed' | 'withdrawn';
    consentGiven: boolean;
    dataShared?: any;
    incentivesEarned: number;
    completionDate?: Date;
    withdrawalReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ResearchProject {
    id: string;
    title: string;
    description: string;
    institution: string;
    principalInvestigator: string;
    participationType: 'data_sharing' | 'clinical_trial' | 'survey';
    eligibilityCriteria: any;
    expectedDuration: number;
    incentivePoints: number;
    maxParticipants?: number;
    currentParticipants: number;
    status: 'recruiting' | 'active' | 'completed' | 'suspended';
    startDate: Date;
    endDate?: Date;
    createdAt: Date;
}
export interface UserIncentive {
    id: string;
    userId: string;
    incentiveType: string;
    pointsEarned: number;
    pointsRedeemed: number;
    description: string;
    earnedDate: Date;
    redeemedDate?: Date;
    expiresAt?: Date;
    status: string;
    metadata?: any;
    createdAt: Date;
}
export declare class ResearchParticipationModel {
    static matchResearchProjects(userId: string): Promise<ResearchProject[]>;
    private static getActiveResearchProjects;
    private static analyzeUserProfile;
    private static extractMedicalConditions;
    private static calculateMatchScore;
    static applyForResearch(userId: string, researchProjectId: string, consentGiven: boolean): Promise<ResearchParticipation>;
    static updateParticipationStatus(participationId: string, status: 'active' | 'completed' | 'withdrawn', startDate?: Date, endDate?: Date): Promise<ResearchParticipation>;
    static getUserParticipations(userId: string, status?: string): Promise<ResearchParticipation[]>;
    static getResearchFeedback(userId: string, participationId: string): Promise<{
        participation: ResearchParticipation;
        feedback: any;
        results: any;
    }>;
    private static calculateDataContribution;
    static awardIncentivePoints(userId: string, incentiveType: string, points: number, description: string, referenceId?: string): Promise<UserIncentive>;
    static getUserIncentives(userId: string): Promise<{
        totalPoints: number;
        availablePoints: number;
        redeemedPoints: number;
        incentives: UserIncentive[];
    }>;
    static redeemIncentivePoints(userId: string, points: number, redeemType: string, description: string): Promise<{
        success: boolean;
        remainingPoints: number;
        transaction: any;
    }>;
    static getResearchStats(): Promise<{
        totalParticipations: number;
        activeParticipations: number;
        completedParticipations: number;
        totalIncentivesAwarded: number;
        participationByType: Record<string, number>;
        monthlyParticipations: Array<{
            month: string;
            count: number;
        }>;
    }>;
    private static calculateMonthlyStats;
}
//# sourceMappingURL=ResearchParticipation.d.ts.map