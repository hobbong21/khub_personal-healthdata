import React, { useState } from 'react';
import './RecommendationCard.css';

interface RecommendationItem {
  category: 'nutrition' | 'exercise' | 'screening' | 'lifestyle';
  priority: 'low' | 'medium' | 'high';
  reason: string;
  geneticBasis?: string[];
  // Nutrition specific
  nutrientName?: string;
  recommendedAmount?: string;
  sources?: string[];
  // Exercise specific
  exerciseType?: string;
  frequency?: string;
  duration?: string;
  intensity?: 'low' | 'moderate' | 'high';
  precautions?: string[];
  // Screening specific
  testName?: string;
  nextDueDate?: Date;
  riskFactors?: string[];
  ageRange?: { min: number; max?: number };
  // Lifestyle specific
  recommendation?: string;
  difficulty?: 'easy' | 'moderate' | 'challenging';
  expectedBenefit?: string;
  timeframe?: string;
}

interface Props {
  recommendation: RecommendationItem;
  recommendationId: string;
  onImplementation: (recommendationId: string, category: string, implemented: boolean) => void;
  onFeedback: (recommendationId: string, category: string, rating: number, comments?: string) => void;
}

const RecommendationCard: React.FC<Props> = ({
  recommendation,
  recommendationId,
  onImplementation,
  onFeedback,
}) => {
  const [isImplemented, setIsImplemented] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nutrition': return '🥗';
      case 'exercise': return '🏃‍♂️';
      case 'screening': return '🔬';
      case 'lifestyle': return '🌱';
      default: return '📋';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'nutrition': return '영양';
      case 'exercise': return '운동';
      case 'screening': return '검진';
      case 'lifestyle': return '생활습관';
      default: return '기타';
    }
  };

  const getTitle = () => {
    switch (recommendation.category) {
      case 'nutrition':
        return recommendation.nutrientName || '영양 권장사항';
      case 'exercise':
        return recommendation.exerciseType || '운동 권장사항';
      case 'screening':
        return recommendation.testName || '검진 권장사항';
      case 'lifestyle':
        return recommendation.recommendation || '생활습관 권장사항';
      default:
        return '권장사항';
    }
  };

  const handleImplementationToggle = () => {
    const newImplemented = !isImplemented;
    setIsImplemented(newImplemented);
    onImplementation(recommendationId, recommendation.category, newImplemented);
    
    if (newImplemented) {
      setShowFeedback(true);
    }
  };

  const handleFeedbackSubmit = () => {
    if (rating > 0) {
      onFeedback(recommendationId, recommendation.category, rating, comments);
      setShowFeedback(false);
      setRating(0);
      setComments('');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`recommendation-card ${recommendation.category}`}>
      <div className="card-header">
        <div className="header-left">
          <span className="category-icon">{getCategoryIcon(recommendation.category)}</span>
          <div className="header-info">
            <h3 className="card-title">{getTitle()}</h3>
            <span className="category-label">{getCategoryName(recommendation.category)}</span>
          </div>
        </div>
        <div className="header-right">
          <span 
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(recommendation.priority) }}
          >
            {getPriorityIcon(recommendation.priority)} {recommendation.priority}
          </span>
        </div>
      </div>

      <div className="card-content">
        <div className="main-info">
          {recommendation.category === 'nutrition' && (
            <div className="nutrition-info">
              {recommendation.recommendedAmount && (
                <div className="info-item">
                  <strong>권장량:</strong> {recommendation.recommendedAmount}
                </div>
              )}
              {recommendation.sources && recommendation.sources.length > 0 && (
                <div className="info-item">
                  <strong>공급원:</strong> {recommendation.sources.join(', ')}
                </div>
              )}
            </div>
          )}

          {recommendation.category === 'exercise' && (
            <div className="exercise-info">
              {recommendation.frequency && (
                <div className="info-item">
                  <strong>빈도:</strong> {recommendation.frequency}
                </div>
              )}
              {recommendation.duration && (
                <div className="info-item">
                  <strong>시간:</strong> {recommendation.duration}
                </div>
              )}
              {recommendation.intensity && (
                <div className="info-item">
                  <strong>강도:</strong> {recommendation.intensity}
                </div>
              )}
            </div>
          )}

          {recommendation.category === 'screening' && (
            <div className="screening-info">
              {recommendation.frequency && (
                <div className="info-item">
                  <strong>주기:</strong> {recommendation.frequency}
                </div>
              )}
              {recommendation.nextDueDate && (
                <div className="info-item">
                  <strong>다음 예정일:</strong> {formatDate(recommendation.nextDueDate)}
                </div>
              )}
            </div>
          )}

          {recommendation.category === 'lifestyle' && (
            <div className="lifestyle-info">
              {recommendation.difficulty && (
                <div className="info-item">
                  <strong>난이도:</strong> {recommendation.difficulty}
                </div>
              )}
              {recommendation.timeframe && (
                <div className="info-item">
                  <strong>기간:</strong> {recommendation.timeframe}
                </div>
              )}
              {recommendation.expectedBenefit && (
                <div className="info-item">
                  <strong>기대효과:</strong> {recommendation.expectedBenefit}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="reason-section">
          <strong>이유:</strong> {recommendation.reason}
        </div>

        {isExpanded && (
          <div className="expanded-content">
            {recommendation.geneticBasis && recommendation.geneticBasis.length > 0 && (
              <div className="genetic-basis">
                <strong>유전적 근거:</strong> {recommendation.geneticBasis.join(', ')}
              </div>
            )}

            {recommendation.precautions && recommendation.precautions.length > 0 && (
              <div className="precautions">
                <strong>주의사항:</strong>
                <ul>
                  {recommendation.precautions.map((precaution, index) => (
                    <li key={index}>{precaution}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendation.riskFactors && recommendation.riskFactors.length > 0 && (
              <div className="risk-factors">
                <strong>위험요인:</strong> {recommendation.riskFactors.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card-actions">
        <button
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '간단히 보기' : '자세히 보기'}
        </button>

        <button
          className={`implementation-btn ${isImplemented ? 'implemented' : ''}`}
          onClick={handleImplementationToggle}
        >
          {isImplemented ? '✅ 실행함' : '실행하기'}
        </button>
      </div>

      {showFeedback && (
        <div className="feedback-section">
          <h4>피드백을 남겨주세요</h4>
          <div className="rating-section">
            <span>평점:</span>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`star ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <textarea
            placeholder="추가 의견이 있으시면 남겨주세요 (선택사항)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
          />
          <div className="feedback-actions">
            <button className="btn btn-secondary" onClick={() => setShowFeedback(false)}>
              취소
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleFeedbackSubmit}
              disabled={rating === 0}
            >
              제출
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;