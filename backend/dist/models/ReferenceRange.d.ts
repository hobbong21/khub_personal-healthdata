import { ReferenceRange, TestCategory } from '../types/medical';
export declare class ReferenceRangeModel {
    static create(data: Omit<ReferenceRange, 'ranges'> & {
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
    static findByTest(testName: string, testCategory: TestCategory, age?: number, gender?: 'male' | 'female'): Promise<{
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
    static findAll(testCategory?: TestCategory): Promise<{
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
    static update(id: string, data: Partial<{
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
    static delete(id: string): Promise<{
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
    static seedDefaultRanges(): Promise<void>;
    static checkNormalRange(testName: string, testCategory: TestCategory, value: number | string, age?: number, gender?: 'male' | 'female'): Promise<{
        isNormal: boolean;
        status: 'normal' | 'abnormal' | 'critical';
        message?: string;
    }>;
}
//# sourceMappingURL=ReferenceRange.d.ts.map