import { Request, Response } from 'express';
import { ResearchParticipationService } from '../services/researchParticipationService';

export async function getMatchedResearch(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const projects = await ResearchParticipationService.matchResearchProjects(req.user.id);
        res.json({ success: true, data: projects });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'MATCHING_FAILED', message: errorMessage } });
    }
}

export async function getResearchParticipationHistory(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { status } = req.query;
        const participations = await ResearchParticipationService.getUserParticipations(req.user.id, status as string | undefined);
        res.json({ success: true, data: participations });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'HISTORY_FETCH_FAILED', message: errorMessage } });
    }
}

export async function applyForResearch(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { researchId, consentGiven } = req.body;
        const participation = await ResearchParticipationService.applyForResearch(req.user.id, researchId, consentGiven);
        res.status(201).json({ success: true, data: participation });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'APPLICATION_FAILED', message: errorMessage } });
    }
}

export async function getResearchFeedback(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { participationId } = req.params;
        const feedback = await ResearchParticipationService.getResearchFeedback(req.user.id, participationId);
        res.json({ success: true, data: feedback });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'FEEDBACK_FETCH_FAILED', message: errorMessage } });
    }
}
