import { useState, useEffect, useCallback } from 'react';
import { healthApiService } from '../services/healthApi';
import { ChartDataPoint, ChartPeriod } from '../components/dashboard/HealthTrendChart';
import { Activity } from '../components/dashboard/ActivityList';

export interface HealthData {
  userName: string;
  healthScore: number;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  bloodSugar: number;
  lastUpdated: Date;
}

export interface UseHealthDataReturn {
  healthData: HealthData | null;
  chartData: Record<ChartPeriod, ChartDataPoint>;
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHealthData = (): UseHealthDataReturn => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [chartData, setChartData] = useState<Record<ChartPeriod, ChartDataPoint>>({
    week: {
      labels: [],
      bloodPressure: [],
      heartRate: [],
      temperature: [],
      weight: [],
    },
    month: {
      labels: [],
      bloodPressure: [],
      heartRate: [],
      temperature: [],
      weight: [],
    },
    year: {
      labels: [],
      bloodPressure: [],
      heartRate: [],
      temperature: [],
      weight: [],
    },
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard data
      const dashboardData = await healthApiService.getDashboardData();

      // Transform dashboard data to HealthData format
      const latestVitalSigns = dashboardData.healthMetrics?.latestVitalSigns || {};
      
      const transformedHealthData: HealthData = {
        userName: dashboardData.userName || '사용자',
        healthScore: dashboardData.healthScore || 85,
        bloodPressure: latestVitalSigns.blood_pressure 
          ? `${latestVitalSigns.blood_pressure.value.systolic}/${latestVitalSigns.blood_pressure.value.diastolic}`
          : '120/80',
        heartRate: latestVitalSigns.heart_rate?.value || 72,
        temperature: latestVitalSigns.temperature?.value || 36.5,
        weight: latestVitalSigns.weight?.value || 70,
        bloodSugar: latestVitalSigns.blood_sugar?.value || 95,
        lastUpdated: new Date(),
      };

      setHealthData(transformedHealthData);

      // Generate mock chart data (in production, this would come from API)
      const mockChartData: Record<ChartPeriod, ChartDataPoint> = {
        week: {
          labels: ['월', '화', '수', '목', '금', '토', '일'],
          bloodPressure: [120, 118, 122, 119, 121, 120, 118],
          heartRate: [72, 70, 75, 73, 71, 72, 70],
          temperature: [36.5, 36.6, 36.4, 36.5, 36.7, 36.5, 36.6],
          weight: [70, 70.2, 69.8, 70.1, 70, 69.9, 70.1],
        },
        month: {
          labels: ['1주', '2주', '3주', '4주'],
          bloodPressure: [120, 119, 121, 118],
          heartRate: [72, 71, 73, 70],
          temperature: [36.5, 36.6, 36.5, 36.6],
          weight: [70, 70.1, 69.9, 70.1],
        },
        year: {
          labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
          bloodPressure: [122, 121, 120, 119, 118, 119, 120, 119, 118, 120, 119, 118],
          heartRate: [74, 73, 72, 71, 70, 71, 72, 71, 70, 72, 71, 70],
          temperature: [36.6, 36.5, 36.5, 36.6, 36.5, 36.6, 36.5, 36.6, 36.5, 36.5, 36.6, 36.6],
          weight: [71, 70.8, 70.5, 70.3, 70.1, 70, 69.9, 70, 70.1, 70, 69.9, 70.1],
        },
      };

      setChartData(mockChartData);

      // Transform activities data
      const mockActivities: Activity[] = [
        {
          id: '1',
          icon: '💊',
          title: '아침 약 복용 완료',
          time: '2시간 전',
          type: 'medication',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: '2',
          icon: '🏃',
          title: '운동 30분 완료',
          time: '5시간 전',
          type: 'exercise',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        {
          id: '3',
          icon: '📝',
          title: '건강 일지 작성',
          time: '어제',
          type: 'journal',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          id: '4',
          icon: '🏥',
          title: '병원 예약 확인',
          time: '2일 전',
          type: 'appointment',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ];

      setActivities(mockActivities);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다');
      console.error('Error fetching health data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    healthData,
    chartData,
    activities,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useHealthData;
