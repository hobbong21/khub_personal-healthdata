# Design Document

## Overview

The AI Insights Module is a comprehensive system that analyzes user health data and generates personalized insights, recommendations, and trend analysis. The module consists of backend services for data processing and analysis, REST API endpoints for data access, and frontend React components for visualization.

The system leverages existing health data infrastructure (health records, vital signs, medical records) and AI services to provide actionable insights. It integrates seamlessly with the current AIInsightsPage.tsx component and extends the existing aiService.ts and aiController.ts.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         AIInsightsPage.tsx (React)                   │  │
│  │  - AI Summary Display                                │  │
│  │  - Insight Cards Grid                                │  │
│  │  - Health Score Visualization                        │  │
│  │  - Quick Stats Sidebar                               │  │
│  │  - Recommendations Display                           │  │
│  │  - Trend Analysis Charts                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      API Client (aiInsightsApi.ts)                   │  │
│  │  - HTTP requests to backend                          │  │
│  │  - Response transformation                           │  │
│  │  - Error handling                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                     Backend Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    AI Insights Routes (/api/ai-insights)             │  │
│  │  - GET /api/ai-insights                              │  │
│  │  - GET /api/ai-insights/summary                      │  │
│  │  - GET /api/ai-insights/trends?period=30             │  │
│  │  - GET /api/ai-insights/health-score                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    AI Insights Controller                            │  │
│  │  - Request validation                                │  │
│  │  - Service orchestration                             │  │
│  │  - Response formatting                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    AI Insights Service                               │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Insight Generator                             │  │  │
│  │  │  - Analyze health data                         │  │  │
│  │  │  - Generate insight cards                      │  │  │
│  │  │  - Categorize by type & priority               │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Health Score Calculator                       │  │  │
│  │  │  - Compute weighted score (0-100)              │  │  │
│  │  │  - Compare with previous period                │  │  │
│  │  │  - Categorize score level                      │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Trend Analyzer                                │  │  │
│  │  │  - Calculate metric averages                   │  │  │
│  │  │  - Compute percentage changes                  │  │  │
│  │  │  - Determine trend direction                   │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Summary Generator                             │  │  │
│  │  │  - Generate natural language summary           │  │  │
│  │  │  - Include metadata (period, confidence)       │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Recommendation Engine                         │  │  │
│  │  │  - Generate personalized recommendations       │  │  │
│  │  │  - Prioritize by health impact                 │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Health Data Service (existing)                    │  │
│  │  - Retrieve vital signs                              │  │
│  │  - Retrieve health records                           │  │
│  │  - Calculate aggregates                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Prisma ORM + PostgreSQL/SQLite                    │  │
│  │  - User                                              │  │
│  │  - HealthRecord                                      │  │
│  │  - VitalSign                                         │  │
│  │  - MedicalRecord                                     │  │
│  │  - Medication                                        │  │
│  │  - FamilyHistory                                     │  │
│  │  - GenomicData                                       │  │
│  │  - AIInsightCache (new)                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **User visits AI Insights page** → Frontend loads AIInsightsPage component
2. **Component mounts** → Calls API client to fetch insights
3. **API client** → Makes HTTP GET request to `/api/ai-insights`
4. **Backend controller** → Validates request, calls AI Insights Service
5. **AI Insights Service** → Checks cache, if expired:
   - Retrieves health data from Health Data Service
   - Generates summary, insights, score, trends, recommendations
   - Caches results for 1 hour
6. **Response flows back** → Controller → API client → Frontend
7. **Frontend renders** → Displays all insights with visualizations

## Components and Interfaces

### Backend Components

#### 1. AI Insights Service (`aiInsightsService.ts`)

**Purpose**: Core business logic for generating AI insights

**Key Methods**:
```typescript
class AIInsightsService {
  // Main method to get all insights
  static async getAIInsights(userId: string): Promise<AIInsightsResponse>
  
  // Generate AI summary
  static async generateSummary(userId: string, healthData: HealthData): Promise<AISummary>
  
  // Generate insight cards
  static async generateInsights(userId: string, healthData: HealthData): Promise<InsightCard[]>
  
  // Calculate health score
  static async calculateHealthScore(userId: string, healthData: HealthData): Promise<HealthScore>
  
  // Get quick stats
  static async getQuickStats(userId: string, period: number): Promise<QuickStats>
  
  // Generate recommendations
  static async generateRecommendations(userId: string, healthData: HealthData, insights: InsightCard[]): Promise<Recommendation[]>
  
  // Analyze trends
  static async analyzeTrends(userId: string, period: number): Promise<TrendData[]>
  
  // Cache management
  private static async getCachedInsights(userId: string): Promise<AIInsightsResponse | null>
  private static async cacheInsights(userId: string, insights: AIInsightsResponse): Promise<void>
}
```

