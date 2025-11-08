# AI Insights Performance Monitoring Guide

## Overview

This guide explains how to monitor and optimize the performance of the AI Insights module.

## Environment Configuration

### Required Environment Variables

Add these to your `.env` file:

```env
# AI Insights Configuration
AI_INSIGHTS_CACHE_TTL=3600          # Cache TTL in seconds (default: 1 hour)
AI_INSIGHTS_MIN_DATA_POINTS=3       # Minimum data points required for analysis
```

### Adjusting Cache TTL

**Development Environment:**
```env
AI_INSIGHTS_CACHE_TTL=300  # 5 minutes for faster testing
```

**Production Environment:**
```env
AI_INSIGHTS_CACHE_TTL=3600  # 1 hour for optimal performance
```

**High-Traffic Environment:**
```env
AI_INSIGHTS_CACHE_TTL=7200  # 2 hours to reduce database load
```

## Performance Monitoring

### 1. Cache Hit Rate Monitoring

The system automatically logs cache hit rate every 100 requests:

```
[AI Insights] 📊 캐시 히트율: 75.00% (히트: 75, 미스: 25, 총: 100)
```

**Interpreting Cache Hit Rate:**
- **> 70%**: Excellent - Cache is working effectively
- **50-70%**: Good - Consider increasing TTL
- **30-50%**: Fair - Review cache strategy
- **< 30%**: Poor - Investigate cache issues

### 2. Performance Metrics

Each insight generation logs detailed performance metrics:

```
[AI Insights] 📈 성능 메트릭: {
  userId: 'abc123',
  totalDuration: '610ms',
  dataFetchDuration: '125ms (20.5%)',
  processingDuration: '450ms (73.8%)',
  cacheSaveDuration: '35ms (5.7%)',
  dataPointsCount: 45,
  avgTimePerDataPoint: '13.56ms'
}
```

**Performance Benchmarks:**
- **Total Duration:**
  - Excellent: < 500ms
  - Good: 500-1000ms
  - Fair: 1000-2000ms
  - Poor: > 2000ms
  - Critical: > 5000ms (triggers warning)

- **Data Fetch Duration:**
  - Should be < 30% of total time
  - If > 50%, consider database optimization

- **Processing Duration:**
  - Should be 50-70% of total time
  - If > 80%, consider algorithm optimization

### 3. Programmatic Monitoring

Get cache statistics in your code:

```typescript
import { AIInsightsService } from './services/aiInsightsService';

// Get current cache statistics
const stats = AIInsightsService.getCacheStats();
console.log(`Cache Hit Rate: ${stats.hitRate}%`);
console.log(`Total Requests: ${stats.total}`);
console.log(`Cache Hits: ${stats.hits}`);
console.log(`Cache Misses: ${stats.misses}`);

// Reset statistics (useful for testing)
AIInsightsService.resetCacheStats();
```

## Performance Optimization Tips

### 1. Optimize Cache TTL

**Symptoms of TTL too short:**
- Low cache hit rate (< 50%)
- High database load
- Slow response times

**Solution:**
```env
AI_INSIGHTS_CACHE_TTL=7200  # Increase to 2 hours
```

**Symptoms of TTL too long:**
- Users see outdated insights
- Cache takes up too much memory

**Solution:**
```env
AI_INSIGHTS_CACHE_TTL=1800  # Decrease to 30 minutes
```

### 2. Database Query Optimization

The system uses optimized queries with proper indexing:

```prisma
model AIInsightCache {
  @@index([userId])      // Fast user lookup
  @@index([expiresAt])   // Fast cache cleanup
}
```

**Monitor slow queries:**
- If `dataFetchDuration > 500ms`, check database indexes
- Use `EXPLAIN ANALYZE` on slow queries
- Consider adding composite indexes

### 3. Reduce Data Points

If processing is slow, reduce the analysis period:

```typescript
// Instead of 90 days
const insights = await AIInsightsService.getAIInsights(userId);

// Use 30 days for faster processing
const trends = await AIInsightsService.analyzeTrends(userId, 30);
```

