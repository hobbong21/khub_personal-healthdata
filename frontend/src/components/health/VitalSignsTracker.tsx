import React, { useState, useEffect } from 'react';
import { VitalSignResponse, VitalSignTrend } from '../../types/health';
import healthApiService from '../../services/healthApi';
import TrendChart from './TrendChart';

interface VitalSignsTrackerProps {
  selectedType?: string;
  onTypeChange?: (type: string) => void;
}

const VitalSignsTracker: React.FC<VitalSignsTrackerProps> = ({ 
  selectedType = 'weight', 
  onTypeChange 
}) => {
  const [currentType, setCurrentType] = useState(selectedType);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [days, setDays] = useState(30);
  const [trendData, setTrendData] = useState<VitalSignTrend | null>(null);
  const [recentRecords, setRecentRecords] = useState<VitalSignResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vitalSignTypes = [
    { value: 'weight', label: '체중', unit: 'kg', icon: '⚖️', color: '#3B82F6' },
    { value: 'blood_pressure', label: '혈압', unit: 'mmHg', icon: '🩺', color: '#EF4444' },
    { value: 'heart_rate', label: '맥박', unit: 'BPM', icon: '❤️', color: '#F59E0B' },
    { value: 'temperature', label: '체온', unit: '°C', icon: '🌡️', color: '#10B981' },
    { value: 'blood_sugar', label: '혈당', unit: 'mg/dL', icon: '🩸', color: '#8B5CF6' }
  ];

  const periodOptions = [
    { value: 'daily', label: '일별', days: 30 },
    { value: 'weekly', label: '주별', days: 84 },
    { value: 'monthly', label: '월별', days: 365 }
  ] as const;

  useEffect(() => {
    loadTrendData();
    loadRecentRecords();
  }, [currentType, period, days]);

  const loadTrendData = async () => {
    setLoading(true);
    setError(null);

    try {
      const trend = await healthApiService.getVitalSignTrends(currentType, period, days);
      setTrendData(trend);
    } catch (err) {
      setError(err instanceof Error ? err.message : '트렌드 데이터 로딩에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentRecords = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const records = await healthApiService.getVitalSigns(
        currentType,
        thirtyDaysAgo.toISOString(),
        undefined,
        10
      );
      setRecentRecords(records);
    } catch (err) {
      console.error('최근 기록 로딩 실패:', err);
    }
  };

  const handleTypeChange = (type: string) => {
    setCurrentType(type);
    onTypeChange?.(type);
  };

  const handlePeriodChange = (newPeriod: 'daily' | 'weekly' | 'monthly') => {
    setPeriod(newPeriod);
    const periodOption = periodOptions.find(p => p.value === newPeriod);
    if (periodOption) {
      setDays(periodOption.days);
    }
  };

  const getCurrentType = () => vitalSignTypes.find(type => type.value === currentType);

  const formatValue = (value: number | { systolic: number; diastolic: number }) => {
    if (typeof value === 'object' && 'systolic' in value) {
      return `${value.systolic}/${value.diastolic}`;
    }
    return value.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return '#EF4444';
      case 'decreasing': return '#10B981';
      case 'stable': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const renderChart = () => {
    if (!trendData || trendData.data.length === 0) {
      return (
        <div className="chart-placeholder">
          <div className="no-data">
            <span className="no-data-icon">📊</span>
            <p>표시할 데이터가 없습니다</p>
            <p className="no-data-subtitle">바이탈 사인을 기록하여 트렌드를 확인하세요</p>
          </div>
        </div>
      );
    }

    const currentTypeInfo = getCurrentType();
    if (!currentTypeInfo) return null;

    return (
      <TrendChart
        trendData={trendData}
        type={currentType}
        color={currentTypeInfo.color}
        unit={currentTypeInfo.unit}
      />
    );
  };

  return (
    <div className="vital-signs-tracker">
      {/* 헤더 */}
      <div className="tracker-header">
        <h3>바이탈 사인 추적</h3>
        <div className="header-controls">
          <div className="period-selector">
            {periodOptions.map(option => (
              <button
                key={option.value}
                className={`period-btn ${period === option.value ? 'active' : ''}`}
                onClick={() => handlePeriodChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 타입 선택 */}
      <div className="type-selector">
        {vitalSignTypes.map(type => (
          <button
            key={type.value}
            className={`type-card ${currentType === type.value ? 'active' : ''}`}
            onClick={() => handleTypeChange(type.value)}
          >
            <span className="type-icon">{type.icon}</span>
            <div className="type-info">
              <span className="type-label">{type.label}</span>
              <span className="type-unit">{type.unit}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 통계 요약 */}
      {trendData && (
        <div className="statistics-summary">
          <div className="stat-item">
            <span className="stat-label">평균</span>
            <span className="stat-value">{trendData.statistics.average}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">최소</span>
            <span className="stat-value">{trendData.statistics.min}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">최대</span>
            <span className="stat-value">{trendData.statistics.max}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">트렌드</span>
            <span 
              className="stat-value trend"
              style={{ color: getTrendColor(trendData.statistics.trend) }}
            >
              {getTrendIcon(trendData.statistics.trend)} {trendData.statistics.trend}
            </span>
          </div>
        </div>
      )}

      {/* 차트 영역 */}
      <div className="chart-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={loadTrendData}>
              다시 시도
            </button>
          </div>
        ) : (
          renderChart()
        )}
      </div>

      {/* 최근 기록 */}
      <div className="recent-records">
        <h4>최근 기록</h4>
        {recentRecords.length > 0 ? (
          <div className="records-list">
            {recentRecords.map(record => (
              <div key={record.id} className="record-item">
                <div className="record-value">
                  {formatValue(record.data.value)}
                  <span className="record-unit">{record.data.unit}</span>
                </div>
                <div className="record-date">
                  {formatDate(record.data.measuredAt)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-records">
            <p>최근 기록이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VitalSignsTracker;