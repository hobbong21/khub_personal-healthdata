import React, { useState, useMemo, useCallback } from 'react';
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
  ChartOptions,
} from 'chart.js';
import styles from './HealthTrendChart.module.css';
import { HealthTrendChartProps, ChartPeriod } from './HealthTrendChart.types';

// Register Chart.js components
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

export const HealthTrendChart: React.FC<HealthTrendChartProps> = React.memo(({
  data,
  initialPeriod = 'week',
  onPeriodChange
}) => {
  const [period, setPeriod] = useState<ChartPeriod>(initialPeriod);

  // Memoize period change handler
  const handlePeriodChange = useCallback((newPeriod: ChartPeriod) => {
    setPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  }, [onPeriodChange]);

  const chartData = useMemo(() => {
    const periodData = data[period];
    
    return {
      labels: periodData.labels,
      datasets: [
        {
          label: '혈압 (수축기)',
          data: periodData.bloodPressure,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: '심박수',
          data: periodData.heartRate,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: '체온',
          data: periodData.temperature,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: '체중',
          data: periodData.weight,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [data, period]);

  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#718096',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#718096',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  }), []);

  // Memoize legend items
  const legendItems = useMemo(() => [
    { label: '혈압', color: '#3b82f6' },
    { label: '심박수', color: '#10b981' },
    { label: '체온', color: '#f59e0b' },
    { label: '체중', color: '#8b5cf6' },
  ], []);

  return (
    <div className={styles.chartCard} role="region" aria-label="건강 트렌드 차트">
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>
          <span aria-hidden="true">📈</span> 건강 트렌드
        </h3>
        
        <div className={styles.chartTabs} role="tablist" aria-label="차트 기간 선택">
          <button
            className={`${styles.chartTab} ${period === 'week' ? styles.active : ''}`}
            onClick={() => handlePeriodChange('week')}
            role="tab"
            aria-selected={period === 'week'}
            aria-controls="chart-panel"
            aria-label="주간 데이터 보기"
          >
            주간
          </button>
          <button
            className={`${styles.chartTab} ${period === 'month' ? styles.active : ''}`}
            onClick={() => handlePeriodChange('month')}
            role="tab"
            aria-selected={period === 'month'}
            aria-controls="chart-panel"
            aria-label="월간 데이터 보기"
          >
            월간
          </button>
          <button
            className={`${styles.chartTab} ${period === 'year' ? styles.active : ''}`}
            onClick={() => handlePeriodChange('year')}
            role="tab"
            aria-selected={period === 'year'}
            aria-controls="chart-panel"
            aria-label="연간 데이터 보기"
          >
            연간
          </button>
        </div>
      </div>

      <div 
        className={styles.chartContainer}
        id="chart-panel"
        role="tabpanel"
        aria-label={`${period === 'week' ? '주간' : period === 'month' ? '월간' : '연간'} 건강 데이터 차트`}
      >
        <Line data={chartData} options={options} />
      </div>

      <div className={styles.chartLegend} role="list" aria-label="차트 범례">
        {legendItems.map((item) => (
          <div key={item.label} className={styles.legendItem} role="listitem">
            <div
              className={styles.legendColor}
              style={{ background: item.color }}
              aria-hidden="true"
            />
            <span className={styles.legendLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

HealthTrendChart.displayName = 'HealthTrendChart';

export default HealthTrendChart;
