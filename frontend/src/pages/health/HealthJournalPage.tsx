import React, { useState } from 'react';
import './HealthJournalPage.css';

interface JournalEntry {
  id: string;
  date: Date;
  overallCondition: number; // 1-5 scale
  symptoms: string[];
  mood: 'excellent' | 'good' | 'fair' | 'poor' | 'terrible';
  sleepHours: number;
  sleepQuality: number; // 1-5 scale
  exerciseType?: string;
  exerciseDuration?: number;
  notes: string;
  medications: string[];
  waterIntake: number; // liters
}

const HealthJournalPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [journalEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: new Date('2024-01-15'),
      overallCondition: 4,
      symptoms: ['두통', '피로'],
      mood: 'good',
      sleepHours: 7.5,
      sleepQuality: 4,
      exerciseType: '걷기',
      exerciseDuration: 30,
      notes: '오늘은 전반적으로 컨디션이 좋았습니다. 약간의 두통이 있었지만 충분한 수분 섭취로 개선되었습니다.',
      medications: ['비타민 D', '오메가3'],
      waterIntake: 2.1
    },
    {
      id: '2',
      date: new Date('2024-01-14'),
      overallCondition: 3,
      symptoms: ['목 아픔', '코막힘'],
      mood: 'fair',
      sleepHours: 6,
      sleepQuality: 2,
      notes: '감기 기운이 있어서 일찍 잠자리에 들었습니다.',
      medications: ['감기약'],
      waterIntake: 1.8
    }
  ]);

  const conditionLabels = ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'];
  const moodEmojis = {
    excellent: '😄',
    good: '😊',
    fair: '😐',
    poor: '😞',
    terrible: '😢'
  };

  const commonSymptoms = [
    '두통', '피로', '목 아픔', '코막힘', '기침', '복통', '근육통', '어지러움',
    '메스꺼움', '설사', '변비', '불면증', '스트레스', '불안', '우울감'
  ];

  const getTodayEntry = () => {
    const today = new Date().toDateString();
    return journalEntries.find(entry => entry.date.toDateString() === today);
  };

  const getConditionColor = (condition: number) => {
    const colors = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38a169'];
    return colors[condition - 1] || '#718096';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="health-journal-page">
      <div className="page-header">
        <div className="header-content">
          <h1>건강 일지</h1>
          <p>매일의 컨디션과 증상을 기록하여 건강 패턴을 파악하세요</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          오늘 일지 작성
        </button>
      </div>

      {/* Today's Summary */}
      <div className="today-summary">
        <h2>오늘의 건강 상태</h2>
        {getTodayEntry() ? (
          <div className="today-entry">
            <div className="condition-overview">
              <div className="condition-score">
                <div 
                  className="score-circle"
                  style={{ backgroundColor: getConditionColor(getTodayEntry()!.overallCondition) }}
                >
                  <span className="score-number">{getTodayEntry()!.overallCondition}</span>
                  <span className="score-max">/5</span>
                </div>
                <div className="score-label">
                  {conditionLabels[getTodayEntry()!.overallCondition - 1]}
                </div>
              </div>
              
              <div className="quick-stats">
                <div className="stat-item">
                  <span className="stat-icon">😴</span>
                  <div className="stat-info">
                    <span className="stat-value">{getTodayEntry()!.sleepHours}시간</span>
                    <span className="stat-label">수면</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <span className="stat-icon">{moodEmojis[getTodayEntry()!.mood]}</span>
                  <div className="stat-info">
                    <span className="stat-value">기분</span>
                    <span className="stat-label">{getTodayEntry()!.mood}</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <span className="stat-icon">💧</span>
                  <div className="stat-info">
                    <span className="stat-value">{getTodayEntry()!.waterIntake}L</span>
                    <span className="stat-label">수분 섭취</span>
                  </div>
                </div>
                
                {getTodayEntry()!.exerciseType && (
                  <div className="stat-item">
                    <span className="stat-icon">🏃</span>
                    <div className="stat-info">
                      <span className="stat-value">{getTodayEntry()!.exerciseDuration}분</span>
                      <span className="stat-label">{getTodayEntry()!.exerciseType}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {getTodayEntry()!.symptoms.length > 0 && (
              <div className="symptoms-section">
                <h4>오늘의 증상</h4>
                <div className="symptoms-list">
                  {getTodayEntry()!.symptoms.map((symptom, index) => (
                    <span key={index} className="symptom-tag">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-entry-today">
            <div className="no-entry-icon">📝</div>
            <h3>오늘의 일지가 없습니다</h3>
            <p>오늘의 건강 상태를 기록해보세요</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              일지 작성하기
            </button>
          </div>
        )}
      </div>

      {/* Journal History */}
      <div className="journal-history">
        <div className="history-header">
          <h2>일지 기록</h2>
          <div className="date-filter">
            <input 
              type="month" 
              value={selectedDate.toISOString().slice(0, 7)}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
          </div>
        </div>

        <div className="journal-entries">
          {journalEntries
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((entry) => (
              <div key={entry.id} className="journal-entry">
                <div className="entry-header">
                  <div className="entry-date">
                    <span className="date-text">{formatDate(entry.date)}</span>
                  </div>
                  <div className="entry-condition">
                    <div 
                      className="condition-badge"
                      style={{ backgroundColor: getConditionColor(entry.overallCondition) }}
                    >
                      {entry.overallCondition}/5
                    </div>
                  </div>
                </div>

                <div className="entry-content">
                  <div className="entry-stats">
                    <div className="stat">
                      <span className="stat-icon">😴</span>
                      <span>{entry.sleepHours}h</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">{moodEmojis[entry.mood]}</span>
                      <span>{entry.mood}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">💧</span>
                      <span>{entry.waterIntake}L</span>
                    </div>
                    {entry.exerciseType && (
                      <div className="stat">
                        <span className="stat-icon">🏃</span>
                        <span>{entry.exerciseDuration}분</span>
                      </div>
                    )}
                  </div>

                  {entry.symptoms.length > 0 && (
                    <div className="entry-symptoms">
                      <span className="symptoms-label">증상:</span>
                      {entry.symptoms.map((symptom, index) => (
                        <span key={index} className="symptom-tag small">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.notes && (
                    <div className="entry-notes">
                      <p>{entry.notes}</p>
                    </div>
                  )}
                </div>

                <div className="entry-actions">
                  <button className="action-btn edit">✏️ 수정</button>
                  <button className="action-btn delete">🗑️ 삭제</button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="journal-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>건강 일지 작성</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-section">
                <h4>전반적인 컨디션</h4>
                <div className="condition-selector">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      className="condition-btn"
                      style={{ backgroundColor: getConditionColor(score) }}
                    >
                      <span className="condition-score">{score}</span>
                      <span className="condition-label">{conditionLabels[score - 1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h4>증상 (해당되는 것을 선택하세요)</h4>
                <div className="symptoms-selector">
                  {commonSymptoms.map((symptom) => (
                    <button key={symptom} className="symptom-btn">
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>수면 시간</label>
                  <input type="number" step="0.5" placeholder="7.5" />
                  <span className="input-unit">시간</span>
                </div>
                <div className="form-group">
                  <label>수면 질 (1-5)</label>
                  <input type="number" min="1" max="5" placeholder="4" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>기분</label>
                  <select>
                    <option value="excellent">😄 매우 좋음</option>
                    <option value="good">😊 좋음</option>
                    <option value="fair">😐 보통</option>
                    <option value="poor">😞 나쁨</option>
                    <option value="terrible">😢 매우 나쁨</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>수분 섭취량</label>
                  <input type="number" step="0.1" placeholder="2.0" />
                  <span className="input-unit">리터</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>운동 종류</label>
                  <input type="text" placeholder="걷기, 달리기, 헬스 등" />
                </div>
                <div className="form-group">
                  <label>운동 시간</label>
                  <input type="number" placeholder="30" />
                  <span className="input-unit">분</span>
                </div>
              </div>

              <div className="form-group">
                <label>메모</label>
                <textarea 
                  placeholder="오늘의 컨디션, 특별한 사건, 느낀 점 등을 자유롭게 기록하세요"
                  rows={4}
                ></textarea>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                취소
              </button>
              <button className="btn btn-primary">
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthJournalPage;