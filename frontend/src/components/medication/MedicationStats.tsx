import React from 'react';
import { MedicationStats as Stats } from '../../services/medicationApi';

interface MedicationStatsProps {
  stats: Stats;
}

export const MedicationStats: React.FC<MedicationStatsProps> = ({ stats }) => {
  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return '#28a745'; // 초록색
    if (rate >= 70) return '#ffc107'; // 노란색
    if (rate >= 50) return '#fd7e14'; // 주황색
    return '#dc3545'; // 빨간색
  };

  const getAdherenceLabel = (rate: number) => {
    if (rate >= 90) return '우수';
    if (rate >= 70) return '양호';
    if (rate >= 50) return '보통';
    return '개선 필요';
  };

  return (
    <div className="medication-stats">
      <div className="stats-grid">
        {/* 총 약물 수 */}
        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalMedications}</div>
            <div className="stat-label">총 약물</div>
          </div>
        </div>

        {/* 복용 중인 약물 */}
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeMedications}</div>
            <div className="stat-label">복용 중</div>
          </div>
        </div>

        {/* 오늘 복약 현황 */}
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">
              {stats.todayTaken}/{stats.todayScheduled}
            </div>
            <div className="stat-label">오늘 복약</div>
          </div>
        </div>

        {/* 복약 순응도 */}
        <div className="stat-card adherence">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div 
              className="stat-value"
              style={{ color: getAdherenceColor(stats.adherenceRate) }}
            >
              {stats.adherenceRate}%
            </div>
            <div className="stat-label">
              순응도 ({getAdherenceLabel(stats.adherenceRate)})
            </div>
          </div>
          <div className="adherence-bar">
            <div 
              className="adherence-fill"
              style={{ 
                width: `${stats.adherenceRate}%`,
                backgroundColor: getAdherenceColor(stats.adherenceRate)
              }}
            ></div>
          </div>
        </div>

        {/* 상호작용 경고 */}
        <div className={`stat-card ${stats.interactionWarnings > 0 ? 'warning' : ''}`}>
          <div className="stat-icon">
            {stats.interactionWarnings > 0 ? '⚠️' : '✅'}
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.interactionWarnings}</div>
            <div className="stat-label">상호작용 경고</div>
          </div>
        </div>
      </div>

      {/* 추가 인사이트 */}
      <div className="stats-insights">
        {stats.adherenceRate < 70 && (
          <div className="insight warning">
            <span className="insight-icon">💡</span>
            <span className="insight-text">
              복약 순응도가 낮습니다. 알림 설정을 확인해보세요.
            </span>
          </div>
        )}

        {stats.interactionWarnings > 0 && (
          <div className="insight danger">
            <span className="insight-icon">⚠️</span>
            <span className="insight-text">
              약물 상호작용이 발견되었습니다. 의사와 상담하세요.
            </span>
          </div>
        )}

        {stats.todayTaken === stats.todayScheduled && stats.todayScheduled > 0 && (
          <div className="insight success">
            <span className="insight-icon">🎉</span>
            <span className="insight-text">
              오늘 예정된 모든 약물을 복용했습니다!
            </span>
          </div>
        )}

        {stats.activeMedications === 0 && (
          <div className="insight info">
            <span className="insight-icon">📝</span>
            <span className="insight-text">
              복용 중인 약물이 없습니다. 새로운 약물을 추가해보세요.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};