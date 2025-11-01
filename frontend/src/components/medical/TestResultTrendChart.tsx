import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TestResultApi, TestResultTrend } from '../../services/testResultApi';
import './TestResultTrendChart.css';

interface TestResultTrendChartProps {
  testNames: string[];
  onTestNamesChange?: (testNames: string[]) => void;
}

export const TestResultTrendChart: React.FC<TestResultTrendChartProps> = ({
  testNames,
  onTestNamesChange
}) => {
  const [trends, setTrends] = useState<TestResultTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrend, setSelectedTrend] = useState<TestResultTrend | null>(null);

  // 트렌드 데이터 로드 (요구사항 8.4, 8.5)
  const loadTrends = async () => {
    if (testNames.length === 0) {
      setTrends([]);
      return;
    }

    try {
      setLoading(true);
      const trendData = await TestResultApi.getTestResultTrends(testNames);
      setTrends(trendData);
      
      if (trendData.length > 0 && !selectedTrend) {
        setSelectedTrend(trendData[0]);
      }
      
      setError(null);
    } catch (err) {
      setError('트렌드 데이터를 불러오는데 실패했습니다.');
      console.error('트렌드 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends();
  }, [testNames]);

  // 트렌드 색상 결정
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#10B981'; // 녹색
      case 'worsening': return '#EF4444'; // 빨간색
      case 'stable': return '#6B7280'; // 회색
      case 'fluctuating': return '#F59E0B'; // 주황색
      default: return '#6366F1'; // 기본 파란색
    }
  };

  // 상태별 점 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#10B981';
      case 'abnormal': return '#F59E0B';
      case 'critical': return '#EF4444';
      case 'borderline': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  // 차트 데이터 포맷팅
  const formatChartData = (trend: TestResultTrend) => {
    return trend.dataPoints.map(point => ({
      date: new Date(point.date).toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fullDate: point.date,
      value: point.value,
      status: point.status,
      referenceMin: point.referenceRange.min,
      referenceMax: point.referenceRange.max,
      statusColor: getStatusColor(point.status)
    }));
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="trend-tooltip">
          <p className="tooltip-date">{label}</p>
          <p className="tooltip-value">
            <span className="tooltip-label">값:</span>
            <span className="tooltip-number">
              {data.value} {selectedTrend?.unit}
            </span>
          </p>
          <p className="tooltip-status">
            <span className="tooltip-label">상태:</span>
            <span className={`status-badge ${data.status}`}>
              {getStatusLabel(data.status)}
            </span>
          </p>
          {data.referenceMin !== undefined && data.referenceMax !== undefined && (
            <p className="tooltip-reference">
              <span className="tooltip-label">정상범위:</span>
              <span className="tooltip-number">
                {data.referenceMin} - {data.referenceMax} {selectedTrend?.unit}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // 상태 라벨 변환
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      normal: '정상',
      abnormal: '비정상',
      critical: '위험',
      borderline: '경계',
      pending: '대기'
    };
    return labels[status] || status;
  };

  // 트렌드 아이콘
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'worsening': return '📉';
      case 'stable': return '➡️';
      case 'fluctuating': return '📊';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <div className="trend-chart-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>트렌드 데이터를 분석하는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trend-chart-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadTrends} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="trend-chart-container">
        <div className="empty-state">
          <p>트렌드를 분석할 검사 결과가 없습니다.</p>
          <p>최소 2개 이상의 검사 결과가 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trend-chart-container">
      {/* 검사 선택 탭 */}
      <div className="trend-tabs">
        {trends.map((trend, index) => (
          <button
            key={index}
            className={`trend-tab ${selectedTrend?.testName === trend.testName ? 'active' : ''}`}
            onClick={() => setSelectedTrend(trend)}
          >
            <span className="trend-icon">{getTrendIcon(trend.trend)}</span>
            <span className="trend-name">{trend.testName}</span>
            <span className={`trend-indicator ${trend.trend}`}>
              {trend.changePercentage !== undefined && (
                <span className="trend-percentage">
                  {trend.changePercentage > 0 ? '+' : ''}{trend.changePercentage.toFixed(1)}%
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {selectedTrend && (
        <div className="trend-chart-content">
          {/* 트렌드 정보 */}
          <div className="trend-info">
            <div className="trend-header">
              <h3>{selectedTrend.testName}</h3>
              <div className="trend-badges">
                <span className={`trend-badge ${selectedTrend.trend}`}>
                  {getTrendIcon(selectedTrend.trend)}
                  {selectedTrend.trend === 'improving' && '개선'}
                  {selectedTrend.trend === 'worsening' && '악화'}
                  {selectedTrend.trend === 'stable' && '안정'}
                  {selectedTrend.trend === 'fluctuating' && '변동'}
                </span>
                {selectedTrend.unit && (
                  <span className="unit-badge">단위: {selectedTrend.unit}</span>
                )}
              </div>
            </div>

            {/* 전년도 대비 변화 */}
            {selectedTrend.lastYearComparison && (
              <div className="year-comparison">
                <h4>전년도 대비 변화</h4>
                <div className="comparison-stats">
                  <div className="stat-item">
                    <span className="stat-label">현재값</span>
                    <span className="stat-value">
                      {selectedTrend.lastYearComparison.currentValue} {selectedTrend.unit}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">이전값</span>
                    <span className="stat-value">
                      {selectedTrend.lastYearComparison.previousValue} {selectedTrend.unit}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">변화율</span>
                    <span className={`stat-value ${selectedTrend.lastYearComparison.changePercentage >= 0 ? 'positive' : 'negative'}`}>
                      {selectedTrend.lastYearComparison.changePercentage > 0 ? '+' : ''}
                      {selectedTrend.lastYearComparison.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                  {selectedTrend.lastYearComparison.isSignificant && (
                    <div className="significance-badge">
                      유의미한 변화
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 차트 */}
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={formatChartData(selectedTrend)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* 정상 범위 표시 */}
                {selectedTrend.dataPoints[0]?.referenceRange.min !== undefined && (
                  <ReferenceLine 
                    y={selectedTrend.dataPoints[0].referenceRange.min} 
                    stroke="#10B981" 
                    strokeDasharray="5 5"
                    label="최소 정상값"
                  />
                )}
                {selectedTrend.dataPoints[0]?.referenceRange.max !== undefined && (
                  <ReferenceLine 
                    y={selectedTrend.dataPoints[0].referenceRange.max} 
                    stroke="#10B981" 
                    strokeDasharray="5 5"
                    label="최대 정상값"
                  />
                )}
                
                {/* 트렌드 라인 */}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={getTrendColor(selectedTrend.trend)}
                  strokeWidth={2}
                  dot={{ fill: getTrendColor(selectedTrend.trend), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: getTrendColor(selectedTrend.trend), strokeWidth: 2 }}
                  name={`${selectedTrend.testName} (${selectedTrend.unit || ''})`}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 데이터 포인트 요약 */}
          <div className="data-summary">
            <div className="summary-stats">
              <div className="summary-item">
                <span className="summary-label">총 측정 횟수</span>
                <span className="summary-value">{selectedTrend.dataPoints.length}회</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">최근 측정값</span>
                <span className="summary-value">
                  {selectedTrend.dataPoints[selectedTrend.dataPoints.length - 1]?.value} {selectedTrend.unit}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">측정 기간</span>
                <span className="summary-value">
                  {new Date(selectedTrend.dataPoints[0]?.date).toLocaleDateString('ko-KR')} ~ 
                  {new Date(selectedTrend.dataPoints[selectedTrend.dataPoints.length - 1]?.date).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};