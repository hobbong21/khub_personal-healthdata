import React, { useState, useEffect } from 'react';
import { PersonalizedRecommendations, RecommendationStats, LifestyleSuggestions, ScreeningScheduleItem } from '../../types/recommendations';
import { recommendationApi } from '../../services/recommendationApi';
import './RecommendationsDashboard.css';

interface Props {
  recommendations: PersonalizedRecommendations | null;
  stats: RecommendationStats | null;
  onGenerateNew: () => void;
}

const RecommendationsDashboard: React.FC<Props> = ({ recommendations, stats, onGenerateNew }) => {
  const [lifestyleSuggestions, setLifestyleSuggestions] = useState<LifestyleSuggestions | null>(null);
  const [screeningSchedule, setScreeningSchedule] = useState<ScreeningScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdditionalData();
  }, []);

  const loadAdditionalData = async () => {
    try {
      const [suggestions, schedule] = await Promise.all([
        recommendationApi.getLifestyleSuggestions(),
        recommendationApi.getScreeningSchedule(),
      ]);

      setLifestyleSuggestions(suggestions);
      setScreeningSchedule(schedule);
    } catch (error) {
      console.error('Error loading additional data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>대시보드를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="recommendations-dashboard">
      {/* Stats Overview */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.totalRecommendations}</h3>
              <p>총 권장사항</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.implementedRecommendations}</h3>
              <p>실행한 권장사항</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>{stats.implementationRate.toFixed(1)}%</h3>
              <p>실행률</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{stats.averageAdherence.toFixed(1)}%</h3>
              <p>평균 준수율</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Recommendations Summary */}
      {recommendations && (
        <div className="recommendations-summary">
          <div className="summary-header">
            <h2>현재 권장사항 요약</h2>
            <div className="confidence-badge">
              신뢰도: {(recommendations.confidence * 100).toFixed(0)}%
            </div>
          </div>
          
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-header-item">
                <span className="summary-icon">🥗</span>
                <h3>영양 권장사항</h3>
              </div>
              <div className="summary-count">{recommendations.nutrition.length}개</div>
              <div className="priority-breakdown">
                {['high', 'medium', 'low'].map(priority => {
                  const count = recommendations.nutrition.filter(n => n.priority === priority).length;
                  return count > 0 ? (
                    <span key={priority} className="priority-item">
                      {getPriorityIcon(priority)} {count}
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-header-item">
                <span className="summary-icon">🏃‍♂️</span>
                <h3>운동 권장사항</h3>
              </div>
              <div className="summary-count">{recommendations.exercise.length}개</div>
              <div className="priority-breakdown">
                {['high', 'medium', 'low'].map(priority => {
                  const count = recommendations.exercise.filter(e => e.priority === priority).length;
                  return count > 0 ? (
                    <span key={priority} className="priority-item">
                      {getPriorityIcon(priority)} {count}
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-header-item">
                <span className="summary-icon">🔬</span>
                <h3>검진 권장사항</h3>
              </div>
              <div className="summary-count">{recommendations.screening.length}개</div>
              <div className="priority-breakdown">
                {['high', 'medium', 'low'].map(priority => {
                  const count = recommendations.screening.filter(s => s.priority === priority).length;
                  return count > 0 ? (
                    <span key={priority} className="priority-item">
                      {getPriorityIcon(priority)} {count}
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-header-item">
                <span className="summary-icon">🌱</span>
                <h3>생활습관 권장사항</h3>
              </div>
              <div className="summary-count">{recommendations.lifestyle.length}개</div>
              <div className="priority-breakdown">
                {['high', 'medium', 'low'].map(priority => {
                  const count = recommendations.lifestyle.filter(l => l.priority === priority).length;
                  return count > 0 ? (
                    <span key={priority} className="priority-item">
                      {getPriorityIcon(priority)} {count}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          <div className="validity-info">
            <p>
              <span className="validity-label">생성일:</span> {formatDate(recommendations.generatedAt)}
            </p>
            <p>
              <span className="validity-label">유효기간:</span> {formatDate(recommendations.validUntil)}
            </p>
          </div>
        </div>
      )}

      {/* Lifestyle Suggestions */}
      {lifestyleSuggestions && (
        <div className="lifestyle-suggestions">
          <h2>생활습관 개선 제안</h2>
          <div className="suggestions-grid">
            <div className="suggestion-category">
              <h3>🚨 즉시 실행</h3>
              <ul>
                {lifestyleSuggestions.immediate.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
            <div className="suggestion-category">
              <h3>📅 단기 목표</h3>
              <ul>
                {lifestyleSuggestions.shortTerm.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
            <div className="suggestion-category">
              <h3>🎯 장기 목표</h3>
              <ul>
                {lifestyleSuggestions.longTerm.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Screening Schedule */}
      {screeningSchedule.length > 0 && (
        <div className="screening-schedule">
          <h2>맞춤형 검진 일정</h2>
          <div className="schedule-list">
            {screeningSchedule.slice(0, 5).map((item, index) => (
              <div key={index} className="schedule-item">
                <div className="schedule-info">
                  <h4>{item.test}</h4>
                  <p className="schedule-frequency">{item.frequency}</p>
                </div>
                <div className="schedule-date">
                  <span className="date-label">다음 예정일</span>
                  <span className="date-value">{formatDate(item.nextDue)}</span>
                </div>
                <div className="schedule-priority">
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(item.priority) }}
                  >
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={onGenerateNew}>
          새 권장사항 생성
        </button>
        {recommendations && (
          <button className="btn btn-secondary">
            권장사항 내보내기
          </button>
        )}
      </div>
    </div>
  );
};

export default RecommendationsDashboard;