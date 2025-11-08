# AI Insights API 문서

## 개요

AI Insights API는 사용자의 건강 데이터를 분석하여 AI 기반 인사이트, 건강 점수, 트렌드 분석, 맞춤형 추천을 제공합니다.

## 기본 정보

- **Base URL**: `/api/ai-insights`
- **인증**: JWT Bearer Token 필요
- **응답 형식**: JSON
- **캐시**: 1시간 (3600초)

## 인증

모든 엔드포인트는 인증이 필요합니다. 요청 헤더에 JWT 토큰을 포함해야 합니다:

```http
Authorization: Bearer <your-jwt-token>
```

## 엔드포인트

### 1. 전체 인사이트 조회

모든 AI 인사이트 데이터를 한 번에 조회합니다.

**요청**

```http
GET /api/ai-insights
Authorization: Bearer <token>
```

**응답 (200 OK)**

```json
{
  "summary": {
    "text": "최근 7일간의 건강 데이터를 분석한 결과, 전반적인 건강 상태는 양호합니다...",
    "period": "최근 7일",
    "lastUpdated": "2024-01-15T10:30:00.000Z",
    "confidence": 0.85,
    "keyFindings": {
      "positive": [
        "규칙적인 운동 습관이 유지되고 있습니다",
        "수면 패턴이 개선되었습니다"
      ],
      "concerning": [
        "혈압이 정상 범위를 초과하는 경우가 있습니다"
      ]
    }
  },
  "insights": [
    {
      "id": "insight-1",
      "type": "warning",
      "priority": "high",
      "icon": "⚠️",
      "title": "혈압 주의",
      "description": "최근 혈압이 140/90 mmHg를 초과하는 경우가 관찰되었습니다.",
      "actionText": "혈압 관리 팁 보기",
      "actionLink": "/health/blood-pressure",
      "relatedMetrics": ["bloodPressure"],
      "generatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "healthScore": {
    "score": 78,
    "category": "good",
    "categoryLabel": "양호",
    "previousScore": 75,
    "change": 3,
    "changeDirection": "up",
    "components": {
      "bloodPressure": { "score": 70, "weight": 0.25 },
      "heartRate": { "score": 85, "weight": 0.20 },
      "sleep": { "score": 80, "weight": 0.25 },
      "exercise": { "score": 75, "weight": 0.20 },
      "stress": { "score": 80, "weight": 0.10 }
    }
  },
  "quickStats": {
    "bloodPressure": { "value": "125/82", "unit": "mmHg" },
    "heartRate": { "value": 72, "unit": "bpm" },
    "sleep": { "value": 7.2, "unit": "시간" },
    "exercise": { "value": 180, "unit": "분/주" }
  },
  "recommendations": [
    {
      "id": "rec-1",
      "icon": "🏃",
      "title": "유산소 운동 증가",
      "description": "주 3회, 30분씩 걷기나 조깅을 추천합니다.",
      "category": "exercise",
      "priority": 1
    }
  ],
  "trends": [
    {
      "metric": "bloodPressure",
      "label": "혈압",
      "currentValue": "125/82",
      "previousValue": "128/85",
      "change": -2.3,
      "changeDirection": "down",
      "isImproving": true,
      "dataPoints": [
        { "date": "2024-01-08", "value": 128 },
        { "date": "2024-01-15", "value": 125 }
      ]
    }
  ],
  "metadata": {
    "userId": "user-123",
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "dataPointsAnalyzed": 42,
    "analysisPeriod": 7,
    "cacheExpiry": "2024-01-15T11:30:00.000Z"
  }
}
```

**에러 응답**

```json
// 401 Unauthorized
{
  "error": "인증이 필요합니다"
}

// 500 Internal Server Error
{
  "error": "인사이트 생성 중 오류가 발생했습니다",
  "message": "상세 오류 메시지"
}
```

---

### 2. AI 요약 조회

AI가 생성한 건강 요약만 조회합니다.

**요청**

```http
GET /api/ai-insights/summary
Authorization: Bearer <token>
```

**응답 (200 OK)**

```json
{
  "text": "최근 7일간의 건강 데이터를 분석한 결과...",
  "period": "최근 7일",
  "lastUpdated": "2024-01-15T10:30:00.000Z",
  "confidence": 0.85,
  "keyFindings": {
    "positive": ["규칙적인 운동 습관이 유지되고 있습니다"],
    "concerning": ["혈압이 정상 범위를 초과하는 경우가 있습니다"]
  }
}
```

---

### 3. 트렌드 분석 조회

특정 기간의 건강 트렌드를 조회합니다.

**요청**

```http
GET /api/ai-insights/trends?period=30
Authorization: Bearer <token>
```

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| period | number | 아니오 | 30 | 분석 기간 (일) |

**지원되는 기간**
- `7`: 최근 7일
- `30`: 최근 30일
- `90`: 최근 90일
- `365`: 최근 1년

**응답 (200 OK)**

```json
[
  {
    "metric": "bloodPressure",
    "label": "혈압",
    "currentValue": "125/82",
    "previousValue": "128/85",
    "change": -2.3,
    "changeDirection": "down",
    "isImproving": true,
    "dataPoints": [
      { "date": "2024-01-08", "value": 128 },
      { "date": "2024-01-15", "value": 125 }
    ]
  },
  {
    "metric": "heartRate",
    "label": "심박수",
    "currentValue": "72",
    "previousValue": "75",
    "change": -4.0,
    "changeDirection": "down",
    "isImproving": true,
    "dataPoints": [
      { "date": "2024-01-08", "value": 75 },
      { "date": "2024-01-15", "value": 72 }
    ]
  }
]
```

---

### 4. 건강 점수 조회

현재 건강 점수와 구성 요소를 조회합니다.

**요청**

```http
GET /api/ai-insights/health-score
Authorization: Bearer <token>
```

**응답 (200 OK)**

```json
{
  "score": 78,
  "category": "good",
  "categoryLabel": "양호",
  "previousScore": 75,
  "change": 3,
  "changeDirection": "up",
  "components": {
    "bloodPressure": { "score": 70, "weight": 0.25 },
    "heartRate": { "score": 85, "weight": 0.20 },
    "sleep": { "score": 80, "weight": 0.25 },
    "exercise": { "score": 75, "weight": 0.20 },
    "stress": { "score": 80, "weight": 0.10 }
  }
}
```

**건강 점수 카테고리**

| 점수 범위 | 카테고리 | 한글 레이블 |
|----------|---------|-----------|
| 81-100 | excellent | 우수 |
| 61-80 | good | 양호 |
| 41-60 | fair | 보통 |
| 0-40 | poor | 주의 필요 |

---

### 5. 인사이트 새로고침

캐시를 무시하고 최신 인사이트를 강제로 생성합니다.

**요청**

```http
POST /api/ai-insights/refresh
Authorization: Bearer <token>
```

**응답 (200 OK)**

전체 인사이트 조회와 동일한 응답 형식

```json
{
  "summary": { ... },
  "insights": [ ... ],
  "healthScore": { ... },
  "quickStats": { ... },
  "recommendations": [ ... ],
  "trends": [ ... ],
  "metadata": { ... }
}
```

---

## 데이터 타입

### InsightCard

```typescript
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
```

### HealthScore

```typescript
interface HealthScore {
  score: number; // 0-100
  category: 'excellent' | 'good' | 'fair' | 'poor';
  categoryLabel: string;
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
```

### TrendData

```typescript
interface TrendData {
  metric: string;
  label: string;
  currentValue: string;
  previousValue: string;
  change: number;
  changeDirection: 'up' | 'down' | 'stable';
  isImproving: boolean;
  dataPoints: Array<{ date: string; value: number }>;
}
```

### Recommendation

```typescript
interface Recommendation {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'exercise' | 'sleep' | 'stress' | 'nutrition' | 'hydration';
  priority: number;
}
```

---

## 캐싱

AI Insights API는 성능 최적화를 위해 캐싱을 사용합니다:

- **캐시 TTL**: 1시간 (3600초)
- **캐시 키**: `userId` 기반
- **캐시 무효화**: 
  - 새로운 건강 데이터 입력 시
  - `/refresh` 엔드포인트 호출 시
  - 캐시 만료 시

캐시 상태는 응답의 `metadata.cacheExpiry` 필드에서 확인할 수 있습니다.

---

## 에러 코드

| HTTP 상태 | 에러 메시지 | 설명 |
|-----------|------------|------|
| 400 | Invalid period parameter | 잘못된 기간 파라미터 |
| 401 | 인증이 필요합니다 | JWT 토큰 누락 또는 만료 |
| 404 | User not found | 사용자를 찾을 수 없음 |
| 500 | 인사이트 생성 중 오류가 발생했습니다 | 서버 내부 오류 |

---

## 사용 예제

### JavaScript/TypeScript

```typescript
// API 클라이언트 함수
async function getAllInsights() {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/api/ai-insights', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch insights');
  }
  
  return await response.json();
}

// 사용
try {
  const insights = await getAllInsights();
  console.log('Health Score:', insights.healthScore.score);
  console.log('Insights:', insights.insights);
} catch (error) {
  console.error('Error:', error);
}
```

### cURL

```bash
# 전체 인사이트 조회
curl -X GET "http://localhost:5000/api/ai-insights" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 트렌드 조회 (30일)
curl -X GET "http://localhost:5000/api/ai-insights/trends?period=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 인사이트 새로고침
curl -X POST "http://localhost:5000/api/ai-insights/refresh" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 성능 고려사항

### 최소 데이터 요구사항

AI 인사이트를 생성하려면 최소한의 데이터가 필요합니다:

- **최소 데이터 포인트**: 3개 이상
- **권장 데이터 기간**: 7일 이상
- **분석 가능한 지표**: 혈압, 심박수, 수면, 운동, 스트레스 중 1개 이상

데이터가 부족한 경우, API는 여전히 응답을 반환하지만 일부 인사이트가 제한될 수 있습니다.

### 응답 시간

- **캐시 히트**: ~50ms
- **캐시 미스**: ~500-1000ms (데이터 분석 포함)
- **새로고침**: ~500-1000ms

### 요청 제한

- **Rate Limit**: 사용자당 분당 60회
- **동시 요청**: 사용자당 최대 5개

---

## 버전 관리

현재 API 버전: **v1**

향후 버전 업데이트 시 `/api/v2/ai-insights` 형식으로 제공될 예정입니다.

---

## 지원 및 문의

문제가 발생하거나 질문이 있으시면:
- GitHub Issues: [프로젝트 저장소]
- 이메일: support@healthplatform.com
- 문서: [전체 문서 보기](../docs/README.md)
