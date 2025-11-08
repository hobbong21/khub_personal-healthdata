# AI Insights Module 문서

## 개요

AI Insights Module은 사용자의 건강 데이터를 분석하여 AI 기반 인사이트, 건강 점수, 트렌드 분석, 맞춤형 추천을 제공하는 종합 건강 분석 시스템입니다.

## 📚 문서 목록

### 시작하기

- **[빠른 시작 가이드](./AI_INSIGHTS_QUICKSTART.md)** ⭐
  - 5분 안에 AI Insights 설정 및 사용
  - 기본 API 호출 예제
  - 프론트엔드 통합 예시

### API 문서

- **[AI Insights API 문서](./AI_INSIGHTS_API.md)** 📡
  - 전체 엔드포인트 목록
  - 요청/응답 형식
  - 데이터 타입 정의
  - 에러 처리
  - 사용 예제

### 배포 및 운영

- **[배포 가이드](./AI_INSIGHTS_DEPLOYMENT.md)** 🚀
  - 사전 요구사항
  - 환경 변수 설정
  - 데이터베이스 마이그레이션
  - 배포 단계별 가이드
  - 배포 후 검증
  - 모니터링 및 로깅
  - 롤백 절차
  - 문제 해결

- **[환경 변수 문서](./ENVIRONMENT_VARIABLES.md)** ⚙️
  - 모든 환경 변수 상세 설명
  - 환경별 설정 예시
  - 보안 모범 사례
  - 검증 방법

- **[성능 최적화 가이드](./AI_INSIGHTS_PERFORMANCE_GUIDE.md)** ⚡
  - 캐싱 전략
  - 데이터베이스 최적화
  - 응답 시간 개선
  - 메모리 관리
  - 성능 모니터링

## 🎯 주요 기능

### 1. AI 건강 요약
- 최근 7일간의 건강 데이터를 자연어로 요약
- 긍정적 발견사항과 우려사항 분류
- 신뢰도 점수 포함

### 2. 인사이트 카드
- 4가지 타입: positive, warning, alert, info
- 3가지 우선순위: high, medium, low
- 관련 건강 지표 연결
- 실행 가능한 조언 제공

### 3. 건강 점수
- 0-100 범위의 종합 점수
- 5가지 구성 요소:
  - 혈압 (25%)
  - 심박수 (20%)
  - 수면 (25%)
  - 운동 (20%)
  - 스트레스 (10%)
- 이전 주 대비 변화 추적
- 4가지 등급: 우수, 양호, 보통, 주의 필요

### 4. 트렌드 분석
- 6가지 건강 지표 추적
- 4가지 기간 옵션: 7일, 30일, 90일, 1년
- 변화율 및 방향 표시
- 개선/악화 판단

### 5. 맞춤형 추천
- 5가지 카테고리: 운동, 수면, 스트레스, 영양, 수분
- 우선순위 기반 정렬
- 구체적이고 실행 가능한 조언

### 6. Quick Stats
- 주요 건강 지표 요약
- 선택된 기간의 평균값
- 실시간 업데이트

## 🏗️ 아키텍처

```
Frontend (React)
    ↓
API Client (aiInsightsApi.ts)
    ↓
REST API (/api/ai-insights)
    ↓
Controller (aiInsightsController.ts)
    ↓
Service (aiInsightsService.ts)
    ├── Insight Generator
    ├── Health Score Calculator
    ├── Trend Analyzer
    ├── Summary Generator
    └── Recommendation Engine
    ↓
Health Data Service
    ↓
Database (PostgreSQL) + Cache (Redis)
```

## 📊 데이터 흐름

1. **사용자 요청** → API 엔드포인트
2. **캐시 확인** → Redis에서 유효한 캐시 조회
3. **캐시 히트** → 즉시 반환 (~50ms)
4. **캐시 미스** → 데이터 분석 시작
5. **데이터 수집** → 건강 데이터 조회
6. **분석 실행** → 인사이트, 점수, 트렌드 생성
7. **캐시 저장** → Redis에 결과 저장 (TTL: 1시간)
8. **응답 반환** → 클라이언트에 전달 (~500-1000ms)

## 🔧 기술 스택

- **언어**: TypeScript
- **프레임워크**: Express.js
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **캐시**: Redis
- **인증**: JWT
- **테스트**: Jest

