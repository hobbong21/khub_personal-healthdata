# 건강 플랫폼 프론트엔드

React + TypeScript + Vite로 구축된 개인 건강 플랫폼의 프론트엔드 애플리케이션입니다.

## 🛠️ 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구 및 개발 서버
- **React Router** - 클라이언트 사이드 라우팅
- **TanStack Query** - 서버 상태 관리
- **Recharts** - 데이터 시각화
- **Axios** - HTTP 클라이언트

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── dashboard/      # 대시보드 컴포넌트
│   ├── health/         # 건강 데이터 컴포넌트
│   ├── medical/        # 진료 기록 컴포넌트
│   ├── medication/     # 복약 관리 컴포넌트
│   ├── genomics/       # 유전체 분석 컴포넌트
│   └── ai/            # AI 기능 컴포넌트
├── pages/              # 페이지 컴포넌트
├── services/           # API 서비스
├── hooks/              # 커스텀 훅
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
└── App.tsx            # 메인 앱 컴포넌트
```

## 🚀 개발 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트 검사
npm run lint
```

## 🔧 환경 설정

개발 서버는 기본적으로 포트 3000에서 실행되며, 백엔드 API는 포트 5000으로 프록시됩니다.

## 📱 주요 페이지

- `/` - 대시보드 (건강 지표 요약)
- `/health` - 건강 데이터 관리
- `/medical` - 진료 기록
- `/medication` - 복약 관리
- `/genomics` - 유전체 분석
- `/ai` - AI 인사이트

## 🎨 스타일링

현재는 인라인 스타일을 사용하고 있으며, 향후 CSS-in-JS 라이브러리나 Tailwind CSS로 마이그레이션할 예정입니다.