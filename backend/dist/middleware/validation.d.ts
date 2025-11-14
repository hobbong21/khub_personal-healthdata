import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare function validateRegistration(req: Request, res: Response, next: NextFunction): void;
export declare function validateLogin(req: Request, res: Response, next: NextFunction): void;
export declare function validateProfileUpdate(req: Request, res: Response, next: NextFunction): void;
export declare function validatePasswordChange(req: Request, res: Response, next: NextFunction): void;
export declare function validateVitalSign(req: Request, res: Response, next: NextFunction): void;
export declare function validateHealthJournal(req: Request, res: Response, next: NextFunction): void;
export declare function validateHealthRecordUpdate(req: Request, res: Response, next: NextFunction): void;
export declare function validateMedicalRecord(req: Request, res: Response, next: NextFunction): void;
export declare function validateMedicalRecordUpdate(req: Request, res: Response, next: NextFunction): void;
export declare function validateTestResult(req: Request, res: Response, next: NextFunction): void;
export declare function validateMedication(req: Request, res: Response, next: NextFunction): void;
export declare function validateSchedule(req: Request, res: Response, next: NextFunction): void;
export declare function validateDosageLog(req: Request, res: Response, next: NextFunction): void;
export declare function validateSideEffect(req: Request, res: Response, next: NextFunction): void;
export declare function validateFamilyMember(req: Request, res: Response, next: NextFunction): void;
export declare function validateRequest(req: Request, res: Response, next: NextFunction): void;
export declare function handleValidationError(error: Joi.ValidationError): {
    code: string;
    message: string;
    details: Array<{
        field: string;
        message: string;
    }>;
};
//# sourceMappingURL=validation.d.ts.map