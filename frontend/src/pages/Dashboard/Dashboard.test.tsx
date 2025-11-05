import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';

// Mock the hooks
vi.mock('../../hooks/useHealthData', () => ({
  useHealthData: vi.fn(),
}));

import { useHealthData } from '../../hooks/useHealthData';

const mockUseHealthData = useHealthData as ReturnType<typeof vi.fn>;

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Dashboard', () => {
  const mockHealthData = {
    userName: '홍길동',
    healthScore: 85,
    bloodPressure: '120/80',
    heartRate: 72,
    temperature: 36.5,
    weight: 70,
    bloodSugar: 95,
    lastUpdated: new Date(),
  };

  const mockChartData = {
    week: {
      labels: ['월', '화', '수', '목', '금', '토', '일'],
      bloodPressure: [120, 118, 122, 119, 121, 120, 118],
      heartRate: [72, 70, 75, 73, 71, 72, 70],
      temperature: [36.5, 36.6, 36.4, 36.5, 36.7, 36.5, 36.6],
      weight: [70, 70.2, 69.8, 70.1, 70, 69.9, 70.1],
    },
    month: {
      labels: ['1주', '2주', '3주', '4주'],
      bloodPressure: [120, 119, 121, 120],
      heartRate: [72, 71, 73, 72],
      temperature: [36.5, 36.5, 36.6, 36.5],
      weight: [70, 70.1, 70, 70.1],
    },
    year: {
      labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
      bloodPressure: [120, 119, 121, 120, 122, 121, 120, 119, 120, 121, 120, 119],
      heartRate: [72, 71, 73, 72, 74, 73, 72, 71, 72, 73, 72, 71],
      temperature: [36.5, 36.5, 36.6, 36.5, 36.6, 36.5, 36.5, 36.6, 36.5, 36.5, 36.6, 36.5],
      weight: [70, 70.1, 70, 70.1, 70.2, 70.1, 70, 69.9, 70, 70.1, 70, 70.1],
    },
  };

  const mockActivities = [
    {
      id: '1',
      icon: '💊',
      title: '아스피린 복용',
      time: '2시간 전',
      type: 'medication' as const,
    },
    {
      id: '2',
      icon: '🏃',
      title: '조깅 30분',
      time: '5시간 전',
      type: 'exercise' as const,
    },
  ];

  it('renders loading state', () => {
    mockUseHealthData.mockReturnValue({
      healthData: null,
      chartData: mockChartData,
      activities: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const mockRefetch = vi.fn();
    mockUseHealthData.mockReturnValue({
      healthData: null,
      chartData: mockChartData,
      activities: [],
      loading: false,
      error: '데이터를 불러오는데 실패했습니다',
      refetch: mockRefetch,
    });

    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
    expect(screen.getByText('데이터를 불러오는데 실패했습니다')).toBeInTheDocument();
  });

  it('renders dashboard with health data', async () => {
    mockUseHealthData.mockReturnValue({
      healthData: mockHealthData,
      chartData: mockChartData,
      activities: mockActivities,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/안녕하세요, 홍길동님/)).toBeInTheDocument();
    });
  });

  it('renders health score card', async () => {
    mockUseHealthData.mockReturnValue({
      healthData: mockHealthData,
      chartData: mockChartData,
      activities: mockActivities,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument();
    });
  });

  it('renders stat cards with vital signs', async () => {
    mockUseHealthData.mockReturnValue({
      healthData: mockHealthData,
      chartData: mockChartData,
      activities: mockActivities,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('120/80')).toBeInTheDocument();
      expect(screen.getByText('72')).toBeInTheDocument();
      expect(screen.getByText('70')).toBeInTheDocument();
      expect(screen.getByText('95')).toBeInTheDocument();
    });
  });

  it('renders quick action buttons', async () => {
    mockUseHealthData.mockReturnValue({
      healthData: mockHealthData,
      chartData: mockChartData,
      activities: mockActivities,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByLabelText('건강 일지 작성')).toBeInTheDocument();
      expect(screen.getByLabelText('복약 기록')).toBeInTheDocument();
      expect(screen.getByLabelText('병원 예약')).toBeInTheDocument();
      expect(screen.getByLabelText('검사 결과 보기')).toBeInTheDocument();
    });
  });

  it('has proper accessibility structure', async () => {
    mockUseHealthData.mockReturnValue({
      healthData: mockHealthData,
      chartData: mockChartData,
      activities: mockActivities,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: '주 네비게이션' })).toBeInTheDocument();
    });
  });
});
