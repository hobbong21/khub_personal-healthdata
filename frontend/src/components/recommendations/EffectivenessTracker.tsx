import React, { useState, useEffect } from 'react';
import { PersonalizedRecommendations, RecommendationEffectiveness } from '../../types/recommendations';
import { recommendationApi } from '../../services/recommendationApi';
import './EffectivenessTracker.css';

interface Props {
  recommendations: PersonalizedRecommendations | null;
  onUpdate: () => void;
}

const EffectivenessTracker: React.FC<Props> = ({ recommendations, onUpdate }) => {
  const [effectivenessData, setEffectivenessData] = useState<RecommendationEffectiveness[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecommendationEffectiveness | null>(null);
  const [outcomeData, setOutcomeData] = useState({
    metric: '',
    beforeValue: '',
    afterValue: '',
  });

  useEffect(() => {
    loadEffectivenessData();
  }, []);

  const loadEffectivenessData = async () => {
    try {
      setLoading(true);
      const data = await recommendationApi.getEffectivenessData();
      setEffectivenessData(data);
    } catch (error) {
      console.error('Error loading effectiveness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdherenceUpdate = async (
    recommendationId: string,
    category: string,
    adherenceScore: number
  ) => {
    try {
      await recommendationApi.updateAdherence(recommendationId, category, adherenceScore);
      await loadEffectivenessData();
      onUpdate();
    } catch (error) {
      console.error('Error updating adherence:', error);
    }
  };

  const handleOutcomeSubmit = async () => {
    if (!selectedItem || !outcomeData.metric || !outcomeData.beforeValue || !outcomeData.afterValue) {
      return;
    }

    try {
      await recommendationApi.recordOutcome(
        selectedItem.recommendationId,
        selectedItem.category,
        outcomeData.metric,
        parseFloat(outcomeData.beforeValue),
        parseFloat(outcomeData.afterValue)
      );
      
      setShowOutcomeModal(false);
      setSelectedItem(null);
      setOutcomeData({ metric: '', beforeValue: '', afterValue: '' });
      await loadEffectivenessData();
      onUpdate();
    } catch (error) {
      console.error('Error recording outcome:', error);
    }
  };

  const filteredData = selectedCategory === 'all' 
    ? effectivenessData 
    : effectivenessData.filter(item => item.category === selectedCategory);

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
      default: return '전체';
    }
  };

  const getAdherenceColor = (score: number) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="effectiveness-loading">
        <div className="loading-spinner"></div>
        <p>효과 추적 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="no-recommendations-message">
        <div className="no-recommendations-icon">📊</div>
        <h3>추적할 권장사항이 없습니다</h3>
        <p>먼저 권장사항을 생성하고 실행해주세요.</p>
      </div>
    );
  }

  return (
    <div className="effectiveness-tracker">
      <div className="tracker-header">
        <div className="header-info">
          <h2>효과 추적</h2>
          <p>권장사항의 실행 효과를 추적하고 관리하세요</p>
        </div>
        
        <div className="category-filter">
          <label>카테고리:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="nutrition">영양</option>
            <option value="exercise">운동</option>
            <option value="screening">검진</option>
            <option value="lifestyle">생활습관</option>
          </select>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="no-tracking-data">
          <div className="no-data-icon">📈</div>
          <h3>추적 데이터가 없습니다</h3>
          <p>권장사항을 실행하고 피드백을 남기면 효과를 추적할 수 있습니다.</p>
        </div>
      ) : (
        <div className="tracking-list">
          {filteredData.map((item, index) => (
            <div key={index} className="tracking-item">
              <div className="item-header">
                <div className="item-info">
                  <span className="category-icon">{getCategoryIcon(item.category)}</span>
                  <div className="item-details">
                    <h4>{getCategoryName(item.category)} 권장사항</h4>
                    <p className="implementation-date">
                      실행일: {item.implementationDate ? formatDate(item.implementationDate) : '미실행'}
                    </p>
                  </div>
                </div>
                <div className="implementation-status">
                  <span className={`status-badge ${item.implemented ? 'implemented' : 'not-implemented'}`}>
                    {item.implemented ? '✅ 실행함' : '❌ 미실행'}
                  </span>
                </div>
              </div>

              {item.implemented && (
                <div className="tracking-details">
                  {/* Adherence Score */}
                  <div className="adherence-section">
                    <div className="adherence-header">
                      <label>준수율:</label>
                      <span 
                        className="adherence-score"
                        style={{ color: getAdherenceColor(item.adherenceScore || 0) }}
                      >
                        {item.adherenceScore || 0}%
                      </span>
                    </div>
                    <div className="adherence-slider">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={item.adherenceScore || 0}
                        onChange={(e) => handleAdherenceUpdate(
                          item.recommendationId,
                          item.category,
                          parseInt(e.target.value)
                        )}
                        className="slider"
                      />
                    </div>
                  </div>

                  {/* User Feedback */}
                  {item.userFeedback && (
                    <div className="feedback-display">
                      <div className="feedback-rating">
                        <span>평점:</span>
                        <div className="stars">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              className={`star ${item.userFeedback!.rating >= star ? 'active' : ''}`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      {item.userFeedback.comments && (
                        <div className="feedback-comments">
                          <strong>의견:</strong> {item.userFeedback.comments}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Measured Outcome */}
                  {item.measuredOutcome ? (
                    <div className="outcome-display">
                      <h5>측정 결과</h5>
                      <div className="outcome-details">
                        <div className="outcome-metric">
                          <strong>지표:</strong> {item.measuredOutcome.metric}
                        </div>
                        <div className="outcome-values">
                          <span className="before-value">
                            이전: {item.measuredOutcome.beforeValue}
                          </span>
                          <span className="arrow">→</span>
                          <span className="after-value">
                            이후: {item.measuredOutcome.afterValue}
                          </span>
                        </div>
                        <div className="improvement">
                          <span 
                            className={`improvement-percentage ${
                              item.measuredOutcome.improvementPercentage >= 0 ? 'positive' : 'negative'
                            }`}
                          >
                            {item.measuredOutcome.improvementPercentage >= 0 ? '+' : ''}
                            {item.measuredOutcome.improvementPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="outcome-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowOutcomeModal(true);
                        }}
                      >
                        측정 결과 기록
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="item-footer">
                <span className="last-updated">
                  마지막 업데이트: {formatDate(item.lastUpdated)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Outcome Recording Modal */}
      {showOutcomeModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>측정 결과 기록</h3>
              <button 
                className="close-btn"
                onClick={() => setShowOutcomeModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>측정 지표:</label>
                <input
                  type="text"
                  placeholder="예: 체중, 혈압, 콜레스테롤 등"
                  value={outcomeData.metric}
                  onChange={(e) => setOutcomeData({
                    ...outcomeData,
                    metric: e.target.value
                  })}
                />
              </div>
              <div className="form-group">
                <label>이전 값:</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="권장사항 실행 전 측정값"
                  value={outcomeData.beforeValue}
                  onChange={(e) => setOutcomeData({
                    ...outcomeData,
                    beforeValue: e.target.value
                  })}
                />
              </div>
              <div className="form-group">
                <label>현재 값:</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="권장사항 실행 후 측정값"
                  value={outcomeData.afterValue}
                  onChange={(e) => setOutcomeData({
                    ...outcomeData,
                    afterValue: e.target.value
                  })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowOutcomeModal(false)}
              >
                취소
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleOutcomeSubmit}
                disabled={!outcomeData.metric || !outcomeData.beforeValue || !outcomeData.afterValue}
              >
                기록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EffectivenessTracker;