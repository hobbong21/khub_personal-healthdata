# 🔄 HTML to TSX Conversion Guide

## 📋 개요

HTML 프로토타입을 React TypeScript (TSX) 컴포넌트로 변환하는 완전한 가이드입니다. 이 문서는 체계적인 변환 프로세스, 베스트 프랙티스, 그리고 실제 구현 예시를 제공합니다.

## 🎯 목표

- ✅ HTML 프로토타입의 디자인 완벽 보존
- ✅ React 컴포넌트 기반 아키텍처 구축
- ✅ TypeScript 타입 안정성 확보
- ✅ 재사용 가능한 컴포넌트 라이브러리 구축
- ✅ 성능 최적화 및 접근성 준수

## 📁 프로젝트 구조

```
frontend/src/
├── components/
│   ├── common/           # 공통 컴포넌트
│   │   ├── Navigation/
│   │   ├── Footer/
│   │   ├── Button/
│   │   └── Card/
│   ├── dashboard/        # 대시보드 컴포넌트
│   ├── genomics/         # 유전체 분석 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── pages/                # 페이지 컴포넌트
│   ├── Dashboard/
│   ├── GenomicsPage/
│   └── GenomicsResultsPage/
├── services/             # API 서비스
│   ├── api.ts
│   ├── healthDataApi.ts
│   └── genomicsApi.ts
├── hooks/                # 커스텀 훅
│   ├── useHealthData.ts
│   ├── useChartData.ts
│   └── useAuth.ts
├── types/                # TypeScript 타입
│   ├── health.types.ts
│   ├── genomics.types.ts
│   └── common.types.ts
├── utils/                # 유틸리티 함수
├── styles/               # 글로벌 스타일
│   ├── variables.css
│   └── global.css
└── App.tsx               # 메인 앱
```

## 🔄 변환 프로세스

### 1단계: HTML 분석

**HTML 프로토타입 분석 체크리스트:**
- [ ] 페이지 구조 파악
- [ ] 재사용 가능한 패턴 식별
- [ ] 상태가 필요한 부분 확인
- [ ] 이벤트 핸들러 목록 작성
- [ ] API 연동이 필요한 부분 표시

### 2단계: 컴포넌트 분해

**컴포넌트 계층 구조 설계:**

```
Dashboard Page
├── Navigation (공통)
├── Header
├── HealthScoreCard
├── StatsGrid
│   └── StatCard (반복)
├── ContentGrid
│   ├── HealthTrendChart
│   └── ActivityList
│       └── ActivityItem (반복)
└── Footer (공통)
```

### 3단계: 타입 정의

**TypeScript 인터페이스 작성:**

```typescript
// health.types.ts
export interface HealthData {
  userName: string;
  healthScore: number;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  lastUpdated: Date;
}

export interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  change?: {
    value: string;
    positive: boolean;
  };
}
```

### 4단계: 컴포넌트 구현

**HTML → TSX 변환 예시:**

#### Before (HTML)
```html
<div class="stat-card">
    <div class="stat-card-header">
        <div>
            <div class="stat-value">120/80</div>
            <div class="stat-label">혈압 (mmHg)</div>
        </div>
        <div class="stat-icon blue">❤️</div>
    </div>
    <div class="stat-change positive">↑ 정상 범위</div>
</div>
```

#### After (TSX)
```typescript
import React from 'react';
import styles from './StatCard.module.css';
import { StatCardProps } from './StatCard.types';

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  change,
}) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statCardHeader}>
        <div>
          <div className={styles.statValue}>{value}</div>
          <div className={styles.statLabel}>{label}</div>
        </div>
        <div className={`${styles.statIcon} ${styles.blue}`}>{icon}</div>
      </div>
      {change && (
        <div
          className={`${styles.statChange} ${
            change.positive ? styles.positive : styles.negative
          }`}
        >
          {change.positive ? '↑' : '↓'} {change.value}
        </div>
      )}
    </div>
  );
};
```

### 5단계: 스타일링

**CSS → CSS Modules 변환:**

#### Before (Inline CSS)
```html
<style>
.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
}
</style>
```

#### After (CSS Modules)
```css
/* StatCard.module.css */
.statCard {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}

.statCard:hover {
  transform: translateY(-2px);
}
```

### 6단계: 상태 관리

**useState & useEffect 추가:**

```typescript
import React, { useState, useEffect } from 'react';
import { healthDataApi } from '../../services/healthDataApi';

export const Dashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await healthDataApi.getHealthData();
        setHealthData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

## 🎨 스타일링 전략

### CSS Modules 사용

**장점:**
- ✅ 스코프 격리 (클래스명 충돌 방지)
- ✅ 타입 안정성 (TypeScript 지원)
- ✅ 코드 스플리팅 지원
- ✅ 기존 CSS 지식 활용 가능

**사용 예시:**
```typescript
import styles from './Component.module.css';

<div className={styles.container}>
  <h1 className={styles.title}>Title</h1>
</div>
```

### 글로벌 변수

```css
/* variables.css */
:root {
  --primary: #667eea;
  --primary-dark: #764ba2;
  --spacing-md: 1rem;
  --radius-lg: 12px;
}
```

## 📊 Chart.js 통합

### 설치

```bash
npm install chart.js react-chartjs-2
```

### 사용 예시

```typescript
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const HealthTrendChart: React.FC<Props> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: '혈압',
        data: data.bloodPressure,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};
```

## 🔌 API 통합

### API 클라이언트 설정

```typescript
// services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API 서비스 레이어

```typescript
// services/healthDataApi.ts
import { api } from './api';
import { HealthData } from '../types/health.types';

export const healthDataApi = {
  getHealthData: async (): Promise<HealthData> => {
    const response = await api.get<HealthData>('/health/data');
    return response.data;
  },

  updateVitalSigns: async (data: Partial<HealthData>): Promise<void> => {
    await api.post('/health/vitals', data);
  },
};
```

## 🪝 커스텀 훅

### useHealthData 예시

```typescript
// hooks/useHealthData.ts
import { useState, useEffect } from 'react';
import { healthDataApi } from '../services/healthDataApi';
import { HealthData } from '../types/health.types';

export const useHealthData = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await healthDataApi.getHealthData();
        setHealthData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { healthData, loading, error };
};
```

## 🧪 테스팅

### 컴포넌트 테스트

```typescript
// Navigation.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from './Navigation';

describe('Navigation', () => {
  it('renders navigation items', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.getByText('대시보드')).toBeInTheDocument();
    expect(screen.getByText('건강 데이터')).toBeInTheDocument();
  });

  it('toggles mobile menu', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    const toggleButton = screen.getByLabelText('Toggle mobile menu');
    fireEvent.click(toggleButton);

    // Assert menu is open
  });
});
```

## 🚀 성능 최적화

### 1. 코드 스플리팅

```typescript
import React, { Suspense, lazy } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const GenomicsPage = lazy(() => import('./pages/GenomicsPage/GenomicsPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/genomics" element={<GenomicsPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. 메모이제이션

```typescript
// React.memo
const MemoizedStatCard = React.memo(StatCard);

// useCallback
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);

// useMemo
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

## ♿ 접근성

### ARIA 속성

```typescript
<button
  className={styles.mobileMenuToggle}
  onClick={toggleMenu}
  aria-label="Toggle mobile menu"
  aria-expanded={isMobileMenuOpen}
>
  ☰
</button>
```

### 키보드 네비게이션

```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
};
```

## 📦 필수 패키지

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "axios": "^1.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "typescript": "^5.0.0"
  }
}
```

## 📝 체크리스트

### 변환 완료 체크리스트

- [ ] 모든 HTML 페이지를 TSX 컴포넌트로 변환
- [ ] TypeScript 타입 정의 완료
- [ ] CSS Modules로 스타일 분리
- [ ] API 서비스 레이어 구현
- [ ] 커스텀 훅 작성
- [ ] 라우팅 설정
- [ ] 테스트 작성
- [ ] 접근성 검증
- [ ] 성능 최적화
- [ ] 문서화 완료

## 🎯 다음 단계

1. `.kiro/specs/html-to-tsx-conversion/tasks.md` 파일 열기
2. "Start task" 버튼 클릭하여 작업 시작
3. 각 작업을 순차적으로 완료
4. 테스트 및 검증

## 📚 참고 자료

- React 공식 문서: https://react.dev
- TypeScript 공식 문서: https://www.typescriptlang.org
- Chart.js 문서: https://www.chartjs.org
- React Router 문서: https://reactrouter.com
- React Testing Library: https://testing-library.com/react

## 🎉 결과

HTML 프로토타입을 완전한 React TypeScript 애플리케이션으로 변환하여 프로덕션 환경에서 사용할 수 있는 확장 가능하고 유지보수 가능한 코드베이스를 구축합니다.
