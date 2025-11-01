import React, { useState, useEffect, useMemo, memo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface TrendData {
  type: string;
  period: string;
  data: Array<{
    date: string;
    value: number | { systolic: number; diastolic: number };
    average?: number;
  }>;
  statistics: {
    min: number;
    max: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

interface TrendChartsProps {
  trends: TrendData[];
  period: string;
  onPeriodChange: (period: string) => void;
}

const TrendCharts: React.FC<TrendChartsProps> = memo(({ trends, period, onPeriodChange }) => {
  const [selectedTrend, setSelectedTrend] = useState<string>('weight');

  useEffect(() => {
    if (trends.length > 0 && !trends.find(t => t.type === selectedTrend)) {
      setSelectedTrend(trends[0].type);
    }
  }, [trends, selectedTrend]);

  const currentTrend = useMemo(() => 
    trends.find(t => t.type === selectedTrend), 
    [trends, selectedTrend]
  );

  const formatChartData = useMemo(() => (trendData: TrendData) => {
    return trendData.data.map(item => {
      let value: number;
      if (typeof item.value === 'object' && 'systolic' in item.value) {
        // 혈압의 경우 수축기 혈압을 주 값으로 사용
        value = item.value.systolic;
      } else {
        value = item.value as number;
      }

      return {
        date: new Date(item.date).toLocaleDateString('ko-KR', { 
          month: 'short', 
          day: 'numeric' 
        }),
        value,
        average: item.average || value,
        fullDate: item.date
      };
    });
  }, []);

  const getTrendColor = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return '#ef4444'; // red
      case 'decreasing': return '#10b981'; // green
      case 'stable': return '#6366f1'; // indigo
      default: return '#6366f1';
    }
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'decreasing':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'stable':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  const getTrendLabel = (type: string) => {
    switch (type) {
      case 'weight': return '체중';
      case 'blood_pressure': return '혈압';
      case 'heart_rate': return '심박수';
      case 'blood_sugar': return '혈당';
      case 'temperature': return '체온';
      default: return type;
    }
  };

  const getUnit = (type: string) => {
    switch (type) {
      case 'weight': return 'kg';
      case 'blood_pressure': return 'mmHg';
      case 'heart_rate': return 'bpm';
      case 'blood_sugar': return 'mg/dL';
      case 'temperature': return '°C';
      default: return '';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            {`${getTrendLabel(selectedTrend)}: ${payload[0].value}${getUnit(selectedTrend)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!currentTrend) {
    return (
      <div className="trend-charts-container">
        <div className="card chart-card">
          <div className="card-header">
            <h3>건강 트렌드</h3>
            <div className="chart-controls">
              <button 
                className={`btn btn-sm ${period === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onPeriodChange('daily')}
              >
                7일
              </button>
              <button 
                className={`btn btn-sm ${period === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onPeriodChange('weekly')}
              >
                4주
              </button>
              <button 
                className={`btn btn-sm ${period === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onPeriodChange('monthly')}
              >
                3개월
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="no-data-message">
              <p>표시할 트렌드 데이터가 없습니다.</p>
              <p>건강 데이터를 기록하면 트렌드를 확인할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chartData = useMemo(() => 
    currentTrend ? formatChartData(currentTrend) : [], 
    [currentTrend, formatChartData]
  );

  return (
    <div className="trend-charts-container">
      <div className="card chart-card">
        <div className="card-header">
          <h3>건강 트렌드</h3>
          <div className="chart-controls">
            <button 
              className={`btn btn-sm ${period === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onPeriodChange('daily')}
            >
              7일
            </button>
            <button 
              className={`btn btn-sm ${period === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onPeriodChange('weekly')}
            >
              4주
            </button>
            <button 
              className={`btn btn-sm ${period === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onPeriodChange('monthly')}
            >
              3개월
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* 트렌드 선택 탭 */}
          <div className="trend-tabs">
            {trends.map((trend) => (
              <button
                key={trend.type}
                className={`trend-tab ${selectedTrend === trend.type ? 'active' : ''}`}
                onClick={() => setSelectedTrend(trend.type)}
              >
                {getTrendLabel(trend.type)}
              </button>
            ))}
          </div>

          {/* 통계 정보 */}
          <div className="trend-stats">
            <div className="stat-item">
              <span className="stat-label">평균</span>
              <span className="stat-value">
                {currentTrend.statistics.average.toFixed(1)}{getUnit(selectedTrend)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">최소</span>
              <span className="stat-value">
                {currentTrend.statistics.min.toFixed(1)}{getUnit(selectedTrend)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">최대</span>
              <span className="stat-value">
                {currentTrend.statistics.max.toFixed(1)}{getUnit(selectedTrend)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">트렌드</span>
              <span className="stat-trend" style={{ color: getTrendColor(currentTrend.statistics.trend) }}>
                {getTrendIcon(currentTrend.statistics.trend)}
                {currentTrend.statistics.trend === 'increasing' ? '증가' : 
                 currentTrend.statistics.trend === 'decreasing' ? '감소' : '안정'}
              </span>
            </div>
          </div>

          {/* 차트 */}
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getTrendColor(currentTrend.statistics.trend)} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={getTrendColor(currentTrend.statistics.trend)} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={getTrendColor(currentTrend.statistics.trend)}
                  strokeWidth={2}
                  fill="url(#trendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
});

TrendCharts.displayName = 'TrendCharts';

export default TrendCharts;