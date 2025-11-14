"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatchedResearch = getMatchedResearch;
exports.getResearchParticipationHistory = getResearchParticipationHistory;
exports.applyForResearch = applyForResearch;
exports.getResearchFeedback = getResearchFeedback;
const researchParticipationService_1 = require("../services/researchParticipationService");
async function getMatchedResearch(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const projects = await researchParticipationService_1.ResearchParticipationService.matchResearchProjects(req.user.id);
        res.json({ success: true, data: projects });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'MATCHING_FAILED', message: errorMessage } });
    }
}
async function getResearchParticipationHistory(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { status } = req.query;
        const participations = await researchParticipationService_1.ResearchParticipationService.getUserParticipations(req.user.id, status);
        res.json({ success: true, data: participations });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'HISTORY_FETCH_FAILED', message: errorMessage } });
    }
}
async function applyForResearch(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { researchId, consentGiven } = req.body;
        const participation = await researchParticipationService_1.ResearchParticipationService.applyForResearch(req.user.id, researchId, consentGiven);
        res.status(201).json({ success: true, data: participation });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'APPLICATION_FAILED', message: errorMessage } });
    }
}
async function getResearchFeedback(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { participationId } = req.params;
        const feedback = await researchParticipationService_1.ResearchParticipationService.getResearchFeedback(req.user.id, participationId);
        res.json({ success: true, data: feedback });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'FEEDBACK_FETCH_FAILED', message: errorMessage } });
    }
}
//# sourceMappingURL=researchParticipationController.js.map