"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecordModel = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const icd10_1 = require("../utils/icd10");
class MedicalRecordModel {
    static async create(userId, recordData) {
        const createData = {
            userId,
            hospitalName: recordData.hospitalName,
            department: recordData.department,
            doctorName: recordData.doctorName,
            diagnosisCode: recordData.diagnosisCode ? (0, icd10_1.normalizeICD10Code)(recordData.diagnosisCode) : null,
            diagnosisDescription: recordData.diagnosisDescription || null,
            doctorNotes: recordData.doctorNotes || null,
            cost: recordData.cost || null,
            visitDate: new Date(recordData.visitDate)
        };
        if (recordData.testResults && recordData.testResults.length > 0) {
            createData.testResults = {
                create: recordData.testResults.map(test => ({
                    testCategory: test.testCategory,
                    testSubcategory: test.testSubcategory || null,
                    testName: test.testName,
                    testItems: test.testItems,
                    overallStatus: test.overallStatus || 'pending',
                    testDate: new Date(test.testDate),
                    laboratoryName: test.laboratoryName || null,
                    doctorNotes: test.doctorNotes || null,
                    imageFiles: test.imageFiles || []
                }))
            };
        }
        if (recordData.prescriptions && recordData.prescriptions.length > 0) {
            createData.prescriptions = {
                create: recordData.prescriptions.map(prescription => ({
                    medicationName: prescription.medicationName,
                    dosage: prescription.dosage,
                    frequency: prescription.frequency,
                    duration: prescription.duration || null,
                    instructions: prescription.instructions || null
                }))
            };
        }
        const medicalRecord = await prisma.medicalRecord.create({
            data: createData,
            include: {
                testResults: true,
                prescriptions: true
            }
        });
        return this.formatMedicalRecord(medicalRecord);
    }
    static async findById(id, userId) {
        const medicalRecord = await prisma.medicalRecord.findFirst({
            where: { id, userId },
            include: {
                testResults: true,
                prescriptions: true
            }
        });
        if (!medicalRecord)
            return null;
        return this.formatMedicalRecord(medicalRecord);
    }
    static async findByUserId(userId, filters = {}, page = 1, limit = 10) {
        const where = { userId };
        if (filters.department) {
            where.department = { contains: filters.department, mode: 'insensitive' };
        }
        if (filters.startDate || filters.endDate) {
            where.visitDate = {};
            if (filters.startDate) {
                where.visitDate.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.visitDate.lte = new Date(filters.endDate);
            }
        }
        if (filters.hospitalName) {
            where.hospitalName = { contains: filters.hospitalName, mode: 'insensitive' };
        }
        if (filters.doctorName) {
            where.doctorName = { contains: filters.doctorName, mode: 'insensitive' };
        }
        if (filters.diagnosisCode) {
            where.diagnosisCode = { contains: filters.diagnosisCode, mode: 'insensitive' };
        }
        if (filters.searchTerm) {
            where.OR = [
                { hospitalName: { contains: filters.searchTerm, mode: 'insensitive' } },
                { department: { contains: filters.searchTerm, mode: 'insensitive' } },
                { doctorName: { contains: filters.searchTerm, mode: 'insensitive' } },
                { diagnosisDescription: { contains: filters.searchTerm, mode: 'insensitive' } },
                { doctorNotes: { contains: filters.searchTerm, mode: 'insensitive' } }
            ];
        }
        const [records, total] = await Promise.all([
            prisma.medicalRecord.findMany({
                where,
                include: {
                    testResults: true,
                    prescriptions: true
                },
                orderBy: { visitDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.medicalRecord.count({ where })
        ]);
        return {
            records: records.map(record => this.formatMedicalRecord(record)),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            filters
        };
    }
    static async update(id, userId, updateData) {
        const existingRecord = await prisma.medicalRecord.findFirst({
            where: { id, userId }
        });
        if (!existingRecord)
            return null;
        const updatedRecord = await prisma.medicalRecord.update({
            where: { id },
            data: {
                ...(updateData.hospitalName && { hospitalName: updateData.hospitalName }),
                ...(updateData.department && { department: updateData.department }),
                ...(updateData.doctorName && { doctorName: updateData.doctorName }),
                ...(updateData.diagnosisCode !== undefined && {
                    diagnosisCode: updateData.diagnosisCode ? (0, icd10_1.normalizeICD10Code)(updateData.diagnosisCode) : null
                }),
                ...(updateData.diagnosisDescription !== undefined && { diagnosisDescription: updateData.diagnosisDescription }),
                ...(updateData.doctorNotes !== undefined && { doctorNotes: updateData.doctorNotes }),
                ...(updateData.cost !== undefined && { cost: updateData.cost }),
                ...(updateData.visitDate && { visitDate: new Date(updateData.visitDate) })
            },
            include: {
                testResults: true,
                prescriptions: true
            }
        });
        return this.formatMedicalRecord(updatedRecord);
    }
    static async delete(id, userId) {
        const existingRecord = await prisma.medicalRecord.findFirst({
            where: { id, userId }
        });
        if (!existingRecord)
            return false;
        await prisma.medicalRecord.delete({
            where: { id }
        });
        return true;
    }
    static async getStats(userId) {
        const [totalRecords, totalCostResult, departmentStats, recentVisits] = await Promise.all([
            prisma.medicalRecord.count({ where: { userId } }),
            prisma.medicalRecord.aggregate({
                where: { userId, cost: { not: null } },
                _sum: { cost: true }
            }),
            prisma.medicalRecord.groupBy({
                by: ['department'],
                where: { userId },
                _count: { department: true },
                _sum: { cost: true },
                orderBy: { _count: { department: 'desc' } }
            }),
            prisma.medicalRecord.findMany({
                where: { userId },
                include: {
                    testResults: true,
                    prescriptions: true
                },
                orderBy: { visitDate: 'desc' },
                take: 5
            })
        ]);
        return {
            totalRecords,
            totalCost: totalCostResult._sum.cost || 0,
            departmentStats: departmentStats.map(stat => ({
                department: stat.department,
                count: stat._count?.department || 0,
                totalCost: stat._sum?.cost || 0
            })),
            recentVisits: recentVisits.map(record => this.formatMedicalRecord(record)),
            upcomingAppointments: []
        };
    }
    static async getTimeline(userId) {
        const records = await prisma.medicalRecord.findMany({
            where: { userId },
            include: {
                testResults: true,
                prescriptions: true
            },
            orderBy: { visitDate: 'desc' }
        });
        const timelineItems = [];
        records.forEach(record => {
            timelineItems.push({
                id: record.id,
                type: 'visit',
                date: record.visitDate,
                title: `${record.hospitalName} - ${record.department}`,
                description: record.diagnosisDescription || '진료 방문',
                hospitalName: record.hospitalName,
                department: record.department,
                doctorName: record.doctorName,
                metadata: {
                    cost: record.cost,
                    diagnosisCode: record.diagnosisCode
                }
            });
            record.testResults.forEach(test => {
                timelineItems.push({
                    id: test.id,
                    type: 'test',
                    date: test.testDate,
                    title: test.testName,
                    description: `${test.testCategory} - ${test.overallStatus || '결과 확인'}`,
                    hospitalName: record.hospitalName,
                    department: record.department,
                    status: test.overallStatus,
                    metadata: {
                        testCategory: test.testCategory,
                        testItems: test.testItems,
                        laboratoryName: test.laboratoryName
                    }
                });
            });
            record.prescriptions.forEach(prescription => {
                timelineItems.push({
                    id: prescription.id,
                    type: 'prescription',
                    date: record.visitDate,
                    title: prescription.medicationName,
                    description: `${prescription.dosage} - ${prescription.frequency}`,
                    hospitalName: record.hospitalName,
                    department: record.department,
                    doctorName: record.doctorName,
                    metadata: {
                        dosage: prescription.dosage,
                        frequency: prescription.frequency,
                        duration: prescription.duration,
                        instructions: prescription.instructions
                    }
                });
            });
        });
        return timelineItems.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
    static async search(userId, searchTerm) {
        const [records, testResults, prescriptions] = await Promise.all([
            prisma.medicalRecord.findMany({
                where: {
                    userId,
                    OR: [
                        { hospitalName: { contains: searchTerm, mode: 'insensitive' } },
                        { department: { contains: searchTerm, mode: 'insensitive' } },
                        { doctorName: { contains: searchTerm, mode: 'insensitive' } },
                        { diagnosisDescription: { contains: searchTerm, mode: 'insensitive' } },
                        { doctorNotes: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                include: {
                    testResults: true,
                    prescriptions: true
                }
            }),
            prisma.testResult.findMany({
                where: {
                    medicalRecord: { userId },
                    OR: [
                        { testName: { contains: searchTerm, mode: 'insensitive' } },
                        { testCategory: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                }
            }),
            prisma.prescription.findMany({
                where: {
                    medicalRecord: { userId },
                    medicationName: { contains: searchTerm, mode: 'insensitive' }
                }
            })
        ]);
        const totalResults = records.length + testResults.length + prescriptions.length;
        const suggestions = await this.generateSearchSuggestions(userId, searchTerm);
        return {
            records: records.map(record => this.formatMedicalRecord(record)),
            testResults: testResults.map(test => ({
                id: test.id,
                medicalRecordId: test.medicalRecordId,
                testCategory: test.testCategory,
                testSubcategory: test.testSubcategory,
                testName: test.testName,
                testItems: test.testItems,
                overallStatus: test.overallStatus,
                testDate: test.testDate,
                laboratoryName: test.laboratoryName,
                doctorNotes: test.doctorNotes,
                imageFiles: test.imageFiles || [],
                createdAt: test.createdAt,
                updatedAt: test.updatedAt
            })),
            prescriptions: prescriptions.map(prescription => ({
                id: prescription.id,
                medicalRecordId: prescription.medicalRecordId,
                medicationName: prescription.medicationName,
                dosage: prescription.dosage,
                frequency: prescription.frequency,
                duration: prescription.duration,
                instructions: prescription.instructions
            })),
            totalResults,
            searchTerm,
            suggestions
        };
    }
    static validateMedicalRecord(recordData) {
        const errors = [];
        if (!recordData.hospitalName || recordData.hospitalName.trim().length === 0) {
            errors.push('병원명은 필수입니다');
        }
        if (!recordData.department || recordData.department.trim().length === 0) {
            errors.push('진료과는 필수입니다');
        }
        if (!recordData.doctorName || recordData.doctorName.trim().length === 0) {
            errors.push('의사명은 필수입니다');
        }
        if (!recordData.visitDate) {
            errors.push('진료 날짜는 필수입니다');
        }
        else {
            const visitDate = new Date(recordData.visitDate);
            if (isNaN(visitDate.getTime())) {
                errors.push('유효한 진료 날짜를 입력해주세요');
            }
            else if (visitDate > new Date()) {
                errors.push('진료 날짜는 미래일 수 없습니다');
            }
        }
        if (recordData.diagnosisCode) {
            const validation = (0, icd10_1.validateAndSuggestICD10)(recordData.diagnosisCode);
            if (!validation.isValid) {
                errors.push(validation.error || '유효한 ICD-10 코드 형식이 아닙니다 (예: A00, B15.1)');
            }
        }
        if (recordData.cost !== undefined && recordData.cost !== null) {
            if (recordData.cost < 0) {
                errors.push('진료비는 0 이상이어야 합니다');
            }
        }
        if (recordData.testResults) {
            recordData.testResults.forEach((test, index) => {
                if (!test.testCategory || test.testCategory.trim().length === 0) {
                    errors.push(`검사 결과 ${index + 1}: 검사 카테고리는 필수입니다`);
                }
                if (!test.testName || test.testName.trim().length === 0) {
                    errors.push(`검사 결과 ${index + 1}: 검사명은 필수입니다`);
                }
                if (!test.testDate) {
                    errors.push(`검사 결과 ${index + 1}: 검사 날짜는 필수입니다`);
                }
            });
        }
        if (recordData.prescriptions) {
            recordData.prescriptions.forEach((prescription, index) => {
                if (!prescription.medicationName || prescription.medicationName.trim().length === 0) {
                    errors.push(`처방전 ${index + 1}: 약물명은 필수입니다`);
                }
                if (!prescription.dosage || prescription.dosage.trim().length === 0) {
                    errors.push(`처방전 ${index + 1}: 용량은 필수입니다`);
                }
                if (!prescription.frequency || prescription.frequency.trim().length === 0) {
                    errors.push(`처방전 ${index + 1}: 복용 빈도는 필수입니다`);
                }
            });
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    static async searchICD10Codes(searchTerm) {
        return (0, icd10_1.searchICD10Codes)(searchTerm, 20);
    }
    static async getICD10CodeDetails(code) {
        return (0, icd10_1.getICD10CodeDetails)(code);
    }
    static validateICD10Code(code) {
        return (0, icd10_1.validateAndSuggestICD10)(code);
    }
    static async generateSearchSuggestions(userId, searchTerm) {
        const [hospitals, departments, doctors] = await Promise.all([
            prisma.medicalRecord.findMany({
                where: { userId },
                select: { hospitalName: true },
                distinct: ['hospitalName']
            }),
            prisma.medicalRecord.findMany({
                where: { userId },
                select: { department: true },
                distinct: ['department']
            }),
            prisma.medicalRecord.findMany({
                where: { userId },
                select: { doctorName: true },
                distinct: ['doctorName']
            })
        ]);
        const suggestions = [];
        hospitals.forEach(h => {
            if (h.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())) {
                suggestions.push(h.hospitalName);
            }
        });
        departments.forEach(d => {
            if (d.department.toLowerCase().includes(searchTerm.toLowerCase())) {
                suggestions.push(d.department);
            }
        });
        doctors.forEach(d => {
            if (d.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) {
                suggestions.push(d.doctorName);
            }
        });
        return [...new Set(suggestions)].slice(0, 5);
    }
    static formatMedicalRecord(record) {
        return {
            id: record.id,
            userId: record.userId,
            hospitalName: record.hospitalName,
            department: record.department,
            doctorName: record.doctorName,
            diagnosisCode: record.diagnosisCode || undefined,
            diagnosisDescription: record.diagnosisDescription || undefined,
            doctorNotes: record.doctorNotes || undefined,
            cost: record.cost || undefined,
            visitDate: record.visitDate,
            createdAt: record.createdAt,
            testResults: record.testResults?.map((test) => ({
                id: test.id,
                medicalRecordId: test.medicalRecordId,
                testCategory: test.testCategory,
                testSubcategory: test.testSubcategory,
                testName: test.testName,
                testItems: test.testItems,
                overallStatus: test.overallStatus,
                testDate: test.testDate,
                laboratoryName: test.laboratoryName,
                doctorNotes: test.doctorNotes,
                imageFiles: test.imageFiles || [],
                createdAt: test.createdAt,
                updatedAt: test.updatedAt
            })) || [],
            prescriptions: record.prescriptions?.map((prescription) => ({
                id: prescription.id,
                medicalRecordId: prescription.medicalRecordId,
                medicationName: prescription.medicationName,
                dosage: prescription.dosage,
                frequency: prescription.frequency,
                duration: prescription.duration,
                instructions: prescription.instructions
            })) || []
        };
    }
}
exports.MedicalRecordModel = MedicalRecordModel;
//# sourceMappingURL=MedicalRecord.js.map