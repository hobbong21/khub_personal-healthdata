import { Request, Response, NextFunction } from 'express';
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