### 4. Manual Cache Refresh

Force cache refresh when new data is added:

```typescript
// After user adds new health data
await AIInsightsService.clearCache(userId);

// Next request will generate fresh insights
const insights = await AIInsightsService.getAIInsights(userId);
```

## Monitoring Dashboard

### Key Metrics to Track

1. **Cache Hit Rate**
   - Target: > 70%
   - Alert if: < 50%

2. **Average Response Time**
   - Target: < 500ms
   - Alert if: > 2000ms

3. **P95 Response Time**
   - Target: < 1000ms
   - Alert if: > 5000ms

4. **Database Query Time**
   - Target: < 200ms
   - Alert if: > 500ms

5. **Cache Size**
   - Monitor memory usage
   - Clean up expired caches regularly

### Log Analysis

Search for performance issues in logs:

```bash
# Find slow requests
grep "⚠️  성능 경고" logs/app.log

# Check cache hit rate
grep "캐시 히트율" logs/app.log

# View performance metrics
grep "성능 메트릭" logs/app.log

# Find cache hits/misses
grep "캐시 히트\|캐시 미스" logs/app.log
```

## Troubleshooting

### Problem: Low Cache Hit Rate

**Possible Causes:**
1. Cache TTL too short
2. High user activity with frequent data updates
3. Cache storage issues

**Solutions:**
1. Increase `AI_INSIGHTS_CACHE_TTL`
2. Implement cache warming strategy
3. Check database connectivity

### Problem: Slow Response Times

**Possible Causes:**
1. Large dataset (many data points)
2. Slow database queries
3. Complex calculations

**Solutions:**
1. Reduce analysis period
2. Add database indexes
3. Optimize algorithms
4. Use background processing

### Problem: High Memory Usage

**Possible Causes:**
1. Too many cached insights
2. Large insight data
3. Cache not expiring properly

**Solutions:**
1. Reduce cache TTL
2. Implement cache size limits
3. Add cache cleanup job

## Best Practices

### 1. Cache Strategy

```typescript
// Good: Use cache for frequently accessed data
const insights = await AIInsightsService.getAIInsights(userId);

// Good: Clear cache after data updates
await healthService.addHealthRecord(userId, data);
await AIInsightsService.clearCache(userId);

// Bad: Bypassing cache unnecessarily
await AIInsightsService.clearCache(userId);
const insights = await AIInsightsService.getAIInsights(userId);
```

### 2. Error Handling

```typescript
try {
  const insights = await AIInsightsService.getAIInsights(userId);
  return res.json({ success: true, data: insights });
} catch (error) {
  console.error('Failed to get insights:', error);
  // Return cached data if available, or error
  return res.status(500).json({ 
    error: 'Failed to generate insights',
    message: error.message 
  });
}
```

### 3. Monitoring Integration

```typescript
// Log to monitoring service
const startTime = Date.now();
const insights = await AIInsightsService.getAIInsights(userId);
const duration = Date.now() - startTime;

monitoringService.recordMetric('ai_insights_duration', duration);
monitoringService.recordMetric('ai_insights_data_points', 
  insights.metadata.dataPointsAnalyzed);
```

## Performance Testing

### Load Testing

Test cache performance under load:

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 \
  http://localhost:5000/api/ai-insights
```

### Benchmark Results

Expected performance with cache:

| Metric | Without Cache | With Cache (70% hit rate) |
|--------|--------------|---------------------------|
| Avg Response Time | 800ms | 250ms |
| P95 Response Time | 1500ms | 400ms |
| Requests/sec | 50 | 200 |
| DB Queries/sec | 500 | 150 |

## Conclusion

The AI Insights module is optimized for production use with:
- ✅ Intelligent caching (1-hour TTL)
- ✅ Comprehensive performance logging
- ✅ Database query optimization
- ✅ Response compression
- ✅ Configurable parameters

Monitor the logs regularly and adjust configuration based on your specific usage patterns.
