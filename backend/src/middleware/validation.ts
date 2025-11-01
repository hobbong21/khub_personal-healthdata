import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Joi from 'joi';

/**
 * 회원가입 데이터 유효성 검사 (요구사항 1.1, 1.2, 1.3, 1.5)
 */
export function validateRegistration(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': '유효한 이메일 주소를 입력해주세요',
        'any.required': '이메일은 필수 항목입니다',
      }),
    
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': '비밀번호는 최소 8자 이상이어야 합니다',
        'string.pattern.base': '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다',
        'any.required': '비밀번호는 필수 항목입니다',
      }),
    
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': '이름은 최소 2자 이상이어야 합니다',
        'string.max': '이름은 최대 50자까지 입력 가능합니다',
        'any.required': '이름은 필수 항목입니다',
      }),
    
    birthDate: Joi.string()
      .isoDate()
      .required()
      .messages({
        'string.isoDate': '유효한 날짜 형식을 입력해주세요 (YYYY-MM-DD)',
        'any.required': '생년월일은 필수 항목입니다',
      }),
    
    gender: Joi.string()
      .valid('male', 'female', 'other')
      .required()
      .messages({
        'any.only': '성별은 male, female, other 중 하나여야 합니다',
        'any.required': '성별은 필수 항목입니다',
      }),
    
    bloodType: Joi.string()
      .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
      .optional()
      .messages({
        'any.only': '유효한 혈액형을 선택해주세요',
      }),
    
    height: Joi.number()
      .min(50)
      .max(300)
      .optional()
      .messages({
        'number.min': '키는 50cm 이상이어야 합니다',
        'number.max': '키는 300cm 이하여야 합니다',
      }),
    
    weight: Joi.number()
      .min(10)
      .max(500)
      .optional()
      .messages({
        'number.min': '몸무게는 10kg 이상이어야 합니다',
        'number.max': '몸무게는 500kg 이하여야 합니다',
      }),
    
    lifestyleHabits: Joi.object({
      smoking: Joi.boolean().required(),
      alcohol: Joi.string().valid('none', 'light', 'moderate', 'heavy').required(),
      exerciseFrequency: Joi.number().min(0).max(14).required(),
      dietType: Joi.string().required(),
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

/**
 * 로그인 데이터 유효성 검사 (요구사항 1.1, 1.5)
 */
export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': '유효한 이메일 주소를 입력해주세요',
        'any.required': '이메일은 필수 항목입니다',
      }),
    
    password: Joi.string()
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

/**
 * 프로필 업데이트 데이터 유효성 검사 (요구사항 1.2, 1.3, 1.4)
 */
export function validateProfileUpdate(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': '이름은 최소 2자 이상이어야 합니다',
        'string.max': '이름은 최대 50자까지 입력 가능합니다',
      }),
    
    birthDate: Joi.string()
      .isoDate()
      .optional()
      .messages({
        'string.isoDate': '유효한 날짜 형식을 입력해주세요 (YYYY-MM-DD)',
      }),
    
    gender: Joi.string()
      .valid('male', 'female', 'other')
      .optional()
      .messages({
        'any.only': '성별은 male, female, other 중 하나여야 합니다',
      }),
    
    bloodType: Joi.string()
      .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
      .optional()
      .allow(null)
      .messages({
        'any.only': '유효한 혈액형을 선택해주세요',
      }),
    
    height: Joi.number()
      .min(50)
      .max(300)
      .optional()
      .allow(null)
      .messages({
        'number.min': '키는 50cm 이상이어야 합니다',
        'number.max': '키는 300cm 이하여야 합니다',
      }),
    
    weight: Joi.number()
      .min(10)
      .max(500)
      .optional()
      .allow(null)
      .messages({
        'number.min': '몸무게는 10kg 이상이어야 합니다',
        'number.max': '몸무게는 500kg 이하여야 합니다',
      }),
    
    lifestyleHabits: Joi.object({
      smoking: Joi.boolean().required(),
      alcohol: Joi.string().valid('none', 'light', 'moderate', 'heavy').required(),
      exerciseFrequency: Joi.number().min(0).max(14).required(),
      dietType: Joi.string().required(),
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

/**
 * 비밀번호 변경 데이터 유효성 검사 (요구사항 1.5)
 */
export function validatePasswordChange(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': '현재 비밀번호는 필수 항목입니다',
      }),
    
    newPassword: Joi.string()
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

/**
 * 바이탈 사인 데이터 유효성 검사 (요구사항 2.1, 2.2, 2.5)
 */
export function validateVitalSign(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    type: Joi.string()
      .valid('blood_pressure', 'heart_rate', 'temperature', 'blood_sugar', 'weight')
      .required()
      .messages({
        'any.only': '바이탈 사인 타입은 blood_pressure, heart_rate, temperature, blood_sugar, weight 중 하나여야 합니다',
        'any.required': '바이탈 사인 타입은 필수 항목입니다',
      }),
    
    value: Joi.alternatives()
      .conditional('type', {
        is: 'blood_pressure',
        then: Joi.object({
          systolic: Joi.number().min(50).max(300).required(),
          diastolic: Joi.number().min(30).max(200).required(),
        }).required(),
        otherwise: Joi.number().min(0).max(1000).required(),
      })
      .messages({
        'number.min': '값은 0 이상이어야 합니다',
        'number.max': '값이 허용 범위를 초과했습니다',
        'any.required': '측정값은 필수 항목입니다',
      }),
    
    unit: Joi.string()
      .required()
      .messages({
        'any.required': '단위는 필수 항목입니다',
      }),
    
    measuredAt: Joi.string()
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

/**
 * 건강 일지 데이터 유효성 검사 (요구사항 3.1, 3.2, 3.3, 3.4, 3.5)
 */
export function validateHealthJournal(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    conditionRating: Joi.number()
      .min(1)
      .max(5)
      .required()
      .messages({
        'number.min': '컨디션 평점은 1점 이상이어야 합니다',
        'number.max': '컨디션 평점은 5점 이하여야 합니다',
        'any.required': '컨디션 평점은 필수 항목입니다',
      }),
    
    symptoms: Joi.object({
      pain: Joi.number().min(0).max(10).required(),
      fatigue: Joi.number().min(0).max(10).required(),
      sleepQuality: Joi.number().min(0).max(10).required(),
    }).required()
      .messages({
        'any.required': '증상 정보는 필수 항목입니다',
      }),
    
    supplements: Joi.array()
      .items(Joi.string().min(1).max(100))
      .default([])
      .messages({
        'string.min': '영양제 이름은 1자 이상이어야 합니다',
        'string.max': '영양제 이름은 100자 이하여야 합니다',
      }),
    
    exercise: Joi.array()
      .items(Joi.object({
        type: Joi.string().min(1).max(50).required(),
        duration: Joi.number().min(1).max(1440).required(), // 최대 24시간
        intensity: Joi.string().valid('low', 'moderate', 'high').required(),
      }))
      .default([])
      .messages({
        'string.min': '운동 종류는 1자 이상이어야 합니다',
        'string.max': '운동 종류는 50자 이하여야 합니다',
        'number.min': '운동 시간은 1분 이상이어야 합니다',
        'number.max': '운동 시간은 24시간 이하여야 합니다',
        'any.only': '운동 강도는 low, moderate, high 중 하나여야 합니다',
      }),
    
    notes: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': '메모는 1000자 이하여야 합니다',
      }),
    
    recordedDate: Joi.string()
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

/**
 * 건강 기록 업데이트 데이터 유효성 검사 (요구사항 2.5)
 */
export function validateHealthRecordUpdate(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    type: Joi.string()
      .valid('blood_pressure', 'heart_rate', 'temperature', 'blood_sugar', 'weight')
      .optional(),
    
    value: Joi.alternatives()
      .conditional('type', {
        is: 'blood_pressure',
        then: Joi.object({
          systolic: Joi.number().min(50).max(300).required(),
          diastolic: Joi.number().min(30).max(200).required(),
        }),
        otherwise: Joi.number().min(0).max(1000),
      })
      .optional(),
    
    unit: Joi.string().optional(),
    
    measuredAt: Joi.string().isoDate().optional(),
    
    conditionRating: Joi.number().min(1).max(5).optional(),
    
    symptoms: Joi.object({
      pain: Joi.number().min(0).max(10).optional(),
      fatigue: Joi.number().min(0).max(10).optional(),
      sleepQuality: Joi.number().min(0).max(10).optional(),
    }).optional(),
    
    supplements: Joi.array()
      .items(Joi.string().min(1).max(100))
      .optional(),
    
    exercise: Joi.array()
      .items(Joi.object({
        type: Joi.string().min(1).max(50).required(),
        duration: Joi.number().min(1).max(1440).required(),
        intensity: Joi.string().valid('low', 'moderate', 'high').required(),
      }))
      .optional(),
    
    notes: Joi.string().max(1000).optional().allow(''),
    
    recordedDate: Joi.string().isoDate().optional(),
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

/**
 * 진료 기록 생성 데이터 유효성 검사 (요구사항 5.1, 5.2)
 */
export function validateMedicalRecord(req: Request, res: Response, next: NextFunction): void {
  const testResultSchema = Joi.object({
    testType: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': '검사 유형은 1자 이상이어야 합니다',
        'string.max': '검사 유형은 100자 이하여야 합니다',
        'any.required': '검사 유형은 필수 항목입니다',
      }),
    
    testName: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': '검사명은 1자 이상이어야 합니다',
        'string.max': '검사명은 200자 이하여야 합니다',
        'any.required': '검사명은 필수 항목입니다',
      }),
    
    results: Joi.object().required()
      .messages({
        'any.required': '검사 결과는 필수 항목입니다',
      }),
    
    referenceRange: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': '정상 범위는 100자 이하여야 합니다',
      }),
    
    status: Joi.string()
      .valid('normal', 'abnormal', 'critical', 'pending')
      .optional()
      .messages({
        'any.only': '상태는 normal, abnormal, critical, pending 중 하나여야 합니다',
      }),
    
    testDate: Joi.string()
      .isoDate()
      .required()
      .messages({
        'string.isoDate': '유효한 검사 날짜를 입력해주세요 (YYYY-MM-DD)',
        'any.required': '검사 날짜는 필수 항목입니다',
      }),
  });

  const prescriptionSchema = Joi.object({
    medicationName: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': '약물명은 1자 이상이어야 합니다',
        'string.max': '약물명은 200자 이하여야 합니다',
        'any.required': '약물명은 필수 항목입니다',
      }),
    
    dosage: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': '용량은 1자 이상이어야 합니다',
        'string.max': '용량은 100자 이하여야 합니다',
        'any.required': '용량은 필수 항목입니다',
      }),
    
    frequency: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': '복용 빈도는 1자 이상이어야 합니다',
        'string.max': '복용 빈도는 100자 이하여야 합니다',
        'any.required': '복용 빈도는 필수 항목입니다',
      }),
    
    duration: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': '복용 기간은 100자 이하여야 합니다',
      }),
    
    instructions: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': '복용 지침은 500자 이하여야 합니다',
      }),
  });

  const schema = Joi.object({
    hospitalName: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': '병원명은 1자 이상이어야 합니다',
        'string.max': '병원명은 200자 이하여야 합니다',
        'any.required': '병원명은 필수 항목입니다',
      }),
    
    department: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': '진료과는 1자 이상이어야 합니다',
        'string.max': '진료과는 100자 이하여야 합니다',
        'any.required': '진료과는 필수 항목입니다',
      }),
    
    doctorName: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': '의사명은 1자 이상이어야 합니다',
        'string.max': '의사명은 100자 이하여야 합니다',
        'any.required': '의사명은 필수 항목입니다',
      }),
    
    diagnosisCode: Joi.string()
      .pattern(/^[A-Z]\d{2}(\.\d{1,2})?$/)
      .optional()
      .messages({
        'string.pattern.base': '유효한 ICD-10 코드 형식이 아닙니다 (예: A00, B15.1)',
      }),
    
    diagnosisDescription: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': '진단 설명은 500자 이하여야 합니다',
      }),
    
    doctorNotes: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': '의사 소견은 1000자 이하여야 합니다',
      }),
    
    cost: Joi.number()
      .min(0)
      .max(10000000)
      .optional()
      .messages({
        'number.min': '진료비는 0 이상이어야 합니다',
        'number.max': '진료비는 1000만원 이하여야 합니다',
      }),
    
    visitDate: Joi.string()
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
    
    testResults: Joi.array()
      .items(testResultSchema)
      .optional()
      .messages({
        'array.base': '검사 결과는 배열 형태여야 합니다',
      }),
    
    prescriptions: Joi.array()
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

/**
 * 진료 기록 업데이트 데이터 유효성 검사 (요구사항 5.2)
 */
export function validateMedicalRecordUpdate(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    hospitalName: Joi.string()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.min': '병원명은 1자 이상이어야 합니다',
        'string.max': '병원명은 200자 이하여야 합니다',
      }),
    
    department: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': '진료과는 1자 이상이어야 합니다',
        'string.max': '진료과는 100자 이하여야 합니다',
      }),
    
    doctorName: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': '의사명은 1자 이상이어야 합니다',
        'string.max': '의사명은 100자 이하여야 합니다',
      }),
    
    diagnosisCode: Joi.string()
      .pattern(/^[A-Z]\d{2}(\.\d{1,2})?$/)
      .optional()
      .allow(null)
      .messages({
        'string.pattern.base': '유효한 ICD-10 코드 형식이 아닙니다 (예: A00, B15.1)',
      }),
    
    diagnosisDescription: Joi.string()
      .max(500)
      .optional()
      .allow(null)
      .messages({
        'string.max': '진단 설명은 500자 이하여야 합니다',
      }),
    
    doctorNotes: Joi.string()
      .max(1000)
      .optional()
      .allow(null)
      .messages({
        'string.max': '의사 소견은 1000자 이하여야 합니다',
      }),
    
    cost: Joi.number()
      .min(0)
      .max(10000000)
      .optional()
      .allow(null)
      .messages({
        'number.min': '진료비는 0 이상이어야 합니다',
        'number.max': '진료비는 1000만원 이하여야 합니다',
      }),
    
    visitDate: Joi.string()
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

/**
 * 검사 결과 생성 데이터 유효성 검사 (요구사항 8.1, 8.2)
 */
export function validateTestResult(req: Request, res: Response, next: NextFunction): void {
  const testItemSchema = Joi.object({
    name: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': '검사 항목명은 1자 이상이어야 합니다',
        'string.max': '검사 항목명은 200자 이하여야 합니다',
        'any.required': '검사 항목명은 필수 항목입니다',
      }),
    
    value: Joi.alternatives()
      .try(
        Joi.number().min(-999999).max(999999),
        Joi.string().max(100)
      )
      .required()
      .messages({
        'alternatives.match': '검사 값은 숫자 또는 문자열이어야 합니다',
        'any.required': '검사 값은 필수 항목입니다',
      }),
    
    unit: Joi.string()
      .max(20)
      .optional()
      .messages({
        'string.max': '단위는 20자 이하여야 합니다',
      }),
    
    referenceRange: Joi.object({
      min: Joi.number().optional(),
      max: Joi.number().optional(),
      text: Joi.string().max(100).optional(),
    }).required()
      .messages({
        'any.required': '정상 범위 정보는 필수 항목입니다',
      }),
    
    status: Joi.string()
      .valid('normal', 'abnormal', 'critical', 'borderline', 'pending')
      .optional()
      .messages({
        'any.only': '상태는 normal, abnormal, critical, borderline, pending 중 하나여야 합니다',
      }),
    
    flags: Joi.array()
      .items(Joi.string().max(10))
      .optional()
      .messages({
        'string.max': '플래그는 10자 이하여야 합니다',
      }),
  });

  const schema = Joi.object({
    testCategory: Joi.string()
      .valid('blood', 'urine', 'imaging', 'endoscopy', 'biopsy', 'cardiac', 'pulmonary', 'other')
      .required()
      .messages({
        'any.only': '검사 카테고리는 blood, urine, imaging, endoscopy, biopsy, cardiac, pulmonary, other 중 하나여야 합니다',
        'any.required': '검사 카테고리는 필수 항목입니다',
      }),
    
    testSubcategory: Joi.string()
      .valid('cbc', 'liver_function', 'kidney_function', 'lipid_panel', 'glucose', 'thyroid', 'cardiac_markers', 'tumor_markers', 'hormones', 'vitamins', 'electrolytes', 'coagulation', 'immunology', 'other')
      .optional()
      .messages({
        'any.only': '혈액검사 하위 카테고리가 유효하지 않습니다',
      }),
    
    testName: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': '검사명은 1자 이상이어야 합니다',
        'string.max': '검사명은 200자 이하여야 합니다',
        'any.required': '검사명은 필수 항목입니다',
      }),
    
    testItems: Joi.array()
      .items(testItemSchema)
      .min(1)
      .required()
      .messages({
        'array.min': '최소 1개의 검사 항목이 필요합니다',
        'any.required': '검사 항목은 필수 항목입니다',
      }),
    
    overallStatus: Joi.string()
      .valid('normal', 'abnormal', 'critical', 'borderline', 'pending')
      .optional()
      .messages({
        'any.only': '전체 상태는 normal, abnormal, critical, borderline, pending 중 하나여야 합니다',
      }),
    
    testDate: Joi.string()
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
    
    laboratoryName: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': '검사 기관명은 200자 이하여야 합니다',
      }),
    
    doctorNotes: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': '의사 소견은 1000자 이하여야 합니다',
      }),
    
    imageFiles: Joi.array()
      .items(Joi.string().max(500))
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

