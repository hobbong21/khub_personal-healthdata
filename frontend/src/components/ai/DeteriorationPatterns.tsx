import React, { useState } from 'react';
import { PredictionResult, HealthDeteriorationPattern } from '../../types/ai';
import './DeteriorationPatterns.css';

interface DeteriorationPatternsProps {
  prediction: PredictionResult;
}

interface PatternsData {
  patterns: HealthDeteriorationPattern[];
  alertLevel: string;
}

const DeteriorationPatterns: React.FC<DeteriorationPatternsProps> = ({ prediction }) => {
  const [selectedPattern, setSelectedPattern] = useState<HealthDeteriorationPattern | null>(null);
  
  const patternsData = prediction.predictionResult as PatternsData;
  const patterns = patternsData.patterns || [];

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'info': return '#2196F3';
      case 'warning': return '#FF9800';
      case 'critical': return '#F44336';
      default: return '#757575';
    }
  };

  const getAlertLevelText = (level: string) => {
    switch (level) {
      case 'info': return '정보';
      case 'warning': return '주의';
      case 'critical': return '위험';
      default: return level;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'severe': return '#F44336';
      default: return '#757575';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'mild': return '경미';
      case 'moderate': return '보통';
      case 'severe': return '심각';
      default: return severity;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return '📈';
      case 'stable': return '➡️';
      case 'declining': return '📉';
      default: return '📊';
    }
  };

  const getTrendText = (direction: string) => {
    switch (direction) {
      case 'improving': return '개선';
      case 'stable': return '안정';
      case 'declining': return '악화';
      default: return direction;
    }
  };

  const getPatternTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'systolicBP_trend': '수축기 혈압 추세',
      'diastolicBP_trend': '이완기 혈압 추세',
      'heartRate_trend': '심박수 추세',
      'weight_trend': '체중 추세',
      'bloodSugar_trend': '혈당 추세',
      'increasing_symptoms': '증상 증가',
      'overall_health_trend': '전반적 건강 추세',
    };
    return typeMap[type] || type;
  };

  const PatternCard: React.FC<{ pattern: HealthDeteriorationPattern }> = ({ pattern }) => (
    <div 
      className={`pattern-card ${selectedPattern?.patternType === pattern.patternType ? 'selected' : ''}`}
      onClick={() => setSelectedPattern(pattern)}
    >
      <div className="pattern-header">
        <div className="pattern-title">
          <span className="trend-icon">{getTrendIcon(pattern.trendDirection)}</span>
          <h4>{getPatternTypeText(pattern.patternType)}</h4>
        </div>
        <div className="pattern-badges">
          <span 
            className="alert-badge"
            style={{ backgroundColor: getAlertLevelColor(pattern.alertLevel) }}
          >
            {getAlertLevelText(pattern.alertLevel)}
          </span>
          <span 
            className="severity-badge"
            style={{ backgroundColor: getSeverityColor(pattern.severity) }}
          >
            {getSeverityText(pattern.severity)}
          </span>
        </div>
      </div>

      <div className="pattern-details">
        <div className="pattern-metrics">
          <div className="metric-item">
            <span className="metric-label">추세</span>
            <span className="metric-value">
              {getTrendIcon(pattern.trendDirection)} {getTrendText(pattern.trendDirection)}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">기간</span>
            <span className="metric-value">{pattern.timeframe}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">신뢰도</span>
            <span className="metric-value">{Math.round(pattern.confidence * 100)}%</span>
          </div>
        </div>

        <div className="affected-metrics">
          <span className="metrics-label">영향받는 지표:</span>
          <div className="metrics-tags">
            {pattern.affectedMetrics.map((metric, index) => (
              <span key={index} className="metric-tag">
                {metric}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const PatternDetails: React.FC<{ pattern: HealthDeteriorationPattern }> = ({ pattern }) => (
    <div className="pattern-details-panel">
      <div className="details-header">
        <h3>{getPatternTypeText(pattern.patternType)} 상세 분석</h3>
        <button 
          className="close-details"
          onClick={() => setSelectedPattern(null)}
        >
          ✕
        </button>
      </div>

      <div className="details-content">
        <div className="pattern-summary">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">패턴 유형</span>
              <span className="summary-value">{getPatternTypeText(pattern.patternType)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">심각도</span>
              <span 
                className="summary-value severity-value"
                style={{ color: getSeverityColor(pattern.severity) }}
              >
                {getSeverityText(pattern.severity)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">경고 수준</span>
              <span 
                className="summary-value alert-value"
                style={{ color: getAlertLevelColor(pattern.alertLevel) }}
              >
                {getAlertLevelText(pattern.alertLevel)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">추세 방향</span>
              <span className="summary-value">
                {getTrendIcon(pattern.trendDirection)} {getTrendText(pattern.trendDirection)}
              </span>
            </div>
          </div>
        </div>

        <div className="pattern-analysis">
          <h4>분석 결과</h4>
          <div className="analysis-content">
            <div className="confidence-meter">
              <span className="confidence-label">분석 신뢰도</span>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${pattern.confidence * 100}%` }}
                />
              </div>
              <span className="confidence-value">{Math.round(pattern.confidence * 100)}%</span>
            </div>

            <div className="timeframe-info">
              <span className="timeframe-label">관찰 기간</span>
              <span className="timeframe-value">{pattern.timeframe}</span>
            </div>
          </div>
        </div>

        <div className="affected-metrics-detail">
          <h4>영향받는 건강 지표</h4>
          <div className="metrics-list">
            {pattern.affectedMetrics.map((metric, index) => (
              <div key={index} className="metric-detail-item">
                <span className="metric-name">{metric}</span>
                <span className="metric-status">
                  {pattern.trendDirection === 'declining' ? '악화 중' : 
                   pattern.trendDirection === 'improving' ? '개선 중' : '안정'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="recommendations-section">
          <h4>권장 조치사항</h4>
          <div className="recommendations-list">
            {pattern.alertLevel === 'critical' && (
              <div className="recommendation-item critical">
                <span className="rec-icon">🚨</span>
                <span className="rec-text">즉시 의료진과 상담하시기 바랍니다.</span>
              </div>
            )}
            {pattern.alertLevel === 'warning' && (
              <div className="recommendation-item warning">
                <span className="rec-icon">⚠️</span>
                <span className="rec-text">건강 상태를 면밀히 모니터링하고 필요시 의료진과 상담하세요.</span>
              </div>
            )}
            <div className="recommendation-item">
              <span className="rec-icon">📊</span>
              <span className="rec-text">해당 지표를 더 자주 측정하여 추세를 확인하세요.</span>
            </div>
            <div className="recommendation-item">
              <span className="rec-icon">📝</span>
              <span className="rec-text">건강 일지에 관련 증상이나 변화를 기록하세요.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (patterns.length === 0) {
    return (
      <div className="deterioration-patterns no-patterns">
        <div className="no-patterns-content">
          <div className="no-patterns-icon">✅</div>
          <h3>건강 악화 패턴이 감지되지 않았습니다</h3>
          <p>현재 건강 데이터에서 우려할 만한 악화 패턴이 발견되지 않았습니다. 계속해서 건강한 생활습관을 유지하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="deterioration-patterns">
      <div className="patterns-header">
        <div className="overall-alert">
          <div className="alert-indicator">
            <span 
              className="alert-level-badge large"
              style={{ backgroundColor: getAlertLevelColor(patternsData.alertLevel) }}
            >
              {getAlertLevelText(patternsData.alertLevel)}
            </span>
          </div>
          <div className="alert-summary">
            <h3>전체 경고 수준: {getAlertLevelText(patternsData.alertLevel)}</h3>
            <p>{patterns.length}개의 건강 패턴이 감지되었습니다.</p>
          </div>
        </div>

        <div className="patterns-stats">
          <div className="stat-item">
            <span className="stat-number">
              {patterns.filter(p => p.alertLevel === 'critical').length}
            </span>
            <span className="stat-label">위험</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {patterns.filter(p => p.alertLevel === 'warning').length}
            </span>
            <span className="stat-label">주의</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {patterns.filter(p => p.alertLevel === 'info').length}
            </span>
            <span className="stat-label">정보</span>
          </div>
        </div>
      </div>

      <div className="patterns-content">
        <div className="patterns-grid">
          {patterns.map((pattern, index) => (
            <PatternCard key={index} pattern={pattern} />
          ))}
        </div>

        {selectedPattern && (
          <PatternDetails pattern={selectedPattern} />
        )}
      </div>

      <div className="patterns-footer">
        <div className="footer-info">
          <span className="analysis-date">
            분석일: {new Date(prediction.createdAt).toLocaleDateString('ko-KR')}
          </span>
          <span className="confidence-score">
            전체 신뢰도: {Math.round(prediction.confidenceScore * 100)}%
          </span>
        </div>
        <div className="footer-note">
          <p>
            💡 패턴을 클릭하면 상세 분석을 확인할 수 있습니다. 
            위험 또는 주의 수준의 패턴이 있다면 의료진과 상담하시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeteriorationPatterns;