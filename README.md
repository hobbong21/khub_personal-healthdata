# 개인 건강 플랫폼 (Personal Health Platform)

개인의 건강 데이터를 체계적으로 수집, 저장, 분석하여 맞춤형 건강 관리 및 질병 예측 서비스를 제공하는 통합 웹 애플리케이션입니다.

## 🏗️ 프로젝트 구조

```
personal-health-platform/
├── frontend/          # React + TypeScript 프론트엔드
├── backend/           # Node.js + Express + TypeScript 백엔드
├── package.json       # 루트 패키지 설정 (워크스페이스)
└── README.md
```

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18+ 
- PostgreSQL 14+
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd personal-health-platform
   ```

2. **의존성 설치**
   ```bash
   npm run install:all
   ```

3. **환경 변수 설정**
   ```bash
   # 백엔드 환경 변수 설정
   cp backend/.env.example backend/.env
   # .env 파일을 편집하여 데이터베이스 연결 정보 등을 설정
   ```

4. **데이터베이스 설정**
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   ```

5. **개발 서버 실행**
   ```bash
   # 루트 디렉토리에서
   npm run dev
   ```

   또는 개별 실행:
   ```bash
   # 프론트엔드만 실행
   npm run dev:frontend
   
   # 백엔드만 실행
   npm run dev:backend
   ```

## 📁 상세 구조

### 프론트엔드 (frontend/)
- **React 18** + **TypeScript**
- **Vite** 빌드 도구
- **React Router** 라우팅
- **TanStack Query** 상태 관리
- **Recharts** 데이터 시각화

### 백엔드 (backend/)
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **JWT** 인증
- **Helmet**, **CORS** 보안
- **Rate Limiting** API 보호

## 🔧 개발 명령어

```bash
# 전체 프로젝트 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프론트엔드만 개발
npm run dev:frontend

# 백엔드만 개발
npm run dev:backend

# 데이터베이스 마이그레이션
cd backend && npm run db:migrate

# Prisma 클라이언트 생성
cd backend && npm run db:generate
```

## 🌐 접속 정보

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5000
- **헬스 체크**: http://localhost:5000/health

## 📋 주요 기능

- ✅ 사용자 인증 및 프로필 관리
- ✅ 바이탈 사인 추적 (혈압, 맥박, 체온, 혈당, 체중)
- ✅ 건강 일지 작성
- ✅ 진료 기록 관리
- ✅ 복약 관리 및 알림
- ✅ 검사 결과 저장 및 분석
- ✅ 가족력 관리
- ✅ 의료 문서 OCR 처리
- ✅ AI 기반 건강 예측
- ✅ 유전체 데이터 분석
- ✅ 맞춤형 건강 권장사항

## 🔒 보안

- JWT 기반 인증
- 비밀번호 해싱 (bcrypt)
- Rate Limiting
- CORS 설정
- Helmet 보안 헤더
- 민감한 데이터 암호화

## 📊 데이터베이스

PostgreSQL을 사용하며, Prisma ORM으로 관리됩니다.

주요 테이블:
- `users` - 사용자 정보
- `health_records` - 건강 기록
- `vital_signs` - 바이탈 사인
- `medical_records` - 진료 기록
- `medications` - 복약 정보
- `genomic_data` - 유전체 데이터

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.