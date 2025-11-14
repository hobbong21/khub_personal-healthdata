"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelehealthIntegrationModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class TelehealthIntegrationModel {
    static async createIntegration(integrationData) {
        const integration = await database_1.default.telehealthIntegration.create({
            data: {
                userId: integrationData.userId,
                platformName: integrationData.platformName,
                platformId: integrationData.platformUserId || 'default',
                integrationConfig: integrationData.integrationSettings,
                isActive: true,
            },
        });
        return integration;
    }
    static async createSession(sessionData) {
        const session = await database_1.default.telehealthSession.create({
            data: {
                telehealthIntegrationId: sessionData.telehealthIntegrationId,
                sessionId: sessionData.sessionId,
                doctorName: sessionData.doctorName,
                specialty: sessionData.specialty,
                sessionType: sessionData.sessionType,
                scheduledTime: sessionData.scheduledTime,
                status: 'scheduled',
                followUpRequired: false,
            },
        });
        return session;
    }
    static async getUserIntegrations(userId) {
        const integrations = await database_1.default.telehealthIntegration.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return integrations;
    }
    static async getUserSessions(userId, status, limit = 50) {
        const integrations = await database_1.default.telehealthIntegration.findMany({
            where: { userId },
            select: { id: true }
        });
        const integrationIds = integrations.map(i => i.id);
        const sessions = await database_1.default.telehealthSession.findMany({
            where: {
                telehealthIntegrationId: { in: integrationIds },
                ...(status && { status }),
            },
            orderBy: { scheduledTime: 'desc' },
            take: limit,
        });
        return sessions;
    }
    static async updateSessionStatus(sessionId, status, updateData) {
        const session = await database_1.default.telehealthSession.update({
            where: { id: sessionId },
            data: {
                status,
                ...(updateData?.actualStartTime && { actualStartTime: updateData.actualStartTime }),
                ...(updateData?.actualEndTime && { actualEndTime: updateData.actualEndTime }),
                ...(updateData?.sessionNotes && { sessionNotes: updateData.sessionNotes }),
            },
        });
        return session;
    }
    static async getUpcomingSessions(userId) {
        const now = new Date();
        const integrations = await database_1.default.telehealthIntegration.findMany({
            where: { userId },
            select: { id: true }
        });
        const integrationIds = integrations.map(i => i.id);
        const sessions = await database_1.default.telehealthSession.findMany({
            where: {
                telehealthIntegrationId: { in: integrationIds },
                status: 'scheduled',
                scheduledTime: {
                    gte: now,
                },
            },
            orderBy: { scheduledTime: 'asc' },
            take: 10,
        });
        return sessions;
    }
    static async deactivateIntegration(integrationId) {
        const integration = await database_1.default.telehealthIntegration.update({
            where: { id: integrationId },
            data: { isActive: false },
        });
        return integration;
    }
    static async generateSessionUrl(sessionId, platformName, integrationSettings) {
        switch (platformName.toLowerCase()) {
            case 'zoom_healthcare':
                return this.generateZoomHealthcareUrl(sessionId, integrationSettings);
            case 'teladoc':
                return this.generateTeladocUrl(sessionId, integrationSettings);
            case 'amwell':
                return this.generateAmwellUrl(sessionId, integrationSettings);
            default:
                return `https://telehealth-platform.com/session/${sessionId}`;
        }
    }
    static async generateZoomHealthcareUrl(sessionId, settings) {
        const meetingId = `zoom-${sessionId}-${Date.now()}`;
        return `https://zoom.us/j/${meetingId}?pwd=${settings.password || 'default'}`;
    }
    static async generateTeladocUrl(sessionId, settings) {
        return `https://teladoc.com/session/${sessionId}?token=${settings.apiToken}`;
    }
    static async generateAmwellUrl(sessionId, settings) {
        return `https://amwell.com/visit/${sessionId}?auth=${settings.authToken}`;
    }
    static async syncMedicalRecords(sessionId, platformName, integrationSettings) {
        try {
            const session = await database_1.default.telehealthSession.findUnique({
                where: { id: sessionId },
            });
            if (!session) {
                throw new Error('세션을 찾을 수 없습니다.');
            }
            let syncedData;
            switch (platformName.toLowerCase()) {
                case 'zoom_healthcare':
                    syncedData = await this.syncZoomHealthcareRecords(session, integrationSettings);
                    break;
                case 'teladoc':
                    syncedData = await this.syncTeladocRecords(session, integrationSettings);
                    break;
                case 'amwell':
                    syncedData = await this.syncAmwellRecords(session, integrationSettings);
                    break;
                default:
                    syncedData = { message: '지원되지 않는 플랫폼입니다.' };
            }
            if (syncedData && syncedData.diagnosis) {
                await database_1.default.medicalRecord.create({
                    data: {
                        userId: 'temp-user-id',
                        hospitalName: 'Telehealth Session',
                        department: 'Telehealth',
                        doctorName: session.doctorName,
                        diagnosisDescription: syncedData.diagnosis,
                        doctorNotes: syncedData.notes || session.sessionNotes,
                        visitDate: session.actualStartTime || session.scheduledTime,
                    },
                });
            }
            return syncedData;
        }
        catch (error) {
            console.error('진료 기록 동기화 오류:', error);
            throw error;
        }
    }
    static async syncZoomHealthcareRecords(session, settings) {
        return {
            diagnosis: '원격 진료 상담 완료',
            notes: session.sessionNotes || '원격 진료를 통한 상담이 완료되었습니다.',
            duration: session.actualEndTime && session.actualStartTime
                ? Math.round((new Date(session.actualEndTime).getTime() - new Date(session.actualStartTime).getTime()) / 60000)
                : null,
        };
    }
    static async syncTeladocRecords(session, settings) {
        return {
            diagnosis: 'Teladoc 원격 진료',
            notes: session.sessionNotes || 'Teladoc을 통한 원격 진료가 완료되었습니다.',
        };
    }
    static async syncAmwellRecords(session, settings) {
        return {
            diagnosis: 'Amwell 원격 진료',
            notes: session.sessionNotes || 'Amwell을 통한 원격 진료가 완료되었습니다.',
        };
    }
    static async getTelehealthStats(userId) {
        const integrations = await database_1.default.telehealthIntegration.findMany({
            where: { userId },
            select: { id: true }
        });
        const integrationIds = integrations.map(i => i.id);
        const [totalSessions, completedSessions, upcomingSessions, cancelledSessions] = await Promise.all([
            database_1.default.telehealthSession.count({ where: { telehealthIntegrationId: { in: integrationIds } } }),
            database_1.default.telehealthSession.count({ where: { telehealthIntegrationId: { in: integrationIds }, status: 'completed' } }),
            database_1.default.telehealthSession.count({
                where: {
                    telehealthIntegrationId: { in: integrationIds },
                    status: 'scheduled',
                    scheduledTime: { gte: new Date() }
                }
            }),
            database_1.default.telehealthSession.count({ where: { telehealthIntegrationId: { in: integrationIds }, status: 'cancelled' } }),
        ]);
        const completedSessionsWithDuration = await database_1.default.telehealthSession.findMany({
            where: {
                telehealthIntegrationId: { in: integrationIds },
                status: 'completed',
                actualStartTime: { not: null },
                actualEndTime: { not: null },
            },
            select: {
                actualStartTime: true,
                actualEndTime: true,
            },
        });
        let averageSessionDuration = 0;
        if (completedSessionsWithDuration.length > 0) {
            const totalDuration = completedSessionsWithDuration.reduce((sum, session) => {
                if (session.actualStartTime && session.actualEndTime) {
                    return sum + (new Date(session.actualEndTime).getTime() - new Date(session.actualStartTime).getTime());
                }
                return sum;
            }, 0);
            averageSessionDuration = Math.round(totalDuration / completedSessionsWithDuration.length / 60000);
        }
        return {
            totalSessions,
            completedSessions,
            upcomingSessions,
            cancelledSessions,
            averageSessionDuration,
        };
    }
}
exports.TelehealthIntegrationModel = TelehealthIntegrationModel;
//# sourceMappingURL=TelehealthIntegration.js.map