#### 2. AI Insights Controller (`aiInsightsController.ts`)

**Purpose**: Handle HTTP requests and responses

**Endpoints**:
```typescript
class AIInsightsController {
  // GET /api/ai-insights - Get all insights
  static async getAllInsights(req: Request, res: Response)
  
  // GET /api/ai-insights/summary - Get only summary
  static async getSummary(req: Request, res: Response)
  
  // GET /api/ai-insights/trends?period=30 - Get trend data
  static async getTrends(req: Request, res: Response)
  
  // GET /api/ai-insights/health-score - Get health score
  static async getHealthScore(req: Request, res: Response)
  
  // POST /api/ai-insights/refresh - Force refresh insights
  static async refreshInsights(req: Request, res: Response)
}
```

#### 3. Insight Generator (part of AIInsightsService)

**Purpose**: Analyze health data and create categorized insights

**Logic**:
- Analyzes vital signs, sleep, exercise, stress data
- Compares against normal ranges and user history
- Generates insights in 4 categories: positive, warning, alert, info
- Assigns priority levels: high, medium, low
- Creates actionable recommendations for each insight

**Rules**:
- Blood pressure > 140/90 → Alert (high priority)
- Heart rate > 100 or < 50 → Alert (high priority)
- Exercise < 150 min/week → Warning (medium priority)
- Sleep < 6 hours → Warning (medium priority)
- Stress level > 7/10 → Alert (high priority)
- Improvements detected → Positive (low priority)
- General tips → Info (low priority)

#### 4. Health Score Calculator (part of AIInsightsService)

**Purpose**: Compute overall health score

**Algorithm**:
```
Health Score (0-100) = 
  Blood Pressure Score (25%) +
  Heart Rate Score (20%) +
  Sleep Quality Score (25%) +
  Exercise Score (20%) +
  Stress Score (10%)

Each component scored 0-100 based on:
- Blood Pressure: Optimal (120/80) = 100, High (>140/90) = 0
- Heart Rate: Optimal (60-80) = 100, Outside range = lower score
- Sleep: 7-9 hours = 100, <6 or >10 = lower score
- Exercise: ≥150 min/week = 100, 0 min = 0
- Stress: Low (1-3) = 100, High (8-10) = 0

Score Categories:
- 81-100: Excellent (우수)
- 61-80: Good (양호)
- 41-60: Fair (보통)
- 0-40: Poor (주의 필요)
```

#### 5. Trend Analyzer (part of AIInsightsService)

**Purpose**: Analyze health metric trends over time

**Metrics Tracked**:
- Blood pressure (systolic/diastolic)
- Heart rate
- Sleep duration
- Exercise time
- Stress index
- Hydration level

**Analysis**:
- Calculate average for selected period
- Compare with previous period
- Compute percentage change
- Determine trend direction (improving/worsening)
- Generate mini-chart data points

#### 6. Summary Generator (part of AIInsightsService)

**Purpose**: Create natural language health summary

**Approach**:
- Template-based generation with dynamic content
- Analyzes last 7 days of data
- Highlights key findings (positive and concerning)
- Provides actionable recommendations
- Includes metadata (analysis period, update time, confidence)

**Example Template**:
```
최근 {period}일간의 건강 데이터를 분석한 결과, 전반적인 건강 상태는 {overall_status}입니다.
{positive_findings}
{concerning_findings}
{recommendations}
```

#### 7. Recommendation Engine (part of AIInsightsService)

**Purpose**: Generate personalized health recommendations

**Categories**:
- Exercise recommendations
- Sleep improvement tips
- Stress management techniques
- Nutrition advice
- Hydration reminders

**Prioritization**:
- Based on insight priority levels
- Addresses most critical issues first
- Provides 3-5 actionable recommendations
- Includes timing suggestions when relevant

### Frontend Components

#### 1. AI Insights API Client (`frontend/src/api/aiInsightsApi.ts`)

**Purpose**: Handle API communication

