# Design Document

## Overview

HTML 프로토타입을 React TypeScript 컴포넌트로 변환하는 체계적인 아키텍처를 설계합니다. 이 디자인은 컴포넌트 재사용성, 타입 안정성, 성능 최적화를 중심으로 구성됩니다.

## Architecture

### Component Hierarchy

```
src/
├── components/
│   ├── common/
│   │   ├── Navigation/
│   │   │   ├── Navigation.tsx
│   │   │   ├── Navigation.module.css
│   │   │   └── Navigation.types.ts
│   │   ├── Footer/
│   │   │   ├── Footer.tsx
│   │   │   ├── Footer.module.css
│   │   │   └── Footer.types.ts
│   │   ├── Button/
│   │   ├── Card/
│   │   └── LoadingSpinner/
│   ├── dashboard/
│   │   ├── HealthScoreCard/
│   │   ├── StatCard/
│   │   ├── HealthTrendChart/
│   │   └── ActivityList/
│   ├── genomics/
│   │   ├── FileUploadArea/
│   │   ├── RiskCard/
│   │   ├── DrugCard/
│   │   └── SNPTable/
│   └── layout/
│       └── Layout.tsx
├── pages/
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   └── Dashboard.module.css
│   ├── GenomicsPage/
│   ├── GenomicsResultsPage/
│   └── ...
├── services/
│   ├── api.ts
│   ├── genomicsApi.ts
│   └── healthDataApi.ts
├── hooks/
│   ├── useHealthData.ts
│   ├── useChartData.ts
│   └── useAuth.ts
├── types/
│   ├── health.types.ts
│   ├── genomics.types.ts
│   └── common.types.ts
├── utils/
│   ├── formatters.ts
│   └── validators.ts
└── styles/
    ├── variables.css
    └── global.css
```

## Components and Interfaces

### 1. Navigation Component

**File**: `src/components/common/Navigation/Navigation.tsx`

```typescript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';
import { NavigationProps } from './Navigation.types';

export const Navigation: React.FC<NavigationProps> = ({ user }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/dashboard', icon: '📊', label: '대시보드' },
    { path: '/health-data', icon: '📝', label: '건강 데이터' },
    { path: '/medical-records', icon: '🏥', label: '진료 기록' },
    { path: '/medications', icon: '💊', label: '복약 관리' },
    { path: '/genomics', icon: '🧬', label: '유전체 분석' },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navLogo}>
          <div className={styles.navLogoIcon}>🏥</div>
          <span>KnowledgeHub</span>
        </Link>

        <ul className={`${styles.navMenu} ${isMobileMenuOpen ? styles.active : ''}`}>
          {navItems.map((item) => (
            <li key={item.path} className={styles.navItem}>
              <Link
                to={item.path}
                className={`${styles.navLink} ${
                  location.pathname === item.path ? styles.active : ''
                }`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.navActions}>
          <Link to="/guide" className={`${styles.navBtn} ${styles.navBtnOutline}`}>
            <span>📚</span>
            <span>가이드</span>
          </Link>
          <Link to="/" className={`${styles.navBtn} ${styles.navBtnPrimary}`}>
            <span>🏠</span>
            <span>홈</span>
          </Link>
        </div>

        <button
          className={styles.mobileMenuToggle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          ☰
        </button>
      </div>
    </nav>
  );
};
```

**Types**: `src/components/common/Navigation/Navigation.types.ts`

```typescript
export interface NavigationProps {
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface NavItem {
  path: string;
  icon: string;
  label: string;
}
```

### 2. Footer Component

**File**: `src/components/common/Footer/Footer.tsx`

