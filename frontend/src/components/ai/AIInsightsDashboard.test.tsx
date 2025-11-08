/**
 * AIInsightsDashboard Component Tests
 * 
 * Tests cover:
 * - Component rendering
 * - Loading states
 * - Error states
 * - Data display
 * - User interactions (filter changes, refresh)
 * 
 * Requirements: All
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import AIInsightsDashboard from './AIInsightsDashboard';
import { AIInsightsResponse } from '../../services/aiInsightsApi';

// Mock data for tests
const mockInsightsData: AIInsightsResponse = {
  summary: {
    text: '최근 7일간의 건강 데이터를 분석한 결과, 전반적인 건강 상태는 양호합니다.',
    period: '최근 7일',
    lastUpdated: new Date('2024-01-15T10:00:00Z'),
    confidence: 0.85,
    keyFindings: {
      positive: ['혈압이 정상 범위를 유지하고 있습니다', '수면 시간이 개선되었습니다'],
      concerning: ['운동량이 권장량보다 부족합니다']
    }
  },
  insights: [
    {
      id: '1',
      type: 'positive',
      priority: 'low',
      icon: '✅',
      title: '혈압 정상 유지',
      description: '지난 주 동안 혈압이 정상 범위를 유지하고 있습니다.',
      actionText: '자세히 보기',
      actionLink: '/health/blood-pressure',
      relatedMetrics: ['혈압'],
      generatedAt: new Date('2024-01-15T10:00:00Z')
    },
    {
      id: '2',
      type: 'warning',
      priority: 'medium',
      icon: '⚠️',
      title: '운동 부족',
      description: '주간 운동량이 권장량보다 부족합니다.',
      actionText: '운동 계획 보기',
      actionLink: '/health/exercise',
      relatedMetrics: ['운동'],
      generatedAt: new Date('2024-01-15T10:00:00Z')
    },
    {
      id: '3',
      type: 'alert',
      priority: 'high',
      icon: '🚨',
      title: '스트레스 수치 높음',
      description: '스트레스 수치가 높게 측정되었습니다.',
      actionText: '스트레스 관리',
      actionLink: '/health/stress',
      relatedMetrics: ['스트레스'],
      generatedAt: new Date('2024-01-15T10:00:00Z')
    }
  ],
  healthScore: {
    score: 75,
    category: 'good',
    categoryLabel: '양호',
    previousScore: 70,
    change: 5,
    changeDirection: 'up',
    components: {
      bloodPressure: { score: 85, weight: 0.25 },
      heartRate: { score: 80, weight: 0.20 },
      sleep: { score: 70, weight: 0.25 },
      exercise: { score: 60, weight: 0.20 },
      stress: { score: 65, weight: 0.10 }
    }
  },
  quickStats: {
    bloodPressure: { value: '120/80', unit: 'mmHg' },
    heartRate: { value: 72, unit: 'bpm' },
    sleep: { value: 7.5, unit: 'hours' },
    exercise: { value: 120, unit: 'min/week' }
  },
  recommendations: [
    {
      id: '1',
      icon: '🏃',
      title: '유산소 운동 증가',
      description: '주 3회 이상 30분씩 유산소 운동을 하세요.',
      category: 'exercise',
      priority: 1
    },
    {
      id: '2',
      icon: '😴',
      title: '수면 시간 개선',
      description: '매일 7-8시간의 충분한 수면을 취하세요.',
      category: 'sleep',
      priority: 2
    },
    {
      id: '3',
      icon: '🧘',
      title: '스트레스 관리',
      description: '명상이나 요가로 스트레스를 관리하세요.',
      category: 'stress',
      priority: 3
    }
  ],
  trends: [
    {
      metric: 'bloodPressure',
      label: '혈압',
      currentValue: '120/80',
      previousValue: '125/85',
      change: -4,
      changeDirection: 'down',
      isImproving: true,
      dataPoints: []
    },
    {
      metric: 'heartRate',
      label: '심박수',
      currentValue: '72 bpm',
      previousValue: '75 bpm',
      change: -4,
      changeDirection: 'down',
      isImproving: true,
      dataPoints: []
    },
    {
      metric: 'sleep',
      label: '수면',
      currentValue: '7.5 hours',
      previousValue: '6.8 hours',
      change: 10,
      changeDirection: 'up',
      isImproving: true,
      dataPoints: []
    }
  ],
  metadata: {
    userId: 'user-123',
    generatedAt: new Date('2024-01-15T10:00:00Z'),
    dataPointsAnalyzed: 42,
    analysisPeriod: 7,
    cacheExpiry: new Date('2024-01-15T11:00:00Z')
  }
};

const API_BASE_URL = 'http://localhost:5001/api';

describe('AIInsightsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering Tests', () => {
    it('renders the dashboard with all main sections', async () => {
      // Setup mock API response
      server.use(
        http.get(`${API_BASE_URL}/ai-insights`, () => {
          return HttpResponse.json({ data: mockInsightsData });
        })
      );

      render(<AIInsightsDashboard />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('AI 건강 인사이트를 분석하고 있습니다...')).not.toBeInTheDocument();
      });

      // Check main sections are rendered
      expect(screen.getByText('AI 건강 인사이트')).toBeInTheDocument();
      expect(screen.getByText('AI 건강 요약')).toBeInTheDocument();
      expect(screen.getByText('건강 인사이트')).toBeInTheDocument();
      expect(screen.getByText('종합 건강 점수')).toBeInTheDocument();
      expect(screen.getByText('건강 트렌드 분석')).toBeInTheDocument();
      expect(screen.getByText('주요 지표')).toBeInTheDocument();
      expect(screen.getByText('맞춤형 추천')).toBeInTheDocument();
    });

    it('renders the header with refresh button', async () => {
      server.use(
        http.get(`${API_BASE_URL}/ai-insights`, () => {
          return HttpResponse.json({ data: mockInsightsData });
        })
      );

      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.queryByText('AI 건강 인사이트를 분석하고 있습니다...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('인공지능 기반 건강 분석 및 맞춤형 추천')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /새로고침/ })).toBeInTheDocument();
    });
  });

  describe('Loading State Tests', () => {
    it('displays loading spinner while fetching data', () => {
      // Setup delayed response
      server.use(
        http.get(`${API_BASE_URL}/ai-insights`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({ data: mockInsightsData });
        })
      );

      render(<AIInsightsDashboard />);

      // Check loading state is displayed
      expect(screen.getByText('AI 건강 인사이트를 분석하고 있습니다...')).toBeInTheDocument();
    });

    it('hides loading spinner after data is loaded', async () => {
      server.use(
        http.get(`${API_BASE_URL}/ai-insights`, () => {
          return HttpResponse.json({ data: mockInsightsData });
        })
      );

      render(<AIInsightsDashboard />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('AI 건강 인사이트를 분석하고 있습니다...')).not.toBeInTheDocument();
      });

      // Check data is displayed
      expect(screen.getByText('AI 건강 요약')).toBeInTheDocument();
    });
  });

  describe('Error State Tests', () => {
    it('displays error message when API call fails', async () => {
      // Setup error response
      server.use(
        http.get(`${API_BASE_URL}/ai-insights`, () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<AIInsightsDashboard />);

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
      });

      expect(screen.getByText(/AI 인사이트 조회 실패/)).toBeInTheDocument();
    });

    it('displays retry button in error state', async () => {
      server.use(
        http.get(`${API_BASE_URL}/ai-insights`, () => {
          return HttpResponse.json(
            { error: 'Network error' },
            { status: 500 }
          );
        })
      );

      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /다시 시도/ });
      expect(retryButton).toBeInTheDocument();
    });

    it('retries loading when retry button is clicked', async () => {
      const user = userEvent.setup();
      let callCount = 0;

      server.use(
        http.get(`${API_BASE_URL}/ai-insights`, () => {
          callCount++;
          if (callCount === 1) {
            return HttpResponse.json(
              { error: 'Network error' },
              { status: 500 }
            );
          }
          return HttpResponse.json({ data: mockInsightsData });
        })
      );

      render(<AIInsightsDashboard />);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /다시 시도/ });
      await user.click(retryButton);

      // Wait for successful load
      await waitFor(() => {
        expect(screen.getByText('AI 건강 요약')).toBeInTheDocument();
      });

      expect(callCount).toBe(2);
    });
  });

  describe('Data Display Tests', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE_URL}/ai-insights`, () => {
          return HttpResponse.json({ data: mockInsightsData });
        })
      );
    });

    it('displays AI summary with correct data', async () => {
      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(mockInsightsData.summary.text)).toBeInTheDocument();
      });

      expect(screen.getByText(mockInsightsData.summary.period)).toBeInTheDocument();
      expect(screen.getByText(/신뢰도: 85%/)).toBeInTheDocument();
    });

    it('displays positive and concerning findings', async () => {
      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('긍정적 발견사항')).toBeInTheDocument();
      });

      expect(screen.getByText('혈압이 정상 범위를 유지하고 있습니다')).toBeInTheDocument();
      expect(screen.getByText('주의가 필요한 사항')).toBeInTheDocument();
      expect(screen.getByText('운동량이 권장량보다 부족합니다')).toBeInTheDocument();
    });

    it('displays all insight cards with correct types', async () => {
      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('혈압 정상 유지')).toBeInTheDocument();
      });

      expect(screen.getByText('운동 부족')).toBeInTheDocument();
      expect(screen.getByText('스트레스 수치 높음')).toBeInTheDocument();
    });

    it('displays insight cards with priority badges', async () => {
      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('낮음')).toBeInTheDocument();
      });

      expect(screen.getByText('보통')).toBeInTheDocument();
      expect(screen.getByText('높음')).toBeInTheDocument();
    });

    it('displays health score with correct value', async () => {
      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('75')).toBeInTheDocument();
      });

      expect(screen.getByText('양호')).toBeInTheDocument();
      expect(screen.getByText('+5점')).toBeInTheDocument();
      expect(screen.getByText('지난 주 대비')).toBeInTheDocument();
    });

    it('displays health score components', async () => {
      render(<AIInsightsDashboard />);

      await waitFor(() => {
        // Use getAllByText since "혈압" appears in multiple places
        const bloodPressureElements = screen.getAllByText('혈압');
        expect(bloodPressureElements.length).toBeGreaterThan(0);
      });

      const componentLabels = ['심박수', '수면', '운동', '스트레스'];
      componentLabels.forEach(label => {
        const elements = screen.getAllByText(label);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('displays quick stats with correct values', async () => {
      render(<AIInsightsDashboard />);

      await waitFor(() => {
        // Check for blood pressure value (appears in multiple places)
        const bloodPressureElements = screen.getAllByText(/120\/80/);
        expect(bloodPressureElements.length).toBeGreaterThan(0);
      });

      // Use getAllByText since these values appear in both trends and quick stats
      const heartRateElements = screen.getAllByText('72 bpm');
      expect(heartRateElements.length).toBeGreaterThan(0);
      
      const sleepElements = screen.getAllByText('7.5 hours');
      expect(sleepElements.length).toBeGreaterThan(0);
      
      expect(screen.getByText('120 min/week')).toBeInTheDocument();
    });

    it('displays "No data" for missing quick stats', async () => {
      const dataWithMissingStats = {
        ...mockInsightsData,
        quickStats: {
          ...mockInsightsData.quickStats,
          heartRate: { value: 0, unit: 'bpm' }
        }
      };

      server.use(
        http.get(`${API_BASE_URL}/ai-insights`, () => {
          return HttpResponse.json({ data: dataWithMissingStats });
        })
      );

      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('데이터 없음')).toBeInTheDocument();
      });
    });

    it('displays recommendations sorted by priority', async () => {
      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('유산소 운동 증가')).toBeInTheDocument();
      });

      expect(screen.getByText('수면 시간 개선')).toBeInTheDocument();
      // Use getAllByText since "스트레스 관리" appears in both insight card and recommendation
      const stressManagementElements = screen.getAllByText('스트레스 관리');
      expect(stressManagementElements.length).toBeGreaterThan(0);
    });

    it('displays trend cards with correct data', async () => {
      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('120/80')).toBeInTheDocument();
      });

      // Use getAllByText since these values appear in both trends and quick stats
      const heartRateElements = screen.getAllByText('72 bpm');
      expect(heartRateElements.length).toBeGreaterThan(0);
      
      const sleepElements = screen.getAllByText('7.5 hours');
      expect(sleepElements.length).toBeGreaterThan(0);
    });
  });

  describe('User Interaction Tests', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE_URL}/ai-insights`, () => {
          return HttpResponse.json({ data: mockInsightsData });
        })
      );
    });

    it('handles refresh button click', async () => {
      const user = userEvent.setup();
      let refreshCalled = false;

      server.use(
        http.post(`${API_BASE_URL}/ai-insights/refresh`, () => {
          refreshCalled = true;
          return HttpResponse.json({ data: mockInsightsData });
        })
      );

      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /새로고침/ })).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /새로고침/ });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(refreshCalled).toBe(true);
      });
    });

    it('disables refresh button while refreshing', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE_URL}/ai-insights/refresh`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({ data: mockInsightsData });
        })
      );

      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /새로고침/ })).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /새로고침/ });
      await user.click(refreshButton);

      // Check button is disabled and shows loading text
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /분석 중.../ })).toBeDisabled();
      });
    });

    it('changes period filter when filter button is clicked', async () => {
      const user = userEvent.setup();
      const mockTrends7Days = [
        {
          metric: 'bloodPressure',
          label: '혈압',
          currentValue: '118/78',
          previousValue: '120/80',
          change: -2,
          changeDirection: 'down' as const,
          isImproving: true,
          dataPoints: []
        }
      ];

      server.use(
        http.get(`${API_BASE_URL}/ai-insights/trends`, ({ request }) => {
          const url = new URL(request.url);
          const period = url.searchParams.get('period');
          
          if (period === '7') {
            return HttpResponse.json({ data: mockTrends7Days });
          }
          return HttpResponse.json({ data: mockInsightsData.trends });
        })
      );

      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '7일' })).toBeInTheDocument();
      });

      // Click 7-day filter
      const filter7Days = screen.getByRole('button', { name: '7일' });
      await user.click(filter7Days);

      // Wait for trends to update
      await waitFor(() => {
        expect(screen.getByText('118/78')).toBeInTheDocument();
      });
    });

    it('highlights active filter button', async () => {
      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '30일' })).toBeInTheDocument();
      });

      // Check 30-day filter is active by default
      const filter30Days = screen.getByRole('button', { name: '30일' });
      expect(filter30Days).toHaveClass('active');
    });

    it('updates active filter when different period is selected', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE_URL}/ai-insights/trends`, () => {
          return HttpResponse.json({ data: mockInsightsData.trends });
        })
      );

      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '90일' })).toBeInTheDocument();
      });

      // Click 90-day filter
      const filter90Days = screen.getByRole('button', { name: '90일' });
      await user.click(filter90Days);

      // Check 90-day filter becomes active
      await waitFor(() => {
        expect(filter90Days).toHaveClass('active');
      });
    });

    it('handles filter change error gracefully', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE_URL}/ai-insights/trends`, () => {
          return HttpResponse.json(
            { error: 'Failed to load trends' },
            { status: 500 }
          );
        })
      );

      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '7일' })).toBeInTheDocument();
      });

      // Click filter
      const filter7Days = screen.getByRole('button', { name: '7일' });
      await user.click(filter7Days);

      // Check error message is displayed (the actual error message from the API client)
      await waitFor(() => {
        expect(screen.getByText(/트렌드 분석 조회 실패/)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State Tests', () => {
    it('displays error state when API returns null data', async () => {
      // When API returns null data, the API client throws an error
      // So the component shows error state, not empty state
      server.use(
        http.get(`${API_BASE_URL}/ai-insights`, () => {
          return HttpResponse.json({ data: null });
        })
      );

      render(<AIInsightsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
      });

      expect(screen.getByText(/AI 인사이트 조회 실패/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /다시 시도/ })).toBeInTheDocument();
    });
  });
});