```typescript
class AIInsightsAPI {
  static async getAllInsights(userId: string): Promise<AIInsightsResponse>
  static async getSummary(userId: string): Promise<AISummary>
  static async getTrends(userId: string, period: number): Promise<TrendData[]>
  static async getHealthScore(userId: string): Promise<HealthScore>
  static async refreshInsights(userId: string): Promise<AIInsightsResponse>
}
```

#### 2. Enhanced AIInsightsPage Component

**Updates to existing component**:
- Replace static data with API calls
- Add loading states
- Add error handling
- Implement data refresh functionality
- Add period filter state management

**New Sub-components** (optional, for better organization):
- `AISummaryCard.tsx` - Display AI summary
- `InsightCard.tsx` - Already exists, enhance with real data
- `HealthScoreWidget.tsx` - Display health score
- `QuickStatsPanel.tsx` - Display quick stats
- `RecommendationsPanel.tsx` - Display recommendations
- `TrendCard.tsx` - Already exists, enhance with real data

## Data Models

### TypeScript Interfaces

```typescript
// Main response interface
interface AIInsightsResponse {
  summary: AISummary;
  insights: InsightCard[];
  healthScore: HealthScore;
  quickStats: QuickStats;
  recommendations: Recommendation[];
  trends: TrendData[];
  metadata: InsightsMetadata;
}

// AI Summary
interface AISummary {
  text: string;
  period: string;
  lastUpdated: Date;
  confidence: number;
  keyFindings: {
    positive: string[];
    concerning: string[];
  };
}

// Insight Card
interface InsightCard {
  id: string;
  type: 'positive' | 'warning' | 'alert' | 'info';
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
  actionText: string;
  actionLink: string;
  relatedMetrics: string[];
  generatedAt: Date;
}

// Health Score
interface HealthScore {
  score: number; // 0-100
  category: 'excellent' | 'good' | 'fair' | 'poor';
  categoryLabel: string; // Korean label
  previousScore: number;
  change: number;
  changeDirection: 'up' | 'down' | 'stable';
  components: {
    bloodPressure: { score: number; weight: number };
    heartRate: { score: number; weight: number };
    sleep: { score: number; weight: number };
    exercise: { score: number; weight: number };
    stress: { score: number; weight: number };
  };
}

// Quick Stats
interface QuickStats {
  bloodPressure: { value: string; unit: string };
  heartRate: { value: number; unit: string };
  sleep: { value: number; unit: string };
  exercise: { value: number; unit: string };
}

// Recommendation
interface Recommendation {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'exercise' | 'sleep' | 'stress' | 'nutrition' | 'hydration';
  priority: number;
}

// Trend Data
interface TrendData {
  metric: string;
  label: string;
  currentValue: string;
  previousValue: string;
  change: number;
  changeDirection: 'up' | 'down' | 'stable';
  isImproving: boolean;
  dataPoints: { date: string; value: number }[];
}

// Metadata
interface InsightsMetadata {
  userId: string;
  generatedAt: Date;
  dataPointsAnalyzed: number;
  analysisPeriod: number; // days
  cacheExpiry: Date;
}
```

### Database Schema Extension

**New Table: AIInsightCache**

```prisma
model AIInsightCache {
  id            String   @id @default(uuid())
  userId        String
  insightsData  Json     // Stores complete AIInsightsResponse
  generatedAt   DateTime @default(now())
  expiresAt     DateTime
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([expiresAt])
}
```

## Error Handling

### Backend Error Scenarios

1. **Insufficient Data**
   - Status: 200 OK
   - Response: Partial insights with message indicating more data needed
   - Frontend: Display encouragement message

2. **User Not Found**
   - Status: 404 Not Found
   - Response: `{ error: 'User not found' }`
   - Frontend: Redirect to login or show error

3. **Service Error**
   - Status: 500 Internal Server Error
   - Response: `{ error: 'Failed to generate insights', message: '...' }`
   - Frontend: Show error message with retry option

4. **Invalid Period Parameter**
   - Status: 400 Bad Request
   - Response: `{ error: 'Invalid period parameter' }`
   - Frontend: Use default period (30 days)

### Frontend Error Handling

```typescript
try {
  const insights = await AIInsightsAPI.getAllInsights(userId);
  setInsights(insights);
} catch (error) {
  if (error.status === 404) {
    // User not found
    navigate('/login');
  } else if (error.status === 500) {
    // Server error
    setError('인사이트를 불러오는데 실패했습니다. 다시 시도해주세요.');
  } else {
    // Unknown error
    setError('알 수 없는 오류가 발생했습니다.');
  }
}
```

