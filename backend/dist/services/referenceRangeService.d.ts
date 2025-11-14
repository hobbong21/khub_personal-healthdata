import { TestCategory } from '../types/medical';
export declare class ReferenceRangeService {
    static initializeDefaultRanges(): Promise<void>;
    static getReferenceRange(testName: string, testCategory: TestCategory, age?: number, gender?: 'male' | 'female'): Promise<{
        id: string;
        gender: string | null;
        createdAt: Date;
        updatedAt: Date;
        unit: string | null;
        testName: string;
        testCategory: string;
        ageMin: number | null;
        ageMax: number | null;
        minValue: number | null;
        maxValue: number | null;
        textRange: string | null;
        source: string | null;
        isActive: boolean;
    }[]>;
    static getAllReferenceRanges(testCategory?: TestCategory): Promise<{
        id: string;
        gender: string | null;
        createdAt: Date;
        updatedAt: Date;
        unit: string | null;
        testName: string;
        testCategory: string;
        ageMin: number | null;
        ageMax: number | null;
        minValue: number | null;
        maxValue: number | null;
        textRange: string | null;
        source: string | null;
        isActive: boolean;
    }[]>;
    static validateTestValue(testName: string, testCategory: TestCategory, value: number | string, age?: number, gender?: 'male' | 'female'): Promise<{
        isNormal: boolean;
        status: "normal" | "abnormal" | "critical";
        message?: string;
    }>;
    static addReferenceRange(data: {
        testName: string;
        testCategory: TestCategory;
        unit?: string;
        ageMin?: number;
        ageMax?: number;
        gender?: 'male' | 'female' | 'all';
        minValue?: number;
        maxValue?: number;
        textRange?: string;
        source?: string;
    }): Promise<{
        id: string;
        gender: string | null;
        createdAt: Date;
        updatedAt: Date;
        unit: string | null;
        testName: string;
        testCategory: string;
        ageMin: number | null;
        ageMax: number | null;
        minValue: number | null;
        maxValue: number | null;
        textRange: string | null;
        source: string | null;
        isActive: boolean;
    }>;
    static updateReferenceRange(id: string, data: Partial<{
        unit: string;
        ageMin: number;
        ageMax: number;
        gender: string;
        minValue: number;
        maxValue: number;
        textRange: string;
        source: string;
        isActive: boolean;
    }>): Promise<{
        id: string;
        gender: string | null;
        createdAt: Date;
        updatedAt: Date;
        unit: string | null;
        testName: string;
        testCategory: string;
        ageMin: number | null;
        ageMax: number | null;
        minValue: number | null;
        maxValue: number | null;
        textRange: string | null;
        source: string | null;
        isActive: boolean;
    }>;
    static deleteReferenceRange(id: string): Promise<{
        id: string;
        gender: string | null;
        createdAt: Date;
        updatedAt: Date;
        unit: string | null;
        testName: string;
        testCategory: string;
        ageMin: number | null;
        ageMax: number | null;
        minValue: number | null;
        maxValue: number | null;
        textRange: string | null;
        source: string | null;
        isActive: boolean;
    }>;
}
//# sourceMappingURL=referenceRangeService.d.ts.map