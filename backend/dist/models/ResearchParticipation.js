"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchParticipationModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class ResearchParticipationModel {
    static async matchResearchProjects(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            include: {
                healthRecords: true,
                medicalRecords: true,
                genomicData: true,
                familyHistory: true,
            },
        });
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }
        const allProjects = await this.getActiveResearchProjects();
        const userProfile = this.analyzeUserProfile(user);
        const matchedProjects = allProjects
            .map(project => ({
            ...project,
            matchScore: this.calculateMatchScore(userProfile, project),
        }))
            .filter(project => project.matchScore > 0.3)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10);
        return matchedProjects;
    }
    static async getActiveResearchProjects() {
        return [
            {
                id: 'research_001',
                title: '심혈관 질환 예측 AI 모델 개발',
                description: '웨어러블 기기 데이터를 활용한 심혈관 질환 조기 예측 모델 개발 연구',
                institution: '서울대학교 의과대학',
                principalInvestigator: '김○○ 교수',
                participationType: 'data_sharing',
                eligibilityCriteria: {
                    ageRange: { min: 30, max: 70 },
                    conditions: ['hypertension', 'diabetes'],
                    dataTypes: ['vital_signs', 'wearable_data'],
                },
                expectedDuration: 365,
                incentivePoints: 1000,
                maxParticipants: 500,
                currentParticipants: 234,
                status: 'recruiting',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                createdAt: new Date('2023-12-01'),
            },
            {
                id: 'research_002',
                title: '유전체 기반 개인화 영양 권장 시스템',
                description: '유전체 정보와 생활습관 데이터를 활용한 개인화 영양 권장 시스템 개발',
                institution: '연세대학교 의과대학',
                principalInvestigator: '이○○ 교수',
                participationType: 'data_sharing',
                eligibilityCriteria: {
                    ageRange: { min: 20, max: 65 },
                    dataTypes: ['genomic_data', 'health_records', 'lifestyle_habits'],
                },
                expectedDuration: 180,
                incentivePoints: 800,
                maxParticipants: 300,
                currentParticipants: 156,
                status: 'recruiting',
                startDate: new Date('2024-02-01'),
                endDate: new Date('2024-08-01'),
                createdAt: new Date('2024-01-01'),
            },
            {
                id: 'research_003',
                title: '정신건강 모니터링 앱 효과성 연구',
                description: '디지털 치료제로서의 정신건강 모니터링 앱의 임상적 효과성 검증',
                institution: '고려대학교 의과대학',
                principalInvestigator: '박○○ 교수',
                participationType: 'clinical_trial',
                eligibilityCriteria: {
                    ageRange: { min: 18, max: 50 },
                    conditions: ['depression', 'anxiety'],
                    exclusions: ['severe_mental_illness'],
                },
                expectedDuration: 90,
                incentivePoints: 1500,
                maxParticipants: 100,
                currentParticipants: 67,
                status: 'recruiting',
                startDate: new Date('2024-03-01'),
                endDate: new Date('2024-06-01'),
                createdAt: new Date('2024-02-01'),
            },
        ];
    }
    static analyzeUserProfile(user) {
        const age = user.birthDate ?
            Math.floor((Date.now() - new Date(user.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) :
            null;
        return {
            age,
            gender: user.gender,
            hasVitalSigns: user.healthRecords?.some((record) => record.recordType === 'vital_signs') || false,
            hasMedicalHistory: user.medicalRecords?.length > 0 || false,
            hasGenomicData: user.genomicData?.length > 0 || false,
            hasFamilyHistory: user.familyHistory?.length > 0 || false,
            lifestyleHabits: user.lifestyleHabits,
            medicalConditions: this.extractMedicalConditions(user.medicalRecords || []),
        };
    }
    static extractMedicalConditions(medicalRecords) {
        const conditions = [];
        medicalRecords.forEach(record => {
            if (record.diagnosisCode) {
                if (record.diagnosisCode.startsWith('I')) {
                    conditions.push('cardiovascular');
                }
                if (record.diagnosisCode.startsWith('E10') || record.diagnosisCode.startsWith('E11')) {
                    conditions.push('diabetes');
                }
                if (record.diagnosisCode.startsWith('I10')) {
                    conditions.push('hypertension');
                }
                if (record.diagnosisCode.startsWith('F')) {
                    conditions.push('mental_health');
                }
            }
        });
        return [...new Set(conditions)];
    }
    static calculateMatchScore(userProfile, project) {
        let score = 0;
        let maxScore = 0;
        maxScore += 30;
        if (userProfile.age && project.eligibilityCriteria.ageRange) {
            const { min, max } = project.eligibilityCriteria.ageRange;
            if (userProfile.age >= min && userProfile.age <= max) {
                score += 30;
            }
            else {
                return 0;
            }
        }
        maxScore += 40;
        if (project.eligibilityCriteria.dataTypes) {
            const requiredDataTypes = project.eligibilityCriteria.dataTypes;
            let availableDataTypes = 0;
            requiredDataTypes.forEach((dataType) => {
                switch (dataType) {
                    case 'vital_signs':
                        if (userProfile.hasVitalSigns)
                            availableDataTypes++;
                        break;
                    case 'genomic_data':
                        if (userProfile.hasGenomicData)
                            availableDataTypes++;
                        break;
                    case 'health_records':
                        if (userProfile.hasVitalSigns)
                            availableDataTypes++;
                        break;
                    case 'medical_records':
                        if (userProfile.hasMedicalHistory)
                            availableDataTypes++;
                        break;
                    case 'family_history':
                        if (userProfile.hasFamilyHistory)
                            availableDataTypes++;
                        break;
                }
            });
            score += (availableDataTypes / requiredDataTypes.length) * 40;
        }
        maxScore += 20;
        if (project.eligibilityCriteria.conditions) {
            const requiredConditions = project.eligibilityCriteria.conditions;
            const matchingConditions = requiredConditions.filter((condition) => userProfile.medicalConditions.includes(condition));
            if (matchingConditions.length > 0) {
                score += (matchingConditions.length / requiredConditions.length) * 20;
            }
        }
        else {
            score += 20;
        }
        maxScore += 10;
        if (project.eligibilityCriteria.exclusions) {
            const hasExclusions = project.eligibilityCriteria.exclusions.some((exclusion) => userProfile.medicalConditions.includes(exclusion));
            if (!hasExclusions) {
                score += 10;
            }
            else {
                return 0;
            }
        }
        else {
            score += 10;
        }
        return score / maxScore;
    }
    static async applyForResearch(userId, researchProjectId, consentGiven) {
        const existingParticipation = await database_1.default.researchParticipation.findFirst({
            where: {
                userId,
                researchProjectId,
                status: { in: ['pending', 'active'] },
            },
        });
        if (existingParticipation) {
            throw new Error('이미 해당 연구에 참여 중입니다.');
        }
        const projects = await this.getActiveResearchProjects();
        const project = projects.find(p => p.id === researchProjectId);
        if (!project) {
            throw new Error('연구 프로젝트를 찾을 수 없습니다.');
        }
        if (project.status !== 'recruiting') {
            throw new Error('현재 모집 중이지 않은 연구입니다.');
        }
        const participation = await database_1.default.researchParticipation.create({
            data: {
                userId,
                studyId: researchProjectId,
                studyTitle: project.title,
                studyType: project.participationType,
                participationDate: new Date(),
                consentGiven,
                status: consentGiven ? 'pending' : 'pending',
                incentivesEarned: 0,
            },
        });
        return participation;
    }
    static async updateParticipationStatus(participationId, status, startDate, endDate) {
        const participation = await database_1.default.researchParticipation.update({
            where: { id: participationId },
            data: {
                status,
                ...(startDate && { participationStartDate: startDate }),
                ...(endDate && { participationEndDate: endDate }),
            },
        });
        if (status === 'active' && startDate) {
            await this.awardIncentivePoints(participation.userId, 'research_participation_start', 100, `연구 참여 시작: ${participation.researchTitle}`, participationId);
        }
        return participation;
    }
    static async getUserParticipations(userId, status) {
        const participations = await database_1.default.researchParticipation.findMany({
            where: {
                userId,
                ...(status && { status }),
            },
            orderBy: { createdAt: 'desc' },
        });
        return participations;
    }
    static async getResearchFeedback(userId, participationId) {
        const participation = await database_1.default.researchParticipation.findFirst({
            where: {
                id: participationId,
                userId,
            },
        });
        if (!participation) {
            throw new Error('연구 참여 기록을 찾을 수 없습니다.');
        }
        const feedback = {
            participationSummary: {
                duration: participation.participationStartDate && participation.participationEndDate
                    ? Math.ceil((new Date(participation.participationEndDate).getTime() - new Date(participation.participationStartDate).getTime()) / (1000 * 60 * 60 * 24))
                    : null,
                dataContributed: this.calculateDataContribution(userId, participation),
                completionRate: 95.5,
            },
            researchProgress: {
                status: 'ongoing',
                expectedCompletion: '2024-12-31',
                preliminaryFindings: '참여자들의 데이터를 통해 유의미한 패턴을 발견했습니다.',
            },
            personalInsights: {
                dataQuality: 'excellent',
                uniqueContributions: [
                    '희귀한 유전적 변이 데이터 제공',
                    '장기간 일관된 바이탈 사인 데이터',
                ],
                recommendations: [
                    '지속적인 건강 모니터링 권장',
                    '정기적인 건강검진 필요',
                ],
            },
            incentivesEarned: {
                totalPoints: participation.incentivesEarned,
                breakdown: [
                    { type: '참여 시작', points: 100, date: participation.participationDate },
                    { type: '데이터 기여', points: participation.incentivesEarned - 100, date: new Date() },
                ],
            },
        };
        const results = {
            publicationStatus: 'in_preparation',
            expectedPublications: [
                {
                    title: 'AI-based Cardiovascular Risk Prediction Using Wearable Data',
                    journal: 'Nature Digital Medicine',
                    expectedDate: '2025-03-01',
                },
            ],
            dataUsage: {
                anonymizationLevel: 'high',
                sharingScope: 'research_consortium',
                retentionPeriod: '5_years',
            },
        };
        return {
            participation: participation,
            feedback,
            results,
        };
    }
    static calculateDataContribution(userId, participation) {
        return {
            vitalSigns: { records: 1250, quality: 'high' },
            healthRecords: { records: 45, quality: 'medium' },
            genomicData: { snps: 650000, quality: 'excellent' },
            totalScore: 92.5,
        };
    }
    static async awardIncentivePoints(userId, incentiveType, points, description, referenceId) {
        const incentive = await database_1.default.userIncentive.create({
            data: {
                userId,
                incentiveType,
                pointsEarned: points,
                pointsRedeemed: 0,
                description,
                earnedDate: new Date(),
                status: 'active',
            },
        });
        return incentive;
    }
    static async getUserIncentives(userId) {
        const incentives = await database_1.default.userIncentive.findMany({
            where: { userId },
            orderBy: { earnedDate: 'desc' },
        });
        const totalPoints = incentives.reduce((sum, incentive) => sum + incentive.pointsEarned, 0);
        const redeemedPoints = incentives.reduce((sum, incentive) => sum + incentive.pointsRedeemed, 0);
        const availablePoints = totalPoints - redeemedPoints;
        return {
            totalPoints,
            availablePoints,
            redeemedPoints,
            incentives: incentives,
        };
    }
    static async redeemIncentivePoints(userId, points, redeemType, description) {
        const incentiveStatus = await this.getUserIncentives(userId);
        if (incentiveStatus.availablePoints < points) {
            throw new Error('사용 가능한 포인트가 부족합니다.');
        }
        const transaction = await database_1.default.userIncentive.create({
            data: {
                userId,
                incentiveType: redeemType,
                pointsEarned: 0,
                pointsRedeemed: points,
                description,
                earnedDate: new Date(),
                redeemedDate: new Date(),
                status: 'redeemed',
            },
        });
        return {
            success: true,
            remainingPoints: incentiveStatus.availablePoints - points,
            transaction,
        };
    }
    static async getResearchStats() {
        const [totalParticipations, activeParticipations, completedParticipations, allParticipations, allIncentives,] = await Promise.all([
            database_1.default.researchParticipation.count(),
            database_1.default.researchParticipation.count({ where: { status: 'active' } }),
            database_1.default.researchParticipation.count({ where: { status: 'completed' } }),
            database_1.default.researchParticipation.findMany({
                select: { studyType: true, createdAt: true },
            }),
            database_1.default.userIncentive.findMany({
                select: { pointsEarned: true },
            }),
        ]);
        const participationByType = allParticipations.reduce((acc, participation) => {
            acc[participation.studyType] = (acc[participation.studyType] || 0) + 1;
            return acc;
        }, {});
        const monthlyParticipations = this.calculateMonthlyStats(allParticipations);
        const totalIncentivesAwarded = allIncentives.reduce((sum, incentive) => sum + incentive.pointsEarned, 0);
        return {
            totalParticipations,
            activeParticipations,
            completedParticipations,
            totalIncentivesAwarded,
            participationByType,
            monthlyParticipations,
        };
    }
    static calculateMonthlyStats(participations) {
        const monthlyStats = {};
        participations.forEach(participation => {
            const month = new Date(participation.createdAt).toISOString().substring(0, 7);
            monthlyStats[month] = (monthlyStats[month] || 0) + 1;
        });
        const result = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = date.toISOString().substring(0, 7);
            result.push({
                month,
                count: monthlyStats[month] || 0,
            });
        }
        return result;
    }
}
exports.ResearchParticipationModel = ResearchParticipationModel;
//# sourceMappingURL=ResearchParticipation.js.map