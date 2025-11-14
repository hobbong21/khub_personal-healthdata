"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceRangeModel = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ReferenceRangeModel {
    static async create(data) {
        return await prisma.referenceRange.create({
            data: {
                testName: data.testName,
                testCategory: data.testCategory,
                unit: data.unit,
                ageMin: data.ageMin,
                ageMax: data.ageMax,
                gender: data.gender || 'all',
                minValue: data.minValue,
                maxValue: data.maxValue,
                textRange: data.textRange,
                source: data.source
            }
        });
    }
    static async findByTest(testName, testCategory, age, gender) {
        const where = {
            testName,
            testCategory,
            isActive: true
        };
        if (age !== undefined) {
            where.OR = [
                { ageMin: null, ageMax: null },
                { ageMin: { lte: age }, ageMax: { gte: age } },
                { ageMin: { lte: age }, ageMax: null },
                { ageMin: null, ageMax: { gte: age } }
            ];
        }
        if (gender) {
            where.gender = { in: [gender, 'all'] };
        }
        return await prisma.referenceRange.findMany({
            where,
            orderBy: [
                { gender: 'desc' },
                { ageMin: 'asc' }
            ]
        });
    }
    static async findAll(testCategory) {
        const where = { isActive: true };
        if (testCategory) {
            where.testCategory = testCategory;
        }
        return await prisma.referenceRange.findMany({
            where,
            orderBy: [
                { testCategory: 'asc' },
                { testName: 'asc' }
            ]
        });
    }
    static async update(id, data) {
        return await prisma.referenceRange.update({
            where: { id },
            data
        });
    }
    static async delete(id) {
        return await prisma.referenceRange.update({
            where: { id },
            data: { isActive: false }
        });
    }
    static async seedDefaultRanges() {
        const defaultRanges = [
            { testName: 'Hemoglobin', testCategory: 'blood', unit: 'g/dL', gender: 'male', minValue: 13.5, maxValue: 17.5, source: '대한진단검사의학회' },
            { testName: 'Hemoglobin', testCategory: 'blood', unit: 'g/dL', gender: 'female', minValue: 12.0, maxValue: 15.5, source: '대한진단검사의학회' },
            { testName: 'Hematocrit', testCategory: 'blood', unit: '%', gender: 'male', minValue: 41.0, maxValue: 53.0, source: '대한진단검사의학회' },
            { testName: 'Hematocrit', testCategory: 'blood', unit: '%', gender: 'female', minValue: 36.0, maxValue: 46.0, source: '대한진단검사의학회' },
            { testName: 'WBC', testCategory: 'blood', unit: '/μL', minValue: 4000, maxValue: 10000, source: '대한진단검사의학회' },
            { testName: 'Platelet', testCategory: 'blood', unit: '/μL', minValue: 150000, maxValue: 450000, source: '대한진단검사의학회' },
            { testName: 'AST', testCategory: 'blood', unit: 'U/L', minValue: 0, maxValue: 40, source: '대한진단검사의학회' },
            { testName: 'ALT', testCategory: 'blood', unit: 'U/L', minValue: 0, maxValue: 40, source: '대한진단검사의학회' },
            { testName: 'Total Bilirubin', testCategory: 'blood', unit: 'mg/dL', minValue: 0.2, maxValue: 1.2, source: '대한진단검사의학회' },
            { testName: 'Albumin', testCategory: 'blood', unit: 'g/dL', minValue: 3.5, maxValue: 5.0, source: '대한진단검사의학회' },
            { testName: 'Creatinine', testCategory: 'blood', unit: 'mg/dL', gender: 'male', minValue: 0.7, maxValue: 1.3, source: '대한진단검사의학회' },
            { testName: 'Creatinine', testCategory: 'blood', unit: 'mg/dL', gender: 'female', minValue: 0.6, maxValue: 1.1, source: '대한진단검사의학회' },
            { testName: 'BUN', testCategory: 'blood', unit: 'mg/dL', minValue: 8, maxValue: 20, source: '대한진단검사의학회' },
            { testName: 'Total Cholesterol', testCategory: 'blood', unit: 'mg/dL', minValue: 0, maxValue: 200, source: '대한진단검사의학회' },
            { testName: 'HDL Cholesterol', testCategory: 'blood', unit: 'mg/dL', gender: 'male', minValue: 40, maxValue: 999, source: '대한진단검사의학회' },
            { testName: 'HDL Cholesterol', testCategory: 'blood', unit: 'mg/dL', gender: 'female', minValue: 50, maxValue: 999, source: '대한진단검사의학회' },
            { testName: 'LDL Cholesterol', testCategory: 'blood', unit: 'mg/dL', minValue: 0, maxValue: 130, source: '대한진단검사의학회' },
            { testName: 'Triglyceride', testCategory: 'blood', unit: 'mg/dL', minValue: 0, maxValue: 150, source: '대한진단검사의학회' },
            { testName: 'Glucose', testCategory: 'blood', unit: 'mg/dL', minValue: 70, maxValue: 100, source: '대한당뇨병학회' },
            { testName: 'HbA1c', testCategory: 'blood', unit: '%', minValue: 0, maxValue: 5.7, source: '대한당뇨병학회' },
            { testName: 'TSH', testCategory: 'blood', unit: 'μIU/mL', minValue: 0.4, maxValue: 4.0, source: '대한내분비학회' },
            { testName: 'Free T4', testCategory: 'blood', unit: 'ng/dL', minValue: 0.8, maxValue: 1.8, source: '대한내분비학회' },
            { testName: 'Protein', testCategory: 'urine', textRange: 'Negative', source: '대한진단검사의학회' },
            { testName: 'Glucose', testCategory: 'urine', textRange: 'Negative', source: '대한진단검사의학회' },
            { testName: 'Blood', testCategory: 'urine', textRange: 'Negative', source: '대한진단검사의학회' },
            { testName: 'Ketone', testCategory: 'urine', textRange: 'Negative', source: '대한진단검사의학회' }
        ];
        for (const range of defaultRanges) {
            await prisma.referenceRange.upsert({
                where: {
                    id: `${range.testName}_${range.testCategory}_${range.gender || 'all'}`
                },
                update: {},
                create: range
            });
        }
    }
    static async checkNormalRange(testName, testCategory, value, age, gender) {
        const ranges = await this.findByTest(testName, testCategory, age, gender);
        if (ranges.length === 0) {
            return { isNormal: true, status: 'normal', message: '정상 범위 정보 없음' };
        }
        const bestRange = ranges[0];
        if (typeof value === 'string') {
            if (bestRange.textRange) {
                const isNormal = value.toLowerCase() === bestRange.textRange.toLowerCase();
                return {
                    isNormal,
                    status: isNormal ? 'normal' : 'abnormal',
                    message: `정상: ${bestRange.textRange}`
                };
            }
            return { isNormal: true, status: 'normal', message: '텍스트 값 비교 불가' };
        }
        if (bestRange.minValue !== null && bestRange.maxValue !== null) {
            const isNormal = value >= bestRange.minValue && value <= bestRange.maxValue;
            let status = 'normal';
            if (!isNormal) {
                const range = bestRange.maxValue - bestRange.minValue;
                const deviation = Math.max(Math.abs(value - bestRange.minValue), Math.abs(value - bestRange.maxValue));
                status = deviation > range ? 'critical' : 'abnormal';
            }
            return {
                isNormal,
                status,
                message: `정상 범위: ${bestRange.minValue}-${bestRange.maxValue} ${bestRange.unit || ''}`
            };
        }
        return { isNormal: true, status: 'normal', message: '정상 범위 정보 불완전' };
    }
}
exports.ReferenceRangeModel = ReferenceRangeModel;
//# sourceMappingURL=ReferenceRange.js.map