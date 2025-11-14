"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceOptimizationService = exports.PerformanceOptimizationService = void 0;
const performanceService_1 = require("./performanceService");
const redis_1 = require("../config/redis");
class PerformanceOptimizationService {
    constructor() {
        this.optimizationHistory = [];
        this.autoOptimizationEnabled = true;
    }
    static getInstance() {
        if (!PerformanceOptimizationService.instance) {
            PerformanceOptimizationService.instance = new PerformanceOptimizationService();
        }
        return PerformanceOptimizationService.instance;
    }
    async generateOptimizationReport() {
        const timestamp = new Date();
        const recommendations = [];
        const autoOptimizations = [];
        const dbRecommendations = await this.analyzeDatabasePerformance();
        recommendations.push(...dbRecommendations.recommendations);
        autoOptimizations.push(...dbRecommendations.autoOptimizations);
        const cacheRecommendations = await this.analyzeCachePerformance();
        recommendations.push(...cacheRecommendations.recommendations);
        autoOptimizations.push(...cacheRecommendations.autoOptimizations);
        const apiRecommendations = this.analyzeAPIPerformance();
        recommendations.push(...apiRecommendations.recommendations);
        const memoryRecommendations = this.analyzeMemoryPerformance();
        recommendations.push(...memoryRecommendations.recommendations);
        autoOptimizations.push(...memoryRecommendations.autoOptimizations);
        const networkRecommendations = this.analyzeNetworkPerformance();
        recommendations.push(...networkRecommendations.recommendations);
        const overallScore = this.calculateOverallScore(recommendations);
        const metrics = await this.collectPerformanceMetrics();
        const report = {
            timestamp,
            overallScore,
            recommendations: recommendations.sort((a, b) => {
                const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }),
            metrics,
            autoOptimizations
        };
        if (this.autoOptimizationEnabled) {
            await this.executeAutoOptimizations(autoOptimizations);
        }
        this.optimizationHistory.push(report);
        if (this.optimizationHistory.length > 100) {
            this.optimizationHistory.shift();
        }
        return report;
    }
    async analyzeDatabasePerformance() {
        const recommendations = [];
        const autoOptimizations = [];
        try {
            const slowQueries = performanceService_1.PerformanceService.getSlowQueries(100);
            if (slowQueries.length > 0) {
                recommendations.push({
                    id: 'db-slow-queries',
                    category: 'database',
                    priority: 'high',
                    title: '느린 쿼리 최적화 필요',
                    description: `${slowQueries.length}개의 느린 쿼리가 감지되었습니다.`,
                    impact: '쿼리 응답 시간을 50-80% 개선할 수 있습니다.',
                    implementation: '인덱스 추가, 쿼리 리팩토링, 파티셔닝 고려',
                    estimatedGain: 60,
                    effort: 'medium',
                    automated: false
                });
            }
            const indexRecommendations = await performanceService_1.PerformanceService.analyzeIndexOptimization();
            if (indexRecommendations.length > 0) {
                recommendations.push({
                    id: 'db-index-optimization',
                    category: 'database',
                    priority: 'medium',
                    title: '인덱스 최적화 권장',
                    description: `${indexRecommendations.length}개의 인덱스 최적화 기회가 있습니다.`,
                    impact: '데이터베이스 쿼리 성능을 30-50% 개선할 수 있습니다.',
                    implementation: '권장된 인덱스를 생성하고 기존 인덱스를 검토합니다.',
                    estimatedGain: 40,
                    effort: 'low',
                    automated: true
                });
                for (const rec of indexRecommendations) {
                    if (rec.performanceGain > 50) {
                        autoOptimizations.push(`인덱스 생성: ${rec.optimizedQuery}`);
                    }
                }
            }
            const connectionAnalysis = await performanceService_1.PerformanceService.optimizeConnectionPool();
            if (connectionAnalysis.currentConnections / connectionAnalysis.maxConnections > 0.8) {
                recommendations.push({
                    id: 'db-connection-pool',
                    category: 'database',
                    priority: 'high',
                    title: '데이터베이스 연결 풀 최적화',
                    description: '연결 풀 사용률이 높습니다.',
                    impact: '연결 대기 시간을 줄이고 처리량을 개선할 수 있습니다.',
                    implementation: '연결 풀 크기 증가 또는 연결 관리 최적화',
                    estimatedGain: 25,
                    effort: 'low',
                    automated: false
                });
            }
        }
        catch (error) {
            console.error('Database performance analysis failed:', error);
        }
        return { recommendations, autoOptimizations };
    }
    async analyzeCachePerformance() {
        const recommendations = [];
        const autoOptimizations = [];
        try {
            const cacheAnalysis = await performanceService_1.PerformanceService.analyzeCacheOptimization();
            if (cacheAnalysis.currentHitRate < 70) {
                recommendations.push({
                    id: 'cache-hit-rate',
                    category: 'cache',
                    priority: 'medium',
                    title: '캐시 적중률 개선 필요',
                    description: `현재 캐시 적중률: ${cacheAnalysis.currentHitRate.toFixed(1)}%`,
                    impact: 'API 응답 시간을 20-40% 개선할 수 있습니다.',
                    implementation: 'TTL 조정, 캐시 키 전략 개선, 프리로딩 구현',
                    estimatedGain: 30,
                    effort: 'medium',
                    automated: true
                });
                autoOptimizations.push('캐시 TTL 자동 조정');
            }
            const cacheStats = await redis_1.redisService.getCacheStats();
            if (cacheStats.keyCount > 100000) {
                recommendations.push({
                    id: 'cache-memory-optimization',
                    category: 'cache',
                    priority: 'medium',
                    title: '캐시 메모리 최적화',
                    description: `캐시 키 수: ${cacheStats.keyCount}개`,
                    impact: '메모리 사용량을 줄이고 캐시 성능을 개선할 수 있습니다.',
                    implementation: '만료된 키 정리, 압축 활성화, 키 네임스페이스 정리',
                    estimatedGain: 20,
                    effort: 'low',
                    automated: true
                });
                autoOptimizations.push('캐시 메모리 정리');
            }
        }
        catch (error) {
            console.error('Cache performance analysis failed:', error);
        }
        return { recommendations, autoOptimizations };
    }
    analyzeAPIPerformance() {
        const recommendations = [];
        const apiAnalysis = performanceService_1.PerformanceService.analyzeAPIPerformance();
        if (apiAnalysis.slowEndpoints.length > 0) {
            const avgSlowTime = apiAnalysis.slowEndpoints.reduce((sum, ep) => sum + ep.avgResponseTime, 0) / apiAnalysis.slowEndpoints.length;
            recommendations.push({
                id: 'api-slow-endpoints',
                category: 'api',
                priority: avgSlowTime > 1000 ? 'high' : 'medium',
                title: '느린 API 엔드포인트 최적화',
                description: `${apiAnalysis.slowEndpoints.length}개의 느린 엔드포인트가 감지되었습니다.`,
                impact: 'API 응답 시간을 40-70% 개선할 수 있습니다.',
                implementation: '쿼리 최적화, 캐싱 추가, 페이지네이션 구현, 비동기 처리',
                estimatedGain: 55,
                effort: 'medium',
                automated: false
            });
        }
        const metrics = performanceService_1.PerformanceService.getPerformanceMetrics();
        metrics.then(m => {
            if (m.responseTime > 500) {
                recommendations.push({
                    id: 'api-response-time',
                    category: 'api',
                    priority: 'medium',
                    title: 'API 응답 시간 개선',
                    description: `평균 응답 시간: ${m.responseTime.toFixed(0)}ms`,
                    impact: '사용자 경험을 크게 개선할 수 있습니다.',
                    implementation: '코드 최적화, 병렬 처리, 캐싱 전략 개선',
                    estimatedGain: 35,
                    effort: 'medium',
                    automated: false
                });
            }
        });
        return { recommendations };
    }
    analyzeMemoryPerformance() {
        const recommendations = [];
        const autoOptimizations = [];
        const memoryAnalysis = performanceService_1.PerformanceService.analyzeMemoryOptimization();
        if (memoryAnalysis.criticalLevel) {
            recommendations.push({
                id: 'memory-critical',
                category: 'memory',
                priority: 'critical',
                title: '메모리 사용량 위험 수준',
                description: '메모리 사용률이 위험 수준에 도달했습니다.',
                impact: '시스템 안정성과 성능에 심각한 영향을 줄 수 있습니다.',
                implementation: '메모리 누수 확인, 가비지 컬렉션 튜닝, 메모리 할당 최적화',
                estimatedGain: 80,
                effort: 'high',
                automated: true
            });
            autoOptimizations.push('강제 가비지 컬렉션 실행');
        }
        const memUsage = memoryAnalysis.currentUsage;
        const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        if (heapUsagePercent > 70) {
            recommendations.push({
                id: 'memory-heap-optimization',
                category: 'memory',
                priority: 'medium',
                title: '힙 메모리 최적화',
                description: `힙 메모리 사용률: ${heapUsagePercent.toFixed(1)}%`,
                impact: '메모리 효율성을 개선하고 GC 압력을 줄일 수 있습니다.',
                implementation: '객체 풀링, 메모리 캐시 최적화, 불필요한 참조 제거',
                estimatedGain: 25,
                effort: 'medium',
                automated: false
            });
        }
        return { recommendations, autoOptimizations };
    }
    analyzeNetworkPerformance() {
        const recommendations = [];
        recommendations.push({
            id: 'network-http2',
            category: 'network',
            priority: 'low',
            title: 'HTTP/2 프로토콜 사용 권장',
            description: 'HTTP/2를 사용하여 네트워크 성능을 개선할 수 있습니다.',
            impact: '다중 요청 처리 성능을 20-30% 개선할 수 있습니다.',
            implementation: 'Nginx 또는 로드 밸런서에서 HTTP/2 활성화',
            estimatedGain: 25,
            effort: 'low',
            automated: false
        });
        recommendations.push({
            id: 'network-compression',
            category: 'network',
            priority: 'low',
            title: '응답 압축 최적화',
            description: 'Gzip/Brotli 압축을 통해 전송 크기를 줄일 수 있습니다.',
            impact: '네트워크 대역폭을 30-50% 절약할 수 있습니다.',
            implementation: '서버에서 압축 알고리즘 최적화 및 압축 레벨 조정',
            estimatedGain: 40,
            effort: 'low',
            automated: false
        });
        return { recommendations };
    }
    calculateOverallScore(recommendations) {
        let score = 100;
        recommendations.forEach(rec => {
            const impact = {
                critical: 25,
                high: 15,
                medium: 8,
                low: 3
            };
            score -= impact[rec.priority];
        });
        return Math.max(score, 0);
    }
    async collectPerformanceMetrics() {
        const performanceMetrics = await performanceService_1.PerformanceService.getPerformanceMetrics();
        const cacheStats = await redis_1.redisService.getCacheStats();
        const memoryUsage = process.memoryUsage();
        return {
            database: {
                avgQueryTime: performanceMetrics.queryTime,
                slowQueries: performanceService_1.PerformanceService.getSlowQueries().length,
                connectionUtilization: (performanceMetrics.activeConnections / 100) * 100
            },
            cache: {
                hitRate: cacheStats.hitRate,
                memoryUsage: parseInt(cacheStats.memoryUsage.replace(/[^\d]/g, '')) || 0,
                keyCount: cacheStats.keyCount
            },
            api: {
                avgResponseTime: performanceMetrics.responseTime,
                errorRate: 0,
                throughput: 0
            },
            memory: {
                heapUsage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
                gcFrequency: 0,
                leakSuspicion: memoryUsage.heapUsed > memoryUsage.heapTotal * 0.9
            }
        };
    }
    async executeAutoOptimizations(optimizations) {
        for (const optimization of optimizations) {
            try {
                if (optimization.includes('캐시 TTL 자동 조정')) {
                    await this.optimizeCacheTTL();
                }
                else if (optimization.includes('캐시 메모리 정리')) {
                    await redis_1.redisService.optimizeMemory();
                }
                else if (optimization.includes('강제 가비지 컬렉션')) {
                    if (global.gc) {
                        global.gc();
                    }
                }
                console.log(`자동 최적화 실행됨: ${optimization}`);
            }
            catch (error) {
                console.error(`자동 최적화 실패: ${optimization}`, error);
            }
        }
    }
    async optimizeCacheTTL() {
        const cacheAnalysis = await performanceService_1.PerformanceService.analyzeCacheOptimization();
        if (cacheAnalysis.currentHitRate < 50) {
            console.log('캐시 TTL을 증가시켜 적중률 개선');
        }
        else if (cacheAnalysis.currentHitRate > 90) {
            console.log('캐시 TTL을 감소시켜 메모리 사용량 최적화');
        }
    }
    getOptimizationHistory(limit = 10) {
        return this.optimizationHistory
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    analyzePerformanceTrends() {
        if (this.optimizationHistory.length < 2) {
            return {
                scoreImprovement: 0,
                recommendationTrends: [],
                criticalIssues: 0
            };
        }
        const recent = this.optimizationHistory[this.optimizationHistory.length - 1];
        const previous = this.optimizationHistory[this.optimizationHistory.length - 2];
        const scoreImprovement = recent.overallScore - previous.overallScore;
        const categoryTrends = new Map();
        recent.recommendations.forEach(rec => {
            const current = categoryTrends.get(rec.category) || { current: 0, previous: 0 };
            current.current++;
            categoryTrends.set(rec.category, current);
        });
        previous.recommendations.forEach(rec => {
            const trend = categoryTrends.get(rec.category) || { current: 0, previous: 0 };
            trend.previous++;
            categoryTrends.set(rec.category, trend);
        });
        const recommendationTrends = Array.from(categoryTrends.entries()).map(([category, data]) => {
            let trend = 'stable';
            if (data.current < data.previous)
                trend = 'improving';
            else if (data.current > data.previous)
                trend = 'degrading';
            return {
                category,
                count: data.current,
                trend
            };
        });
        const criticalIssues = recent.recommendations.filter(r => r.priority === 'critical').length;
        return {
            scoreImprovement,
            recommendationTrends,
            criticalIssues
        };
    }
    setAutoOptimization(enabled) {
        this.autoOptimizationEnabled = enabled;
        console.log(`자동 최적화 ${enabled ? '활성화' : '비활성화'}됨`);
    }
    cleanup() {
        const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        this.optimizationHistory = this.optimizationHistory.filter(report => report.timestamp > cutoffDate);
        console.log('Performance optimization data cleanup completed');
    }
}
exports.PerformanceOptimizationService = PerformanceOptimizationService;
exports.performanceOptimizationService = PerformanceOptimizationService.getInstance();
//# sourceMappingURL=performanceOptimizationService.js.map