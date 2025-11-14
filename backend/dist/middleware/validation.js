"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegistration = validateRegistration;
exports.validateLogin = validateLogin;
exports.validateProfileUpdate = validateProfileUpdate;
exports.validatePasswordChange = validatePasswordChange;
exports.validateVitalSign = validateVitalSign;
exports.validateHealthJournal = validateHealthJournal;
exports.validateHealthRecordUpdate = validateHealthRecordUpdate;
exports.validateMedicalRecord = validateMedicalRecord;
exports.validateMedicalRecordUpdate = validateMedicalRecordUpdate;
exports.validateTestResult = validateTestResult;
exports.validateMedication = validateMedication;
exports.validateSchedule = validateSchedule;
exports.validateDosageLog = validateDosageLog;
exports.validateSideEffect = validateSideEffect;
exports.validateFamilyMember = validateFamilyMember;
exports.validateRequest = validateRequest;
exports.handleValidationError = handleValidationError;
const express_validator_1 = require("express-validator");
const joi_1 = __importDefault(require("joi"));
function validateRegistration(req, res, next) {
    const schema = joi_1.default.object({
        email: joi_1.default.string()
            .email()
            .required()
            .messages({
            'string.email': '유효한 이메일 주소를 입력해주세요',
            'any.required': '이메일은 필수 항목입니다',
        }),
        password: joi_1.default.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required()
            .messages({
            'string.min': '비밀번호는 최소 8자 이상이어야 합니다',
            'string.pattern.base': '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다',
            'any.required': '비밀번호는 필수 항목입니다',
        }),
        name: joi_1.default.string()
            .min(2)
            .max(50)
            .required()
            .messages({
            'string.min': '이름은 최소 2자 이상이어야 합니다',
            'string.max': '이름은 최대 50자까지 입력 가능합니다',
            'any.required': '이름은 필수 항목입니다',
        }),
        birthDate: joi_1.default.string()
            .isoDate()
            .required()
            .messages({
            'string.isoDate': '유효한 날짜 형식을 입력해주세요 (YYYY-MM-DD)',
            'any.required': '생년월일은 필수 항목입니다',
        }),
        gender: joi_1.default.string()
            .valid('male', 'female', 'other')
            .required()
            .messages({
            'any.only': '성별은 male, female, other 중 하나여야 합니다',
            'any.required': '성별은 필수 항목입니다',
        }),
        bloodType: joi_1.default.string()
            .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
            .optional()
            .messages({
            'any.only': '유효한 혈액형을 선택해주세요',
        }),
        height: joi_1.default.number()
            .min(50)
            .max(300)
            .optional()
            .messages({
            'number.min': '키는 50cm 이상이어야 합니다',
            'number.max': '키는 300cm 이하여야 합니다',
        }),
        weight: joi_1.default.number()
            .min(10)
            .max(500)
            .optional()
            .messages({
            'number.min': '몸무게는 10kg 이상이어야 합니다',
            'number.max': '몸무게는 500kg 이하여야 합니다',
        }),
        lifestyleHabits: joi_1.default.object({
            smoking: joi_1.default.boolean().required(),
            alcohol: joi_1.default.string().valid('none', 'light', 'moderate', 'heavy').required(),
            exerciseFrequency: joi_1.default.number().min(0).max(14).required(),
            dietType: joi_1.default.string().required(),
        }).optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: '입력 데이터가 유효하지 않습니다',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            },
        });
        return;
    }
    next();
}
function validateLogin(req, res, next) {
    const schema = joi_1.default.object({
        email: joi_1.default.string()
            .email()
            .required()
            .messages({
            'string.email': '유효한 이메일 주소를 입력해주세요',
            'any.required': '이메일은 필수 항목입니다',
        }),
        password: joi_1.default.string()
            .required()
            .messages({
            'any.required': '비밀번호는 필수 항목입니다',
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: '입력 데이터가 유효하지 않습니다',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            },
        });
        return;
    }
    next();
}
function validateProfileUpdate(req, res, next) {
    const schema = joi_1.default.object({
        name: joi_1.default.string()
            .min(2)
            .max(50)
            .optional()
            .messages({
            'string.min': '이름은 최소 2자 이상이어야 합니다',
            'string.max': '이름은 최대 50자까지 입력 가능합니다',
        }),
        birthDate: joi_1.default.string()
            .isoDate()
            .optional()
            .messages({
            'string.isoDate': '유효한 날짜 형식을 입력해주세요 (YYYY-MM-DD)',
        }),
        gender: joi_1.default.string()
            .valid('male', 'female', 'other')
            .optional()
            .messages({
            'any.only': '성별은 male, female, other 중 하나여야 합니다',
        }),
        bloodType: joi_1.default.string()
            .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
            .optional()
            .allow(null)
            .messages({
            'any.only': '유효한 혈액형을 선택해주세요',
        }),
        height: joi_1.default.number()
            .min(50)
            .max(300)
            .optional()
            .allow(null)
            .messages({
            'number.min': '키는 50cm 이상이어야 합니다',
            'number.max': '키는 300cm 이하여야 합니다',
        }),
        weight: joi_1.default.number()
            .min(10)
            .max(500)
            .optional()
            .allow(null)
            .messages({
            'number.min': '몸무게는 10kg 이상이어야 합니다',
            'number.max': '몸무게는 500kg 이하여야 합니다',
        }),
        lifestyleHabits: joi_1.default.object({
            smoking: joi_1.default.boolean().required(),
            alcohol: joi_1.default.string().valid('none', 'light', 'moderate', 'heavy').required(),
            exerciseFrequency: joi_1.default.number().min(0).max(14).required(),
            dietType: joi_1.default.string().required(),
        }).optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: '입력 데이터가 유효하지 않습니다',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            },
        });
        return;
    }
    next();
}
function validatePasswordChange(req, res, next) {
    const schema = joi_1.default.object({
        currentPassword: joi_1.default.string()
            .required()
            .messages({
            'any.required': '현재 비밀번호는 필수 항목입니다',
        }),
        newPassword: joi_1.default.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required()
            .messages({
            'string.min': '새 비밀번호는 최소 8자 이상이어야 합니다',
            'string.pattern.base': '새 비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다',
            'any.required': '새 비밀번호는 필수 항목입니다',
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: '입력 데이터가 유효하지 않습니다',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            },
        });
        return;
    }
    next();
}
function validateVitalSign(req, res, next) {
    const schema = joi_1.default.object({
        type: joi_1.default.string()
            .valid('blood_pressure', 'heart_rate', 'temperature', 'blood_sugar', 'weight')
            .required()
            .messages({
            'any.only': '바이탈 사인 타입은 blood_pressure, heart_rate, temperature, blood_sugar, weight 중 하나여야 합니다',
            'any.required': '바이탈 사인 타입은 필수 항목입니다',
        }),
        value: joi_1.default.alternatives()
            .conditional('type', {
            is: 'blood_pressure',
            then: joi_1.default.object({
                systolic: joi_1.default.number().min(50).max(300).required(),
                diastolic: joi_1.default.number().min(30).max(200).required(),
            }).required(),
            otherwise: joi_1.default.number().min(0).max(1000).required(),
        })
            .messages({
            'number.min': '값은 0 이상이어야 합니다',
            'number.max': '값이 허용 범위를 초과했습니다',
            'any.required': '측정값은 필수 항목입니다',
        }),
        unit: joi_1.default.string()
            .required()
            .messages({
            'any.required': '단위는 필수 항목입니다',
        }),
        measuredAt: joi_1.default.string()
            .isoDate()
            .required()
            .messages({
            'string.isoDate': '유효한 측정 시간을 입력해주세요 (ISO 8601 형식)',
            'any.required': '측정 시간은 필수 항목입니다',
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: handleValidationError(error),
        });
        return;
    }
    next();
}
function validateHealthJournal(req, res, next) {
    const schema = joi_1.default.object({
        conditionRating: joi_1.default.number()
            .min(1)
            .max(5)
            .required()
            .messages({
            'number.min': '컨디션 평점은 1점 이상이어야 합니다',
            'number.max': '컨디션 평점은 5점 이하여야 합니다',
            'any.required': '컨디션 평점은 필수 항목입니다',
        }),
        symptoms: joi_1.default.object({
            pain: joi_1.default.number().min(0).max(10).required(),
            fatigue: joi_1.default.number().min(0).max(10).required(),
            sleepQuality: joi_1.default.number().min(0).max(10).required(),
        }).required()
            .messages({
            'any.required': '증상 정보는 필수 항목입니다',
        }),
        supplements: joi_1.default.array()
            .items(joi_1.default.string().min(1).max(100))
            .default([])
            .messages({
            'string.min': '영양제 이름은 1자 이상이어야 합니다',
            'string.max': '영양제 이름은 100자 이하여야 합니다',
        }),
        exercise: joi_1.default.array()
            .items(joi_1.default.object({
            type: joi_1.default.string().min(1).max(50).required(),
            duration: joi_1.default.number().min(1).max(1440).required(),
            intensity: joi_1.default.string().valid('low', 'moderate', 'high').required(),
        }))
            .default([])
            .messages({
            'string.min': '운동 종류는 1자 이상이어야 합니다',
            'string.max': '운동 종류는 50자 이하여야 합니다',
            'number.min': '운동 시간은 1분 이상이어야 합니다',
            'number.max': '운동 시간은 24시간 이하여야 합니다',
            'any.only': '운동 강도는 low, moderate, high 중 하나여야 합니다',
        }),
        notes: joi_1.default.string()
            .max(1000)
            .optional()
            .allow('')
            .messages({
            'string.max': '메모는 1000자 이하여야 합니다',
        }),
        recordedDate: joi_1.default.string()
            .isoDate()
            .required()
            .messages({
            'string.isoDate': '유효한 기록 날짜를 입력해주세요 (ISO 8601 형식)',
            'any.required': '기록 날짜는 필수 항목입니다',
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: handleValidationError(error),
        });
        return;
    }
    next();
}
function validateHealthRecordUpdate(req, res, next) {
    const schema = joi_1.default.object({
        type: joi_1.default.string()
            .valid('blood_pressure', 'heart_rate', 'temperature', 'blood_sugar', 'weight')
            .optional(),
        value: joi_1.default.alternatives()
            .conditional('type', {
            is: 'blood_pressure',
            then: joi_1.default.object({
                systolic: joi_1.default.number().min(50).max(300).required(),
                diastolic: joi_1.default.number().min(30).max(200).required(),
            }),
            otherwise: joi_1.default.number().min(0).max(1000),
        })
            .optional(),
        unit: joi_1.default.string().optional(),
        measuredAt: joi_1.default.string().isoDate().optional(),
        conditionRating: joi_1.default.number().min(1).max(5).optional(),
        symptoms: joi_1.default.object({
            pain: joi_1.default.number().min(0).max(10).optional(),
            fatigue: joi_1.default.number().min(0).max(10).optional(),
            sleepQuality: joi_1.default.number().min(0).max(10).optional(),
        }).optional(),
        supplements: joi_1.default.array()
            .items(joi_1.default.string().min(1).max(100))
            .optional(),
        exercise: joi_1.default.array()
            .items(joi_1.default.object({
            type: joi_1.default.string().min(1).max(50).required(),
            duration: joi_1.default.number().min(1).max(1440).required(),
            intensity: joi_1.default.string().valid('low', 'moderate', 'high').required(),
        }))
            .optional(),
        notes: joi_1.default.string().max(1000).optional().allow(''),
        recordedDate: joi_1.default.string().isoDate().optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: handleValidationError(error),
        });
        return;
    }
    next();
}
function validateMedicalRecord(req, res, next) {
    const testResultSchema = joi_1.default.object({
        testType: joi_1.default.string()
            .min(1)
            .max(100)
            .required()
            .messages({
            'string.min': '검사 유형은 1자 이상이어야 합니다',
            'string.max': '검사 유형은 100자 이하여야 합니다',
            'any.required': '검사 유형은 필수 항목입니다',
        }),
        testName: joi_1.default.string()
            .min(1)
            .max(200)
            .required()
            .messages({
            'string.min': '검사명은 1자 이상이어야 합니다',
            'string.max': '검사명은 200자 이하여야 합니다',
            'any.required': '검사명은 필수 항목입니다',
        }),
        results: joi_1.default.object().required()
            .messages({
            'any.required': '검사 결과는 필수 항목입니다',
        }),
        referenceRange: joi_1.default.string()
            .max(100)
            .optional()
            .messages({
            'string.max': '정상 범위는 100자 이하여야 합니다',
        }),
        status: joi_1.default.string()
            .valid('normal', 'abnormal', 'critical', 'pending')
            .optional()
            .messages({
            'any.only': '상태는 normal, abnormal, critical, pending 중 하나여야 합니다',
        }),
        testDate: joi_1.default.string()
            .isoDate()
            .required()
            .messages({
            'string.isoDate': '유효한 검사 날짜를 입력해주세요 (YYYY-MM-DD)',
            'any.required': '검사 날짜는 필수 항목입니다',
        }),
    });
    const prescriptionSchema = joi_1.default.object({
        medicationName: joi_1.default.string()
            .min(1)
            .max(200)
            .required()
            .messages({
            'string.min': '약물명은 1자 이상이어야 합니다',
            'string.max': '약물명은 200자 이하여야 합니다',
            'any.required': '약물명은 필수 항목입니다',
        }),
        dosage: joi_1.default.string()
            .min(1)
            .max(100)
            .required()
            .messages({
            'string.min': '용량은 1자 이상이어야 합니다',
            'string.max': '용량은 100자 이하여야 합니다',
            'any.required': '용량은 필수 항목입니다',
        }),
        frequency: joi_1.default.string()
            .min(1)
            .max(100)
            .required()
            .messages({
            'string.min': '복용 빈도는 1자 이상이어야 합니다',
            'string.max': '복용 빈도는 100자 이하여야 합니다',
            'any.required': '복용 빈도는 필수 항목입니다',
        }),
        duration: joi_1.default.string()
            .max(100)
            .optional()
            .messages({
            'string.max': '복용 기간은 100자 이하여야 합니다',
        }),
        instructions: joi_1.default.string()
            .max(500)
            .optional()
            .messages({
            'string.max': '복용 지침은 500자 이하여야 합니다',
        }),
    });
    const schema = joi_1.default.object({
        hospitalName: joi_1.default.string()
            .min(1)
            .max(200)
            .required()
            .messages({
            'string.min': '병원명은 1자 이상이어야 합니다',
            'string.max': '병원명은 200자 이하여야 합니다',
            'any.required': '병원명은 필수 항목입니다',
        }),
        department: joi_1.default.string()
            .min(1)
            .max(100)
            .required()
            .messages({
            'string.min': '진료과는 1자 이상이어야 합니다',
            'string.max': '진료과는 100자 이하여야 합니다',
            'any.required': '진료과는 필수 항목입니다',
        }),
        doctorName: joi_1.default.string()
            .min(1)
            .max(100)
            .required()
            .messages({
            'string.min': '의사명은 1자 이상이어야 합니다',
            'string.max': '의사명은 100자 이하여야 합니다',
            'any.required': '의사명은 필수 항목입니다',
        }),
        diagnosisCode: joi_1.default.string()
            .pattern(/^[A-Z]\d{2}(\.\d{1,2})?$/)
            .optional()
            .messages({
            'string.pattern.base': '유효한 ICD-10 코드 형식이 아닙니다 (예: A00, B15.1)',
        }),
        diagnosisDescription: joi_1.default.string()
            .max(500)
            .optional()
            .messages({
            'string.max': '진단 설명은 500자 이하여야 합니다',
        }),
        doctorNotes: joi_1.default.string()
            .max(1000)
            .optional()
            .messages({
            'string.max': '의사 소견은 1000자 이하여야 합니다',
        }),
        cost: joi_1.default.number()
            .min(0)
            .max(10000000)
            .optional()
            .messages({
            'number.min': '진료비는 0 이상이어야 합니다',
            'number.max': '진료비는 1000만원 이하여야 합니다',
        }),
        visitDate: joi_1.default.string()
            .isoDate()
            .required()
            .custom((value, helpers) => {
            const visitDate = new Date(value);
            const today = new Date();
            if (visitDate > today) {
                return helpers.error('any.invalid');
            }
            return value;
        })
            .messages({
            'string.isoDate': '유효한 진료 날짜를 입력해주세요 (YYYY-MM-DD)',
            'any.required': '진료 날짜는 필수 항목입니다',
            'any.invalid': '진료 날짜는 미래일 수 없습니다',
        }),
        testResults: joi_1.default.array()
            .items(testResultSchema)
            .optional()
            .messages({
            'array.base': '검사 결과는 배열 형태여야 합니다',
        }),
        prescriptions: joi_1.default.array()
            .items(prescriptionSchema)
            .optional()
            .messages({
            'array.base': '처방전은 배열 형태여야 합니다',
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: handleValidationError(error),
        });
        return;
    }
    next();
}
function validateMedicalRecordUpdate(req, res, next) {
    const schema = joi_1.default.object({
        hospitalName: joi_1.default.string()
            .min(1)
            .max(200)
            .optional()
            .messages({
            'string.min': '병원명은 1자 이상이어야 합니다',
            'string.max': '병원명은 200자 이하여야 합니다',
        }),
        department: joi_1.default.string()
            .min(1)
            .max(100)
            .optional()
            .messages({
            'string.min': '진료과는 1자 이상이어야 합니다',
            'string.max': '진료과는 100자 이하여야 합니다',
        }),
        doctorName: joi_1.default.string()
            .min(1)
            .max(100)
            .optional()
            .messages({
            'string.min': '의사명은 1자 이상이어야 합니다',
            'string.max': '의사명은 100자 이하여야 합니다',
        }),
        diagnosisCode: joi_1.default.string()
            .pattern(/^[A-Z]\d{2}(\.\d{1,2})?$/)
            .optional()
            .allow(null)
            .messages({
            'string.pattern.base': '유효한 ICD-10 코드 형식이 아닙니다 (예: A00, B15.1)',
        }),
        diagnosisDescription: joi_1.default.string()
            .max(500)
            .optional()
            .allow(null)
            .messages({
            'string.max': '진단 설명은 500자 이하여야 합니다',
        }),
        doctorNotes: joi_1.default.string()
            .max(1000)
            .optional()
            .allow(null)
            .messages({
            'string.max': '의사 소견은 1000자 이하여야 합니다',
        }),
        cost: joi_1.default.number()
            .min(0)
            .max(10000000)
            .optional()
            .allow(null)
            .messages({
            'number.min': '진료비는 0 이상이어야 합니다',
            'number.max': '진료비는 1000만원 이하여야 합니다',
        }),
        visitDate: joi_1.default.string()
            .isoDate()
            .optional()
            .custom((value, helpers) => {
            const visitDate = new Date(value);
            const today = new Date();
            if (visitDate > today) {
                return helpers.error('any.invalid');
            }
            return value;
        })
            .messages({
            'string.isoDate': '유효한 진료 날짜를 입력해주세요 (YYYY-MM-DD)',
            'any.invalid': '진료 날짜는 미래일 수 없습니다',
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: handleValidationError(error),
        });
        return;
    }
    next();
}
function validateTestResult(req, res, next) {
    const testItemSchema = joi_1.default.object({
        name: joi_1.default.string()
            .min(1)
            .max(200)
            .required()
            .messages({
            'string.min': '검사 항목명은 1자 이상이어야 합니다',
            'string.max': '검사 항목명은 200자 이하여야 합니다',
            'any.required': '검사 항목명은 필수 항목입니다',
        }),
        value: joi_1.default.alternatives()
            .try(joi_1.default.number().min(-999999).max(999999), joi_1.default.string().max(100))
            .required()
            .messages({
            'alternatives.match': '검사 값은 숫자 또는 문자열이어야 합니다',
            'any.required': '검사 값은 필수 항목입니다',
        }),
        unit: joi_1.default.string()
            .max(20)
            .optional()
            .messages({
            'string.max': '단위는 20자 이하여야 합니다',
        }),
        referenceRange: joi_1.default.object({
            min: joi_1.default.number().optional(),
            max: joi_1.default.number().optional(),
            text: joi_1.default.string().max(100).optional(),
        }).required()
            .messages({
            'any.required': '정상 범위 정보는 필수 항목입니다',
        }),
        status: joi_1.default.string()
            .valid('normal', 'abnormal', 'critical', 'borderline', 'pending')
            .optional()
            .messages({
            'any.only': '상태는 normal, abnormal, critical, borderline, pending 중 하나여야 합니다',
        }),
        flags: joi_1.default.array()
            .items(joi_1.default.string().max(10))
            .optional()
            .messages({
            'string.max': '플래그는 10자 이하여야 합니다',
        }),
    });
    const schema = joi_1.default.object({
        testCategory: joi_1.default.string()
            .valid('blood', 'urine', 'imaging', 'endoscopy', 'biopsy', 'cardiac', 'pulmonary', 'other')
            .required()
            .messages({
            'any.only': '검사 카테고리는 blood, urine, imaging, endoscopy, biopsy, cardiac, pulmonary, other 중 하나여야 합니다',
            'any.required': '검사 카테고리는 필수 항목입니다',
        }),
        testSubcategory: joi_1.default.string()
            .valid('cbc', 'liver_function', 'kidney_function', 'lipid_panel', 'glucose', 'thyroid', 'cardiac_markers', 'tumor_markers', 'hormones', 'vitamins', 'electrolytes', 'coagulation', 'immunology', 'other')
            .optional()
            .messages({
            'any.only': '혈액검사 하위 카테고리가 유효하지 않습니다',
        }),
        testName: joi_1.default.string()
            .min(1)
            .max(200)
            .required()
            .messages({
            'string.min': '검사명은 1자 이상이어야 합니다',
            'string.max': '검사명은 200자 이하여야 합니다',
            'any.required': '검사명은 필수 항목입니다',
        }),
        testItems: joi_1.default.array()
            .items(testItemSchema)
            .min(1)
            .required()
            .messages({
            'array.min': '최소 1개의 검사 항목이 필요합니다',
            'any.required': '검사 항목은 필수 항목입니다',
        }),
        overallStatus: joi_1.default.string()
            .valid('normal', 'abnormal', 'critical', 'borderline', 'pending')
            .optional()
            .messages({
            'any.only': '전체 상태는 normal, abnormal, critical, borderline, pending 중 하나여야 합니다',
        }),
        testDate: joi_1.default.string()
            .isoDate()
            .required()
            .custom((value, helpers) => {
            const testDate = new Date(value);
            const today = new Date();
            if (testDate > today) {
                return helpers.error('any.invalid');
            }
            return value;
        })
            .messages({
            'string.isoDate': '유효한 검사 날짜를 입력해주세요 (YYYY-MM-DD)',
            'any.required': '검사 날짜는 필수 항목입니다',
            'any.invalid': '검사 날짜는 미래일 수 없습니다',
        }),
        laboratoryName: joi_1.default.string()
            .max(200)
            .optional()
            .messages({
            'string.max': '검사 기관명은 200자 이하여야 합니다',
        }),
        doctorNotes: joi_1.default.string()
            .max(1000)
            .optional()
            .messages({
            'string.max': '의사 소견은 1000자 이하여야 합니다',
        }),
        imageFiles: joi_1.default.array()
            .items(joi_1.default.string().max(500))
            .optional()
            .messages({
            'string.max': '이미지 파일 경로는 500자 이하여야 합니다',
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: handleValidationError(error),
        });
        return;
    }
    next();
}
function validateMedication(req, res, next) {
    const schema = joi_1.default.object({
        name: joi_1.default.string()
            .min(1)
            .max(200)
            .required()
            .messages({
            'string.min': '약물명은 1자 이상이어야 합니다',
            'string.max': '약물명은 200자 이하여야 합니다',
            'any.required': '약물명은 필수 항목입니다',
        }),
        genericName: joi_1.default.string()
            .max(200)
            .optional()
            .messages({
            'string.max': '일반명은 200자 이하여야 합니다',
        }),
        dosage: joi_1.default.string()
            .min(1)
            .max(100)
            .required()
            .messages({
            'string.min': '용량은 1자 이상이어야 합니다',
            'string.max': '용량은 100자 이하여야 합니다',
            'any.required': '용량은 필수 항목입니다',
        }),
        frequency: joi_1.default.string()
            .min(1)
            .max(100)
            .required()
            .messages({
            'string.min': '복용 빈도는 1자 이상이어야 합니다',
            'string.max': '복용 빈도는 100자 이하여야 합니다',
            'any.required': '복용 빈도는 필수 항목입니다',
        }),
        route: joi_1.default.string()
            .valid('oral', 'injection', 'topical', 'inhalation', 'sublingual', 'rectal', 'other')
            .optional()
            .messages({
            'any.only': '투여 경로는 oral, injection, topical, inhalation, sublingual, rectal, other 중 하나여야 합니다',
        }),
        startDate: joi_1.default.string()
            .isoDate()
            .required()
            .messages({
            'string.isoDate': '유효한 시작 날짜를 입력해주세요 (YYYY-MM-DD)',
            'any.required': '시작 날짜는 필수 항목입니다',
        }),
        endDate: joi_1.default.string()
            .isoDate()
            .optional()
            .messages({
            'string.isoDate': '유효한 종료 날짜를 입력해주세요 (YYYY-MM-DD)',
        }),
        purpose: joi_1.default.string()
            .max(500)
            .optional()
            .messages({
            'string.max': '복용 목적은 500자 이하여야 합니다',
        }),
        prescribedBy: joi_1.default.string()
            .max(100)
            .optional()
            .messages({
            'string.max': '처방의는 100자 이하여야 합니다',
        }),
        pharmacy: joi_1.default.string()
            .max(200)
            .optional()
            .messages({
            'string.max': '약국명은 200자 이하여야 합니다',
        }),
        notes: joi_1.default.string()
            .max(1000)
            .optional()
            .messages({
            'string.max': '메모는 1000자 이하여야 합니다',
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: handleValidationError(error),
        });
        return;
    }
    next();
}
function validateSchedule(req, res, next) {
    const schema = joi_1.default.object({
        timeOfDay: joi_1.default.string()
            .valid('morning', 'afternoon', 'evening', 'night')
            .required()
            .messages({
            'any.only': '복용 시간대는 morning, afternoon, evening, night 중 하나여야 합니다',
            'any.required': '복용 시간대는 필수 항목입니다',
        }),
        scheduledTime: joi_1.default.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required()
            .messages({
            'string.pattern.base': '시간은 HH:MM 형식이어야 합니다 (예: 08:30)',
            'any.required': '예정 시간은 필수 항목입니다',
        }),
        dosage: joi_1.default.string()
            .min(1)
            .max(100)
            .required()
            .messages({
            'string.min': '용량은 1자 이상이어야 합니다',
            'string.max': '용량은 100자 이하여야 합니다',
            'any.required': '용량은 필수 항목입니다',
        }),
        instructions: joi_1.default.string()
            .max(500)
            .optional()
            .messages({
            'string.max': '복용 지침은 500자 이하여야 합니다',
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: handleValidationError(error),
        });
        return;
    }
    next();
}
function validateDosageLog(req, res, next) {
    const schema = joi_1.default.object({
        takenAt: joi_1.default.string()
            .isoDate()
            .optional()
            .messages({
            'string.isoDate': '유효한 복용 시간을 입력해주세요 (ISO 8601 형식)',
        }),
        dosageTaken: joi_1.default.string()
            .min(1)
            .max(100)
            .required()
            .messages({
            'string.min': '복용량은 1자 이상이어야 합니다',
            'string.max': '복용량은 100자 이하여야 합니다',
            'any.required': '복용량은 필수 항목입니다',
        }),
        notes: joi_1.default.string()
            .max(500)
            .optional()
            .messages({
            'string.max': '메모는 500자 이하여야 합니다',
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: handleValidationError(error),
        });
        return;
    }
    next();
}
function validateSideEffect(req, res, next) {
    const schema = joi_1.default.object({
        effectName: joi_1.default.string()
            .min(1)
            .max(200)
            .required()
            .messages({
            'string.min': '부작용명은 1자 이상이어야 합니다',
            'string.max': '부작용명은 200자 이하여야 합니다',
            'any.required': '부작용명은 필수 항목입니다',
        }),
        severity: joi_1.default.string()
            .valid('mild', 'moderate', 'severe')
            .required()
            .messages({
            'any.only': '심각도는 mild, moderate, severe 중 하나여야 합니다',
            'any.required': '심각도는 필수 항목입니다',
        }),
        description: joi_1.default.string()
            .max(1000)
            .optional()
            .messages({
            'string.max': '부작용 설명은 1000자 이하여야 합니다',
        }),
        startDate: joi_1.default.string()
            .isoDate()
            .required()
            .messages({
            'string.isoDate': '유효한 시작 날짜를 입력해주세요 (YYYY-MM-DD)',
            'any.required': '시작 날짜는 필수 항목입니다',
        }),
        endDate: joi_1.default.string()
            .isoDate()
            .optional()
            .messages({
            'string.isoDate': '유효한 종료 날짜를 입력해주세요 (YYYY-MM-DD)',
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: handleValidationError(error),
        });
        return;
    }
    next();
}
function validateFamilyMember(req, res, next) {
    const medicalConditionSchema = joi_1.default.object({
        name: joi_1.default.string()
            .min(1)
            .max(200)
            .required()
            .messages({
            'string.min': '질환명은 1자 이상이어야 합니다',
            'string.max': '질환명은 200자 이하여야 합니다',
            'any.required': '질환명은 필수 항목입니다',
        }),
        diagnosedYear: joi_1.default.number()
            .min(1900)
            .max(new Date().getFullYear())
            .optional()
            .messages({
            'number.min': '진단 연도는 1900년 이후여야 합니다',
            'number.max': '진단 연도는 현재 연도를 초과할 수 없습니다',
        }),
        severity: joi_1.default.string()
            .valid('mild', 'moderate', 'severe')
            .optional()
            .messages({
            'any.only': '심각도는 mild, moderate, severe 중 하나여야 합니다',
        }),
        status: joi_1.default.string()
            .valid('active', 'resolved', 'managed')
            .optional()
            .messages({
            'any.only': '상태는 active, resolved, managed 중 하나여야 합니다',
        }),
        notes: joi_1.default.string()
            .max(500)
            .optional()
            .messages({
            'string.max': '메모는 500자 이하여야 합니다',
        }),
    });
    const schema = joi_1.default.object({
        relationship: joi_1.default.string()
            .valid('father', 'mother', 'stepfather', 'stepmother', 'paternal_grandfather', 'paternal_grandmother', 'maternal_grandfather', 'maternal_grandmother', 'brother', 'sister', 'half_brother', 'half_sister', 'stepbrother', 'stepsister', 'son', 'daughter', 'stepson', 'stepdaughter', 'grandson', 'granddaughter', 'uncle', 'aunt', 'cousin', 'nephew', 'niece')
            .required()
            .messages({
            'any.only': '유효한 가족 관계를 선택해주세요',
            'any.required': '가족 관계는 필수 항목입니다',
        }),
        name: joi_1.default.string()
            .min(1)
            .max(100)
            .optional()
            .messages({
            'string.min': '이름은 1자 이상이어야 합니다',
            'string.max': '이름은 100자 이하여야 합니다',
        }),
        gender: joi_1.default.string()
            .valid('male', 'female', 'unknown')
            .optional()
            .messages({
            'any.only': '성별은 male, female, unknown 중 하나여야 합니다',
        }),
        birthYear: joi_1.default.number()
            .min(1900)
            .max(new Date().getFullYear())
            .optional()
            .messages({
            'number.min': '출생 연도는 1900년 이후여야 합니다',
            'number.max': '출생 연도는 현재 연도를 초과할 수 없습니다',
        }),
        deathYear: joi_1.default.number()
            .min(1900)
            .max(new Date().getFullYear())
            .optional()
            .messages({
            'number.min': '사망 연도는 1900년 이후여야 합니다',
            'number.max': '사망 연도는 현재 연도를 초과할 수 없습니다',
        }),
        isAlive: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': '생존 여부는 true 또는 false여야 합니다',
        }),
        generation: joi_1.default.number()
            .min(-3)
            .max(3)
            .optional()
            .messages({
            'number.min': '세대는 -3 이상이어야 합니다',
            'number.max': '세대는 3 이하여야 합니다',
        }),
        position: joi_1.default.number()
            .min(0)
            .max(20)
            .optional()
            .messages({
            'number.min': '위치는 0 이상이어야 합니다',
            'number.max': '위치는 20 이하여야 합니다',
        }),
        parentId: joi_1.default.string()
            .optional()
            .messages({
            'string.base': '부모 ID는 문자열이어야 합니다',
        }),
        conditions: joi_1.default.array()
            .items(medicalConditionSchema)
            .optional()
            .messages({
            'array.base': '질환 정보는 배열 형태여야 합니다',
        }),
        causeOfDeath: joi_1.default.string()
            .max(200)
            .optional()
            .messages({
            'string.max': '사망 원인은 200자 이하여야 합니다',
        }),
        notes: joi_1.default.string()
            .max(1000)
            .optional()
            .messages({
            'string.max': '메모는 1000자 이하여야 합니다',
        }),
    })
        .custom((value, helpers) => {
        if (value.isAlive === false) {
            if (!value.deathYear) {
                return helpers.error('any.invalid', { message: '사망한 경우 사망 연도를 입력해야 합니다' });
            }
            if (value.birthYear && value.deathYear && value.birthYear >= value.deathYear) {
                return helpers.error('any.invalid', { message: '사망 연도는 출생 연도보다 늦어야 합니다' });
            }
        }
        if (value.isAlive === true) {
            if (value.deathYear || value.causeOfDeath) {
                return helpers.error('any.invalid', { message: '생존한 경우 사망 정보를 입력할 수 없습니다' });
            }
        }
        return value;
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({
            success: false,
            error: handleValidationError(error),
        });
        return;
    }
    next();
}
function validateRequest(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: '입력 데이터가 유효하지 않습니다',
                details: errors.array().map(error => ({
                    field: error.type === 'field' ? error.path : error.type,
                    message: error.msg,
                })),
            },
        });
        return;
    }
    next();
}
function handleValidationError(error) {
    return {
        code: 'VALIDATION_ERROR',
        message: '입력 데이터가 유효하지 않습니다',
        details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
        })),
    };
}
//# sourceMappingURL=validation.js.map