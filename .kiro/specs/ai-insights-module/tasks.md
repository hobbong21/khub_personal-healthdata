# Implementation Plan

- [x] 1. 백엔드 타입 정의 및 인터페이스 생성





  - TypeScript 인터페이스 파일 생성 (`backend/src/types/aiInsights.ts`)
  - AIInsightsResponse, AISummary, InsightCard, HealthScore, QuickStats, Recommendation, TrendData, InsightsMetadata 인터페이스 정의
  - _Requirements: 1.3, 2.6, 3.5, 4.4, 5.5, 6.5, 9.4_

- [x] 2. 데이터베이스 스키마 확장




















  - Prisma 스키마에 AIInsightCache 모델 추가
  - 인덱스 설정 (userId, expiresAt)
  - 마이그레이션 파일 생성 및 실행
  - _Requirements: 7.2, 7.3_
-

- [x] 3. AI Insights Service 핵심 로직 구현




- [x] 3.1 서비스 기본 구조 및 캐시 관리






  - `backend/src/services/aiInsightsService.ts` 파일 생성
  - AIInsightsService 클래스 기본 구조 작성
  - 캐시 조회 및 저장 메서드 구현 (getCachedInsights, cacheInsights)
  - _Requirements: 7.2, 7.3_

- [x] 3.2 Health Score Calculator 구현


  - calculateHealthScore 메서드 구현
  - 각 건강 지표별 점수 계산 로직 (혈압, 심박수, 수면, 운동, 스트레스)
  - 가중치 적용 및 총점 계산 (0-100)
  - 이전 주 대비 변화 계산
  - 점수 카테고리 분류 (Excellent, Good, Fair, Poor)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.3 Insight Generator 구현


  - generateInsights 메서드 구현
  - 건강 데이터 분석 로직 (혈압, 심박수, 수면, 운동, 스트레스)
  - 정상 범위와 비교하여 인사이트 생성
  - 인사이트 타입 분류 (positive, warning, alert, info)
  - 우선순위 할당 (high, medium, low)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 3.4 Summary Generator 구현


  - generateSummary 메서드 구현
  - 최근 7일 데이터 분석
  - 자연어 요약 생성 (템플릿 기반)
  - 긍정적 발견사항 및 우려사항 추출
  - 메타데이터 포함 (분석 기간, 업데이트 시간, 신뢰도)
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 3.5 Recommendation Engine 구현


  - generateRecommendations 메서드 구현
  - 인사이트 기반 맞춤형 추천 생성
  - 운동, 수면, 스트레스, 수분 섭취 추천
  - 우선순위에 따른 정렬
  - 3-5개 추천사항 선택
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3.6 Trend Analyzer 구현


  - analyzeTrends 메서드 구현
  - 기간별 평균값 계산 (7일, 30일, 90일, 1년)
  - 이전 기간 대비 변화율 계산
  - 트렌드 방향 결정 (improving, worsening, stable)
  - 6가지 지표 분석 (혈압, 심박수, 수면, 운동, 스트레스, 수분)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 3.7 Quick Stats 계산 구현


  - getQuickStats 메서드 구현
  - 선택된 기간의 평균값 계산
  - 데이터 없는 경우 처리 ("No data" 표시)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 3.8 메인 통합 메서드 구현


  - getAIInsights 메서드 구현
  - 캐시 확인 및 유효성 검사
  - 모든 하위 메서드 호출 및 결과 통합
  - 에러 처리 및 부분 데이터 처리
  - _Requirements: 1.4, 7.1, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5_
-

- [x] 4. AI Insights Controller 구현




  - `backend/src/controllers/aiInsightsController.ts` 파일 생성
  - getAllInsights 엔드포인트 핸들러 구현
  - getSummary 엔드포인트 핸들러 구현
  - getTrends 엔드포인트 핸들러 구현 (period 쿼리 파라미터 처리)
  - getHealthScore 엔드포인트 핸들러 구현
  - refreshInsights 엔드포인트 핸들러 구현
  - 요청 검증 및 에러 처리
  - 인증 확인 (userId 추출)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
-

- [x] 5. API 라우트 설정




  - `backend/src/routes/aiInsights.ts` 파일 생성
  - GET /api/ai-insights 라우트 등록
  - GET /api/ai-insights/summary 라우트 등록
  - GET /api/ai-insights/trends 라우트 등록
  - GET /api/ai-insights/health-score 라우트 등록
  - POST /api/ai-insights/refresh 라우트 등록
  - 인증 미들웨어 적용
  - `backend/src/server.ts`에 라우트 통합
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 6. 프론트엔드 API 클라이언트 구현





  - `frontend/src/api/aiInsightsApi.ts` 파일 생성
  - TypeScript 인터페이스 정의 (백엔드와 동일)
  - getAllInsights API 함수 구현
  - getSummary API 함수 구현
  - getTrends API 함수 구현
  - getHealthScore API 함수 구현
  - refreshInsights API 함수 구현
  - HTTP 에러 처리
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 7. AIInsightsPage 컴포넌트 업데이트





- [x] 7.1 데이터 페칭 및 상태 관리







  - useState 훅으로 insights, loading, error 상태 관리
  - useEffect 훅으로 컴포넌트 마운트 시 데이터 로드
  - API 클라이언트 호출 및 응답 처리
  - 로딩 상태 표시
  - 에러 상태 처리 및 표시
  - _Requirements: 1.5, 7.4, 8.5_
-

- [x] 7.2 AI Summary 섹션 업데이트





  - 정적 데이터를 API 응답 데이터로 교체
  - summary.text, summary.period, summary.lastUpdated 표시
  - summary.confidence 표시
  - _Requirements: 1.5_

- [x] 7.3 Insight Cards 섹션 업데이트

  - insights 배열을 map으로 렌더링
  - InsightCard 컴포넌트에 실제 데이터 전달
  - 타입별 스타일링 유지 (positive, warning, alert, info)
  - 우선순위별 배지 표시
  - _Requirements: 2.6_

- [x] 7.4 Health Score 위젯 업데이트

  - healthScore.score 표시
  - healthScore.category 및 categoryLabel 표시
  - healthScore.change 및 changeDirection 표시
  - 트렌드 인디케이터 (↑↓) 표시
  - _Requirements: 3.5_

- [x] 7.5 Quick Stats 패널 업데이트

  - quickStats 데이터로 사이드바 업데이트
  - 각 지표 값 및 단위 표시
  - "No data" 처리
  - _Requirements: 4.4, 4.5_

- [x] 7.6 Recommendations 패널 업데이트

  - recommendations 배열을 map으로 렌더링
  - 아이콘, 제목, 설명 표시
  - 우선순위 순으로 정렬
  - _Requirements: 5.5_

- [x] 7.7 Trends 섹션 업데이트

  - trends 배열을 map으로 렌더링
  - TrendCard 컴포넌트에 실제 데이터 전달
  - 기간 필터 상태 관리 (activeFilter)
  - 필터 변경 시 API 재호출
  - 변화율 및 방향 표시
  - _Requirements: 6.5, 6.6_

- [x] 7.8 데이터 새로고침 기능 추가

  - 새로고침 버튼 추가
  - refreshInsights API 호출
  - 로딩 상태 표시
  - _Requirements: 7.4_

- [x] 8. 백엔드 유닛 테스트 작성




  - AI Insights Service 테스트
  - Health Score Calculator 테스트 (다양한 시나리오)
  - Insight Generator 테스트 (각 타입별)
  - Trend Analyzer 테스트 (기간별)
  - Summary Generator 테스트
  - Recommendation Engine 테스트
  - 캐시 관리 테스트
  - _Requirements: All_

- [x] 9. 백엔드 통합 테스트 작성





  - API 엔드포인트 통합 테스트
  - 데이터베이스 연동 테스트
  - 캐시 동작 테스트
  - 에러 시나리오 테스트
  - _Requirements: All_

- [x] 10. 프론트엔드 컴포넌트 테스트 작성








  - AIInsightsPage 렌더링 테스트
  - 로딩 상태 테스트
  - 에러 상태 테스트
  - 데이터 표시 테스트
  - 사용자 인터랙션 테스트 (필터 변경, 새로고침)
  - _Requirements: All_

- [x] 11. 한국어 텍스트 및 레이블 적용




  - 모든 인사이트 텍스트를 한국어로 작성
  - 건강 지표 용어를 한국어로 표시
  - 에러 메시지를 한국어로 작성
  - 카테고리 레이블 한국어 매핑 (Excellent → 우수, Good → 양호 등)




  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 12. 성능 최적화 및 마무리






  - 데이터베이스 쿼리 최적화 확인


  - 캐시 TTL 설정 확인 (1시간)
  - API 응답 압축 설정
  - 환경 변수 설정 (AI_INSIGHTS_CACHE_TTL, AI_INSIGHTS_MIN_DATA_POINTS)
  - 로깅 추가 (insight 생성 시간, 캐시 히트율)
  - _Requirements: 7.2, 7.3_


- [x] 13. 문서화 및 배포 준비


  - API 문서 작성 (엔드포인트, 요청/응답 형식)
  - README 업데이트 (새로운 기능 설명)
  - 환경 변수 문서화
  - 배포 가이드 작성
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