/**
 * 약물 등록 데이터 유효성 검사 (요구사항 6.1)
 */
export function validateMedication(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    name: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': '약물명은 1자 이상이어야 합니다',
        'string.max': '약물명은 200자 이하여야 합니다',
        'any.required': '약물명은 필수 항목입니다',
      }),
    
    genericName: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': '일반명은 200자 이하여야 합니다',
      }),
    
    dosage: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': '용량은 1자 이상이어야 합니다',
        'string.max': '용량은 100자 이하여야 합니다',
        'any.required': '용량은 필수 항목입니다',
      }),
    
    frequency: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': '복용 빈도는 1자 이상이어야 합니다',
        'string.max': '복용 빈도는 100자 이하여야 합니다',
        'any.required': '복용 빈도는 필수 항목입니다',
      }),
    
    route: Joi.string()
      .valid('oral', 'injection', 'topical', 'inhalation', 'sublingual', 'rectal', 'other')
      .optional()
      .messages({
        'any.only': '투여 경로는 oral, injection, topical, inhalation, sublingual, rectal, other 중 하나여야 합니다',
      }),
    
    startDate: Joi.string()
      .isoDate()
      .required()
      .messages({
        'string.isoDate': '유효한 시작 날짜를 입력해주세요 (YYYY-MM-DD)',
        'any.required': '시작 날짜는 필수 항목입니다',
      }),
    
    endDate: Joi.string()
      .isoDate()
      .optional()
      .messages({
        'string.isoDate': '유효한 종료 날짜를 입력해주세요 (YYYY-MM-DD)',
      }),
    
    purpose: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': '복용 목적은 500자 이하여야 합니다',
      }),
    
    prescribedBy: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': '처방의는 100자 이하여야 합니다',
      }),
    
    pharmacy: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': '약국명은 200자 이하여야 합니다',
      }),
    
    notes: Joi.string()
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

