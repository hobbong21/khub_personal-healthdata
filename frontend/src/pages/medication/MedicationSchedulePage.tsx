import React, { useState } from 'react';
import './MedicationSchedulePage.css';

interface MedicationSchedule {
  id: string;
  medicationName: string;
  dosage: string;
  timeSlots: {
    morning?: string;
    afternoon?: string;
    evening?: string;
    night?: string;
  };
  frequency: 'daily' | 'weekly' | 'as_needed';
  startDate: Date;
  endDate?: Date;
  instructions: string;
  isActive: boolean;
  reminderEnabled: boolean;
}

interface DosageLog {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  takenTime?: Date;
  status: 'taken' | 'missed' | 'pending';
  notes?: string;
}

const MedicationSchedulePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  
  const [schedules] = useState<MedicationSchedule[]>([
    {
      id: '1',
      medicationName: '혈압약 (암로디핀)',
      dosage: '5mg',
      timeSlots: {
        morning: '08:00'
      },
      frequency: 'daily',
      startDate: new Date('2024-01-01'),
      instructions: '식후 30분에 복용',
      isActive: true,
      reminderEnabled: true
    },
    {
      id: '2',
      medicationName: '비타민 D',
      dosage: '1000IU',
      timeSlots: {
        morning: '08:30'
      },
      frequency: 'daily',
      startDate: new Date('2024-01-01'),
      instructions: '식사와 함께 복용',
      isActive: true,
      reminderEnabled: true
    },
    {
      id: '3',
      medicationName: '오메가3',
      dosage: '1캡슐',
      timeSlots: {
        evening: '19:00'
      },
      frequency: 'daily',
      startDate: new Date('2024-01-01'),
      instructions: '저녁 식사 후 복용',
      isActive: true,
      reminderEnabled: false
    }
  ]);

  const [dosageLogs] = useState<DosageLog[]>([
    {
      id: '1',
      medicationId: '1',
      scheduledTime: new Date('2024-01-15T08:00:00'),
      takenTime: new Date('2024-01-15T08:15:00'),
      status: 'taken'
    },
    {
      id: '2',
      medicationId: '2',
      scheduledTime: new Date('2024-01-15T08:30:00'),
      takenTime: new Date('2024-01-15T08:35:00'),
      status: 'taken'
    },
    {
      id: '3',
      medicationId: '3',
      scheduledTime: new Date('2024-01-15T19:00:00'),
      status: 'pending'
    }
  ]);

  const timeSlotLabels = {
    morning: '아침',
    afternoon: '점심',
    evening: '저녁',
    night: '밤'
  };

  const getTimeSlotIcon = (slot: string) => {
    const icons = {
      morning: '🌅',
      afternoon: '☀️',
      evening: '🌆',
      night: '🌙'
    };
    return icons[slot as keyof typeof icons] || '💊';
  };

  const getTodaySchedule = () => {
    const today = new Date().toDateString();
    const todaySchedules: Array<{
      schedule: MedicationSchedule;
      timeSlot: string;
      time: string;
      log?: DosageLog;
    }> = [];

    schedules.forEach(schedule => {
      Object.entries(schedule.timeSlots).forEach(([slot, time]) => {
        if (time) {
          const scheduledDateTime = new Date(`${today} ${time}`);
          const log = dosageLogs.find(log => 
            log.medicationId === schedule.id && 
            log.scheduledTime.toDateString() === today &&
            log.scheduledTime.getHours() === scheduledDateTime.getHours()
          );
          
          todaySchedules.push({
            schedule,
            timeSlot: slot,
            time,
            log
          });
        }
      });
    });

    return todaySchedules.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getComplianceRate = () => {
    const totalScheduled = dosageLogs.length;
    const taken = dosageLogs.filter(log => log.status === 'taken').length;
    return totalScheduled > 0 ? Math.round((taken / totalScheduled) * 100) : 0;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? '오후' : '오전';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${ampm} ${displayHour}:${minutes}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return '#48bb78';
      case 'missed': return '#f56565';
      case 'pending': return '#ed8936';
      default: return '#718096';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'taken': return '복용 완료';
      case 'missed': return '복용 누락';
      case 'pending': return '복용 예정';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="medication-schedule-page">
      <div className="page-header">
        <div className="header-content">
          <h1>복약 일정 관리</h1>
          <p>매일의 복약 일정을 확인하고 복용 기록을 관리하세요</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-value">{getComplianceRate()}%</span>
              <span className="stat-label">복약 순응도</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💊</div>
            <div className="stat-info">
              <span className="stat-value">{schedules.filter(s => s.isActive).length}</span>
              <span className="stat-label">활성 약물</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="today-schedule">
        <div className="section-header">
          <h2>오늘의 복약 일정</h2>
          <div className="date-display">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
        </div>

        <div className="schedule-timeline">
          {getTodaySchedule().map((item, index) => (
            <div key={`${item.schedule.id}-${item.timeSlot}`} className="timeline-item">
              <div className="timeline-time">
                <span className="time-slot-icon">
                  {getTimeSlotIcon(item.timeSlot)}
                </span>
                <div className="time-info">
                  <span className="time-label">
                    {timeSlotLabels[item.timeSlot as keyof typeof timeSlotLabels]}
                  </span>
                  <span className="time-value">{formatTime(item.time)}</span>
                </div>
              </div>

              <div className="timeline-content">
                <div className="medication-info">
                  <h4>{item.schedule.medicationName}</h4>
                  <div className="medication-details">
                    <span className="dosage">{item.schedule.dosage}</span>
                    <span className="instructions">{item.schedule.instructions}</span>
                  </div>
                </div>

                <div className="medication-status">
                  {item.log ? (
                    <div className={`status-badge ${item.log.status}`}>
                      <span 
                        className="status-indicator"
                        style={{ backgroundColor: getStatusColor(item.log.status) }}
                      ></span>
                      <span className="status-text">
                        {getStatusLabel(item.log.status)}
                      </span>
                      {item.log.takenTime && (
                        <span className="taken-time">
                          {item.log.takenTime.toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  ) : (
                    <button className="take-medication-btn">
                      복용 완료
                    </button>
                  )}
                </div>

                <div className="medication-actions">
                  <button className="action-btn skip">건너뛰기</button>
                  <button className="action-btn remind">알림 설정</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {getTodaySchedule().length === 0 && (
          <div className="empty-schedule">
            <div className="empty-icon">💊</div>
            <h3>오늘 복용할 약물이 없습니다</h3>
            <p>새로운 약물을 추가하거나 일정을 확인해보세요</p>
          </div>
        )}
      </div>

      {/* Weekly Overview */}
      <div className="weekly-overview">
        <div className="section-header">
          <h2>주간 복약 현황</h2>
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'daily' ? 'active' : ''}`}
              onClick={() => setViewMode('daily')}
            >
              일별
            </button>
            <button 
              className={`view-btn ${viewMode === 'weekly' ? 'active' : ''}`}
              onClick={() => setViewMode('weekly')}
            >
              주별
            </button>
          </div>
        </div>

        <div className="weekly-calendar">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - date.getDay() + i);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={i} className={`calendar-day ${isToday ? 'today' : ''}`}>
                <div className="day-header">
                  <span className="day-name">
                    {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
                  </span>
                  <span className="day-date">{date.getDate()}</span>
                </div>
                
                <div className="day-medications">
                  {schedules.map(schedule => (
                    <div key={schedule.id} className="med-item">
                      <div className="med-name">{schedule.medicationName}</div>
                      <div className="med-times">
                        {Object.entries(schedule.timeSlots).map(([slot, time]) => (
                          time && (
                            <span key={slot} className="med-time">
                              {getTimeSlotIcon(slot)} {time}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Medications */}
      <div className="active-medications">
        <div className="section-header">
          <h2>활성 약물 목록</h2>
          <button className="btn btn-primary">새 약물 추가</button>
        </div>

        <div className="medications-grid">
          {schedules.filter(schedule => schedule.isActive).map(schedule => (
            <div key={schedule.id} className="medication-card">
              <div className="card-header">
                <h4>{schedule.medicationName}</h4>
                <div className="card-actions">
                  <button className="action-btn edit">✏️</button>
                  <button className="action-btn delete">🗑️</button>
                </div>
              </div>

              <div className="card-content">
                <div className="medication-detail">
                  <span className="detail-label">용량</span>
                  <span className="detail-value">{schedule.dosage}</span>
                </div>
                
                <div className="medication-detail">
                  <span className="detail-label">복용 시간</span>
                  <div className="time-slots">
                    {Object.entries(schedule.timeSlots).map(([slot, time]) => (
                      time && (
                        <span key={slot} className="time-slot">
                          {getTimeSlotIcon(slot)} {formatTime(time)}
                        </span>
                      )
                    ))}
                  </div>
                </div>

                <div className="medication-detail">
                  <span className="detail-label">복용법</span>
                  <span className="detail-value">{schedule.instructions}</span>
                </div>

                <div className="medication-detail">
                  <span className="detail-label">알림</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={schedule.reminderEnabled}
                      readOnly
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicationSchedulePage;