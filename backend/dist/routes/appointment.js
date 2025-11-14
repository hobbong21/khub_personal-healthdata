"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
const createAppointmentValidation = [
    (0, express_validator_1.body)('hospitalName')
        .notEmpty()
        .withMessage('병원명은 필수입니다.')
        .isLength({ max: 100 })
        .withMessage('병원명은 100자를 초과할 수 없습니다.'),
    (0, express_validator_1.body)('department')
        .notEmpty()
        .withMessage('진료과는 필수입니다.')
        .isLength({ max: 50 })
        .withMessage('진료과명은 50자를 초과할 수 없습니다.'),
    (0, express_validator_1.body)('appointmentType')
        .isIn(['consultation', 'follow_up', 'procedure', 'test', 'emergency', 'routine_checkup'])
        .withMessage('올바른 예약 유형을 선택해주세요.'),
    (0, express_validator_1.body)('appointmentDate')
        .isISO8601()
        .withMessage('올바른 날짜 형식을 입력해주세요.')
        .custom((value) => {
        const appointmentDate = new Date(value);
        const now = new Date();
        if (appointmentDate <= now) {
            throw new Error('예약 날짜는 현재 시간 이후여야 합니다.');
        }
        return true;
    }),
    (0, express_validator_1.body)('duration')
        .optional()
        .isInt({ min: 5, max: 480 })
        .withMessage('예약 시간은 5분에서 8시간 사이여야 합니다.'),
    (0, express_validator_1.body)('doctorName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('의사명은 50자를 초과할 수 없습니다.'),
    (0, express_validator_1.body)('purpose')
        .optional()
        .isLength({ max: 200 })
        .withMessage('예약 목적은 200자를 초과할 수 없습니다.'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('메모는 500자를 초과할 수 없습니다.'),
    (0, express_validator_1.body)('hospitalPhone')
        .optional()
        .matches(/^[0-9-+\s()]+$/)
        .withMessage('올바른 전화번호 형식을 입력해주세요.'),
    (0, express_validator_1.body)('reminderSettings.enabled')
        .optional()
        .isBoolean()
        .withMessage('알림 설정은 true 또는 false여야 합니다.'),
    (0, express_validator_1.body)('reminderSettings.notifications')
        .optional()
        .isArray()
        .withMessage('알림 설정은 배열이어야 합니다.'),
    (0, express_validator_1.body)('reminderSettings.notifications.*.type')
        .optional()
        .isIn(['email', 'sms', 'push', 'in_app'])
        .withMessage('올바른 알림 유형을 선택해주세요.'),
    (0, express_validator_1.body)('reminderSettings.notifications.*.timeBeforeAppointment')
        .optional()
        .isInt({ min: 5, max: 10080 })
        .withMessage('알림 시간은 5분에서 1주일 사이여야 합니다.'),
];
const updateAppointmentValidation = [
    (0, express_validator_1.body)('hospitalName')
        .optional()
        .notEmpty()
        .withMessage('병원명은 비어있을 수 없습니다.')
        .isLength({ max: 100 })
        .withMessage('병원명은 100자를 초과할 수 없습니다.'),
    (0, express_validator_1.body)('department')
        .optional()
        .notEmpty()
        .withMessage('진료과는 비어있을 수 없습니다.')
        .isLength({ max: 50 })
        .withMessage('진료과명은 50자를 초과할 수 없습니다.'),
    (0, express_validator_1.body)('appointmentType')
        .optional()
        .isIn(['consultation', 'follow_up', 'procedure', 'test', 'emergency', 'routine_checkup'])
        .withMessage('올바른 예약 유형을 선택해주세요.'),
    (0, express_validator_1.body)('appointmentDate')
        .optional()
        .isISO8601()
        .withMessage('올바른 날짜 형식을 입력해주세요.'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'])
        .withMessage('올바른 예약 상태를 선택해주세요.'),
    (0, express_validator_1.body)('duration')
        .optional()
        .isInt({ min: 5, max: 480 })
        .withMessage('예약 시간은 5분에서 8시간 사이여야 합니다.'),
];
const idValidation = [
    (0, express_validator_1.param)('id')
        .isLength({ min: 1 })
        .withMessage('예약 ID가 필요합니다.'),
];
const paginationValidation = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('페이지 번호는 1 이상이어야 합니다.'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('페이지 크기는 1에서 100 사이여야 합니다.'),
];
const dateRangeValidation = [
    (0, express_validator_1.query)('startDate')
        .isISO8601()
        .withMessage('올바른 시작일 형식을 입력해주세요.'),
    (0, express_validator_1.query)('endDate')
        .isISO8601()
        .withMessage('올바른 종료일 형식을 입력해주세요.')
        .custom((value, { req }) => {
        const startDate = new Date(req.query?.startDate);
        const endDate = new Date(value);
        if (endDate <= startDate) {
            throw new Error('종료일은 시작일보다 늦어야 합니다.');
        }
        return true;
    }),
];
router.post('/', createAppointmentValidation, validation_1.validateRequest, appointmentController_1.AppointmentController.createAppointment);
router.get('/', paginationValidation, validation_1.validateRequest, appointmentController_1.AppointmentController.getAppointments);
router.get('/upcoming', [
    (0, express_validator_1.query)('days')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('일수는 1에서 365 사이여야 합니다.'),
], validation_1.validateRequest, appointmentController_1.AppointmentController.getUpcomingAppointments);
router.get('/stats', appointmentController_1.AppointmentController.getAppointmentStats);
router.get('/today', appointmentController_1.AppointmentController.getTodaysAppointments);
router.get('/calendar', dateRangeValidation, validation_1.validateRequest, appointmentController_1.AppointmentController.getAppointmentsForCalendar);
router.get('/search', [
    (0, express_validator_1.query)('q')
        .notEmpty()
        .withMessage('검색어가 필요합니다.')
        .isLength({ min: 1, max: 100 })
        .withMessage('검색어는 1자에서 100자 사이여야 합니다.'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('결과 수는 1에서 50 사이여야 합니다.'),
], validation_1.validateRequest, appointmentController_1.AppointmentController.searchAppointments);
router.get('/:id', idValidation, validation_1.validateRequest, appointmentController_1.AppointmentController.getAppointment);
router.put('/:id', [...idValidation, ...updateAppointmentValidation], validation_1.validateRequest, appointmentController_1.AppointmentController.updateAppointment);
router.patch('/:id/status', [
    ...idValidation,
    (0, express_validator_1.body)('status')
        .isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'])
        .withMessage('올바른 예약 상태를 선택해주세요.'),
], validation_1.validateRequest, appointmentController_1.AppointmentController.updateAppointmentStatus);
router.patch('/:id/cancel', idValidation, validation_1.validateRequest, appointmentController_1.AppointmentController.cancelAppointment);
router.patch('/:id/reschedule', [
    ...idValidation,
    (0, express_validator_1.body)('newDate')
        .isISO8601()
        .withMessage('올바른 날짜 형식을 입력해주세요.')
        .custom((value) => {
        const newDate = new Date(value);
        const now = new Date();
        if (newDate <= now) {
            throw new Error('새로운 예약 날짜는 현재 시간 이후여야 합니다.');
        }
        return true;
    }),
    (0, express_validator_1.body)('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('메모는 500자를 초과할 수 없습니다.'),
], validation_1.validateRequest, appointmentController_1.AppointmentController.rescheduleAppointment);
router.delete('/:id', idValidation, validation_1.validateRequest, appointmentController_1.AppointmentController.deleteAppointment);
exports.default = router;
//# sourceMappingURL=appointment.js.map