/**
 * 복약 스케줄 데이터 유효성 검사 (요구사항 6.1, 6.2)
 */
export function validateSchedule(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    timeOfDay: Joi.string()
      .valid('morning', 'afternoon', 'evening', 'night')
      .required()
      .messages({
        'any.only': '복용 시간대는 morning, afternoon, evening, night 중 하나여야 합니다',
        'any.required': '복용 시간대는 필수 항목입니다',
      }),
    
    scheduledTime: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': '시간은 HH:MM 형식이어야 합니다 (예: 08:30)',
        'any.required': '예정 시간은 필수 항목입니다',
      }),
    
    dosage: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': '용량은 1자 이상이어야 합니다',
        'string.max': '용량은 100자 이하여야 합니다',
        'any.required': '용량은 필수 항목입니다',
      }),
    
    instructions: Joi.string()
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

/**
 * 복약 기록 데이터 유효성 검사 (요구사항 6.2, 6.5)
 */
export function validateDosageLog(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    takenAt: Joi.string()
      .isoDate()
      .optional()
      .messages({
        'string.isoDate': '유효한 복용 시간을 입력해주세요 (ISO 8601 형식)',
      }),
    
    dosageTaken: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': '복용량은 1자 이상이어야 합니다',
        'string.max': '복용량은 100자 이하여야 합니다',
        'any.required': '복용량은 필수 항목입니다',
      }),
    
    notes: Joi.string()
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

/**
 * 부작용 기록 데이터 유효성 검사 (요구사항 6.4)
 */
export function validateSideEffect(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    effectName: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': '부작용명은 1자 이상이어야 합니다',
        'string.max': '부작용명은 200자 이하여야 합니다',
        'any.required': '부작용명은 필수 항목입니다',
      }),
    
    severity: Joi.string()
      .valid('mild', 'moderate', 'severe')
      .required()
      .messages({
        'any.only': '심각도는 mild, moderate, severe 중 하나여야 합니다',
        'any.required': '심각도는 필수 항목입니다',
      }),
    
    description: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': '부작용 설명은 1000자 이하여야 합니다',
      }),
    
    startDate: Joi.string()
      .isoDate()
      .required()
      .messages({
        'string.isoDate': '유효한 시작 날짜를 입력해주세요 (YYYY-MM-DD)',
        'any.required': '시작 날짜는 필수 항목입니다',
      }),
    
    endDate: Joi.string()
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

/**
 * 가족력 구성원 데이터 유효성 검사 (요구사항 9.1, 9.2, 9.3)
 */
