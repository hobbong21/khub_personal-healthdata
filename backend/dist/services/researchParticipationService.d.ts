import { ResearchProject, ResearchParticipation } from '../models/ResearchParticipation';
export declare const ResearchParticipationService: {
    matchResearchProjects(userId: string): Promise<ResearchProject[]>;
    getUserParticipations(userId: string, status?: string): Promise<ResearchParticipation[]>;
    applyForResearch(userId: string, researchProjectId: string, consentGiven: boolean): Promise<ResearchParticipation>;
    getResearchFeedback(userId: string, participationId: string): Promise<any>;
};
//# sourceMappingURL=researchParticipationService.d.ts.map