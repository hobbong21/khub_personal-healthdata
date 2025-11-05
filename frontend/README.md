# Personal Health Platform - Frontend

React + TypeScript + Vite로 구축된 차세대 개인 건강 관리 플랫폼의 프론트엔드 애플리케이션입니다.

## 📋 목차

- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [환경 설정](#-환경-설정)
- [개발 가이드](#-개발-가이드)
- [컴포넌트 사용법](#-컴포넌트-사용법)
- [API 통합](#-api-통합)
- [테스팅](#-테스팅)
- [빌드 및 배포](#-빌드-및-배포)
- [성능 최적화](#-성능-최적화)

## 🛠️ 기술 스택

### Core
- **React 18.2** - UI 라이브러리
- **TypeScript 5.2** - 타입 안전성
- **Vite 5.0** - 빌드 도구 및 개발 서버

### Routing & State Management
- **React Router 6.30** - 클라이언트 사이드 라우팅
- **TanStack Query 5.8** - 서버 상태 관리

### Data Visualization
- **Recharts 2.8** - 차트 라이브러리
- **Chart.js 4.5** - 캔버스 기반 차트
- **react-chartjs-2 5.3** - Chart.js React 래퍼

### HTTP & API
- **Axios 1.6** - HTTP 클라이언트

### UI & Styling
- **CSS Modules** - 컴포넌트 스코프 스타일링
- **Lucide React** - 아이콘 라이브러리
- **clsx** - 조건부 클래스명 유틸리티

### Testing
- **Vitest** - 단위 테스트 프레임워크
- **React Testing Library** - 컴포넌트 테스팅
- **MSW** - API 모킹

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── common/         # 공통 컴포넌트 (Navigation, Footer, Button 등)
│   │   ├── dashboard/      # 대시보드 컴포넌트
│   │   ├── genomics/       # 유전체 분석 컴포넌트
│   │   └── layout/         # 레이아웃 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Dashboard/      # 대시보드 페이지
│   │   ├── GenomicsPage/   # 유전체 분석 페이지
│   │   └── ...
│   ├── services/           # API 서비스 레이어
│   │   ├── api.ts          # Axios 인스턴스 설정
│   │   ├── healthDataApi.ts
│   │   └── genomicsApi.ts
│   ├── hooks/              # 커스텀 훅
│   │   ├── useHealthData.ts
│   │   ├── useChartData.ts
│   │   └── useAuth.ts
│   ├── types/              # TypeScript 타입 정의
│   │   ├── health.types.ts
│   │   ├── genomics.types.ts
│   │   └── common.types.ts
│   ├── utils/              # 유틸리티 함수
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── config/             # 설정 파일
│   │   └── env.ts          # 환경 변수 관리
│   ├── styles/             # 글로벌 스타일
│   │   ├── variables.css   # CSS 변수
│   │   └── global.css      # 글로벌 스타일
│   ├── test/               # 테스트 설정
│   │   └── setup.ts
│   ├── App.tsx             # 메인 앱 컴포넌트
│   └── main.tsx            # 엔트리 포인트
├── public/                 # 정적 파일
├── dist/                   # 빌드 출력 (생성됨)
├── .env                    # 개발 환경 변수
├── .env.production         # 프로덕션 환경 변수
├── .env.example            # 환경 변수 예시
├── vite.config.ts          # Vite 설정
├── tsconfig.json           # TypeScript 설정
└── package.json            # 프로젝트 의존성
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- npm 9.x 이상

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 값 설정
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:3000 에서 실행됩니다.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 🔧 환경 설정

### 환경 변수

프로젝트는 다음 환경 변수를 사용합니다:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5001/api
VITE_API_TIMEOUT=30000

# Application Configuration
VITE_APP_NAME=Personal Health Platform
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_GENOMICS=true
VITE_ENABLE_AI_INSIGHTS=true
VITE_ENABLE_ANALYTICS=false

# Authentication
VITE_AUTH_TOKEN_KEY=authToken
VITE_AUTH_REFRESH_TOKEN_KEY=refreshToken

# Chart Configuration
VITE_CHART_ANIMATION_DURATION=750
VITE_CHART_DEFAULT_PERIOD=week

# File Upload
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=.vcf,.txt,.csv
```

환경 변수는 `src/config/env.ts`를 통해 타입 안전하게 접근할 수 있습니다:

```typescript
import { env } from '@config/env';

console.log(env.apiBaseUrl); // Type-safe access
```

## 👨‍💻 개발 가이드

### 코드 스타일

프로젝트는 ESLint와 TypeScript를 사용하여 코드 품질을 유지합니다.

```bash
# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 타입 체크
npm run type-check
```

### 컴포넌트 작성 가이드

1. **파일 구조**: 각 컴포넌트는 자체 폴더에 위치
   ```
   ComponentName/
   ├── ComponentName.tsx
   ├── ComponentName.module.css
   ├── ComponentName.types.ts
   └── ComponentName.test.tsx
   ```

2. **타입 정의**: Props와 State는 별도 타입 파일에 정의
   ```typescript
   // ComponentName.types.ts
   export interface ComponentNameProps {
     title: string;
     onAction: () => void;
   }
   ```

3. **CSS Modules**: 컴포넌트별 스타일 격리
   ```typescript
   import styles from './ComponentName.module.css';
   
   <div className={styles.container}>...</div>
   ```

### Path Aliases

프로젝트는 다음 path aliases를 사용합니다:

```typescript
import { Button } from '@components/common/Button/Button';
import { useHealthData } from '@hooks/useHealthData';
import { HealthData } from '@types/health.types';
import { formatDate } from '@utils/formatters';
import { env } from '@config/env';
```

## 📦 컴포넌트 사용법

### Navigation Component

```typescript
import { Navigation } from '@components/common/Navigation/Navigation';

<Navigation user={{ name: '홍길동', avatar: '/avatar.jpg' }} />
```

### Footer Component

```typescript
import { Footer } from '@components/common/Footer/Footer';

<Footer />
```

### Button Component

```typescript
import { Button } from '@components/common/Button/Button';

<Button variant="primary" size="medium" onClick={handleClick}>
  클릭하세요
</Button>
```

### HealthScoreCard Component

```typescript
import { HealthScoreCard } from '@components/dashboard/HealthScoreCard/HealthScoreCard';

<HealthScoreCard score={85} />
```

### HealthTrendChart Component

```typescript
import { HealthTrendChart } from '@components/dashboard/HealthTrendChart/HealthTrendChart';

<HealthTrendChart data={chartData} />
```

자세한 컴포넌트 사용 예시는 `src/components/common/examples/ComponentExamples.tsx`를 참조하세요.

## 🔌 API 통합

### API 서비스 사용

```typescript
import { healthDataApi } from '@services/healthDataApi';

// 건강 데이터 가져오기
const data = await healthDataApi.getHealthData();

// 활동 내역 가져오기
const activities = await healthDataApi.getActivities();

// 바이탈 사인 업데이트
await healthDataApi.updateVitalSigns({ heartRate: 72 });
```

### 커스텀 훅 사용

```typescript
import { useHealthData } from '@hooks/useHealthData';

function Dashboard() {
  const { healthData, chartData, activities, loading, error } = useHealthData();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>...</div>;
}
```

### API 에러 처리

API 서비스는 자동으로 에러를 처리하며, 401 에러 시 자동으로 로그인 페이지로 리다이렉트합니다.

```typescript
// services/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 🧪 테스팅

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# Watch 모드로 테스트 실행
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

### 컴포넌트 테스트 예시

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 커스텀 훅 테스트 예시

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useHealthData } from './useHealthData';

describe('useHealthData', () => {
  it('fetches health data', async () => {
    const { result } = renderHook(() => useHealthData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.healthData).toBeDefined();
  });
});
```

## 🚀 빌드 및 배포

### 빌드 스크립트

```bash
# 개발 빌드
npm run build

# 프로덕션 빌드 (명시적)
npm run build:prod

# 빌드 + 번들 분석
npm run build:analyze

# 타입 체크 + 빌드
npm run build:check
```

### 번들 크기 분석

```bash
npm run build:analyze
```

이 명령은 빌드 후 번들 구성을 시각화한 리포트를 생성합니다.

### 배포 체크리스트

- [ ] 환경 변수가 올바르게 설정되었는지 확인
- [ ] `npm run build:analyze`로 번들 크기 확인
- [ ] `npm run test`로 모든 테스트 통과 확인
- [ ] `npm run lint`로 코드 품질 확인
- [ ] `npm run preview`로 프로덕션 빌드 테스트
- [ ] Lighthouse 감사 실행
- [ ] 브라우저 호환성 테스트

### 프로덕션 환경 변수

프로덕션 배포 시 `.env.production` 파일을 사용하거나 CI/CD 파이프라인에서 환경 변수를 설정하세요.

```bash
# .env.production
VITE_API_BASE_URL=https://api.production.com/api
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
```

## ⚡ 성능 최적화

### 코드 스플리팅

프로젝트는 자동으로 다음과 같이 코드를 분할합니다:

- **vendor-react**: React 코어 라이브러리
- **vendor-router**: React Router
- **vendor-charts**: 차트 라이브러리
- **components-dashboard**: 대시보드 컴포넌트
- **components-genomics**: 유전체 분석 컴포넌트

### 지연 로딩

페이지 컴포넌트는 React.lazy를 사용하여 지연 로딩됩니다:

```typescript
const Dashboard = lazy(() => import('@pages/Dashboard/Dashboard'));
const GenomicsPage = lazy(() => import('@pages/GenomicsPage/GenomicsPage'));
```

### 메모이제이션

성능이 중요한 컴포넌트는 React.memo로 메모이제이션됩니다:

```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});
```

### 성능 목표

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Total Bundle Size**: < 1MB (gzipped)

자세한 최적화 가이드는 `BUILD_OPTIMIZATION.md`를 참조하세요.

## 📚 추가 문서

### Frontend Documentation
- [컴포넌트 가이드](src/components/common/README.md)
- [컴포넌트 구현 요약](src/components/common/IMPLEMENTATION_SUMMARY.md)

### Project Documentation (../docs/)
- [API 문서](../docs/api/API_DOCUMENTATION.md)
- [빌드 최적화 가이드](../docs/deployment/BUILD_OPTIMIZATION.md)
- [배포 설정 요약](../docs/deployment/DEPLOYMENT_SETUP_SUMMARY.md)
- [테스트 가이드](../docs/development/TEST_SUMMARY.md)
- [HTML to TSX 변환 가이드](../docs/development/HTML_TO_TSX_CONVERSION_GUIDE.md)
- [시스템 아키텍처](../docs/architecture/SYSTEM_ARCHITECTURE_ANALYSIS.md)
- [프로젝트 구조](../docs/PROJECT_STRUCTURE.md)

## 🤝 기여하기

1. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
2. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
3. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
4. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.
