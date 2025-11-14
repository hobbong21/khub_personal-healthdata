"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googleFitController_1 = require("../controllers/googleFitController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
const googleFitController = new googleFitController_1.GoogleFitController();
router.get('/auth-url', auth_1.authenticateToken, googleFitController.getAuthUrl.bind(googleFitController));
router.get('/auth/callback', auth_1.authenticateToken, [
    (0, express_validator_1.query)('code')
        .notEmpty()
        .withMessage('인증 코드가 필요합니다.'),
], validation_1.validateRequest, googleFitController.handleAuthCallback.bind(googleFitController));
router.post('/sync', auth_1.authenticateToken, [
    (0, express_validator_1.body)('dataTypes')
        .optional()
        .isArray()
        .withMessage('dataTypes는 배열이어야 합니다.'),
    (0, express_validator_1.body)('dataTypes.*')
        .optional()
        .isIn([
        'heart_rate', 'steps', 'calories', 'sleep', 'weight',
        'blood_pressure', 'blood_oxygen', 'body_temperature',
        'exercise_sessions', 'distance', 'floors_climbed'
    ])
        .withMessage('유효하지 않은 데이터 타입입니다.'),
    (0, express_validator_1.body)('startDate')
        .optional()
        .isISO8601()
        .withMessage('startDate는 유효한 ISO 8601 날짜 형식이어야 합니다.'),
    (0, express_validator_1.body)('endDate')
        .optional()
        .isISO8601()
        .withMessage('endDate는 유효한 ISO 8601 날짜 형식이어야 합니다.'),
    (0, express_validator_1.body)('forceSync')
        .optional()
        .isBoolean()
        .withMessage('forceSync는 불린 값이어야 합니다.'),
], validation_1.validateRequest, googleFitController.syncData.bind(googleFitController));
router.get('/data/:dataType', auth_1.authenticateToken, [
    (0, express_validator_1.param)('dataType')
        .isIn([
        'heart_rate', 'steps', 'calories', 'sleep', 'weight',
        'blood_pressure', 'blood_oxygen', 'body_temperature',
        'exercise_sessions', 'distance', 'floors_climbed'
    ])
        .withMessage('유효하지 않은 데이터 타입입니다.'),
    (0, express_validator_1.query)('startDate')
        .optional()
        .isISO8601()
        .withMessage('startDate는 유효한 ISO 8601 날짜 형식이어야 합니다.'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isISO8601()
        .withMessage('endDate는 유효한 ISO 8601 날짜 형식이어야 합니다.'),
], validation_1.validateRequest, googleFitController.getDataByType.bind(googleFitController));
router.get('/status', auth_1.authenticateToken, googleFitController.getConnectionStatus.bind(googleFitController));
router.delete('/disconnect', auth_1.authenticateToken, googleFitController.disconnectDevice.bind(googleFitController));
router.put('/sync-settings', auth_1.authenticateToken, [
    (0, express_validator_1.body)('autoSync')
        .optional()
        .isBoolean()
        .withMessage('autoSync는 불린 값이어야 합니다.'),
    (0, express_validator_1.body)('syncInterval')
        .optional()
        .isInt({ min: 5, max: 1440 })
        .withMessage('syncInterval은 5분에서 1440분(24시간) 사이의 값이어야 합니다.'),
    (0, express_validator_1.body)('dataTypes')
        .optional()
        .isArray()
        .withMessage('dataTypes는 배열이어야 합니다.'),
    (0, express_validator_1.body)('dataTypes.*')
        .optional()
        .isIn([
        'heart_rate', 'steps', 'calories', 'sleep', 'weight',
        'blood_pressure', 'blood_oxygen', 'body_temperature',
        'exercise_sessions', 'distance', 'floors_climbed'
    ])
        .withMessage('유효하지 않은 데이터 타입입니다.'),
], validation_1.validateRequest, googleFitController.updateSyncSettings.bind(googleFitController));
router.get('/profile', auth_1.authenticateToken, googleFitController.getUserProfile.bind(googleFitController));
router.get('/health-summary', auth_1.authenticateToken, [
    (0, express_validator_1.query)('period')
        .optional()
        .isIn(['daily', 'weekly', 'monthly'])
        .withMessage('period는 daily, weekly, monthly 중 하나여야 합니다.'),
    (0, express_validator_1.query)('date')
        .optional()
        .isISO8601()
        .withMessage('date는 유효한 ISO 8601 날짜 형식이어야 합니다.'),
], validation_1.validateRequest, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { period = 'daily', date } = req.query;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: '사용자 인증이 필요합니다.',
            });
            return;
        }
        const summary = {
            period,
            date: date || new Date().toISOString().split('T')[0],
            metrics: {
                steps: {
                    value: 8500,
                    goal: 10000,
                    percentage: 85,
                },
                calories: {
                    value: 2100,
                    goal: 2500,
                    percentage: 84,
                },
                heartRate: {
                    average: 72,
                    resting: 65,
                    max: 145,
                },
                sleep: {
                    duration: 7.5,
                    quality: 'good',
                    efficiency: 88,
                },
            },
            insights: [
                '오늘 목표 걸음 수의 85%를 달성했습니다.',
                '평균 심박수가 정상 범위에 있습니다.',
                '수면 효율성이 양호합니다.',
            ],
        };
        res.json({
            success: true,
            summary,
        });
    }
    catch (error) {
        console.error('Error generating health summary:', error);
        res.status(500).json({
            success: false,
            message: '건강 상태 요약 생성에 실패했습니다.',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=googleFit.js.map