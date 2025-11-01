import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Validation rules
const createAppointmentValidation = [
  body('hospitalName')
    .notEmpty()
    .withMessage('병원명은 필수입니다.')
    .isLength({ max: 100 })
    .withMessage('병원명은 100자를 초과할 수 없습니다.'),
  
  body('department')
    .notEmpty()
    .withMessage('진료과는 필수입니다.')
    .isLength({ max: 50 })
    .withMessage('진료과명은 50자를 초과할 수 없습니다.'),
  
  body('appointmentType')
    .isIn(['consultation', 'follow_up', 'procedure', 'test', 'emergency', 'routine_checkup'])
    .withMessage('올바른 예약 유형을 선택해주세요.'),
  
  body('appointmentDate')
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
  
  body('duration')
    .optional()
    .isInt({ min: 5, max: 480 })
    .withMessage('예약 시간은 5분에서 8시간 사이여야 합니다.'),
  
  body('doctorName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('의사명은 50자를 초과할 수 없습니다.'),
  
  body('purpose')
    .optional()
    .isLength({ max: 200 })
    .withMessage('예약 목적은 200자를 초과할 수 없습니다.'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('메모는 500자를 초과할 수 없습니다.'),
  
  body('hospitalPhone')
    .optional()
    .matches(/^[0-9-+\s()]+$/)
    .withMessage('올바른 전화번호 형식을 입력해주세요.'),
  
  body('reminderSettings.enabled')
    .optional()
    .isBoolean()
    .withMessage('알림 설정은 true 또는 false여야 합니다.'),
  
  body('reminderSettings.notifications')
    .optional()
    .isArray()
    .withMessage('알림 설정은 배열이어야 합니다.'),
  
  body('reminderSettings.notifications.*.type')
    .optional()
    .isIn(['email', 'sms', 'push', 'in_app'])
    .withMessage('올바른 알림 유형을 선택해주세요.'),
  
  body('reminderSettings.notifications.*.timeBeforeAppointment')
    .optional()
    .isInt({ min: 5, max: 10080 }) // 5 minutes to 1 week
    .withMessage('알림 시간은 5분에서 1주일 사이여야 합니다.'),
];

const updateAppointmentValidation = [
  body('hospitalName')
    .optional()
    .notEmpty()
    .withMessage('병원명은 비어있을 수 없습니다.')
    .isLength({ max: 100 })
    .withMessage('병원명은 100자를 초과할 수 없습니다.'),
  
  body('department')
    .optional()
    .notEmpty()
    .withMessage('진료과는 비어있을 수 없습니다.')
    .isLength({ max: 50 })
    .withMessage('진료과명은 50자를 초과할 수 없습니다.'),
  
  body('appointmentType')
    .optional()
    .isIn(['consultation', 'follow_up', 'procedure', 'test', 'emergency', 'routine_checkup'])
    .withMessage('올바른 예약 유형을 선택해주세요.'),
  
  body('appointmentDate')
    .optional()
    .isISO8601()
    .withMessage('올바른 날짜 형식을 입력해주세요.'),
  
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'])
    .withMessage('올바른 예약 상태를 선택해주세요.'),
  
  body('duration')
    .optional()
    .isInt({ min: 5, max: 480 })
    .withMessage('예약 시간은 5분에서 8시간 사이여야 합니다.'),
];

const idValidation = [
  param('id')
    .isLength({ min: 1 })
    .withMessage('예약 ID가 필요합니다.'),
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('페이지 번호는 1 이상이어야 합니다.'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('페이지 크기는 1에서 100 사이여야 합니다.'),
];

const dateRangeValidation = [
  query('startDate')
    .isISO8601()
    .withMessage('올바른 시작일 형식을 입력해주세요.'),
  
  query('endDate')
    .isISO8601()
    .withMessage('올바른 종료일 형식을 입력해주세요.')
    .custom((value, { req }) => {
      const startDate = new Date(req.query?.startDate as string);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('종료일은 시작일보다 늦어야 합니다.');
      }
      return true;
    }),
];

// Routes

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
router.post(
  '/',
  createAppointmentValidation,
  validateRequest,
  AppointmentController.createAppointment
);

/**
 * @route   GET /api/appointments
 * @desc    Get appointments with filters and pagination
 * @access  Private
 */
router.get(
  '/',
  paginationValidation,
  validateRequest,
  AppointmentController.getAppointments
);

/**
 * @route   GET /api/appointments/upcoming
 * @desc    Get upcoming appointments
 * @access  Private
 */
router.get(
  '/upcoming',
  [
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('일수는 1에서 365 사이여야 합니다.'),
  ],
  validateRequest,
  AppointmentController.getUpcomingAppointments
);

/**
 * @route   GET /api/appointments/stats
 * @desc    Get appointment statistics
 * @access  Private
 */
router.get('/stats', AppointmentController.getAppointmentStats);

/**
 * @route   GET /api/appointments/today
 * @desc    Get today's appointments
 * @access  Private
 */
router.get('/today', AppointmentController.getTodaysAppointments);

/**
 * @route   GET /api/appointments/calendar
 * @desc    Get appointments for calendar view
 * @access  Private
 */
router.get(
  '/calendar',
  dateRangeValidation,
  validateRequest,
  AppointmentController.getAppointmentsForCalendar
);

/**
 * @route   GET /api/appointments/search
 * @desc    Search appointments
 * @access  Private
 */
router.get(
  '/search',
  [
    query('q')
      .notEmpty()
      .withMessage('검색어가 필요합니다.')
      .isLength({ min: 1, max: 100 })
      .withMessage('검색어는 1자에서 100자 사이여야 합니다.'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('결과 수는 1에서 50 사이여야 합니다.'),
  ],
  validateRequest,
  AppointmentController.searchAppointments
);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Private
 */
router.get(
  '/:id',
  idValidation,
  validateRequest,
  AppointmentController.getAppointment
);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update appointment
 * @access  Private
 */
router.put(
  '/:id',
  [...idValidation, ...updateAppointmentValidation],
  validateRequest,
  AppointmentController.updateAppointment
);

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private
 */
router.patch(
  '/:id/status',
  [
    ...idValidation,
    body('status')
      .isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'])
      .withMessage('올바른 예약 상태를 선택해주세요.'),
  ],
  validateRequest,
  AppointmentController.updateAppointmentStatus
);

/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Cancel appointment
 * @access  Private
 */
router.patch(
  '/:id/cancel',
  idValidation,
  validateRequest,
  AppointmentController.cancelAppointment
);

/**
 * @route   PATCH /api/appointments/:id/reschedule
 * @desc    Reschedule appointment
 * @access  Private
 */
router.patch(
  '/:id/reschedule',
  [
    ...idValidation,
    body('newDate')
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
    
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('메모는 500자를 초과할 수 없습니다.'),
  ],
  validateRequest,
  AppointmentController.rescheduleAppointment
);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete appointment
 * @access  Private
 */
router.delete(
  '/:id',
  idValidation,
  validateRequest,
  AppointmentController.deleteAppointment
);

export default router;