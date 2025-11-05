import { useMemo } from 'react';
import { ChartDataPoint, ChartPeriod } from '../components/dashboard/HealthTrendChart';

export interface RawHealthDataPoint {
  date: string;
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  temperature?: number;
  weight?: number;
}

export interface UseChartDataOptions {
  period: ChartPeriod;
  rawData?: RawHealthDataPoint[];
}

export interface UseChartDataReturn {
  chartData: ChartDataPoint;
  isEmpty: boolean;
}

/**
 * 차트 데이터 포맷팅 및 필터링을 위한 커스텀 훅
 * Requirements: 4.1, 4.4, 9.4
 */
export const useChartData = (options: UseChartDataOptions): UseChartDataReturn => {
  const { period, rawData = [] } = options;

  // 메모이제이션을 통한 성능 최적화 (Requirement 9.4)
  const chartData = useMemo(() => {
    // 기간별 데이터 필터링 (Requirement 4.4)
    const filteredData = filterDataByPeriod(rawData, period);
    
    // 차트 데이터 포맷팅 (Requirement 4.1)
    return formatChartData(filteredData, period);
  }, [rawData, period]);

  const isEmpty = useMemo(() => {
    return chartData.labels.length === 0;
  }, [chartData]);

  return {
    chartData,
    isEmpty,
  };
};

/**
 * 기간별 데이터 필터링
 */
function filterDataByPeriod(
  data: RawHealthDataPoint[],
  period: ChartPeriod
): RawHealthDataPoint[] {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= now;
  });
}

/**
 * 차트 데이터 포맷팅
 */
function formatChartData(
  data: RawHealthDataPoint[],
  period: ChartPeriod
): ChartDataPoint {
  if (data.length === 0) {
    return getEmptyChartData(period);
  }

  // 기간별로 데이터 그룹화 및 집계
  const aggregatedData = aggregateDataByPeriod(data, period);

  return {
    labels: aggregatedData.map((item) => item.label),
    bloodPressure: aggregatedData.map((item) => item.bloodPressure),
    heartRate: aggregatedData.map((item) => item.heartRate),
    temperature: aggregatedData.map((item) => item.temperature),
    weight: aggregatedData.map((item) => item.weight),
  };
}

/**
 * 기간별 데이터 집계
 */
function aggregateDataByPeriod(
  data: RawHealthDataPoint[],
  period: ChartPeriod
): Array<{
  label: string;
  bloodPressure: number;
  heartRate: number;
  temperature: number;
  weight: number;
}> {
  const grouped = groupDataByPeriod(data, period);
  
  return Object.entries(grouped).map(([key, items]) => {
    const label = formatLabel(key, period);
    
    return {
      label,
      bloodPressure: calculateAverage(items, 'bloodPressure'),
      heartRate: calculateAverage(items, 'heartRate'),
      temperature: calculateAverage(items, 'temperature'),
      weight: calculateAverage(items, 'weight'),
    };
  });
}

/**
 * 데이터를 기간별로 그룹화
 */
function groupDataByPeriod(
  data: RawHealthDataPoint[],
  period: ChartPeriod
): Record<string, RawHealthDataPoint[]> {
  const grouped: Record<string, RawHealthDataPoint[]> = {};

  data.forEach((item) => {
    const date = new Date(item.date);
    let key: string;

    switch (period) {
      case 'week':
        // 요일별로 그룹화
        key = date.toLocaleDateString('ko-KR', { weekday: 'short' });
        break;
      case 'month':
        // 주별로 그룹화
        const weekNumber = Math.ceil(date.getDate() / 7);
        key = `${weekNumber}주`;
        break;
      case 'year':
        // 월별로 그룹화
        key = date.toLocaleDateString('ko-KR', { month: 'short' });
        break;
      default:
        key = date.toISOString();
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });

  return grouped;
}

/**
 * 평균값 계산 (혈압 및 일반 필드)
 */
function calculateAverage(
  items: RawHealthDataPoint[],
  field: keyof Omit<RawHealthDataPoint, 'date'>
): number {
  if (field === 'bloodPressure') {
    // 혈압의 경우 수축기 기준으로 평균 계산
    const values = items
      .map((item) => item.bloodPressure?.systolic)
      .filter((value): value is number => typeof value === 'number');

    if (values.length === 0) return 0;

    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }

  // 일반 필드의 평균 계산
  const values = items
    .map((item) => item[field as keyof Omit<RawHealthDataPoint, 'date' | 'bloodPressure'>])
    .filter((value): value is number => typeof value === 'number');

  if (values.length === 0) return 0;

  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

/**
 * 라벨 포맷팅
 */
function formatLabel(key: string, period: ChartPeriod): string {
  // 이미 한글로 포맷된 경우 그대로 반환
  if (key.includes('주') || key.includes('월') || ['월', '화', '수', '목', '금', '토', '일'].some(day => key.includes(day))) {
    return key;
  }

  // 날짜 문자열인 경우 파싱하여 포맷
  const date = new Date(key);
  if (!isNaN(date.getTime())) {
    switch (period) {
      case 'week':
        return date.toLocaleDateString('ko-KR', { weekday: 'short' });
      case 'month':
        const weekNumber = Math.ceil(date.getDate() / 7);
        return `${weekNumber}주`;
      case 'year':
        return date.toLocaleDateString('ko-KR', { month: 'short' });
    }
  }

  return key;
}

/**
 * 빈 차트 데이터 생성
 */
function getEmptyChartData(period: ChartPeriod): ChartDataPoint {
  let labels: string[];

  switch (period) {
    case 'week':
      labels = ['월', '화', '수', '목', '금', '토', '일'];
      break;
    case 'month':
      labels = ['1주', '2주', '3주', '4주'];
      break;
    case 'year':
      labels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
      break;
    default:
      labels = [];
  }

  return {
    labels,
    bloodPressure: labels.map(() => 0),
    heartRate: labels.map(() => 0),
    temperature: labels.map(() => 0),
    weight: labels.map(() => 0),
  };
}

export default useChartData;
