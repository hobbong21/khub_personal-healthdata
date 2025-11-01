import React, { useState, useEffect } from 'react';
import { medicationApi, TodayScheduleItem } from '../../services/medicationApi';

interface MedicationScheduleProps {
  onMedicationUpdated: () => void;
}

export const MedicationSchedule: React.FC<MedicationScheduleProps> = ({ onMedicationUpdated }) => {
  const [todaySchedule, setTodaySchedule] = useState<TodayScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaySchedule();
  }, []);

  const loadTodaySchedule = async () => {
    try {
      setLoading(true);
      const schedule = await medicationApi.getTodaySchedule();
      setTodaySchedule(schedule);
    } catch (error) {
      console.error('오늘 일정 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeMedication = async (item: TodayScheduleItem) => {
    try {
      await medicationApi.logDosage(item.medicationId, {
        dosageTaken: item.schedule.dosage,
        takenAt: new Date().toISOString(),
        notes: `${item.schedule.timeOfDay} 복용`
      });
      
      // 일정 새로고침
      await loadTodaySchedule();
      onMedicationUpdated();
    } catch (error) {
      console.error('복약 기록 실패:', error);
      alert('복약 기록에 실패했습니다.');
    }
  };

  const getTimeOfDayLabel = (timeOfDay: string) => {
    const labels = {
      morning: '아침',
      afternoon: '점심',
      evening: '저녁',
      night: '밤'
    };
    return labels[timeOfDay as keyof typeof labels] || timeOfDay;
  };

  const getTimeOfDayIcon = (timeOfDay: string) => {
    const icons = {
      morning: '🌅',
      afternoon: '☀️',
      evening: '🌆',
      night: '🌙'
    };
    return icons[timeOfDay as keyof typeof icons] || '💊';
  };

  const isOverdue = (scheduledTime: string) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime > scheduledTime;
  };

  if (loading) {
    return (
      <div className="medication-schedule loading">
        <div className="spinner"></div>
        <p>오늘의 복약 일정을 불러오는 중...</p>
      </div>
    );
  }

  if (todaySchedule.length === 0) {
    return (
      <div className="medication-schedule empty">
        <div className="empty-state">
          <div className="empty-icon">💊</div>
          <h3>오늘 복용할 약물이 없습니다</h3>
          <p>약물을 추가하고 복약 일정을 설정해보세요.</p>
        </div>
      </div>
    );
  }

  // 시간대별로 그룹화
  const groupedSchedule = todaySchedule.reduce((groups, item) => {
    const timeOfDay = item.schedule.timeOfDay;
    if (!groups[timeOfDay]) {
      groups[timeOfDay] = [];
    }
    groups[timeOfDay].push(item);
    return groups;
  }, {} as Record<string, TodayScheduleItem[]>);

  // 시간대 순서 정의
  const timeOrder = ['morning', 'afternoon', 'evening', 'night'];

  return (
    <div className="medication-schedule">
      <div className="schedule-header">
        <h2>오늘의 복약 일정</h2>
        <div className="schedule-summary">
          <span className="total">총 {todaySchedule.length}개</span>
          <span className="taken">완료 {todaySchedule.filter(item => item.isTaken).length}개</span>
          <span className="remaining">남은 {todaySchedule.filter(item => !item.isTaken).length}개</span>
        </div>
      </div>

      <div className="schedule-groups">
        {timeOrder.map(timeOfDay => {
          const items = groupedSchedule[timeOfDay];
          if (!items || items.length === 0) return null;

          return (
            <div key={timeOfDay} className="schedule-group">
              <div className="group-header">
                <span className="time-icon">{getTimeOfDayIcon(timeOfDay)}</span>
                <h3>{getTimeOfDayLabel(timeOfDay)}</h3>
                <span className="group-count">
                  {items.filter(item => item.isTaken).length}/{items.length}
                </span>
              </div>

              <div className="schedule-items">
                {items.map((item, index) => (
                  <div 
                    key={`${item.medicationId}-${item.schedule.id}`}
                    className={`schedule-item ${item.isTaken ? 'taken' : ''} ${
                      !item.isTaken && isOverdue(item.schedule.scheduledTime) ? 'overdue' : ''
                    }`}
                  >
                    <div className="item-info">
                      <div className="medication-name">{item.medicationName}</div>
                      <div className="medication-details">
                        <span className="dosage">{item.schedule.dosage}</span>
                        <span className="time">{item.schedule.scheduledTime}</span>
                        {item.schedule.instructions && (
                          <span className="instructions">{item.schedule.instructions}</span>
                        )}
                      </div>
                      {!item.isTaken && isOverdue(item.schedule.scheduledTime) && (
                        <div className="overdue-badge">지연됨</div>
                      )}
                    </div>

                    <div className="item-actions">
                      {item.isTaken ? (
                        <div className="taken-badge">
                          <span className="checkmark">✓</span>
                          복용 완료
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary take-btn"
                          onClick={() => handleTakeMedication(item)}
                        >
                          복용 완료
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 진행률 표시 */}
      <div className="schedule-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{
              width: `${todaySchedule.length > 0 ? 
                (todaySchedule.filter(item => item.isTaken).length / todaySchedule.length) * 100 : 0}%`
            }}
          ></div>
        </div>
        <div className="progress-text">
          오늘 복약 진행률: {todaySchedule.length > 0 ? 
            Math.round((todaySchedule.filter(item => item.isTaken).length / todaySchedule.length) * 100) : 0}%
        </div>
      </div>
    </div>
  );
};