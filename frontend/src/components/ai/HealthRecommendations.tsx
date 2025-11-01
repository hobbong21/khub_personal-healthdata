import React, { useState } from 'react';
import { PredictionResult } from '../../types/ai';
import './HealthRecommendations.css';

interface HealthRecommendationsProps {
  prediction: PredictionResult;
}

interface RecommendationData {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  lifestyle: string[];
  medical: string[];
}

const HealthRecommendations: React.FC<HealthRecommendationsProps> = ({ prediction }) => {
  const [activeCategory, setActiveCategory] = useState<keyof RecommendationData>('immediate');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  
  const recommendationsData = prediction.predictionResult as RecommendationData;

  const categories = [
    { key: 'immediate' as const, label: '즉시 조치', icon: '🚨', color: '#F44336' },
    { key: 'shortTerm' as const, label: '단기 목표', icon: '📅', color: '#FF9800' },
    { key: 'longTerm' as const, label: '장기 목표', icon: '🎯', color: '#4CAF50' },
    { key: 'lifestyle' as const, label: '생활습관', icon: '🏃‍♂️', color: '#2196F3' },
    { key: 'medical' as const, label: '의료 관리', icon: '🏥', color: '#9C27B0' },
  ];

  const toggleCompletion = (item: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(item)) {
      newCompleted.delete(item);
    } else {
      newCompleted.add(item);
    }
    setCompletedItems(newCompleted);
  };

  const getCompletionRate = (items: string[]) => {
    if (items.length === 0) return 0;
    const completed = items.filter(item => completedItems.has(item)).length;
    return Math.round((completed / items.length) * 100);
  };

  const RecommendationItem: React.FC<{ 
    item: string; 
    index: number; 
    category: keyof RecommendationData 
  }> = ({ item, index, category }) => {
    const isCompleted = completedItems.has(item);
    const categoryInfo = categories.find(cat => cat.key === category);

    return (
      <div className={`recommendation-item ${isCompleted ? 'completed' : ''}`}>
        <div className="item-checkbox">
          <input
            type="checkbox"
            id={`${category}-${index}`}
            checked={isCompleted}
            onChange={() => toggleCompletion(item)}
          />
          <label htmlFor={`${category}-${index}`} className="checkbox-label">
            <span className="checkmark"></span>
          </label>
        </div>
        <div className="item-content">
          <span className="item-text">{item}</span>
          <div className="item-meta">
            <span 
              className="category-badge"
              style={{ backgroundColor: categoryInfo?.color }}
            >
              {categoryInfo?.icon} {categoryInfo?.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const CategoryProgress: React.FC<{ 
    category: keyof RecommendationData;
    items: string[];
  }> = ({ category, items }) => {
    const completionRate = getCompletionRate(items);
    const categoryInfo = categories.find(cat => cat.key === category);

    return (
      <div className="category-progress">
        <div className="progress-header">
          <span className="category-name">
            {categoryInfo?.icon} {categoryInfo?.label}
          </span>
          <span className="progress-text">{completionRate}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${completionRate}%`,
              backgroundColor: categoryInfo?.color 
            }}
          />
        </div>
        <div className="progress-details">
          {items.filter(item => completedItems.has(item)).length} / {items.length} 완료
        </div>
      </div>
    );
  };

  const allRecommendations = [
    ...recommendationsData.immediate || [],
    ...recommendationsData.shortTerm || [],
    ...recommendationsData.longTerm || [],
    ...recommendationsData.lifestyle || [],
    ...recommendationsData.medical || [],
  ];

  const overallCompletionRate = getCompletionRate(allRecommendations);

  return (
    <div className="health-recommendations">
      <div className="recommendations-header">
        <div className="overall-progress">
          <div className="progress-circle">
            <svg viewBox="0 0 100 100" className="progress-svg">
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
                stroke="#4CAF50"
                strokeWidth="8"
                strokeDasharray={`${overallCompletionRate * 2.83} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="progress-text">
              <span className="progress-percentage">{overallCompletionRate}%</span>
              <span className="progress-label">완료</span>
            </div>
          </div>
          <div className="progress-summary">
            <h3>전체 진행률</h3>
            <p>
              {allRecommendations.filter(item => completedItems.has(item)).length} / {allRecommendations.length} 권장사항 완료
            </p>
          </div>
        </div>

        <div className="category-tabs">
          {categories.map(category => {
            const items = recommendationsData[category.key] || [];
            if (items.length === 0) return null;

            return (
              <button
                key={category.key}
                className={`category-tab ${activeCategory === category.key ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.key)}
                style={{ 
                  borderColor: activeCategory === category.key ? category.color : 'transparent',
                  color: activeCategory === category.key ? category.color : '#666'
                }}
              >
                <span className="tab-icon">{category.icon}</span>
                <span className="tab-label">{category.label}</span>
                <span className="tab-count">({items.length})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="recommendations-content">
        <div className="category-overview">
          <div className="progress-grid">
            {categories.map(category => {
              const items = recommendationsData[category.key] || [];
              if (items.length === 0) return null;

              return (
                <CategoryProgress
                  key={category.key}
                  category={category.key}
                  items={items}
                />
              );
            })}
          </div>
        </div>

        <div className="active-category-content">
          <div className="category-header">
            <h3>
              {categories.find(cat => cat.key === activeCategory)?.icon}{' '}
              {categories.find(cat => cat.key === activeCategory)?.label}
            </h3>
            <p className="category-description">
              {activeCategory === 'immediate' && '즉시 실행해야 할 중요한 조치사항입니다.'}
              {activeCategory === 'shortTerm' && '1-3개월 내에 달성할 수 있는 목표입니다.'}
              {activeCategory === 'longTerm' && '6개월 이상의 장기적인 건강 목표입니다.'}
              {activeCategory === 'lifestyle' && '일상생활에서 실천할 수 있는 건강 습관입니다.'}
              {activeCategory === 'medical' && '의료진과 상담하거나 의학적 관리가 필요한 사항입니다.'}
            </p>
          </div>

          <div className="recommendations-list">
            {(recommendationsData[activeCategory] || []).map((item, index) => (
              <RecommendationItem
                key={index}
                item={item}
                index={index}
                category={activeCategory}
              />
            ))}
          </div>

          {(recommendationsData[activeCategory] || []).length === 0 && (
            <div className="no-recommendations">
              <p>이 카테고리에는 현재 권장사항이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      <div className="recommendations-footer">
        <div className="footer-actions">
          <button 
            className="export-button"
            onClick={() => {
              // Export functionality could be implemented here
              console.log('Export recommendations');
            }}
          >
            📄 권장사항 내보내기
          </button>
          <button 
            className="share-button"
            onClick={() => {
              // Share functionality could be implemented here
              console.log('Share with healthcare provider');
            }}
          >
            👨‍⚕️ 의료진과 공유
          </button>
        </div>
        <div className="footer-info">
          <span className="generation-date">
            생성일: {new Date(prediction.createdAt).toLocaleDateString('ko-KR')}
          </span>
          <span className="confidence-score">
            신뢰도: {Math.round(prediction.confidenceScore * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default HealthRecommendations;