export function validateFamilyMember(req: Request, res: Response, next: NextFunction): void {
  const medicalConditionSchema = Joi.object({
    name: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': '질환명은 1자 이상이어야 합니다',
        'string.max': '질환명은 200자 이하여야 합니다',
        'any.required': '질환명은 필수 항목입니다',
      }),
    
    diagnosedYear: Joi.number()
      .min(1900)
      .max(new Date().getFullYear())
      .optional()
      .messages({
        'number.min': '진단 연도는 1900년 이후여야 합니다',
        'number.max': '진단 연도는 현재 연도를 초과할 수 없습니다',
      }),
    
    severity: Joi.string()
      .valid('mild', 'moderate', 'severe')
      .optional()
      .messages({
        'any.only': '심각도는 mild, moderate, severe 중 하나여야 합니다',
      }),
    
    status: Joi.string()
      .valid('active', 'resolved', 'managed')
      .optional()
      .messages({
        'any.only': '상태는 active, resolved, managed 중 하나여야 합니다',
      }),
    
    notes: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': '메모는 500자 이하여야 합니다',
      }),
  });

  const schema = Joi.object({
    relationship: Joi.string()
      .valid(
        'father', 'mother', 'stepfather', 'stepmother',
        'paternal_grandfather', 'paternal_grandmother', 'maternal_grandfather', 'maternal_grandmother',
        'brother', 'sister', 'half_brother', 'half_sister', 'stepbrother', 'stepsister',
        'son', 'daughter', 'stepson', 'stepdaughter',
        'grandson', 'granddaughter',
        'uncle', 'aunt', 'cousin', 'nephew', 'niece'
      )
      .required()
      .messages({
        'any.only': '유효한 가족 관계를 선택해주세요',
        'any.required': '가족 관계는 필수 항목입니다',
      }),
    
    name: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': '이름은 1자 이상이어야 합니다',
        'string.max': '이름은 100자 이하여야 합니다',
      }),
    
    gender: Joi.string()
      .valid('male', 'female', 'unknown')
      .optional()
      .messages({
        'any.only': '성별은 male, female, unknown 중 하나여야 합니다',
      }),
    
    birthYear: Joi.number()
      .min(1900)
      .max(new Date().getFullYear())
      .optional()
      .messages({
        'number.min': '출생 연도는 1900년 이후여야 합니다',
        'number.max': '출생 연도는 현재 연도를 초과할 수 없습니다',
      }),
    
    deathYear: Joi.number()
      .min(1900)
      .max(new Date().getFullYear())
      .optional()
      .messages({
        'number.min': '사망 연도는 1900년 이후여야 합니다',
        'number.max': '사망 연도는 현재 연도를 초과할 수 없습니다',
      }),
    
    isAlive: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': '생존 여부는 true 또는 false여야 합니다',
      }),
    
    generation: Joi.number()
      .min(-3)
      .max(3)
      .optional()
      .messages({
        'number.min': '세대는 -3 이상이어야 합니다',
        'number.max': '세대는 3 이하여야 합니다',
      }),
    
    position: Joi.number()
      .min(0)
      .max(20)
      .optional()
      .messages({
        'number.min': '위치는 0 이상이어야 합니다',
        'number.max': '위치는 20 이하여야 합니다',
      }),
    
    parentId: Joi.string()
      .optional()
      .messages({
        'string.base': '부모 ID는 문자열이어야 합니다',
      }),
    
    conditions: Joi.array()
      .items(medicalConditionSchema)
      .optional()
      .messages({
        'array.base': '질환 정보는 배열 형태여야 합니다',
      }),
    
    causeOfDeath: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': '사망 원인은 200자 이하여야 합니다',
      }),
    
    notes: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': '메모는 1000자 이하여야 합니다',
      }),
  })
  .custom((value, helpers) => {
    // 사망한 경우 사망 연도와 원인이 있어야 함
    if (value.isAlive === false) {
      if (!value.deathYear) {
        return helpers.error('any.invalid', { message: '사망한 경우 사망 연도를 입력해야 합니다' });
      }
      if (value.birthYear && value.deathYear && value.birthYear >= value.deathYear) {
        return helpers.error('any.invalid', { message: '사망 연도는 출생 연도보다 늦어야 합니다' });
      }
    }
    
    // 살아있는 경우 사망 정보가 없어야 함
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

/**
 * Express-validator 결과 검증 미들웨어
 */
export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  
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

/**
 * 일반적인 유효성 검사 에러 핸들러
 */
export function handleValidationError(error: Joi.ValidationError): {
  code: string;
  message: string;
  details: Array<{ field: string; message: string }>;
} {
  return {
    code: 'VALIDATION_ERROR',
    message: '입력 데이터가 유효하지 않습니다',
    details: error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    })),
  };
}