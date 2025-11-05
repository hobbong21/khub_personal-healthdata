import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHealthData } from './useHealthData';
import { healthApiService } from '../services/healthApi';

// Mock the health API service
vi.mock('../services/healthApi', () => ({
  healthApiService: {
    getDashboardData: vi.fn(),
  },
}));

describe('useHealthData', () => {
  const mockDashboardData = {
    userName: '홍길동',
    healthScore: 85,
    healthMetrics: {
      latestVitalSigns: {
        blood_pressure: {
          value: { systolic: 120, diastolic: 80 },
          timestamp: new Date().toISOString(),
        },
        heart_rate: {
          value: 72,
          timestamp: new Date().toISOString(),
        },
        temperature: {
          value: 36.5,
          timestamp: new Date().toISOString(),
        },
        weight: {
          value: 70,
          timestamp: new Date().toISOString(),
        },
        blood_sugar: {
          value: 95,
          timestamp: new Date().toISOString(),
        },
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    vi.mocked(healthApiService.getDashboardData).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useHealthData());

    expect(result.current.loading).toBe(true);
    expect(result.current.healthData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('fetches and transforms health data successfully', async () => {
    vi.mocked(healthApiService.getDashboardData).mockResolvedValue(mockDashboardData);

    const { result } = renderHook(() => useHealthData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.healthData).toEqual({
      userName: '홍길동',
      healthScore: 85,
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 36.5,
      weight: 70,
      bloodSugar: 95,
      lastUpdated: expect.any(Date),
    });
    expect(result.current.error).toBeNull();
  });

  it('provides chart data for all periods', async () => {
    vi.mocked(healthApiService.getDashboardData).mockResolvedValue(mockDashboardData);

    const { result } = renderHook(() => useHealthData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.chartData).toHaveProperty('week');
    expect(result.current.chartData).toHaveProperty('month');
    expect(result.current.chartData).toHaveProperty('year');

    expect(result.current.chartData.week.labels).toHaveLength(7);
    expect(result.current.chartData.month.labels).toHaveLength(4);
    expect(result.current.chartData.year.labels).toHaveLength(12);
  });

  it('provides activities data', async () => {
    vi.mocked(healthApiService.getDashboardData).mockResolvedValue(mockDashboardData);

    const { result } = renderHook(() => useHealthData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.activities).toHaveLength(4);
    expect(result.current.activities[0]).toHaveProperty('id');
    expect(result.current.activities[0]).toHaveProperty('icon');
    expect(result.current.activities[0]).toHaveProperty('title');
    expect(result.current.activities[0]).toHaveProperty('type');
  });

  it('handles API errors', async () => {
    const errorMessage = '서버 오류가 발생했습니다';
    vi.mocked(healthApiService.getDashboardData).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useHealthData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.healthData).toBeNull();
  });

  it('refetch function reloads data', async () => {
    vi.mocked(healthApiService.getDashboardData).mockResolvedValue(mockDashboardData);

    const { result } = renderHook(() => useHealthData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear the mock to track new calls
    vi.clearAllMocks();
    vi.mocked(healthApiService.getDashboardData).mockResolvedValue({
      ...mockDashboardData,
      healthScore: 90,
    });

    // Call refetch
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.healthData?.healthScore).toBe(90);
    });

    expect(healthApiService.getDashboardData).toHaveBeenCalledTimes(1);
  });

  it('handles missing vital signs data gracefully', async () => {
    vi.mocked(healthApiService.getDashboardData).mockResolvedValue({
      userName: '테스트',
      healthScore: 75,
      healthMetrics: {
        latestVitalSigns: {},
      },
    });

    const { result } = renderHook(() => useHealthData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.healthData).toEqual({
      userName: '테스트',
      healthScore: 75,
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 36.5,
      weight: 70,
      bloodSugar: 95,
      lastUpdated: expect.any(Date),
    });
  });
});
