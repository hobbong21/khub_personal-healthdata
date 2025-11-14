import {
  ResearchParticipationModel,
  ResearchProject,
  ResearchParticipation,
} from '../models/ResearchParticipation';

export const ResearchParticipationService = {
  async matchResearchProjects(userId: string): Promise<ResearchProject[]> {
    return ResearchParticipationModel.matchResearchProjects(userId);
  },

  async getUserParticipations(
    userId: string,
    status?: string
  ): Promise<ResearchParticipation[]> {
    return ResearchParticipationModel.getUserParticipations(userId, status);
  },

  async applyForResearch(
    userId: string,
    researchProjectId: string,
    consentGiven: boolean
  ): Promise<ResearchParticipation> {
    return ResearchParticipationModel.applyForResearch(
      userId,
      researchProjectId,
      consentGiven
    );
  },

  async getResearchFeedback(
    userId: string,
    participationId: string
  ): Promise<any> {
    return ResearchParticipationModel.getResearchFeedback(userId, participationId);
  },
};