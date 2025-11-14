"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalService = void 0;
const MedicalRecord_1 = require("../models/MedicalRecord");
class MedicalService {
    static async createMedicalRecord(userId, recordData) {
        const validation = MedicalRecord_1.MedicalRecordModel.validateMedicalRecord(recordData);
        if (!validation.isValid) {
            throw new Error(`유효성 검사 실패: ${validation.errors.join(', ')}`);
        }
        return await MedicalRecord_1.MedicalRecordModel.create(userId, recordData);
    }
    static async getMedicalRecord(id, userId) {
        const record = await MedicalRecord_1.MedicalRecordModel.findById(id, userId);
        if (!record) {
            throw new Error('진료 기록을 찾을 수 없습니다');
        }
        return record;
    }
    static async getMedicalRecords(userId, filters = {}, page = 1, limit = 10) {
        if (page < 1)
            page = 1;
        if (limit < 1 || limit > 100)
            limit = 10;
        return await MedicalRecord_1.MedicalRecordModel.findByUserId(userId, filters, page, limit);
    }
    static async updateMedicalRecord(id, userId, updateData) {
        if (updateData.visitDate) {
            const visitDate = new Date(updateData.visitDate);
            if (isNaN(visitDate.getTime())) {
                throw new Error('유효한 진료 날짜를 입력해주세요');
            }
            if (visitDate > new Date()) {
                throw new Error('진료 날짜는 미래일 수 없습니다');
            }
        }
        if (updateData.diagnosisCode) {
            const icd10Regex = /^[A-Z]\d{2}(\.\d{1,2})?$/;
            if (!icd10Regex.test(updateData.diagnosisCode)) {
                throw new Error('유효한 ICD-10 코드 형식이 아닙니다 (예: A00, B15.1)');
            }
        }
        if (updateData.cost !== undefined && updateData.cost !== null && updateData.cost < 0) {
            throw new Error('진료비는 0 이상이어야 합니다');
        }
        const updatedRecord = await MedicalRecord_1.MedicalRecordModel.update(id, userId, updateData);
        if (!updatedRecord) {
            throw new Error('진료 기록을 찾을 수 없습니다');
        }
        return updatedRecord;
    }
    static async deleteMedicalRecord(id, userId) {
        const deleted = await MedicalRecord_1.MedicalRecordModel.delete(id, userId);
        if (!deleted) {
            throw new Error('진료 기록을 찾을 수 없습니다');
        }
    }
    static async getMedicalRecordStats(userId) {
        return await MedicalRecord_1.MedicalRecordModel.getStats(userId);
    }
    static async getMedicalRecordTimeline(userId) {
        return await MedicalRecord_1.MedicalRecordModel.getTimeline(userId);
    }
    static async searchMedicalRecords(userId, searchTerm) {
        if (!searchTerm || searchTerm.trim().length === 0) {
            throw new Error('검색어를 입력해주세요');
        }
        if (searchTerm.trim().length < 2) {
            throw new Error('검색어는 최소 2자 이상이어야 합니다');
        }
        return await MedicalRecord_1.MedicalRecordModel.search(userId, searchTerm.trim());
    }
    static async searchICD10Codes(searchTerm) {
        if (!searchTerm || searchTerm.trim().length === 0) {
            return [];
        }
        return await MedicalRecord_1.MedicalRecordModel.searchICD10Codes(searchTerm.trim());
    }
    static async getDepartmentStats(userId) {
        const stats = await MedicalRecord_1.MedicalRecordModel.getStats(userId);
        const departmentStatsWithLastVisit = await Promise.all(stats.departmentStats.map(async (stat) => {
            const lastRecord = await MedicalRecord_1.MedicalRecordModel.findByUserId(userId, { department: stat.department }, 1, 1);
            return {
                ...stat,
                lastVisit: lastRecord.records[0]?.visitDate || new Date(0)
            };
        }));
        return departmentStatsWithLastVisit.sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());
    }
    static async getMonthlyStats(userId, year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);
        const records = await MedicalRecord_1.MedicalRecordModel.findByUserId(userId, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        }, 1, 1000);
        const monthlyStats = Array.from({ length: 12 }, (_, index) => ({
            month: index + 1,
            visitCount: 0,
            totalCost: 0,
            departments: []
        }));
        records.records.forEach(record => {
            const month = record.visitDate.getMonth();
            monthlyStats[month].visitCount++;
            monthlyStats[month].totalCost += record.cost || 0;
            if (!monthlyStats[month].departments.includes(record.department)) {
                monthlyStats[month].departments.push(record.department);
            }
        });
        return monthlyStats;
    }
    static async getRecentMedicalRecords(userId, limit = 5) {
        const result = await MedicalRecord_1.MedicalRecordModel.findByUserId(userId, {}, 1, limit);
        return result.records;
    }
    static async getMedicalRecordsByHospital(userId, hospitalName, page = 1, limit = 10) {
        return await MedicalRecord_1.MedicalRecordModel.findByUserId(userId, { hospitalName }, page, limit);
    }
    static async getMedicalRecordsByDepartment(userId, department, page = 1, limit = 10) {
        return await MedicalRecord_1.MedicalRecordModel.findByUserId(userId, { department }, page, limit);
    }
    static async getMedicalRecordsByDateRange(userId, startDate, endDate, page = 1, limit = 10) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('유효한 날짜 형식을 입력해주세요');
        }
        if (start > end) {
            throw new Error('시작 날짜는 종료 날짜보다 이전이어야 합니다');
        }
        return await MedicalRecord_1.MedicalRecordModel.findByUserId(userId, { startDate, endDate }, page, limit);
    }
}
exports.MedicalService = MedicalService;
//# sourceMappingURL=medicalService.js.map