```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>🏥 KnowledgeHub</h3>
            <p>
              AI와 유전체 분석을 활용한 차세대 개인 건강 관리 플랫폼.
            </p>
            <div className={styles.footerSocial}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">📘</a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">🐦</a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">📷</a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">💼</a>
            </div>
          </div>

          <div className={styles.footerSection}>
            <h3>빠른 링크</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/dashboard">📊 대시보드</Link></li>
              <li><Link to="/health-data">📝 건강 데이터</Link></li>
              <li><Link to="/medical-records">🏥 진료 기록</Link></li>
              <li><Link to="/medications">💊 복약 관리</Link></li>
              <li><Link to="/genomics">🧬 유전체 분석</Link></li>
            </ul>
          </div>

          {/* Additional sections... */}
        </div>

        <div className={styles.footerBottom}>
          <div>© {currentYear} KnowledgeHub. All rights reserved.</div>
          <div className={styles.footerBottomLinks}>
            <Link to="/terms">이용약관</Link>
            <Link to="/privacy">개인정보처리방침</Link>
            <Link to="/cookies">쿠키 정책</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
```

### 3. HealthTrendChart Component

**File**: `src/components/dashboard/HealthTrendChart/HealthTrendChart.tsx`

```typescript
import React, { useEffect, useRef } from 'react';
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
import styles from './HealthTrendChart.module.css';
import { HealthTrendChartProps, ChartPeriod } from './HealthTrendChart.types';

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

export const HealthTrendChart: React.FC<HealthTrendChartProps> = ({ data }) => {
  const [period, setPeriod] = React.useState<ChartPeriod>('week');

  const chartData = {
    labels: data[period].labels,
    datasets: [
      {
        label: '혈압 (수축기)',
        data: data[period].bloodPressure,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: '심박수',
        data: data[period].heartRate,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      // Additional datasets...
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className={styles.chartCard}>
      <h3>📈 건강 트렌드</h3>
      
      <div className={styles.chartTabs}>
        <button
          className={`${styles.chartTab} ${period === 'week' ? styles.active : ''}`}
          onClick={() => setPeriod('week')}
        >
          주간
        </button>
        <button
          className={`${styles.chartTab} ${period === 'month' ? styles.active : ''}`}
          onClick={() => setPeriod('month')}
        >
          월간
        </button>
        <button
          className={`${styles.chartTab} ${period === 'year' ? styles.active : ''}`}
          onClick={() => setPeriod('year')}
        >
          연간
        </button>
      </div>

      <div className={styles.chartContainer}>
        <Line data={chartData} options={options} />
      </div>

      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ background: '#3b82f6' }} />
          <span>혈압</span>
        </div>
        {/* Additional legend items... */}
      </div>
    </div>
  );
};
```

**Types**: `src/components/dashboard/HealthTrendChart/HealthTrendChart.types.ts`

```typescript
export type ChartPeriod = 'week' | 'month' | 'year';

export interface ChartDataPoint {
  labels: string[];
  bloodPressure: number[];
  heartRate: number[];
  temperature: number[];
  weight: number[];
}

export interface HealthTrendChartProps {
  data: Record<ChartPeriod, ChartDataPoint>;
}
```

### 4. Dashboard Page

**File**: `src/pages/Dashboard/Dashboard.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { Navigation } from '../../components/common/Navigation/Navigation';
import { Footer } from '../../components/common/Footer/Footer';
import { HealthScoreCard } from '../../components/dashboard/HealthScoreCard/HealthScoreCard';
import { StatCard } from '../../components/dashboard/StatCard/StatCard';
import { HealthTrendChart } from '../../components/dashboard/HealthTrendChart/HealthTrendChart';
import { ActivityList } from '../../components/dashboard/ActivityList/ActivityList';
import { useHealthData } from '../../hooks/useHealthData';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const { healthData, chartData, activities, loading, error } = useHealthData();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>👋 안녕하세요, {healthData?.userName}님</h1>
          <p>오늘도 건강한 하루 되세요!</p>
        </div>

        <HealthScoreCard score={healthData?.healthScore || 0} />

        <div className={styles.statsGrid}>
          <StatCard
            icon="❤️"
            value={healthData?.bloodPressure || '120/80'}
            label="혈압 (mmHg)"
            change={{ value: '정상 범위', positive: true }}
          />
          <StatCard
            icon="💓"
            value={healthData?.heartRate || 72}
            label="심박수 (bpm)"
            change={{ value: '안정적', positive: true }}
          />
          {/* Additional stat cards... */}
        </div>

        <div className={styles.contentGrid}>
          <HealthTrendChart data={chartData} />
          <ActivityList activities={activities} />
        </div>
      </div>
      <Footer />
    </>
  );
};
```