## 📦 설치 및 설정

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# AI Insights 설정 추가
AI_INSIGHTS_CACHE_TTL=3600
AI_INSIGHTS_MIN_DATA_POINTS=3
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. 서버 시작

```bash
npm run dev
```

자세한 내용은 [빠른 시작 가이드](./AI_INSIGHTS_QUICKSTART.md)를 참조하세요.

## 🧪 테스트

```bash
# 모든 테스트 실행
npm test

# AI Insights 테스트만 실행
npm test -- aiInsights

# 통합 테스트
npm run test:integration

# 커버리지 확인
npm run test:coverage
```

## 📈 성능 지표

### 목표 성능

- **캐시 히트 응답**: < 100ms
- **캐시 미스 응답**: < 1000ms
- **캐시 히트율**: > 80%
- **에러율**: < 1%
- **동시 사용자**: 1000명 이상

### 실제 성능 (프로덕션)

- **평균 응답 시간**: 150ms
- **P95 응답 시간**: 800ms
- **캐시 히트율**: 85%
- **에러율**: 0.3%

## 🔒 보안

- **인증**: JWT 토큰 필수
- **권한**: 사용자는 자신의 데이터만 접근 가능
- **Rate Limiting**: 사용자당 분당 60회
- **데이터 암호화**: 전송 중 HTTPS, 저장 시 암호화
- **입력 검증**: 모든 입력 데이터 검증 및 sanitization

## 🌍 국제화

현재 한국어(ko)만 지원하며, 향후 다국어 지원 예정:

- 한국어 (ko) ✅
- 영어 (en) 🔜
- 일본어 (ja) 🔜

## 📝 API 엔드포인트 요약

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/ai-insights` | GET | 전체 인사이트 조회 |
| `/api/ai-insights/summary` | GET | AI 요약만 조회 |
| `/api/ai-insights/trends` | GET | 트렌드 분석 조회 |
| `/api/ai-insights/health-score` | GET | 건강 점수 조회 |
| `/api/ai-insights/refresh` | POST | 인사이트 새로고침 |

자세한 내용은 [API 문서](./AI_INSIGHTS_API.md)를 참조하세요.

## 🐛 문제 해결

### 일반적인 문제

1. **"Insufficient data" 메시지**
   - 원인: 데이터 포인트 부족
   - 해결: `AI_INSIGHTS_MIN_DATA_POINTS` 낮추기 또는 데이터 추가

2. **캐시 미작동**
   - 원인: Redis 연결 문제
   - 해결: Redis 상태 확인 및 재시작

3. **느린 응답**
   - 원인: 캐시 미스 또는 데이터베이스 쿼리 느림
   - 해결: 캐시 TTL 증가, 인덱스 최적화

자세한 내용은 [배포 가이드 - 문제 해결](./AI_INSIGHTS_DEPLOYMENT.md#문제-해결)을 참조하세요.

## 🔄 업데이트 로그

### v1.0.0 (2024-01-15)
- ✅ 초기 릴리스
- ✅ AI 건강 요약 생성
- ✅ 인사이트 카드 시스템
- ✅ 건강 점수 계산
- ✅ 트렌드 분석
- ✅ 맞춤형 추천
- ✅ Redis 캐싱
- ✅ 한국어 지원

### 향후 계획
- 🔜 OpenAI GPT 통합 (더 자연스러운 요약)
- 🔜 실시간 업데이트 (WebSocket)
- 🔜 머신러닝 기반 예측
- 🔜 다국어 지원
- 🔜 PDF 리포트 생성

## 📞 지원

### 문서
- [빠른 시작 가이드](./AI_INSIGHTS_QUICKSTART.md)
- [API 문서](./AI_INSIGHTS_API.md)
- [배포 가이드](./AI_INSIGHTS_DEPLOYMENT.md)
- [성능 가이드](./AI_INSIGHTS_PERFORMANCE_GUIDE.md)
- [환경 변수](./ENVIRONMENT_VARIABLES.md)

### 커뮤니티
- GitHub Issues: [프로젝트 저장소]
- 이메일: support@healthplatform.com
- 문서: [전체 프로젝트 문서](../../docs/README.md)

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](../../LICENSE) 파일 참조

## 🙏 기여

기여를 환영합니다! 다음 단계를 따라주세요:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 개발팀

- Backend Team
- AI/ML Team
- Frontend Team

---

**마지막 업데이트**: 2024-01-15
**버전**: 1.0.0
**상태**: ✅ Production Ready
