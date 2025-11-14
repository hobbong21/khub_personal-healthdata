"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceRangeService = void 0;
const ReferenceRange_1 = require("../models/ReferenceRange");
class ReferenceRangeService {
    static async initializeDefaultRanges() {
        try {
            await ReferenceRange_1.ReferenceRangeModel.seedDefaultRanges();
            console.log('기본 정상 범위 데이터가 성공적으로 초기화되었습니다.');
        }
        catch (error) {
            console.error('기본 정상 범위 데이터 초기화 실패:', error);
            throw error;
        }
    }
    static async getReferenceRange(testName, testCategory, age, gender) {
        return await ReferenceRange_1.ReferenceRangeModel.findByTest(testName, testCategory, age, gender);
    }
    static async getAllReferenceRanges(testCategory) {
        return await ReferenceRange_1.ReferenceRangeModel.findAll(testCategory);
    }
    static async validateTestValue(testName, testCategory, value, age, gender) {
        return await ReferenceRange_1.ReferenceRangeModel.checkNormalRange(testName, testCategory, value, age, gender);
    }
    static async addReferenceRange(data) {
        return await ReferenceRange_1.ReferenceRangeModel.create(data);
    }
    static async updateReferenceRange(id, data) {
        return await ReferenceRange_1.ReferenceRangeModel.update(id, data);
    }
    static async deleteReferenceRange(id) {
        return await ReferenceRange_1.ReferenceRangeModel.delete(id);
    }
}
exports.ReferenceRangeService = ReferenceRangeService;
//# sourceMappingURL=referenceRangeService.js.map