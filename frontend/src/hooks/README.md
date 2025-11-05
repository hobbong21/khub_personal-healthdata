# Custom Hooks

이 디렉토리는 React 애플리케이션에서 재사용 가능한 커스텀 훅을 포함합니다.

## 📋 목차

- [useHealthData](#usehealthdata)
- [useChartData](#usechartdata)
- [useAuth](#useauth)

---

## useHealthData

건강 데이터를 가져오고 관리하는 커스텀 훅입니다.

### 기능

- 건강 데이터 fetch 로직
- 로딩 및 에러 상태 관리
- 차트 데이터 변환
- 활동 내역 관리

### 사용법

```typescript
import { useHealthData } from '../hooks/useHealthData';

function Dashboard() {
  const { 
    healthData, 
    chartData, 
    activities, 
    loading, 
    error, 
    refetch 
  } = useHealthData();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <HealthScoreCard score={healthData?.healthScore} />
      <HealthTrendChart data={chartData} />
      <ActivityList activities={activities} />
    </div>
  );
}
```

### 반환값

| 속성 | 타입 | 설명 |
|------|------|------|
| `healthData` | `HealthData \| null` | 사용자의 건강 데이터 |
| `chartData` | `Record<ChartPeriod, ChartDataPoint>` | 차트 표시용 데이터 |
| `activities` | `Activity[]` | 최근 활동 목록 |
| `loading` | `boolean` | 로딩 상태 |
| `error` | `string \| null` | 에러 메시지 |
| `refetch` | `() => Promise<void>` | 데이터 재조회 함수 |

### 요구사항

- Requirements: 4.1, 4.2, 4.3, 4.5

---

## useChartData

차트 데이터를 포맷팅하고 필터링하는 커스텀 훅입니다.

### 기능

- 차트 데이터 포맷팅
- 기간별 데이터 필터링 (주간/월간/연간)
- 메모이제이션을 통한 성능 최적화
- 데이터 집계 및 평균 계산

### 사용법

```typescript
import { useChartData } from '../hooks/useChartData';

function HealthChart() {
  const rawData = [
    {
      date: '2024-01-01',
      bloodPressure: { systolic: 120, diastolic: 80 },
      heartRate: 72,
      temperature: 36.5,
      weight: 70,
    },
    // ... more data
  ];

  const { chartData, isEmpty } = useChartData({
    period: 'week',
    rawData,
  });

  if (isEmpty) return <EmptyState />;

  return <LineChart data={chartData} />;
}
```

### 파라미터

```typescript
interface UseChartDataOptions {
  period: 'week' | 'month' | 'year';
  rawData?: RawHealthDataPoint[];
}
```

### 반환값

| 속성 | 타입 | 설명 |
|------|------|------|
| `chartData` | `ChartDataPoint` | 포맷된 차트 데이터 |
| `isEmpty` | `boolean` | 데이터가 비어있는지 여부 |

### 데이터 구조

```typescript
interface ChartDataPoint {
  labels: string[];           // 차트 레이블 (예: ['월', '화', '수', ...])
  bloodPressure: number[];    // 혈압 데이터 (수축기 기준)
  heartRate: number[];        // 심박수 데이터
  temperature: number[];      // 체온 데이터
  weight: number[];           // 체중 데이터
}
```

### 요구사항

- Requirements: 4.1, 4.4, 9.4

---

## useAuth

인증 상태를 관리하는 커스텀 훅입니다.

### 기능

- 인증 상태 관리
- 로그인/로그아웃 함수
- 회원가입 함수
- 토큰 저장 및 검증
- 프로필 새로고침

### 사용법

#### 1. 기본 사용 (개별 컴포넌트)

```typescript
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
      // 로그인 성공 후 리다이렉트
      navigate('/dashboard');
    } catch (err) {
      // 에러 처리
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 로그인 폼 */}
    </form>
  );
}
```

#### 2. Context API 사용 (전역 상태)

```typescript
// App.tsx
import { AuthProvider } from './contexts/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* 앱 컴포넌트들 */}
      </Router>
    </AuthProvider>
  );
}

// 다른 컴포넌트에서
import { useAuthContext } from '../hooks/useAuth';

function Header() {
  const { user, isAuthenticated, logout } = useAuthContext();

  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>안녕하세요, {user?.name}님</span>
          <button onClick={logout}>로그아웃</button>
        </>
      ) : (
        <Link to="/login">로그인</Link>
      )}
    </header>
  );
}
```

### 반환값

| 속성 | 타입 | 설명 |
|------|------|------|
| `user` | `UserProfile \| null` | 현재 로그인한 사용자 정보 |
| `isAuthenticated` | `boolean` | 인증 여부 |
| `isLoading` | `boolean` | 로딩 상태 |
| `error` | `string \| null` | 에러 메시지 |
| `login` | `(credentials: LoginRequest) => Promise<void>` | 로그인 함수 |
| `register` | `(userData: RegisterRequest) => Promise<void>` | 회원가입 함수 |
| `logout` | `() => Promise<void>` | 로그아웃 함수 |
| `refreshProfile` | `() => Promise<void>` | 프로필 새로고침 함수 |
| `clearError` | `() => void` | 에러 초기화 함수 |

### Protected Route 예제

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// 라우터 설정
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 요구사항

- Requirements: 4.1, 4.2

---

## 🔧 개발 가이드

### 새로운 커스텀 훅 추가하기

1. `frontend/src/hooks/` 디렉토리에 새 파일 생성
2. 훅 함수 구현 (use로 시작하는 이름 사용)
3. TypeScript 타입 정의 추가
4. 이 README에 문서 추가

### 베스트 프랙티스

- **메모이제이션**: `useMemo`, `useCallback`을 사용하여 불필요한 재계산 방지
- **에러 처리**: 모든 비동기 작업에 try-catch 추가
- **타입 안정성**: 모든 파라미터와 반환값에 TypeScript 타입 정의
- **의존성 배열**: useEffect, useMemo, useCallback의 의존성 배열 정확히 관리
- **클린업**: useEffect에서 구독이나 타이머 사용 시 클린업 함수 구현

### 테스트

```bash
# 훅 테스트 실행
npm test -- hooks

# 특정 훅 테스트
npm test -- useHealthData.test.ts
```

---

## 📚 참고 자료

- [React Hooks 공식 문서](https://react.dev/reference/react)
- [Custom Hooks 가이드](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript with React](https://react-typescript-cheatsheet.netlify.app/)
