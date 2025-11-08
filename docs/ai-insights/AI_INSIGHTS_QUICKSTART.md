# AI Insights Module 빠른 시작 가이드

## 개요

이 가이드는 AI Insights Module을 빠르게 설정하고 사용하는 방법을 설명합니다.

## 5분 안에 시작하기

### 1단계: 환경 변수 설정

```bash
cd backend

# .env 파일에 다음 추가
cat >> .env << EOF
AI_INSIGHTS_CACHE_TTL=3600
AI_INSIGHTS_MIN_DATA_POINTS=3
EOF
```

### 2단계: 데이터베이스 마이그레이션

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 실행
npx prisma migrate deploy

# 확인
npx prisma migrate status
```

### 3단계: 서버 시작

```bash
# 개발 모드
npm run dev

# 또는 프로덕션 모드
npm run build
npm start
```

### 4단계: API 테스트

```bash
# 로그인하여 토큰 획득
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# AI Insights 조회
curl -X GET http://localhost:5000/api/ai-insights \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

## 주요 기능 사용하기

### 전체 인사이트 조회

```javascript
// JavaScript/TypeScript
const response = await fetch('/api/ai-insights', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const insights = await response.json();

console.log('건강 점수:', insights.healthScore.score);
console.log('인사이트 개수:', insights.insights.length);
console.log('추천사항:', insights.recommendations);
```

### 건강 점수만 조회

```javascript
const response = await fetch('/api/ai-insights/health-score', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const healthScore = await response.json();

console.log(`건강 점수: ${healthScore.score}/100`);
console.log(`등급: ${healthScore.categoryLabel}`);
console.log(`변화: ${healthScore.change > 0 ? '+' : ''}${healthScore.change}`);
```

### 트렌드 분석 조회

```javascript
// 30일 트렌드
const response = await fetch('/api/ai-insights/trends?period=30', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const trends = await response.json();

trends.forEach(trend => {
  console.log(`${trend.label}: ${trend.currentValue} (${trend.change > 0 ? '+' : ''}${trend.change}%)`);
});
```

### 인사이트 새로고침

```javascript
const response = await fetch('/api/ai-insights/refresh', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const freshInsights = await response.json();

console.log('최신 인사이트 생성 완료');
```

## 프론트엔드 통합

### React 컴포넌트 예시

```typescript
import React, { useEffect, useState } from 'react';
import { getAllInsights } from '../services/aiInsightsApi';

function AIInsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const data = await getAllInsights();
        setInsights(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div>
      <h1>AI 건강 인사이트</h1>
      
      {/* 건강 점수 */}
      <div className="health-score">
        <h2>건강 점수</h2>
        <div className="score">{insights.healthScore.score}/100</div>
        <div className="category">{insights.healthScore.categoryLabel}</div>
      </div>

      {/* 인사이트 카드 */}
      <div className="insights-grid">
        {insights.insights.map(insight => (
          <div key={insight.id} className={`insight-card ${insight.type}`}>
            <span className="icon">{insight.icon}</span>
            <h3>{insight.title}</h3>
            <p>{insight.description}</p>
          </div>
        ))}
      </div>

      {/* 추천사항 */}
      <div className="recommendations">
        <h2>추천사항</h2>
        {insights.recommendations.map(rec => (
          <div key={rec.id} className="recommendation">
            <span className="icon">{rec.icon}</span>
            <div>
              <h4>{rec.title}</h4>
              <p>{rec.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AIInsightsPage;
```

### API 클라이언트 설정

```typescript
// services/aiInsightsApi.ts
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function getAuthToken() {
  return localStorage.getItem('authToken');
}

export async function getAllInsights() {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/ai-insights`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch insights');
  }

  return response.json();
}

export async function getTrends(period = 30) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/ai-insights/trends?period=${period}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch trends');
  }

  return response.json();
}

export async function refreshInsights() {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/ai-insights/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to refresh insights');
  }

  return response.json();
}
```

## 데이터 요구사항

AI Insights를 생성하려면 다음 데이터가 필요합니다:

### 최소 요구사항

- **데이터 포인트**: 최소 3개 이상 (설정 가능)
- **데이터 기간**: 최소 3일 이상 권장
- **데이터 타입**: 다음 중 1개 이상
  - 혈압 (VitalSign)
  - 심박수 (VitalSign)
  - 수면 시간 (HealthRecord)
  - 운동 시간 (HealthRecord)
  - 스트레스 수준 (HealthRecord)

### 테스트 데이터 생성

```bash
# 시드 데이터 실행
cd backend
npm run seed

# 또는 수동으로 데이터 입력
curl -X POST http://localhost:5000/api/health/vitals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bloodPressureSystolic": 120,
    "bloodPressureDiastolic": 80,
    "heartRate": 72,
    "recordedAt": "2024-01-15T10:00:00Z"
  }'
```

## 캐싱 이해하기

### 캐시 동작

1. **첫 요청**: 데이터 분석 → 인사이트 생성 → 캐시 저장 (~500-1000ms)
2. **후속 요청**: 캐시에서 반환 (~50ms)
3. **캐시 만료**: TTL 후 자동 재생성

### 캐시 확인

```bash
# Redis에서 캐시 확인
redis-cli KEYS "ai-insights:*"

# 특정 사용자 캐시 확인
redis-cli GET "ai-insights:user-123"

# 캐시 TTL 확인
redis-cli TTL "ai-insights:user-123"
```

### 캐시 무효화

```bash
# 특정 사용자 캐시 삭제
redis-cli DEL "ai-insights:user-123"

# 모든 AI Insights 캐시 삭제
redis-cli --scan --pattern "ai-insights:*" | xargs redis-cli DEL

# 또는 API로 새로고침
curl -X POST http://localhost:5000/api/ai-insights/refresh \
  -H "Authorization: Bearer $TOKEN"
```

## 문제 해결

### "Insufficient data" 메시지

**문제**: 인사이트가 생성되지 않음

**해결**:
```bash
# 1. 데이터 확인
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"VitalSign\" WHERE \"userId\" = 'user-123';"

# 2. 최소 데이터 포인트 낮추기
export AI_INSIGHTS_MIN_DATA_POINTS=1

# 3. 테스트 데이터 추가
npm run seed
```

### 캐시 미작동

**문제**: 모든 요청이 느림

**해결**:
```bash
# 1. Redis 연결 확인
redis-cli ping

# 2. Redis 로그 확인
redis-cli INFO

# 3. 환경 변수 확인
echo $REDIS_URL
```

### 느린 응답 시간

**문제**: API 응답이 1초 이상 걸림

**해결**:
```bash
# 1. 캐시 히트율 확인
redis-cli INFO stats | grep keyspace_hits

# 2. 데이터베이스 쿼리 최적화
# 인덱스 확인
psql $DATABASE_URL -c "\d VitalSign"

# 3. 캐시 TTL 증가
export AI_INSIGHTS_CACHE_TTL=7200  # 2시간
```

## 다음 단계

- [전체 API 문서](./AI_INSIGHTS_API.md) 읽기
- [배포 가이드](./AI_INSIGHTS_DEPLOYMENT.md) 확인
- [성능 최적화](./AI_INSIGHTS_PERFORMANCE_GUIDE.md) 적용
- [환경 변수 문서](./ENVIRONMENT_VARIABLES.md) 참조

## 지원

- GitHub Issues: [프로젝트 저장소]
- 이메일: support@healthplatform.com
- 문서: [전체 문서](../../docs/README.md)