## Testing Strategy

### Unit Tests

1. **AI Insights Service Tests**
   - Test insight generation with various health data scenarios
   - Test health score calculation with edge cases
   - Test trend analysis with different time periods
   - Test summary generation
   - Test recommendation engine logic
   - Test cache management

2. **Controller Tests**
   - Test all endpoint handlers
   - Test request validation
   - Test error responses
   - Test authentication/authorization

3. **Frontend Component Tests**
   - Test AIInsightsPage rendering
   - Test loading states
   - Test error states
   - Test data display
   - Test user interactions (filter changes, refresh)

### Integration Tests

1. **API Integration Tests**
   - Test complete flow from request to response
   - Test with real database (test environment)
   - Test cache behavior
   - Test concurrent requests

2. **End-to-End Tests**
   - Test user journey: login → navigate to AI Insights → view insights
   - Test data refresh flow
   - Test period filter changes
   - Test responsive design

### Test Data

Create test fixtures with:
- Users with varying amounts of health data
- Users with no data (edge case)
- Users with excellent health metrics
- Users with concerning health metrics
- Historical data spanning different periods

## Performance Considerations

### Caching Strategy

1. **Server-side Cache**
   - Cache complete insights for 1 hour
   - Store in database (AIInsightCache table)
   - Invalidate on new health data entry
   - Use userId as cache key

2. **Client-side Cache**
   - Use React Query or SWR for API response caching
   - Cache for 5 minutes on client
   - Implement stale-while-revalidate pattern

### Optimization Techniques

1. **Database Queries**
   - Use indexed queries for health data retrieval
   - Limit data retrieval to necessary period only
   - Use aggregation queries where possible
   - Implement pagination for historical data

2. **Computation**
   - Pre-calculate common metrics
   - Use memoization for expensive calculations
   - Batch process multiple insights generation
   - Lazy load trend chart data

3. **API Response**
   - Compress responses with gzip
   - Implement partial response (allow clients to request specific sections)
   - Use HTTP caching headers (ETag, Cache-Control)

### Scalability

- Design for horizontal scaling
- Use Redis for distributed caching (future enhancement)
- Implement rate limiting to prevent abuse
- Consider background job processing for heavy computations

## Security Considerations

1. **Authentication & Authorization**
   - Require valid JWT token for all endpoints
   - Verify user can only access their own insights
   - Implement rate limiting per user

2. **Data Privacy**
   - Never expose raw health data in logs
   - Sanitize error messages
   - Implement audit logging for access

3. **Input Validation**
   - Validate all query parameters
   - Sanitize user inputs
   - Prevent SQL injection through Prisma ORM

## Internationalization

### Current Implementation
- All text in Korean (ko)
- Hard-coded strings in service layer

### Future Enhancement
- Extract strings to i18n files
- Support multiple languages (ko, en)
- Use translation keys in responses
- Let frontend handle language selection

## Deployment Considerations

1. **Environment Variables**
   - `AI_INSIGHTS_CACHE_TTL` - Cache time-to-live (default: 3600 seconds)
   - `AI_INSIGHTS_MIN_DATA_POINTS` - Minimum data points for analysis (default: 3)

2. **Database Migration**
   - Create AIInsightCache table
   - Add indexes for performance

3. **Monitoring**
   - Log insight generation time
   - Monitor cache hit rate
   - Track API response times
   - Alert on high error rates

4. **Rollout Strategy**
   - Deploy backend first
   - Test with API client (Postman/Insomnia)
   - Deploy frontend updates
   - Monitor for errors
   - Gradual rollout to users

## Future Enhancements

1. **Advanced AI Integration**
   - Integrate with OpenAI GPT for more natural summaries
   - Use machine learning models for better predictions
   - Implement anomaly detection

2. **Real-time Updates**
   - WebSocket support for live insights updates
   - Push notifications for critical insights

3. **Personalization**
   - Learn from user preferences
   - Customize recommendation types
   - Adjust insight sensitivity

4. **Visualization**
   - Interactive charts with Chart.js or Recharts
   - Historical trend comparisons
   - Goal tracking visualizations

5. **Export & Sharing**
   - PDF export of insights
   - Share insights with healthcare providers
   - Integration with health apps