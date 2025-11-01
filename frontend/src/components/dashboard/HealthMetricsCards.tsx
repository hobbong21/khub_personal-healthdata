import React, { memo, useMemo } from 'react';

interface HealthMetric {
  type: string;
  value: number | { systolic: number; diastolic: number };
  unit: string;
  recordedDate: string;
}

interface HealthMetricsCardsProps {
  latestVitalSigns: { [key: string]: HealthMetric };
  averageCondition: number | null;
  weeklyProgress: {
    vitalSignsCount: number;
    journalEntriesCount: number;
    exerciseSessionsCount: number;
  };
}

const HealthMetricsCards: React.FC<HealthMetricsCardsProps> = memo(({
  latestVitalSigns,
  averageCondition,
  weeklyProgress
}) => {
  const formatVitalSignValue = (type: string, value: number | { systolic: number; diastolic: number }) => {
    if (type === 'blood_pressure' && typeof value === 'object') {
      return `${value.systolic}/${value.diastolic}`;
    }
    return value.toString();
  };

  const getVitalSignIcon = (type: string) => {
    switch (type) {
      case 'blood_pressure':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
      case 'heart_rate':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'temperature':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M14 4V10.54C15.19 11.5 16 12.82 16 14.31C16 17.24 13.24 20 10.31 20C7.38 20 4.62 17.24 4.62 14.31C4.62 12.82 5.43 11.5 6.62 10.54V4C6.62 2.34 7.96 1 9.62 1H11.38C13.04 1 14.38 2.34 14.38 4H14Z" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
      case 'weight':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'blood_sugar':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.5 10.84L4.84 5.17L7.5 2.5L6 1L0 7V9H21Z" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
    }
  };

  const getVitalSignLabel = (type: string) => {
    switch (type) {
      case 'blood_pressure': return '혈압';
      case 'heart_rate': return '심박수';
      case 'temperature': return '체온';
      case 'weight': return '체중';
      case 'blood_sugar': return '혈당';
      default: return type;
    }
  };

  const getConditionColor = (condition: number) => {
    if (condition >= 4) return 'text-green-600';
    if (condition >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConditionText = useMemo(() => (condition: number) => {
    if (condition >= 4) return '좋음';
    if (condition >= 3) return '보통';
    return '주의';
  }, []);

  const vitalSignEntries = useMemo(() => 
    Object.entries(latestVitalSigns), 
    [latestVitalSigns]
  );

  return (
    <div className="health-metrics-cards">
      {/* 바이탈 사인 카드들 */}
      <div className="metrics-grid grid grid-cols-4 gap-4 mb-6">
        {vitalSignEntries.map(([type, metric]) => (
          <div key={type} className="stat-card">
            <div className={`stat-icon ${type}`}>
              {getVitalSignIcon(type)}
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {formatVitalSignValue(type, metric.value)}
                <span className="stat-unit">{metric.unit}</span>
              </div>
              <div className="stat-label">{getVitalSignLabel(type)}</div>
              <div className="stat-time">
                {new Date(metric.recordedDate).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
        ))}

        {/* 평균 컨디션 카드 */}
        {averageCondition && (
          <div className="stat-card">
            <div className="stat-icon condition">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {averageCondition.toFixed(1)}
                <span className="stat-unit">/5</span>
              </div>
              <div className="stat-label">평균 컨디션</div>
              <div className={`stat-trend ${getConditionColor(averageCondition)}`}>
                {getConditionText(averageCondition)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 주간 진행 상황 */}
      <div className="weekly-progress-card card">
        <div className="card-header">
          <h3>이번 주 활동</h3>
        </div>
        <div className="card-body">
          <div className="progress-grid grid grid-cols-3 gap-4">
            <div className="progress-item">
              <div className="progress-icon vitals">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="progress-content">
                <div className="progress-value">{weeklyProgress.vitalSignsCount}</div>
                <div className="progress-label">바이탈 측정</div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-icon journal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="progress-content">
                <div className="progress-value">{weeklyProgress.journalEntriesCount}</div>
                <div className="progress-label">일지 작성</div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-icon exercise">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6.5 6.5H17.5L19 8V16L17.5 17.5H6.5L5 16V8L6.5 6.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div className="progress-content">
                <div className="progress-value">{weeklyProgress.exerciseSessionsCount}</div>
                <div className="progress-label">운동 세션</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

HealthMetricsCards.displayName = 'HealthMetricsCards';

export default HealthMetricsCards;