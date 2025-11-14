"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestResultAnalysis = void 0;
const ReferenceRange_1 = require("../models/ReferenceRange");
class TestResultAnalysis {
    static determineOverallStatus(testItems) {
        if (testItems.some(item => item.status === 'critical')) {
            return 'critical';
        }
        if (testItems.some(item => item.status === 'abnormal')) {
            return 'abnormal';
        }
        if (testItems.some(item => item.status === 'borderline')) {
            return 'borderline';
        }
        if (testItems.some(item => item.status === 'pending')) {
            return 'pending';
        }
        return 'normal';
    }
    static async analyzeTestItems(testItems, testName, testCategory, age, gender) {
        const analyzedItems = [];
        for (const item of testItems) {
            const rangeCheck = await ReferenceRange_1.ReferenceRangeModel.checkNormalRange(item.name, testCategory, item.value, age, gender);
            const analyzedItem = {
                ...item,
                status: rangeCheck.status,
                flags: this.generateFlags(item.value, item.referenceRange)
            };
            if (!item.referenceRange.min && !item.referenceRange.max && !item.referenceRange.text) {
                const ranges = await ReferenceRange_1.ReferenceRangeModel.findByTest(item.name, testCategory, age, gender);
                if (ranges.length > 0) {
                    const range = ranges[0];
                    analyzedItem.referenceRange = {
                        min: range.minValue || undefined,
                        max: range.maxValue || undefined,
                        text: range.textRange || undefined
                    };
                }
            }
            analyzedItems.push(analyzedItem);
        }
        return analyzedItems;
    }
    static generateFlags(value, referenceRange) {
        const flags = [];
        if (typeof value === 'number' && referenceRange.min !== undefined && referenceRange.max !== undefined) {
            if (value > referenceRange.max) {
                const ratio = value / referenceRange.max;
                if (ratio > 2) {
                    flags.push('C');
                }
                else {
                    flags.push('H');
                }
            }
            else if (value < referenceRange.min) {
                const ratio = referenceRange.min / value;
                if (ratio > 2) {
                    flags.push('C');
                }
                else {
                    flags.push('L');
                }
            }
        }
        return flags;
    }
    static getRecommendedFrequency(testCategory, testName, age) {
        const frequencies = {
            'blood_cbc': age > 40 ? '매년' : '2년마다',
            'blood_liver_function': age > 40 ? '매년' : '2년마다',
            'blood_kidney_function': age > 40 ? '매년' : '2년마다',
            'blood_lipid_panel': age > 40 ? '매년' : '2년마다',
            'blood_glucose': age > 40 ? '매년' : '2년마다',
            'blood_thyroid': '2-3년마다',
            'blood_tumor_markers': age > 50 ? '매년' : '필요시',
            'urine': '매년',
            'imaging_chest_xray': '매년',
            'imaging_mammography': age > 40 ? '2년마다' : '필요시',
            'imaging_colonoscopy': age > 50 ? '5년마다' : '필요시',
            'endoscopy_gastroscopy': age > 40 ? '2년마다' : '필요시'
        };
        const key = `${testCategory}_${testName.toLowerCase().replace(/\s+/g, '_')}`;
        return frequencies[key] || '필요시';
    }
    static generateInterpretation(testItems, testCategory) {
        const interpretations = [];
        const abnormalItems = testItems.filter(item => item.status === 'abnormal' || item.status === 'critical' || item.status === 'borderline');
        if (abnormalItems.length === 0) {
            interpretations.push('모든 검사 항목이 정상 범위 내에 있습니다.');
            return interpretations;
        }
        switch (testCategory) {
            case 'blood':
                interpretations.push(...this.interpretBloodTest(abnormalItems));
                break;
            case 'urine':
                interpretations.push(...this.interpretUrineTest(abnormalItems));
                break;
            case 'imaging':
                interpretations.push('영상 검사 결과에 대해서는 담당 의사와 상담하시기 바랍니다.');
                break;
            default:
                interpretations.push('비정상 결과가 있습니다. 담당 의사와 상담하시기 바랍니다.');
        }
        return interpretations;
    }
    static interpretBloodTest(abnormalItems) {
        const interpretations = [];
        for (const item of abnormalItems) {
            switch (item.name.toLowerCase()) {
                case 'glucose':
                case 'hba1c':
                    if (item.status === 'abnormal' || item.status === 'critical') {
                        interpretations.push('혈당 수치가 높습니다. 당뇨병 관리가 필요할 수 있습니다.');
                    }
                    break;
                case 'total cholesterol':
                case 'ldl cholesterol':
                case 'triglyceride':
                    if (item.status === 'abnormal' || item.status === 'critical') {
                        interpretations.push('지질 수치가 높습니다. 식이요법과 운동이 필요할 수 있습니다.');
                    }
                    break;
                case 'ast':
                case 'alt':
                    if (item.status === 'abnormal' || item.status === 'critical') {
                        interpretations.push('간 기능 수치가 높습니다. 간 건강 관리가 필요합니다.');
                    }
                    break;
                case 'creatinine':
                case 'bun':
                    if (item.status === 'abnormal' || item.status === 'critical') {
                        interpretations.push('신장 기능 수치에 이상이 있습니다. 신장 건강 관리가 필요합니다.');
                    }
                    break;
                case 'hemoglobin':
                case 'hematocrit':
                    if (item.status === 'abnormal' || item.status === 'critical') {
                        interpretations.push('빈혈 수치에 이상이 있습니다. 철분 보충이 필요할 수 있습니다.');
                    }
                    break;
            }
        }
        if (interpretations.length === 0) {
            interpretations.push('일부 혈액 검사 수치가 정상 범위를 벗어났습니다. 담당 의사와 상담하시기 바랍니다.');
        }
        return interpretations;
    }
    static interpretUrineTest(abnormalItems) {
        const interpretations = [];
        for (const item of abnormalItems) {
            switch (item.name.toLowerCase()) {
                case 'protein':
                    if (item.value !== 'negative') {
                        interpretations.push('소변에서 단백질이 검출되었습니다. 신장 기능 검사가 필요할 수 있습니다.');
                    }
                    break;
                case 'glucose':
                    if (item.value !== 'negative') {
                        interpretations.push('소변에서 당이 검출되었습니다. 혈당 검사가 필요할 수 있습니다.');
                    }
                    break;
                case 'blood':
                    if (item.value !== 'negative') {
                        interpretations.push('소변에서 혈액이 검출되었습니다. 추가 검사가 필요할 수 있습니다.');
                    }
                    break;
            }
        }
        if (interpretations.length === 0) {
            interpretations.push('소변 검사에서 이상 소견이 있습니다. 담당 의사와 상담하시기 바랍니다.');
        }
        return interpretations;
    }
    static generateSummary(testItems) {
        const summary = {
            totalItems: testItems.length,
            normalCount: testItems.filter(item => item.status === 'normal').length,
            abnormalCount: testItems.filter(item => item.status === 'abnormal' || item.status === 'borderline').length,
            criticalCount: testItems.filter(item => item.status === 'critical').length,
            keyFindings: []
        };
        const criticalItems = testItems.filter(item => item.status === 'critical');
        const abnormalItems = testItems.filter(item => item.status === 'abnormal');
        if (criticalItems.length > 0) {
            summary.keyFindings.push(`위험 수치: ${criticalItems.map(item => item.name).join(', ')}`);
        }
        if (abnormalItems.length > 0) {
            summary.keyFindings.push(`비정상 수치: ${abnormalItems.slice(0, 3).map(item => item.name).join(', ')}${abnormalItems.length > 3 ? ' 외' : ''}`);
        }
        if (summary.normalCount === summary.totalItems) {
            summary.keyFindings.push('모든 검사 항목 정상');
        }
        return summary;
    }
}
exports.TestResultAnalysis = TestResultAnalysis;
//# sourceMappingURL=testResultAnalysis.js.map