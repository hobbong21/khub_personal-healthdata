import React, { useState } from 'react';
import { PersonalizedRecommendations } from '../../types/recommendations';
import { recommendationApi } from '../../services/recommendationApi';
import RecommendationCard from './RecommendationCard';
import './RecommendationsList.css';

interface Props {
  recommendations: PersonalizedRecommendations | null;
  onImplementationUpdate: () => void;
}

const RecommendationsList: React.FC<Props> = ({ recommendations, onImplementationUpdate }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'nutrition' | 'exercise' | 'screening' | 'lifestyle'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  if (!recommendations) {
    return (
      <div className="no-recommendations-message">
        <div className="no-recommendations-icon">📋</div>
        <h3>권장사항이 없습니다</h3>
        <p>새로운 권장사항을 생성해주세요.</p>
      </div>
    );
  }

  const handleImplementation = async (
    recommendationId: string,
    category: string,
    implemented: boolean
  ) => {
    try {
      await recommendationApi.trackImplementation(
        recommendationId,
        category,
        implemented,
        implemented ? new Date() : undefined
      );
      onImplementationUpdate();
    } catch (error) {
      console.error('Error tracking implementation:', error);
    }
  };

  const handleFeedback = async (
    recommendationId: string,
    category: string,
    rating: number,
    comments?: string
  ) => {
    try {
      await recommendationApi.submitFeedback(recommendationId, category, rating, comments);
      onImplementationUpdate();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getAllRecommendations = () => {
    const allRecs = [
      ...recommendations.nutrition.map(rec => ({ ...rec, category: 'nutrition' as const })),
      ...recommendations.exercise.map(rec => ({ ...rec, category: 'exercise' as const })),
      ...recommendations.screening.map(rec => ({ ...rec, category: 'screening' as const })),
      ...recommendations.lifestyle.map(rec => ({ ...rec, category: 'lifestyle' as const })),
    ];

    // Filter by category
    const categoryFiltered = activeCategory === 'all' 
      ? allRecs 
      : allRecs.filter(rec => rec.category === activeCategory);

    // Filter by priority
    const priorityFiltered = priorityFilter === 'all'
      ? categoryFiltered
      : categoryFiltered.filter(rec => rec.priority === priorityFilter);

    // Sort by priority (high -> medium -> low)
    return priorityFiltered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const filteredRecommendations = getAllRecommendations();

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

  const getCategoryCount = (category: string) => {
    switch (category) {
      case 'nutrition': return recommendations.nutrition.length;
      case 'exercise': return recommendations.exercise.length;
      case 'screening': return recommendations.screening.length;
      case 'lifestyle': return recommendations.lifestyle.length;
      default: return filteredRecommendations.length;
    }
  };

  return (
    <div className="recommendations-list">
      <div className="list-header">
        <div className="header-info">
          <h2>상세 권장사항</h2>
          <p>각 권장사항을 확인하고 실행 상태를 관리하세요</p>
        </div>
        
        <div className="filters">
          <div className="category-filter">
            <label>카테고리:</label>
            <select 
              value={activeCategory} 
              onChange={(e) => setActiveCategory(e.target.value as any)}
            >
              <option value="all">전체 ({getAllRecommendations().length})</option>
              <option value="nutrition">영양 ({recommendations.nutrition.length})</option>
              <option value="exercise">운동 ({recommendations.exercise.length})</option>
              <option value="screening">검진 ({recommendations.screening.length})</option>
              <option value="lifestyle">생활습관 ({recommendations.lifestyle.length})</option>
            </select>
          </div>
          
          <div className="priority-filter">
            <label>우선순위:</label>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value as any)}
            >
              <option value="all">전체</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
          </div>
        </div>
      </div>

      <div className="category-tabs">
        {['all', 'nutrition', 'exercise', 'screening', 'lifestyle'].map(category => (
          <button
            key={category}
            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category as any)}
          >
            <span className="tab-icon">{getCategoryIcon(category)}</span>
            <span className="tab-text">{getCategoryName(category)}</span>
            <span className="tab-count">({getCategoryCount(category)})</span>
          </button>
        ))}
      </div>

      <div className="recommendations-grid">
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map((recommendation, index) => (
            <RecommendationCard
              key={`${recommendation.category}-${index}`}
              recommendation={recommendation}
              recommendationId={recommendations.id}
              onImplementation={handleImplementation}
              onFeedback={handleFeedback}
            />
          ))
        ) : (
          <div className="no-filtered-results">
            <div className="no-results-icon">🔍</div>
            <h3>해당 조건의 권장사항이 없습니다</h3>
            <p>다른 카테고리나 우선순위를 선택해보세요.</p>
          </div>
        )}
      </div>

      {filteredRecommendations.length > 0 && (
        <div className="list-summary">
          <p>
            총 <strong>{filteredRecommendations.length}개</strong>의 권장사항이 있습니다.
            {priorityFilter !== 'all' && ` (우선순위: ${priorityFilter})`}
            {activeCategory !== 'all' && ` (카테고리: ${getCategoryName(activeCategory)})`}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsList;