"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchParticipationService = void 0;
const ResearchParticipation_1 = require("../models/ResearchParticipation");
exports.ResearchParticipationService = {
    async matchResearchProjects(userId) {
        return ResearchParticipation_1.ResearchParticipationModel.matchResearchProjects(userId);
    },
    async getUserParticipations(userId, status) {
        return ResearchParticipation_1.ResearchParticipationModel.getUserParticipations(userId, status);
    },
    async applyForResearch(userId, researchProjectId, consentGiven) {
        return ResearchParticipation_1.ResearchParticipationModel.applyForResearch(userId, researchProjectId, consentGiven);
    },
    async getResearchFeedback(userId, participationId) {
        return ResearchParticipation_1.ResearchParticipationModel.getResearchFeedback(userId, participationId);
    },
};
//# sourceMappingURL=researchParticipationService.js.map