## Data Models

### Health Data Types

**File**: `src/types/health.types.ts`

```typescript
export interface HealthData {
  userName: string;
  healthScore: number;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  lastUpdated: Date;
}

export interface StatCardData {
  icon: string;
  value: string | number;
  label: string;
  change?: {
    value: string;
    positive: boolean;
  };
}

export interface Activity {
  id: string;
  icon: string;
  title: string;
  time: string;
  type: 'measurement' | 'medication' | 'appointment' | 'exercise';
}
```

### Genomics Types

**File**: `src/types/genomics.types.ts`

```typescript
export interface GenomicData {
  id: string;
  userId: string;
  sourcePlatform: string;
  uploadedAt: Date;
  rawData: string;
}

export interface RiskAssessment {
  id: string;
  disease: string;
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  percentile: number;
  factors: {
    genetic: number;
    lifestyle: number;
    family: number;
  };
}

export interface PharmacogenomicsData {
  drugName: string;
  response: 'normal' | 'increased' | 'decreased';
  description: string;
  recommendation?: string;
}
```

## API Integration

### API Service Layer

**File**: `src/services/api.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**File**: `src/services/healthDataApi.ts`

```typescript
import { api } from './api';
import { HealthData, Activity } from '../types/health.types';

export const healthDataApi = {
  getHealthData: async (): Promise<HealthData> => {
    const response = await api.get<HealthData>('/health/data');
    return response.data;
  },

  getActivities: async (): Promise<Activity[]> => {
    const response = await api.get<Activity[]>('/health/activities');
    return response.data;
  },

  updateVitalSigns: async (data: Partial<HealthData>): Promise<void> => {
    await api.post('/health/vitals', data);
  },
};
```

## Custom Hooks

### useHealthData Hook

**File**: `src/hooks/useHealthData.ts`

```typescript
import { useState, useEffect } from 'react';
import { healthDataApi } from '../services/healthDataApi';
import { HealthData, Activity } from '../types/health.types';

export const useHealthData = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [health, acts] = await Promise.all([
          healthDataApi.getHealthData(),
          healthDataApi.getActivities(),
        ]);
        setHealthData(health);
        setActivities(acts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    week: {
      labels: ['월', '화', '수', '목', '금', '토', '일'],
      bloodPressure: [120, 118, 122, 119, 121, 120, 118],
      heartRate: [72, 70, 75, 73, 71, 72, 70],
      temperature: [36.5, 36.6, 36.4, 36.5, 36.7, 36.5, 36.6],
      weight: [70, 70.2, 69.8, 70.1, 70, 69.9, 70.1],
    },
    // month and year data...
  };

  return { healthData, chartData, activities, loading, error };
};
```

## Styling Strategy

### CSS Modules

Each component has its own CSS Module file:

```css
/* Navigation.module.css */
.navbar {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navContainer {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

/* Additional styles... */
```

### Global Variables

**File**: `src/styles/variables.css`

```css
:root {
  /* Colors */
  --primary: #667eea;
  --primary-dark: #764ba2;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-900: #111827;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

## Testing Strategy

### Component Tests

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

## Performance Optimization

### Code Splitting

```typescript
// App.tsx
import React, { Suspense, lazy } from 'react';
import { LoadingSpinner } from './components/common/LoadingSpinner/LoadingSpinner';

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

### Memoization

```typescript
const MemoizedChart = React.memo(HealthTrendChart, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});
```

## Accessibility

### ARIA Labels

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

### Keyboard Navigation

```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
};
```

## Deployment Considerations

### Environment Variables

```env
REACT_APP_API_BASE_URL=https://api.knowledgehub.com
REACT_APP_ENV=production
```

### Build Optimization

```json
{
  "scripts": {
    "build": "react-scripts build",
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  }
}
```
