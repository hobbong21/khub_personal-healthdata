"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryPerformanceMonitor = exports.indexOptimizationGuide = exports.QueryOptimizer = exports.createOptimizedPrismaClient = void 0;
const client_1 = require("@prisma/client");
const createOptimizedPrismaClient = () => {
    return new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    });
};
exports.createOptimizedPrismaClient = createOptimizedPrismaClient;
class QueryOptimizer {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async paginateQuery(model, where = {}, page = 1, limit = 10, orderBy = { createdAt: 'desc' }, include) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            model.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include
            }),
            model.count({ where })
        ]);
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    }
    async batchProcess(items, processor, batchSize = 100) {
        const results = [];
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResult = await processor(batch);
            results.push(batchResult);
        }
        return results;
    }
    async loadWithRelations(model, id, relations) {
        const include = {};
        relations.forEach(relation => {
            include[relation] = true;
        });
        return await model.findUnique({
            where: { id },
            include
        });
    }
    async getAggregatedData(model, groupBy, aggregations, where = {}) {
        return await model.groupBy({
            by: groupBy,
            where,
            _count: aggregations.count || {},
            _sum: aggregations.sum || {},
            _avg: aggregations.avg || {},
            _min: aggregations.min || {},
            _max: aggregations.max || {}
        });
    }
}
exports.QueryOptimizer = QueryOptimizer;
exports.indexOptimizationGuide = {
    recommendations: [
        {
            table: 'health_records',
            columns: ['user_id', 'created_at'],
            reason: '사용자별 건강 기록 시계열 조회'
        },
        {
            table: 'medical_records',
            columns: ['user_id', 'visit_date'],
            reason: '사용자별 진료 기록 날짜순 조회'
        },
        {
            table: 'test_results',
            columns: ['medical_record_id', 'test_category'],
            reason: '진료 기록별 검사 결과 카테고리 필터링'
        },
        {
            table: 'medications',
            columns: ['user_id', 'is_active'],
            reason: '사용자별 활성 약물 조회'
        },
        {
            table: 'genomic_data',
            columns: ['user_id', 'source_platform'],
            reason: '사용자별 유전체 데이터 플랫폼별 조회'
        }
    ],
    compositeIndexes: [
        {
            table: 'vital_signs',
            columns: ['user_id', 'type', 'measured_at'],
            reason: '사용자별 바이탈 사인 타입별 시계열 조회'
        },
        {
            table: 'appointments',
            columns: ['user_id', 'status', 'appointment_date'],
            reason: '사용자별 예약 상태별 날짜 조회'
        }
    ]
};
class QueryPerformanceMonitor {
    constructor() {
        this.slowQueries = [];
        this.SLOW_QUERY_THRESHOLD = 1000;
    }
    logSlowQuery(query, duration) {
        if (duration > this.SLOW_QUERY_THRESHOLD) {
            this.slowQueries.push({
                query,
                duration,
                timestamp: new Date()
            });
            console.warn(`🐌 느린 쿼리 감지: ${duration}ms - ${query.substring(0, 100)}...`);
        }
    }
    getSlowQueries() {
        return this.slowQueries;
    }
    clearSlowQueries() {
        this.slowQueries = [];
    }
    generatePerformanceReport() {
        const totalSlowQueries = this.slowQueries.length;
        const avgDuration = totalSlowQueries > 0
            ? this.slowQueries.reduce((sum, q) => sum + q.duration, 0) / totalSlowQueries
            : 0;
        return {
            totalSlowQueries,
            avgDuration,
            slowQueries: this.slowQueries.slice(-10)
        };
    }
}
exports.QueryPerformanceMonitor = QueryPerformanceMonitor;
//# sourceMappingURL=dbOptimization.js.map