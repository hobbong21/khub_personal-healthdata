"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryOptimizationService = void 0;
const database_1 = __importDefault(require("../config/database"));
class QueryOptimizationService {
    static async analyzeQueryPatterns() {
        const optimizations = [];
        try {
            const tableStats = await this.getTableStatistics();
            for (const stat of tableStats) {
                if (stat.rowCount > 1000) {
                    const columnStats = await this.getColumnStatistics(stat.tableName);
                    for (const colStat of columnStats) {
                        if (colStat.distinctValues > 100 && !colStat.hasIndex) {
                            optimizations.push({
                                tableName: stat.tableName,
                                columnName: colStat.columnName,
                                indexType: this.recommendIndexType(colStat),
                                estimatedImprovement: this.calculateImprovement(colStat),
                                priority: this.calculatePriority(stat.rowCount, colStat.distinctValues)
                            });
                        }
                    }
                }
            }
            return optimizations.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
        }
        catch (error) {
            console.error('Query pattern analysis failed:', error);
            return [];
        }
    }
    static async getTableStatistics() {
        try {
            const result = await database_1.default.$queryRaw `
        SELECT 
          schemaname||'.'||tablename as table_name,
          n_tup_ins + n_tup_upd + n_tup_del as row_count,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC
      `;
            return result.map(row => ({
                tableName: row.table_name.replace('public.', ''),
                rowCount: Number(row.row_count),
                tableSize: row.table_size
            }));
        }
        catch (error) {
            console.error('Failed to get table statistics:', error);
            return [];
        }
    }
    static async getColumnStatistics(tableName) {
        try {
            const result = await database_1.default.$queryRaw `
        SELECT 
          s.attname,
          s.n_distinct,
          s.null_frac,
          CASE WHEN i.indexname IS NOT NULL THEN true ELSE false END as has_index
        FROM pg_stats s
        LEFT JOIN pg_indexes i ON i.tablename = s.tablename AND i.indexdef LIKE '%' || s.attname || '%'
        WHERE s.schemaname = 'public' 
        AND s.tablename = ${tableName}
        AND s.n_distinct > 1
      `;
            return result.map(row => ({
                columnName: row.attname,
                distinctValues: Math.abs(row.n_distinct),
                nullFraction: row.null_frac,
                hasIndex: row.has_index
            }));
        }
        catch (error) {
            console.error(`Failed to get column statistics for ${tableName}:`, error);
            return [];
        }
    }
    static recommendIndexType(columnStat) {
        if (columnStat.columnName.includes('text') || columnStat.columnName.includes('description')) {
            return 'gin';
        }
        if (columnStat.distinctValues > 10000) {
            return 'btree';
        }
        if (columnStat.distinctValues < 100) {
            return 'hash';
        }
        return 'btree';
    }
    static calculateImprovement(columnStat) {
        const distinctnessScore = Math.min(columnStat.distinctValues / 1000, 1);
        const nullScore = 1 - columnStat.nullFraction;
        return Math.round((distinctnessScore * nullScore) * 80);
    }
    static calculatePriority(rowCount, distinctValues) {
        const score = (rowCount / 1000) * (distinctValues / 100);
        if (score > 100)
            return 'high';
        if (score > 10)
            return 'medium';
        return 'low';
    }
    static async analyzeQueryPlan(query) {
        try {
            const startTime = performance.now();
            const plan = await database_1.default.$queryRaw `
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}
      `;
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            const planData = JSON.parse(plan[0]['QUERY PLAN']);
            const rootNode = planData[0].Plan;
            return {
                query,
                executionTime,
                cost: rootNode['Total Cost'],
                rows: rootNode['Actual Rows'],
                plan: planData
            };
        }
        catch (error) {
            console.error('Query plan analysis failed:', error);
            return null;
        }
    }
    static async identifySlowQueries() {
        try {
            const result = await database_1.default.$queryRaw `
        SELECT 
          query,
          mean_exec_time,
          calls,
          total_exec_time
        FROM pg_stat_statements 
        WHERE mean_exec_time > 100 -- 100ms 이상
        ORDER BY mean_exec_time DESC
        LIMIT 20
      `;
            return result.map(row => ({
                query: row.query,
                avgTime: row.mean_exec_time,
                calls: Number(row.calls),
                totalTime: row.total_exec_time
            }));
        }
        catch (error) {
            console.error('Slow query identification failed:', error);
            return [];
        }
    }
    static async analyzeIndexUsage() {
        try {
            const result = await database_1.default.$queryRaw `
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
      `;
            return result.map(row => {
                const scans = Number(row.idx_scan);
                const tuplesRead = Number(row.idx_tup_read);
                const tuplesReturned = Number(row.idx_tup_fetch);
                const efficiency = tuplesRead > 0 ? (tuplesReturned / tuplesRead) * 100 : 0;
                return {
                    tableName: row.tablename,
                    indexName: row.indexname,
                    scans,
                    tuplesRead,
                    tuplesReturned,
                    efficiency
                };
            });
        }
        catch (error) {
            console.error('Index usage analysis failed:', error);
            return [];
        }
    }
    static async createRecommendedIndexes(optimizations, maxIndexes = 5) {
        const results = [];
        const highPriorityOptimizations = optimizations
            .filter(opt => opt.priority === 'high')
            .slice(0, maxIndexes);
        for (const opt of highPriorityOptimizations) {
            const indexName = `idx_${opt.tableName}_${opt.columnName}`;
            try {
                await database_1.default.$executeRaw `
          CREATE INDEX IF NOT EXISTS ${indexName} 
          ON ${opt.tableName} USING ${opt.indexType} (${opt.columnName})
        `;
                results.push({ indexName, created: true });
                console.log(`Created index: ${indexName}`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                results.push({ indexName, created: false, error: errorMessage });
                console.error(`Failed to create index ${indexName}:`, error);
            }
        }
        return results;
    }
    static async identifyUnusedIndexes() {
        try {
            const result = await database_1.default.$queryRaw `
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          pg_size_pretty(pg_relation_size(indexrelid)) as pg_size_pretty
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexname NOT LIKE '%_pkey'  -- 기본키 제외
        ORDER BY pg_relation_size(indexrelid) DESC
      `;
            return result.map(row => ({
                tableName: row.tablename,
                indexName: row.indexname,
                size: row.pg_size_pretty,
                lastUsed: null
            }));
        }
        catch (error) {
            console.error('Unused index identification failed:', error);
            return [];
        }
    }
    static async benchmarkQuery(query, iterations = 10) {
        const times = [];
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            try {
                await database_1.default.$queryRaw `${query}`;
            }
            catch (error) {
                console.error(`Benchmark iteration ${i + 1} failed:`, error);
                continue;
            }
            const endTime = performance.now();
            times.push(endTime - startTime);
        }
        if (times.length === 0) {
            return { avgTime: 0, minTime: 0, maxTime: 0, stdDev: 0 };
        }
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
        const stdDev = Math.sqrt(variance);
        return { avgTime, minTime, maxTime, stdDev };
    }
    static async generatePerformanceReport() {
        const [queryOptimizations, slowQueries, indexUsage, unusedIndexes] = await Promise.all([
            this.analyzeQueryPatterns(),
            this.identifySlowQueries(),
            this.analyzeIndexUsage(),
            this.identifyUnusedIndexes()
        ]);
        const recommendations = [];
        if (queryOptimizations.length > 0) {
            recommendations.push(`${queryOptimizations.length}개의 인덱스 최적화 기회가 발견되었습니다.`);
        }
        if (slowQueries.length > 0) {
            recommendations.push(`${slowQueries.length}개의 느린 쿼리가 식별되었습니다.`);
        }
        if (unusedIndexes.length > 0) {
            recommendations.push(`${unusedIndexes.length}개의 사용되지 않는 인덱스를 제거하여 성능을 향상시킬 수 있습니다.`);
        }
        const lowEfficiencyIndexes = indexUsage.filter(idx => idx.efficiency < 50);
        if (lowEfficiencyIndexes.length > 0) {
            recommendations.push(`${lowEfficiencyIndexes.length}개의 인덱스가 낮은 효율성을 보이고 있습니다.`);
        }
        if (recommendations.length === 0) {
            recommendations.push('데이터베이스 성능이 양호합니다.');
        }
        return {
            timestamp: new Date(),
            queryOptimizations,
            slowQueries,
            indexUsage,
            unusedIndexes,
            recommendations
        };
    }
}
exports.QueryOptimizationService = QueryOptimizationService;
//# sourceMappingURL=queryOptimizationService.js.map