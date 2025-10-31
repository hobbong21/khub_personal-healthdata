import React, { useState, useEffect } from 'react';
import { VitalSignResponse, HealthRecordResponse } from '../../types/health';
import healthApiService from '../../services/healthApi';
import TrendChart from './TrendChart';

interface HealthDataDashboardProps {
  refreshKey?: number;
}

const HealthDataDashboard: React.FC<HealthDataDashboardProps> = ({ refreshKey }) => {
  const [healthSummary, setHealthSummary] = useState<any>(null);
  const [recentVitals, setRecentVitals] = useState<VitalSignResponse[]>([]);
  const [recentJournals, setRecentJournals] = useState<HealthRecordResponse[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [trendData, setTrendData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vitalSignTypes = [
    { value: 'weight', label: '체중', unit: 'kg', icon: '⚖️', color: '#3B82F6' },
    { value: 'blood_pressure', label: '혈압', unit: 'mmHg', icon: '🩺', color: '#EF4444' },
    { value: 'heart_rate', label: '맥박', unit: 'BPM', icon: '❤️', color: '#F59E0B' },
    { value: 'temperature', label: '체온', unit: '°C', icon: '🌡️', color: '#10B981' },
    { value: 'blood_sugar', label: '혈당', unit: 'mg/dL', icon: '🩸', color: '#8B5CF6' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, [refreshKey]);

  useEffect(() => {
    if (selectedMetric) {
      loadTrendData();
    }
  }, [selectedMetric]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summary, vitals, journals] = await Promise.all([
        healthApiService.getHealthSummary(),
        healthApiService.getVitalSigns(undefined, undefined, undefined, 5),
        healthApiService.getHealthJournals(undefined, undefined, 3)
      ]);

      setHealthSummary(summary);
      setRecentVitals(vitals);
      setRecentJournals(journals);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로딩에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const loadTrendData = async () => {
    try {
      const trend = await healthApiService.getVitalSignTrends(selectedMetric, 'daily', 14);
      setTrendData(trend);
    } catch (err) {
      console.error('트렌드 데이터 로딩 실패:', err);
    }
  };

  const formatValue = (value: number | { systolic: number; diastolic: number }) => {
    if (typeof value === 'object' && 'systolic' in value) {
      return `${value.systolic}/${value.diastolic}`;
    }
    return value.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '오늘';
    if (diffDays === 2) return '어제';
    if (diffDays <= 7) return `${diffDays - 1}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getConditionEmoji = (rating: number) => {
    const emojiMap = { 1: '😰', 2: '😔', 3: '😐', 4: '🙂', 5: '😊' };
    return emojiMap[rating as keyof typeof emojiMap] || '😐';
  };

  const getConditionLabel = (rating: number) => {
    const labelMap = { 1: '매우 나쁨', 2: '나쁨', 3: '보통', 4: '좋음', 5: '매우 좋음' };
    return labelMap[rating as keyof typeof labelMap] || '보통';
  };

  const getCurrentMetric = () => vitalSignTypes.find(type => type.value === selectedMetric);

  if (loading) {
    return (
      <div className="health-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>건강 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-dashboard error">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="retry-btn">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="health-dashboard">
      {/* 요약 카드 섹션 */}
      <div className="summary-section">
        <h3>건강 현황 요약</h3>
        <div className="summary-cards">
          {/* 최신 바이탈 사인 카드 */}
          <div className="summary-card vitals-card">
            <div className="card-header">
              <h4>최신 바이탈 사인</h4>
              <span className="card-icon">📊</span>
            </div>
            <div className="card-content">
              {healthSummary?.latestVitalSigns && Object.keys(healthSummary.latestVitalSigns).length > 0 ? (
                <div className="vitals-grid">
                  {Object.entries(healthSummary.latestVitalSigns).map(([type, data]: [string, any]) => {
                    const typeInfo = vitalSignTypes.find(t => t.value === type);
                    if (!typeInfo) return null;
                    
                    return (
                      <div key={type} className="vital-item">
                        <span className="vital-icon">{typeInfo.icon}</span>
                        <div className="vital-info">
                          <span className="vital-label">{typeInfo.label}</span>
                          <span className="vital-value">
                            {formatValue(data.value)} {data.unit}
                          </span>
                          <span className="vital-date">
                            {formatDate(data.recordedDate)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-data">
                  <p>아직 기록된 바이탈 사인이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          {/* 평균 컨디션 카드 */}
          <div className="summary-card condition-card">
            <div className="card-header">
              <h4>평균 컨디션</h4>
              <span className="card-icon">😊</span>
            </div>
            <div className="card-content">
              {healthSummary?.averageCondition ? (
                <div className="condition-display">
                  <div className="condition-score">
                    <span className="condition-emoji">
                      {getConditionEmoji(Math.round(healthSummary.averageCondition))}
                    </span>
                    <div className="condition-details">
                      <span className="condition-value">
                        {healthSummary.averageCondition.toFixed(1)}/5.0
                      </span>
                      <span className="condition-label">
                        {getConditionLabel(Math.round(healthSummary.averageCondition))}
                      </span>
                    </div>
                  </div>
                  <div className="condition-period">
                    최근 {healthSummary.period}
                  </div>
                </div>
              ) : (
                <div className="no-data">
                  <p>아직 기록된 건강 일지가 없습니다</p>
                </div>
              )}
            </div>
          </div>

          {/* 총 기록 수 카드 */}
          <div className="summary-card records-card">
            <div className="card-header">
              <h4>총 기록 수</h4>
              <span className="card-icon">📝</span>
            </div>
            <div className="card-content">
              <div className="records-count">
                <span className="count-number">{healthSummary?.totalRecords || 0}</span>
                <span className="count-label">개 기록</span>
              </div>
              <div className="records-period">
                최근 {healthSummary?.period || '30일'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 트렌드 차트 섹션 */}
      <div className="trend-section">
        <div className="section-header">
          <h3>건강 트렌드</h3>
          <div className="metric-selector">
            {vitalSignTypes.map(type => (
              <button
                key={type.value}
                className={`metric-btn ${selectedMetric === type.value ? 'active' : ''}`}
                onClick={() => setSelectedMetric(type.value)}
                style={{
                  borderColor: selectedMetric === type.value ? type.color : 'var(--border-color)',
                  backgroundColor: selectedMetric === type.value ? `${type.color}20` : 'transparent'
                }}
              >
                <span className="metric-icon">{type.icon}</span>
                <span className="metric-label">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="chart-container">
          {trendData && trendData.data.length > 0 ? (
            <TrendChart
              trendData={trendData}
              type={selectedMetric}
              color={getCurrentMetric()?.color || '#3B82F6'}
              unit={getCurrentMetric()?.unit || ''}
            />
          ) : (
            <div className="chart-placeholder">
              <div className="no-data">
                <span className="no-data-icon">📈</span>
                <p>선택한 지표의 데이터가 없습니다</p>
                <p className="no-data-subtitle">바이탈 사인을 기록하여 트렌드를 확인하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 최근 활동 섹션 */}
      <div className="recent-activity-section">
        <h3>최근 활동</h3>
        <div className="activity-grid">
          {/* 최근 바이탈 사인 */}
          <div className="activity-card">
            <h4>최근 바이탈 사인</h4>
            {recentVitals.length > 0 ? (
              <div className="activity-list">
                {recentVitals.slice(0, 3).map(vital => {
                  const typeInfo = vitalSignTypes.find(t => t.value === vital.data.type);
                  return (
                    <div key={vital.id} className="activity-item">
                      <span className="activity-icon">{typeInfo?.icon || '📊'}</span>
                      <div className="activity-info">
                        <span className="activity-title">
                          {typeInfo?.label || vital.data.type}
                        </span>
                        <span className="activity-value">
                          {formatValue(vital.data.value)} {vital.data.unit}
                        </span>
                        <span className="activity-date">
                          {formatDate(vital.data.measuredAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-activity">
                <p>최근 바이탈 사인 기록이 없습니다</p>
              </div>
            )}
          </div>

          {/* 최근 건강 일지 */}
          <div className="activity-card">
            <h4>최근 건강 일지</h4>
            {recentJournals.length > 0 ? (
              <div className="activity-list">
                {recentJournals.slice(0, 3).map(journal => {
                  const data = journal.data as any;
                  return (
                    <div key={journal.id} className="activity-item">
                      <span className="activity-icon">
                        {getConditionEmoji(data.conditionRating)}
                      </span>
                      <div className="activity-info">
                        <span className="activity-title">
                          컨디션: {getConditionLabel(data.conditionRating)}
                        </span>
                        {data.exercise && data.exercise.length > 0 && (
                          <span className="activity-detail">
                            운동: {data.exercise[0].type} {data.exercise[0].duration}분
                          </span>
                        )}
                        <span className="activity-date">
                          {formatDate(journal.recordedDate)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-activity">
                <p>최근 건강 일지 기록이 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDataDashboard;