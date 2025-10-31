# 건강 플랫폼 백엔드

Node.js + Express + TypeScript + PostgreSQL로 구축된 개인 건강 플랫폼의 백엔드 API 서버입니다.

## 🛠️ 기술 스택

- **Node.js** - 런타임 환경
- **Express** - 웹 프레임워크
- **TypeScript** - 타입 안전성
- **Prisma** - ORM 및 데이터베이스 관리
- **PostgreSQL** - 관계형 데이터베이스
- **JWT** - 인증 토큰
- **bcryptjs** - 비밀번호 해싱

## 📁 프로젝트 구조

```
src/
├── controllers/        # 요청 처리 로직
├── services/          # 비즈니스 로직
├── models/            # 데이터 모델 (Prisma 스키마)
├── middleware/        # 미들웨어 함수
├── routes/            # API 라우트 정의
├── types/             # TypeScript 타입 정의
├── utils/             # 유틸리티 함수
├── config/            # 설정 파일
└── server.ts          # 서버 진입점
```

## 🚀 개발 시작

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 연결 정보 설정

# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:migrate

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start
```

## 🗄️ 데이터베이스

### 주요 테이블

- `users` - 사용자 계정 및 프로필
- `health_records` - 건강 기록 메타데이터
- `vital_signs` - 바이탈 사인 측정값
- `medical_records` - 진료 기록
- `test_results` - 검사 결과
- `medications` - 복용 중인 약물
- `genomic_data` - 유전체 데이터
- `risk_assessments` - 질병 위험도 평가

### 마이그레이션

```bash
# 새 마이그레이션 생성
npx prisma migrate dev --name migration_name

# 마이그레이션 적용
npx prisma migrate deploy

# 데이터베이스 리셋
npx prisma migrate reset
```

## 🔐 인증

JWT 기반 인증을 사용합니다:

- 회원가입: `POST /api/auth/register`
- 로그인: `POST /api/auth/login`
- 프로필 조회: `GET /api/auth/profile` (인증 필요)

## 📡 API 엔드포인트

### 인증 (`/api/auth`)
- `POST /register` - 회원가입
- `POST /login` - 로그인
- `POST /logout` - 로그아웃
- `GET /profile` - 프로필 조회

### 건강 데이터 (`/api/health`)
- `GET /vitals` - 바이탈 사인 조회
- `POST /vitals` - 바이탈 사인 등록
- `GET /journal` - 건강 일지 조회
- `POST /journal` - 건강 일지 작성

### 진료 기록 (`/api/medical`)
- `GET /records` - 진료 기록 조회
- `POST /records` - 진료 기록 등록
- `GET /appointments` - 예약 조회
- `POST /appointments` - 예약 등록

## 🔒 보안

- **Helmet** - 보안 헤더 설정
- **CORS** - 교차 출처 리소스 공유 제어
- **Rate Limiting** - API 요청 제한
- **JWT** - 토큰 기반 인증
- **bcrypt** - 비밀번호 해싱

## 📊 모니터링

- **Morgan** - HTTP 요청 로깅
- **Health Check** - `/health` 엔드포인트
- 에러 로깅 및 처리

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 테스트 커버리지
npm run test:coverage
```