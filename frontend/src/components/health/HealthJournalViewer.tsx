import React, { useState, useEffect } from 'react';
import { HealthRecordResponse } from '../../types/health';
import healthApiService from '../../services/healthApi';

interface HealthJournalViewerProps {
  refreshKey?: number;
}

const HealthJournalViewer: React.FC<HealthJournalViewerProps> = ({ refreshKey }) => {
  const [journals, setJournals] = useState<HealthRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadJournals();
  }, [refreshKey, selectedPeriod]);

  const loadJournals = async () => {
    try {
      setLoading(true);
      setError(null);

      let startDate: string | undefined;
      const now = new Date();

      if (selectedPeriod === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        startDate = weekAgo.toISOString();
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        startDate = monthAgo.toISOString();
      }

      const data = await healthApiService.getHealthJournals(startDate, undefined, 50);
      setJournals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '건강 일지 조회에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const getConditionEmoji = (rating: number) => {
    const emojiMap = {
      1: '😰',
      2: '😔',
      3: '😐',
      4: '🙂',
      5: '😊'
    };
    return emojiMap[rating as keyof typeof emojiMap] || '😐';
  };

  const getConditionLabel = (rating: number) => {
    const labelMap = {
      1: '매우 나쁨',
      2: '나쁨',
      3: '보통',
      4: '좋음',
      5: '매우 좋음'
    };
    return labelMap[rating as keyof typeof labelMap] || '보통';
  };

  const getConditionColor = (rating: number) => {
    const colorMap = {
      1: '#ff4757',
      2: '#ff6b7a',
      3: '#ffa502',
      4: '#7bed9f',
      5: '#2ed573'
    };
    return colorMap[rating as keyof typeof colorMap] || '#ffa502';
  };

  const getSymptomLabel = (level: number) => {
    const labels = ['없음', '경미', '보통', '심함', '매우 심함'];
    return labels[level] || '없음';
  };

  const getIntensityLabel = (intensity: string) => {
    const labelMap = {
      low: '낮음',
      moderate: '보통',
      high: '높음'
    };
    return labelMap[intensity as keyof typeof labelMap] || intensity;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  if (loading) {
    return (
      <div className="journal-viewer loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>건강 일지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="journal-viewer error">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={loadJournals} className="retry-btn">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-viewer">
      <div className="viewer-header">
        <h3>건강 일지 기록</h3>
        <div className="period-selector">
          <button
            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            최근 1주일
          </button>
          <button
            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            최근 1개월
          </button>
          <button
            className={`period-btn ${selectedPeriod === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('all')}
          >
            전체
          </button>
        </div>
      </div>

      {journals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h4>아직 기록된 건강 일지가 없습니다</h4>
          <p>첫 번째 건강 일지를 작성해보세요!</p>
        </div>
      ) : (
        <div className="journals-list">
          {journals.map((journal) => {
            const data = journal.data as any;
            return (
              <div key={journal.id} className="journal-entry">
                <div className="journal-header">
                  <div className="journal-date">
                    <span className="date-label">{formatDate(journal.recordedDate)}</span>
                    <span className="date-full">
                      {new Date(journal.recordedDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div 
                    className="condition-indicator"
                    style={{ backgroundColor: `${getConditionColor(data.conditionRating)}20` }}
                  >
                    <span className="condition-emoji">{getConditionEmoji(data.conditionRating)}</span>
                    <span className="condition-text">{getConditionLabel(data.conditionRating)}</span>
                  </div>
                </div>

                <div className="journal-content">
                  {/* 증상 정보 */}
                  {(data.symptoms.pain > 0 || data.symptoms.fatigue > 0 || data.symptoms.sleepQuality !== 3) && (
                    <div className="symptoms-info">
                      <h5>증상</h5>
                      <div className="symptoms-grid">
                        {data.symptoms.pain > 0 && (
                          <div className="symptom-item">
                            <span className="symptom-label">통증:</span>
                            <span className="symptom-value">{getSymptomLabel(data.symptoms.pain)}</span>
                          </div>
                        )}
                        {data.symptoms.fatigue > 0 && (
                          <div className="symptom-item">
                            <span className="symptom-label">피로도:</span>
                            <span className="symptom-value">{getSymptomLabel(data.symptoms.fatigue)}</span>
                          </div>
                        )}
                        <div className="symptom-item">
                          <span className="symptom-label">수면 질:</span>
                          <span className="symptom-value">{getSymptomLabel(data.symptoms.sleepQuality - 1)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 영양제 정보 */}
                  {data.supplements && data.supplements.length > 0 && (
                    <div className="supplements-info">
                      <h5>영양제</h5>
                      <div className="supplements-tags">
                        {data.supplements.map((supplement: string, index: number) => (
                          <span key={index} className="supplement-tag">
                            {supplement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 운동 정보 */}
                  {data.exercise && data.exercise.length > 0 && (
                    <div className="exercise-info">
                      <h5>운동</h5>
                      <div className="exercise-list">
                        {data.exercise.map((ex: any, index: number) => (
                          <div key={index} className="exercise-item">
                            <span className="exercise-type">{ex.type}</span>
                            <span className="exercise-duration">{ex.duration}분</span>
                            <span className={`exercise-intensity ${ex.intensity}`}>
                              {getIntensityLabel(ex.intensity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 메모 */}
                  {data.notes && (
                    <div className="notes-info">
                      <h5>메모</h5>
                      <p className="notes-text">{data.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HealthJournalViewer;