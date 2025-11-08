# 개인 건강 플랫폼 (Personal Health Platform)

[![CI](https://github.com/hobbong21/khub_personal-healthdata/workflows/CI%20-%20Test%20and%20Build/badge.svg)](https://github.com/hobbong21/khub_personal-healthdata/actions)
[![CD Frontend](https://github.com/hobbong21/khub_personal-healthdata/workflows/CD%20-%20Deploy%20Frontend/badge.svg)](https://github.com/hobbong21/khub_personal-healthdata/actions)
[![CD Backend](https://github.com/hobbong21/khub_personal-healthdata/workflows/CD%20-%20Deploy%20Backend/badge.svg)](https://github.com/hobbong21/khub_personal-healthdata/actions)

개인의 건강 데이터를 체계적으로 수집, 저장, 분석하여 맞춤형 건강 관리 및 질병 예측 서비스를 제공하는 통합 플랫폼입니다.

## 🌟 주요 기능

### 핵심 기능
- **사용자 프로필 관리**: 개인 정보, 신체 정보, 생활 습관 관리
- **바이탈 사인 추적**: 혈압, 맥박, 체온, 혈당, 체중 등 실시간 모니터링
- **건강 일지**: 일일 컨디션, 증상, 운동, 영양제 섭취 기록
- **진료 기록 관리**: 병원 방문 내역, 진단, 처방전, 검사 결과 통합 관리
- **복약 관리**: 일일 복약 스케줄, 알림, 상호작용 경고
- **대시보드**: 건강 지표 요약, 트렌드 분석, 목표 달성률

### 고급 기능
- **AI Insights Module**: 건강 데이터 분석 및 맞춤형 인사이트 생성
  - AI 건강 요약 및 자연어 분석
  - 종합 건강 점수 계산 (0-100)
  - 시계열 트렌드 분석 및 시각화
  - 개인화된 건강 개선 추천
- **유전체 분석**: 23andMe, Ancestry 데이터 연동 및 질병 위험도 분석
- **약물유전체학**: 유전적 변이에 따른 약물 반응 예측
- **AI 건강 예측**: 머신러닝 기반 질병 발생 확률 및 건강 위험 요인 분석
- **맞춤형 권장사항**: 개인화된 영양소, 운동, 검진 추천
- **웨어러블 연동**: Apple Health, Google Fit 데이터 동기화
- **의료 문서 OCR**: 처방전, 검사 결과지 자동 텍스트 추출
- **자연어 처리**: 의료 문서 자동 분석 및 건강 상담 챗봇

## 🏗️ 기술 스택

### 프론트엔드
- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **TanStack Query** (상태 관리 및 캐싱)
- **Recharts** (데이터 시각화)
- **Tailwind CSS** (스타일링)

### 백엔드
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** (주 데이터베이스)
- **Redis** (캐싱 및 세션 관리)
- **JWT** (인증)
- **Prisma** (ORM)

### 외부 서비스
- **Google Cloud Vision API** (OCR)
- **Google Cloud Natural Language API** (텍스트 분석)
- **OpenAI GPT API** (AI 분석)
- **AWS S3** (파일 저장소)
- **Google Fit API** (웨어러블 연동)
- **Apple HealthKit** (iOS 연동)

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18.0 이상
- PostgreSQL 14.0 이상
- Redis 6.0 이상
- Git

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd personal-health-platform
```

### 2. 의존성 설치
```bash
# 루트 디렉토리에서
npm install

# 백엔드 의존성
cd backend
npm install

# 프론트엔드 의존성
cd ../frontend
npm install
```

### 3. 환경 변수 설정
환경 설정에 대한 자세한 내용은 [환경 설정 가이드](docs/ENVIRONMENT_SETUP.md)를 참조하세요.

#### 백엔드 환경 변수 (backend/.env)
```bash
# 서버 설정
PORT=5000
NODE_ENV=development

# 데이터베이스
DATABASE_URL="postgresql://username:password@localhost:5432/health_platform_db"

# JWT 인증
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# AI Insights 설정
AI_INSIGHTS_CACHE_TTL=3600              # 캐시 유효 시간 (초), 기본값: 3600 (1시간)
AI_INSIGHTS_MIN_DATA_POINTS=3           # 분석에 필요한 최소 데이터 포인트

# 외부 서비스 API 키들
GOOGLE_VISION_API_KEY=your-google-vision-api-key
OPENAI_API_KEY=your-openai-api-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# ... 기타 설정
```

#### 프론트엔드 환경 변수 (frontend/.env)
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Personal Health Platform
```

### 4. 데이터베이스 설정
```bash
cd backend

# 데이터베이스 생성, 마이그레이션 실행, 시드 데이터 삽입
npm run db:setup

# 또는 개별 실행
npm run db:check    # 연결 확인
npm run migrate     # 마이그레이션만 실행
npm run seed        # 시드 데이터만 삽입
npm run db:reset    # 데이터베이스 초기화 후 재설정
```

### 5. 개발 서버 실행

#### 백엔드 서버
```bash
cd backend
npm run dev
```
서버가 http://localhost:5000에서 실행됩니다.

#### 프론트엔드 서버
```bash
cd frontend
npm run dev
```
프론트엔드가 http://localhost:3000에서 실행됩니다.

## 📁 프로젝트 구조

```
personal-health-platform/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── services/       # API 서비스
│   │   ├── types/          # TypeScript 타입 정의
│   │   ├── hooks/          # 커스텀 React 훅
│   │   ├── config/         # 설정 파일
│   │   └── utils/          # 유틸리티 함수
│   ├── html-prototypes/    # HTML 프로토타입 (참고용)
│   ├── public/             # 정적 파일
│   └── README.md           # 프론트엔드 문서
├── backend/                 # Node.js 백엔드
│   ├── src/
│   │   ├── controllers/    # API 컨트롤러
│   │   ├── services/       # 비즈니스 로직
│   │   ├── models/         # 데이터 모델
│   │   ├── routes/         # API 라우트
│   │   ├── middleware/     # 미들웨어
│   │   └── utils/          # 유틸리티 함수
│   ├── migrations/         # 데이터베이스 마이그레이션
│   ├── seeds/              # 시드 데이터
│   └── scripts/            # 설정 스크립트
├── docs/                   # 📚 통합 문서 (중앙화)
│   ├── architecture/       # 시스템 아키텍처
│   ├── api/               # API 문서
│   ├── deployment/        # 배포 가이드
│   ├── development/       # 개발 가이드
│   ├── features/          # 기능 문서
│   ├── PROJECT_STRUCTURE.md  # 프로젝트 구조 가이드
│   └── README.md          # 문서 인덱스
├── .kiro/                  # Kiro IDE 스펙
│   └── specs/             # 기능 스펙
├── scripts/                # 프로젝트 설정 스크립트
└── README.md              # 프로젝트 개요
```

자세한 프로젝트 구조는 [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)를 참조하세요.

## 📚 문서

모든 프로젝트 문서는 `docs/` 디렉토리에 중앙화되어 있습니다:

- **[문서 인덱스](docs/README.md)** - 전체 문서 목록
- **[프로젝트 구조](docs/PROJECT_STRUCTURE.md)** - 코드베이스 구조 가이드
- **[API 문서](docs/api/API_DOCUMENTATION.md)** - API 통합 가이드
- **[배포 가이드](docs/deployment/DEPLOYMENT_SETUP_SUMMARY.md)** - 프로덕션 배포
- **[개발 가이드](docs/development/)** - 개발 시작하기
- **[시스템 아키텍처](docs/architecture/SYSTEM_ARCHITECTURE_ANALYSIS.md)** - 시스템 설계

### AI Insights 문서 ⭐
- **[AI Insights 문서 인덱스](docs/ai-insights/INDEX.md)** - 시작점
- **[빠른 시작 가이드](docs/ai-insights/AI_INSIGHTS_QUICKSTART.md)** - 5분 안에 시작하기
- **[AI Insights API](docs/ai-insights/AI_INSIGHTS_API.md)** - API 참조
- **[배포 가이드](docs/ai-insights/AI_INSIGHTS_DEPLOYMENT.md)** - 프로덕션 배포
- **[성능 최적화](docs/ai-insights/AI_INSIGHTS_PERFORMANCE_GUIDE.md)** - 성능 튜닝

### 프론트엔드 문서
- [프론트엔드 README](frontend/README.md)
- [컴포넌트 가이드](frontend/src/components/common/README.md)

## 🔧 개발 가이드

### API 문서
- Swagger UI: http://localhost:5000/api-docs (백엔드 실행 후)
- [API 통합 가이드](docs/api/API_DOCUMENTATION.md)

### 테스트 실행
```bash
# 백엔드 테스트
cd backend
npm test

# 프론트엔드 테스트
cd frontend
npm test
```

자세한 테스트 가이드는 [docs/development/TEST_SUMMARY.md](docs/development/TEST_SUMMARY.md)를 참조하세요.

### 코드 스타일
- ESLint + Prettier 설정 적용
- TypeScript strict 모드 사용
- 컴포넌트는 함수형 컴포넌트 + Hooks 사용
- Path aliases 사용 (`@components`, `@hooks`, etc.)

## 🔐 보안 고려사항

- JWT 토큰 기반 인증
- 민감한 건강 데이터 암호화 저장
- HIPAA 준수 보안 정책
- Rate limiting 적용
- CORS 설정
- 입력 데이터 검증 및 sanitization

## 📊 데이터베이스 스키마

주요 테이블:
- `users`: 사용자 정보
- `vital_signs`: 바이탈 사인 데이터
- `health_records`: 건강 기록
- `medical_records`: 진료 기록
- `medications`: 약물 정보
- `genomic_data`: 유전체 데이터
- `risk_assessments`: 위험도 평가
- `tasks`: 할 일 관리

자세한 스키마는 `backend/migrations/001_initial_schema.sql`을 참조하세요.

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🆘 문제 해결

### 일반적인 문제들

1. **데이터베이스 연결 오류**
   ```bash
   npm run db:check
   ```

2. **포트 충돌**
   - 백엔드: PORT 환경 변수 변경
   - 프론트엔드: vite.config.ts에서 포트 변경

3. **API 키 오류**
   - .env 파일의 API 키 확인
   - 서비스별 사용량 제한 확인

### 로그 확인
```bash
# 백엔드 로그
cd backend
npm run dev

# 프론트엔드 로그
cd frontend
npm run dev
```

## 📞 지원

문제가 발생하거나 질문이 있으시면 다음을 통해 연락해주세요:
- GitHub Issues
- 이메일: support@healthplatform.com

## 🗺️ 로드맵

- [ ] 모바일 앱 개발 (React Native)
- [ ] 텔레헬스 플랫폼 연동
- [ ] 의학 연구 참여 시스템
- [ ] 고급 AI 분석 기능
- [ ] 다국어 지원
- [ ] 클라우드 배포 및 확장성 개선