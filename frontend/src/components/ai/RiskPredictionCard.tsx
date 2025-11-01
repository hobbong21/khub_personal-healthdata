import React from 'react';
import { PredictionResult, HealthRiskPrediction } from '../../types/ai';
import './RiskPredictionCard.css';

interface RiskPredictionCardProps {
  title: string;
  prediction: PredictionResult;
  onRefresh?: () => void;
}

const RiskPredictionCard: React.FC<RiskPredictionCardProps> = ({
  title,
  prediction,
  onRefresh
}) => {
  const riskData = prediction.predictionResult as HealthRiskPrediction;
  
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'high': return '#FF5722';
      case 'very_high': return '#D32F2F';
      default: return '#757575';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'low': return '낮음';
      case 'moderate': return '보통';
      case 'high': return '높음';
      case 'very_high': return '매우 높음';
      default: return '알 수 없음';
    }
  };

  const getTimeframeText = (timeframe: string) => {
    switch (timeframe) {
      case '1_year': return '1년';
      case '5_years': return '5년';
      case '10_years': return '10년';
      case 'lifetime': return '평생';
      default: return timeframe;
    }
  };

  const riskPercentage = Math.round(riskData.riskScore * 100);

  return (
    <div className="risk-prediction-card">
      <div className="card-header">
        <h3>{title}</h3>
        {onRefresh && (
          <button onClick={onRefresh} className="refresh-btn" title="새로고침">
            🔄
          </button>
        )}
      </div>

      <div className="risk-score-section">
        <div className="risk-score-circle">
          <svg viewBox="0 0 100 100" className="risk-circle">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getRiskLevelColor(riskData.riskLevel)}
              strokeWidth="8"
              strokeDasharray={`${riskPercentage * 2.83} 283`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="risk-score-text">
            <span className="risk-percentage">{riskPercentage}%</span>
            <span className="risk-label">위험도</span>
          </div>
        </div>

        <div className="risk-details">
          <div className="risk-level">
            <span 
              className="risk-level-badge"
              style={{ backgroundColor: getRiskLevelColor(riskData.riskLevel) }}
            >
              {getRiskLevelText(riskData.riskLevel)}
            </span>
          </div>
          <div className="risk-timeframe">
            {getTimeframeText(riskData.timeframe)} 내 발생 가능성
          </div>
          <div className="confidence-score">
            신뢰도: {Math.round(riskData.confidence * 100)}%
          </div>
        </div>
      </div>

      <div className="contributing-factors">
        <h4>기여 요인</h4>
        <div className="factors-grid">
          <div className="factor-item">
            <span className="factor-label">유전적 요인</span>
            <div className="factor-bar">
              <div 
                className="factor-fill"
                style={{ 
                  width: `${riskData.contributingFactors.genetic * 100}%`,
                  backgroundColor: '#9C27B0'
                }}
              />
            </div>
            <span className="factor-value">
              {Math.round(riskData.contributingFactors.genetic * 100)}%
            </span>
          </div>
          
          <div className="factor-item">
            <span className="factor-label">생활습관</span>
            <div className="factor-bar">
              <div 
                className="factor-fill"
                style={{ 
                  width: `${riskData.contributingFactors.lifestyle * 100}%`,
                  backgroundColor: '#FF9800'
                }}
              />
            </div>
            <span className="factor-value">
              {Math.round(riskData.contributingFactors.lifestyle * 100)}%
            </span>
          </div>
          
          <div className="factor-item">
            <span className="factor-label">병력</span>
            <div className="factor-bar">
              <div 
                className="factor-fill"
                style={{ 
                  width: `${riskData.contributingFactors.medical_history * 100}%`,
                  backgroundColor: '#F44336'
                }}
              />
            </div>
            <span className="factor-value">
              {Math.round(riskData.contributingFactors.medical_history * 100)}%
            </span>
          </div>
          
          <div className="factor-item">
            <span className="factor-label">가족력</span>
            <div className="factor-bar">
              <div 
                className="factor-fill"
                style={{ 
                  width: `${riskData.contributingFactors.family_history * 100}%`,
                  backgroundColor: '#3F51B5'
                }}
              />
            </div>
            <span className="factor-value">
              {Math.round(riskData.contributingFactors.family_history * 100)}%
            </span>
          </div>
        </div>
      </div>

      {riskData.recommendations && riskData.recommendations.length > 0 && (
        <div className="recommendations-preview">
          <h4>주요 권장사항</h4>
          <ul className="recommendations-list">
            {riskData.recommendations.slice(0, 3).map((recommendation, index) => (
              <li key={index} className="recommendation-item">
                {recommendation}
              </li>
            ))}
          </ul>
          {riskData.recommendations.length > 3 && (
            <div className="more-recommendations">
              +{riskData.recommendations.length - 3}개 더 보기
            </div>
          )}
        </div>
      )}

      <div className="card-footer">
        <div className="prediction-info">
          <span className="prediction-date">
            분석일: {new Date(prediction.createdAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiskPredictionCard;