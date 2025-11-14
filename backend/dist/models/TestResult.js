"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestResultModel = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TestResultModel {
    static async create(medicalRecordId, data) {
        const testResult = await prisma.testResult.create({
            data: {
                medicalRecordId,
                testCategory: data.testCategory,
                testSubcategory: data.testSubcategory,
                testName: data.testName,
                testItems: data.testItems,
                overallStatus: data.overallStatus || 'pending',
                testDate: new Date(data.testDate),
                laboratoryName: data.laboratoryName,
                doctorNotes: data.doctorNotes,
                imageFiles: data.imageFiles || []
            },
            include: {
                medicalRecord: true
            }
        });
        return this.formatTestResult(testResult);
    }
    static async findById(id) {
        const testResult = await prisma.testResult.findUnique({
            where: { id },
            include: {
                medicalRecord: true
            }
        });
        return testResult ? this.formatTestResult(testResult) : null;
    }
    static async findByUserId(userId, filters = {}, page = 1, limit = 20) {
        const where = {
            medicalRecord: {
                userId
            }
        };
        if (filters.testCategory) {
            where.testCategory = filters.testCategory;
        }
        if (filters.testSubcategory) {
            where.testSubcategory = filters.testSubcategory;
        }
        if (filters.testName) {
            where.testName = {
                contains: filters.testName,
                mode: 'insensitive'
            };
        }
        if (filters.status) {
            where.overallStatus = filters.status;
        }
        if (filters.startDate || filters.endDate) {
            where.testDate = {};
            if (filters.startDate) {
                where.testDate.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.testDate.lte = new Date(filters.endDate);
            }
        }
        if (filters.laboratoryName) {
            where.laboratoryName = {
                contains: filters.laboratoryName,
                mode: 'insensitive'
            };
        }
        if (filters.abnormalOnly) {
            where.overallStatus = {
                in: ['abnormal', 'critical', 'borderline']
            };
        }
        const [testResults, total] = await Promise.all([
            prisma.testResult.findMany({
                where,
                include: {
                    medicalRecord: true
                },
                orderBy: {
                    testDate: 'desc'
                },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.testResult.count({ where })
        ]);
        const summary = await this.calculateSummary(userId, filters);
        return {
            testResults: testResults.map(this.formatTestResult),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            filters,
            summary
        };
    }
    static async getTrends(userId, testNames) {
        const trends = [];
        for (const testName of testNames) {
            const testResults = await prisma.testResult.findMany({
                where: {
                    medicalRecord: { userId },
                    testName
                },
                orderBy: {
                    testDate: 'asc'
                },
                take: 50
            });
            if (testResults.length < 2)
                continue;
            const dataPoints = testResults.map(result => {
                const testItems = result.testItems;
                const mainItem = testItems[0];
                return {
                    date: result.testDate,
                    value: typeof mainItem.value === 'number' ? mainItem.value : 0,
                    status: result.overallStatus,
                    referenceRange: {
                        min: mainItem.referenceRange.min,
                        max: mainItem.referenceRange.max
                    }
                };
            }).filter(point => typeof point.value === 'number');
            if (dataPoints.length < 2)
                continue;
            const trend = this.calculateTrend(dataPoints);
            const lastYearComparison = this.calculateYearOverYearChange(dataPoints);
            trends.push({
                testName,
                testCategory: testResults[0].testCategory,
                unit: testResults[0].testItems[0]?.unit,
                dataPoints,
                trend,
                changePercentage: lastYearComparison?.changePercentage,
                lastYearComparison
            });
        }
        return trends;
    }
    static async compareResults(userId, testName) {
        const results = await prisma.testResult.findMany({
            where: {
                medicalRecord: { userId },
                testName
            },
            orderBy: {
                testDate: 'desc'
            },
            take: 2
        });
        if (results.length === 0)
            return null;
        const current = results[0];
        const previous = results.length > 1 ? results[1] : null;
        const currentItem = current.testItems[0];
        const previousItem = previous ? previous.testItems[0] : null;
        const comparison = {
            testName,
            current: {
                value: currentItem.value,
                date: current.testDate,
                status: current.overallStatus
            },
            referenceRange: currentItem.referenceRange
        };
        if (previous && previousItem && typeof currentItem.value === 'number' && typeof previousItem.value === 'number') {
            const absolute = currentItem.value - previousItem.value;
            const percentage = (absolute / previousItem.value) * 100;
            comparison.previous = {
                value: previousItem.value,
                date: previous.testDate,
                status: previous.overallStatus
            };
            comparison.change = {
                absolute,
                percentage,
                direction: absolute > 0 ? 'increased' : absolute < 0 ? 'decreased' : 'unchanged',
                isSignificant: Math.abs(percentage) > 10
            };
        }
        return comparison;
    }
    static async getStats(userId) {
        const [totalTests, testsByCategory, testsByStatus, recentAbnormalResults] = await Promise.all([
            prisma.testResult.count({
                where: { medicalRecord: { userId } }
            }),
            this.getTestsByCategory(userId),
            this.getTestsByStatus(userId),
            this.getRecentAbnormalResults(userId)
        ]);
        const commonTests = await this.getCommonTests(userId);
        const trendingTests = await this.getTrends(userId, commonTests);
        return {
            totalTests,
            testsByCategory,
            testsByStatus,
            recentAbnormalResults: recentAbnormalResults.map(this.formatTestResult),
            trendingTests,
            upcomingTests: []
        };
    }
    static formatTestResult(testResult) {
        return {
            id: testResult.id,
            medicalRecordId: testResult.medicalRecordId,
            testCategory: testResult.testCategory,
            testSubcategory: testResult.testSubcategory,
            testName: testResult.testName,
            testItems: testResult.testItems,
            overallStatus: testResult.overallStatus,
            testDate: testResult.testDate,
            laboratoryName: testResult.laboratoryName,
            doctorNotes: testResult.doctorNotes,
            imageFiles: testResult.imageFiles || [],
            createdAt: testResult.createdAt,
            updatedAt: testResult.updatedAt
        };
    }
    static async calculateSummary(userId, filters) {
        const where = {
            medicalRecord: { userId }
        };
        if (filters.testCategory)
            where.testCategory = filters.testCategory;
        if (filters.testSubcategory)
            where.testSubcategory = filters.testSubcategory;
        if (filters.startDate || filters.endDate) {
            where.testDate = {};
            if (filters.startDate)
                where.testDate.gte = new Date(filters.startDate);
            if (filters.endDate)
                where.testDate.lte = new Date(filters.endDate);
        }
        const [total, statusCounts, categoryCounts] = await Promise.all([
            prisma.testResult.count({ where }),
            prisma.testResult.groupBy({
                by: ['overallStatus'],
                where,
                _count: true
            }),
            prisma.testResult.groupBy({
                by: ['testCategory'],
                where,
                _count: true
            })
        ]);
        const statusMap = {};
        statusCounts.forEach(item => {
            statusMap[item.overallStatus] = item._count;
        });
        const categoryMap = {};
        categoryCounts.forEach(item => {
            categoryMap[item.testCategory] = item._count;
        });
        return {
            totalTests: total,
            normalCount: statusMap['normal'] || 0,
            abnormalCount: statusMap['abnormal'] || 0,
            criticalCount: statusMap['critical'] || 0,
            categoryCounts: categoryMap
        };
    }
    static calculateTrend(dataPoints) {
        if (dataPoints.length < 3)
            return 'stable';
        const values = dataPoints.map(p => p.value);
        const n = values.length;
        const sumX = dataPoints.reduce((sum, _, i) => sum + i, 0);
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = dataPoints.reduce((sum, point, i) => sum + i * point.value, 0);
        const sumXX = dataPoints.reduce((sum, _, i) => sum + i * i, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const mean = sumY / n;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
        const coefficientOfVariation = Math.sqrt(variance) / mean;
        if (coefficientOfVariation > 0.2)
            return 'fluctuating';
        if (Math.abs(slope) < 0.01)
            return 'stable';
        return slope > 0 ? 'improving' : 'worsening';
    }
    static calculateYearOverYearChange(dataPoints) {
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        const recent = dataPoints.filter(p => p.date >= oneYearAgo).sort((a, b) => b.date.getTime() - a.date.getTime())[0];
        const yearAgo = dataPoints.filter(p => p.date < oneYearAgo).sort((a, b) => b.date.getTime() - a.date.getTime())[0];
        if (!recent || !yearAgo)
            return undefined;
        const changePercentage = ((recent.value - yearAgo.value) / yearAgo.value) * 100;
        return {
            currentValue: recent.value,
            previousValue: yearAgo.value,
            changePercentage,
            isSignificant: Math.abs(changePercentage) > 15
        };
    }
    static async getTestsByCategory(userId) {
        const results = await prisma.testResult.groupBy({
            by: ['testCategory'],
            where: { medicalRecord: { userId } },
            _count: true
        });
        const categoryMap = {};
        results.forEach(item => {
            categoryMap[item.testCategory] = item._count;
        });
        return categoryMap;
    }
    static async getTestsByStatus(userId) {
        const results = await prisma.testResult.groupBy({
            by: ['overallStatus'],
            where: { medicalRecord: { userId } },
            _count: true
        });
        const statusMap = {};
        results.forEach(item => {
            statusMap[item.overallStatus] = item._count;
        });
        return statusMap;
    }
    static async getRecentAbnormalResults(userId) {
        return await prisma.testResult.findMany({
            where: {
                medicalRecord: { userId },
                overallStatus: {
                    in: ['abnormal', 'critical', 'borderline']
                }
            },
            orderBy: {
                testDate: 'desc'
            },
            take: 10,
            include: {
                medicalRecord: true
            }
        });
    }
    static async getCommonTests(userId) {
        const results = await prisma.testResult.groupBy({
            by: ['testName'],
            where: { medicalRecord: { userId } },
            _count: true,
            orderBy: {
                _count: {
                    testName: 'desc'
                }
            },
            take: 10
        });
        return results.map(item => item.testName);
    }
}
exports.TestResultModel = TestResultModel;
//# sourceMappingURL=TestResult.js.map