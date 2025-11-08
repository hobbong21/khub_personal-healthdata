# 한국어 텍스트 및 레이블 매핑

이 문서는 AI Insights Module에 적용된 모든 한국어 텍스트 및 레이블 매핑을 정리합니다.

## 1. 건강 점수 카테고리 레이블 (Health Score Category Labels)

| English | Korean | Score Range |
|---------|--------|-------------|
| excellent | 우수 | 81-100 |
| good | 양호 | 61-80 |
| fair | 보통 | 41-60 |
| poor | 주의 필요 | 0-40 |

**구현 위치**: `backend/src/services/aiInsightsService.ts` - `calculateHealthScore()` 메서드

```typescript
if (totalScore >= 81) {
  category = 'excellent';
  categoryLabel = '우수';
} else if (totalScore >= 61) {
  category = 'good';
  categoryLabel = '양호';
} else if (totalScore >= 41) {
  category = 'fair';
  categoryLabel = '보통';
} else {
  category = 'poor';
  categoryLabel = '주의 필요';
}
```

## 2. 건강 지표 용어 (Health Metric Terms)

### 2.1 백엔드 (Backend)

| English | Korean |
|---------|--------|
| Blood Pressure | 혈압 |
| Heart Rate | 심박수 |
| Sleep | 수면 |
| Exercise | 운동 |
| Stress | 스트레스 |
| Hydration | 수분 섭취 |

### 2.2 단위 (Units)

| English | Korean | Usage |
|---------|--------|-------|
| mmHg | mmHg | 혈압 (그대로 유지) |
| bpm | bpm | 심박수 (그대로 유지) |
| hours | 시간 | 수면 시간 |
| min/week | 분/주 | 주간 운동 시간 |

**구현 위치**: `backend/src/services/aiInsightsService.ts` - `getQuickStats()` 메서드

```typescript
return {
  bloodPressure: {
    value: bloodPressureValue,
    unit: 'mmHg',
  },
  heartRate: {
    value: heartRateValue,
    unit: 'bpm',
  },
  sleep: {
    value: sleepValue,
    unit: '시간',
  },
  exercise: {
    value: exerciseValue,
    unit: '분/주',
  },
};
```

## 3. 데이터 없음 표시 (No Data Display)

| English | Korean |
|---------|--------|
| No data | 데이터 없음 |

**구현 위치**:
- `backend/src/services/aiInsightsService.ts` - `getQuickStats()` 메서드
- `backend/src/services/aiInsightsService.ts` - `generateInsufficientDataResponse()` 메서드
- `backend/src/services/aiInsightsService.ts` - `analyzeTrends()` 메서드
- `frontend/src/components/ai/AIInsightsDashboard.tsx` - Quick Stats 섹션

## 4. 에러 메시지 (Error Messages)

### 4.1 백엔드 컨트롤러 (Backend Controller)

| Context | Korean Message |
|---------|----------------|
| Authentication Required | 인증이 필요합니다. |
| Get Insights Failed | AI 인사이트를 불러오는데 실패했습니다. |
| Get Summary Failed | AI 요약을 불러오는데 실패했습니다. |
| Invalid Period | 유효하지 않은 기간입니다. |
| Unsupported Period | 지원하지 않는 기간입니다. |
| Get Health Score Failed | 건강 점수를 불러오는데 실패했습니다. |
| Refresh Failed | 인사이트 새로고침에 실패했습니다. |
| Refresh Success | 인사이트가 성공적으로 새로고침되었습니다. |

**구현 위치**: `backend/src/controllers/aiInsightsController.ts`

### 4.2 프론트엔드 API (Frontend API)

| Context | Korean Message |
|---------|----------------|
| Get Insights Failed | AI 인사이트 조회 실패 |
| Get Summary Failed | AI 요약 조회 실패 |
| Get Trends Failed | 트렌드 분석 조회 실패 |
| Get Health Score Failed | 건강 점수 조회 실패 |
| Refresh Failed | 인사이트 새로고침 실패 |
| Unknown Error | 알 수 없는 오류가 발생했습니다 |

**구현 위치**: `frontend/src/services/aiInsightsApi.ts`

## 5. 인사이트 텍스트 (Insight Text)

모든 인사이트 생성 로직은 한국어로 작성되어 있습니다:

### 5.1 혈압 인사이트
- "혈압이 높습니다"
- "혈압 관리가 필요합니다"
- "혈압이 정상 범위입니다"

### 5.2 심박수 인사이트
- "심박수가 높습니다"
- "심박수가 낮습니다"
- "심박수가 이상적입니다"

### 5.3 수면 인사이트
- "수면 시간이 부족합니다"
- "수면 시간이 과도합니다"
- "수면 패턴이 우수합니다"

### 5.4 운동 인사이트
- "운동 기록이 없습니다"
- "운동량이 부족합니다"
- "운동을 꾸준히 하고 있습니다"

### 5.5 스트레스 인사이트
- "스트레스 수준이 높습니다"
- "스트레스 관리가 필요합니다"
- "스트레스를 잘 관리하고 있습니다"

**구현 위치**: `backend/src/services/aiInsightsService.ts` - 각 분석 메서드

## 6. 추천사항 (Recommendations)

모든 추천사항은 한국어로 작성되어 있습니다:

- "혈압 관리"
- "심박수 안정화"
- "스트레스 관리"
- "수면 개선"
- "수면 기록 시작"
- "운동 시작하기"
- "운동량 늘리기"
- "충분한 수분 섭취"
- "균형 잡힌 식단"

**구현 위치**: `backend/src/services/aiInsightsService.ts` - `generateRecommendations()` 메서드

## 7. 트렌드 레이블 (Trend Labels)

| Metric | Korean Label |
|--------|--------------|
| blood_pressure | 혈압 |
| heart_rate | 심박수 |
| sleep | 수면 시간 |
| exercise | 운동 시간 |
| stress | 스트레스 지수 |
| hydration | 수분 섭취 |

**구현 위치**: `backend/src/services/aiInsightsService.ts` - 각 트렌드 분석 메서드

## 8. UI 텍스트 (Frontend UI Text)

### 8.1 대시보드 헤더
- "AI 건강 인사이트"
- "인공지능 기반 건강 분석 및 맞춤형 추천"
- "새로고침"
- "분석 중..."

### 8.2 섹션 제목
- "AI 건강 요약"
- "건강 인사이트"
- "종합 건강 점수"
- "건강 트렌드 분석"
- "주요 지표"
- "맞춤형 추천"

### 8.3 상태 메시지
- "AI 건강 인사이트를 분석하고 있습니다..."
- "오류가 발생했습니다"
- "다시 시도"
- "아직 분석된 인사이트가 없습니다"
- "인사이트 생성하기"

### 8.4 기타 UI 요소
- "신뢰도"
- "긍정적 발견사항"
- "주의가 필요한 사항"
- "마지막 업데이트"
- "지난 주 대비"
- "이전"

**구현 위치**: `frontend/src/components/ai/AIInsightsDashboard.tsx`

## 9. 우선순위 레이블 (Priority Labels)

| English | Korean |
|---------|--------|
| high | 높음 |
| medium | 보통 |
| low | 낮음 |

**구현 위치**: `frontend/src/components/ai/AIInsightsDashboard.tsx` - Insight Cards 섹션

## 10. 기간 필터 (Period Filters)

| Days | Korean Label |
|------|--------------|
| 7 | 7일 |
| 30 | 30일 |
| 90 | 90일 |
| 365 | 1년 |

**구현 위치**: `frontend/src/components/ai/AIInsightsDashboard.tsx` - Trends 섹션

## 11. 요약 (Summary)

모든 AI Insights Module의 텍스트는 한국어로 작성되었으며, 다음 요구사항을 충족합니다:

✅ **Requirement 10.1**: 모든 인사이트 텍스트를 한국어로 작성
✅ **Requirement 10.2**: 건강 지표 용어를 한국어로 표시
✅ **Requirement 10.3**: 에러 메시지를 한국어로 작성
✅ **Requirement 10.4**: 카테고리 레이블 한국어 매핑 (Excellent → 우수, Good → 양호 등)

## 12. 테스트 파일 업데이트

테스트 파일도 한국어 단위로 업데이트되었습니다:

- `backend/src/tests/aiInsightsService.test.ts`
- `backend/src/tests/aiInsights.integration.test.ts`

단위 변경:
- `hours` → `시간`
- `min/week` → `분/주`
