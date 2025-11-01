import React, { useState } from 'react';
import { PredictionResult, RiskFactorAnalysis as RiskFactorAnalysisType, RiskFactor } from '../../types/ai';
import './RiskFactorAnalysis.css';

interface RiskFactorAnalysisProps {
  prediction: PredictionResult;
}

const RiskFactorAnalysis: React.FC<RiskFactorAnalysisProps> = ({ prediction }) => {
  const [activeTab, setActiveTab] = useState<'risk' | 'protective'>('risk');
  const analysisData = prediction.predictionResult as RiskFactorAnalysisType;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'high': return '#FF5722';
      case 'critical': return '#D32F2F';
      default: return '#757575';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low': return '낮음';
      case 'moderate': return '보통';
      case 'high': return '높음';
      case 'critical': return '심각';
      default: return severity;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lifestyle': return '🏃‍♂️';
      case 'medical': return '🏥';
      case 'genetic': return '🧬';
      case 'environmental': return '🌍';
      default: return '📊';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'lifestyle': return '생활습관';
      case 'medical': return '의학적';
      case 'genetic': return '유전적';
      case 'environmental': return '환경적';
      default: return category;
    }
  };

  const getTimeToImpactText = (timeToImpact: string) => {
    switch (timeToImpact) {
      case 'immediate': return '즉시';
      case 'short_term': return '단기';
      case 'medium_term': return '중기';
      case 'long_term': return '장기';
      default: return timeToImpact;
    }
  };

  const getRiskTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'stable': return '➡️';
      case 'decreasing': return '📉';
      default: return '📊';
    }
  };

  const getRiskTrendText = (trend: string) => {
    switch (trend) {
      case 'increasing': return '증가';
      case 'stable': return '안정';
      case 'decreasing': return '감소';
      default: return trend;
    }
  };

  const RiskFactorCard: React.FC<{ factor: RiskFactor }> = ({ factor }) => (
    <div className="risk-factor-card">
      <div className="factor-header">
        <div className="factor-title">
          <span className="factor-icon">{getCategoryIcon(factor.category)}</span>
          <h4>{factor.name}</h4>
          {factor.modifiable && <span className="modifiable-badge">수정 가능</span>}
        </div>
        <div className="factor-severity">
          <span 
            className="severity-badge"
            style={{ backgroundColor: getSeverityColor(factor.severity) }}
          >
            {getSeverityText(factor.severity)}
          </span>
        </div>
      </div>

      <div className="factor-details">
        <div className="factor-meta">
          <span className="factor-category">
            {getCategoryText(factor.category)}
          </span>
          <span className="factor-impact">
            영향도: {Math.round(factor.impact * 100)}%
          </span>
          <span className="factor-timing">
            {getTimeToImpactText(factor.timeToImpact)} 영향
          </span>
        </div>

        <div className="factor-description">
          <p>{factor.description}</p>
        </div>

        {factor.recommendations && factor.recommendations.length > 0 && (
          <div className="factor-recommendations">
            <h5>권장사항</h5>
            <ul>
              {factor.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="risk-factor-analysis">
      <div className="analysis-header">
        <div className="overall-risk">
          <div className="risk-score-display">
            <span className="risk-score-number">
              {Math.round(analysisData.totalRiskScore * 100)}
            </span>
            <span className="risk-score-label">전체 위험 점수</span>
          </div>
          <div className="risk-trend">
            <span className="trend-icon">{getRiskTrendIcon(analysisData.riskTrend)}</span>
            <span className="trend-text">
              위험도 추세: {getRiskTrendText(analysisData.riskTrend)}
            </span>
          </div>
        </div>

        <div className="analysis-stats">
          <div className="stat-item">
            <span className="stat-number">{analysisData.riskFactors.length}</span>
            <span className="stat-label">위험 요인</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{analysisData.protectiveFactors.length}</span>
            <span className="stat-label">보호 요인</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{analysisData.priorityActions.length}</span>
            <span className="stat-label">우선 조치</span>
          </div>
        </div>
      </div>

      {analysisData.priorityActions && analysisData.priorityActions.length > 0 && (
        <div className="priority-actions">
          <h3>우선 조치 사항</h3>
          <div className="actions-list">
            {analysisData.priorityActions.map((action, index) => (
              <div key={index} className="action-item">
                <span className="action-number">{index + 1}</span>
                <span className="action-text">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="factors-section">
        <div className="factors-tabs">
          <button
            className={`tab-button ${activeTab === 'risk' ? 'active' : ''}`}
            onClick={() => setActiveTab('risk')}
          >
            위험 요인 ({analysisData.riskFactors.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'protective' ? 'active' : ''}`}
            onClick={() => setActiveTab('protective')}
          >
            보호 요인 ({analysisData.protectiveFactors.length})
          </button>
        </div>

        <div className="factors-content">
          {activeTab === 'risk' && (
            <div className="risk-factors">
              {analysisData.riskFactors.length > 0 ? (
                <div className="factors-grid">
                  {analysisData.riskFactors.map((factor, index) => (
                    <RiskFactorCard key={index} factor={factor} />
                  ))}
                </div>
              ) : (
                <div className="no-factors">
                  <p>식별된 위험 요인이 없습니다. 좋은 건강 상태를 유지하고 계십니다!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'protective' && (
            <div className="protective-factors">
              {analysisData.protectiveFactors.length > 0 ? (
                <div className="factors-grid">
                  {analysisData.protectiveFactors.map((factor, index) => (
                    <RiskFactorCard key={index} factor={factor} />
                  ))}
                </div>
              ) : (
                <div className="no-factors">
                  <p>보호 요인을 늘려 건강을 더욱 개선할 수 있습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="analysis-footer">
        <div className="analysis-info">
          <span className="analysis-date">
            분석일: {new Date(prediction.createdAt).toLocaleDateString('ko-KR')}
          </span>
          <span className="confidence-score">
            신뢰도: {Math.round(prediction.confidenceScore * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiskFactorAnalysis;