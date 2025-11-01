import React, { useState } from 'react';
import './VitalSignsPage.css';

interface VitalSign {
  id: string;
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'blood_sugar' | 'weight';
  value: any;
  unit: string;
  measuredAt: Date;
  notes?: string;
}

const VitalSignsPage: React.FC = () => {
  const [activeType, setActiveType] = useState<string>('blood_pressure');
  const [showAddForm, setShowAddForm] = useState(false);
  const [vitalSigns] = useState<VitalSign[]>([
    {
      id: '1',
      type: 'blood_pressure',
      value: { systolic: 120, diastolic: 80 },
      unit: 'mmHg',
      measuredAt: new Date('2024-01-15T09:00:00'),
      notes: '아침 측정'
    },
    {
      id: '2',
      type: 'heart_rate',
      value: 72,
      unit: 'bpm',
      measuredAt: new Date('2024-01-15T09:05:00')
    },
    {
      id: '3',
      type: 'weight',
      value: 70.5,
      unit: 'kg',
      measuredAt: new Date('2024-01-15T08:00:00')
    }
  ]);

  const vitalTypes = [
    { id: 'blood_pressure', name: '혈압', icon: '🩺', color: '#ff6b6b' },
    { id: 'heart_rate', name: '심박수', icon: '💓', color: '#4ecdc4' },
    { id: 'temperature', name: '체온', icon: '🌡️', color: '#45b7d1' },
    { id: 'blood_sugar', name: '혈당', icon: '🩸', color: '#96ceb4' },
    { id: 'weight', name: '체중', icon: '⚖️', color: '#feca57' }
  ];

  const formatValue = (vital: VitalSign) => {
    if (vital.type === 'blood_pressure') {
      return `${vital.value.systolic}/${vital.value.diastolic}`;
    }
    return vital.value.toString();
  };

  const getStatusColor = (vital: VitalSign) => {
    // 간단한 정상 범위 체크
    switch (vital.type) {
      case 'blood_pressure':
        const systolic = vital.value.systolic;
        if (systolic >= 90 && systolic <= 120) return '#48bb78';
        if (systolic <= 140) return '#ed8936';
        return '#f56565';
      case 'heart_rate':
        if (vital.value >= 60 && vital.value <= 100) return '#48bb78';
        return '#ed8936';
      default:
        return '#48bb78';
    }
  };

  return (
    <div className="vital-signs-page">
      <div className="page-header">
        <div className="header-content">
          <h1>바이탈 사인 관리</h1>
          <p>혈압, 심박수, 체온 등 기본 생체 신호를 기록하고 추적하세요</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          새 측정값 추가
        </button>
      </div>

      <div className="vital-types-grid">
        {vitalTypes.map((type) => (
          <div 
            key={type.id}
            className={`vital-type-card ${activeType === type.id ? 'active' : ''}`}
            onClick={() => setActiveType(type.id)}
            style={{ '--accent-color': type.color } as React.CSSProperties}
          >
            <div className="type-icon">{type.icon}</div>
            <div className="type-info">
              <h3>{type.name}</h3>
              <p className="latest-value">
                {vitalSigns
                  .filter(v => v.type === type.id)
                  .sort((a, b) => b.measuredAt.getTime() - a.measuredAt.getTime())[0]
                  ? formatValue(vitalSigns.filter(v => v.type === type.id)[0]) + ' ' + 
                    vitalSigns.filter(v => v.type === type.id)[0].unit
                  : '측정값 없음'
                }
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="vital-content">
        <div className="content-header">
          <h2>
            {vitalTypes.find(t => t.id === activeType)?.icon} {' '}
            {vitalTypes.find(t => t.id === activeType)?.name} 기록
          </h2>
          <div className="view-controls">
            <button className="view-btn active">목록</button>
            <button className="view-btn">차트</button>
          </div>
        </div>

        <div className="vital-records">
          {vitalSigns
            .filter(vital => vital.type === activeType)
            .sort((a, b) => b.measuredAt.getTime() - a.measuredAt.getTime())
            .map((vital) => (
              <div key={vital.id} className="vital-record">
                <div className="record-time">
                  <span className="date">
                    {vital.measuredAt.toLocaleDateString('ko-KR')}
                  </span>
                  <span className="time">
                    {vital.measuredAt.toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="record-value">
                  <span className="value">{formatValue(vital)}</span>
                  <span className="unit">{vital.unit}</span>
                </div>
                <div className="record-status">
                  <span 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(vital) }}
                  ></span>
                </div>
                {vital.notes && (
                  <div className="record-notes">
                    <span className="notes-icon">📝</span>
                    <span className="notes-text">{vital.notes}</span>
                  </div>
                )}
                <div className="record-actions">
                  <button className="action-btn edit">✏️</button>
                  <button className="action-btn delete">🗑️</button>
                </div>
              </div>
            ))}
        </div>

        {vitalSigns.filter(vital => vital.type === activeType).length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>측정 기록이 없습니다</h3>
            <p>첫 번째 {vitalTypes.find(t => t.id === activeType)?.name} 측정값을 추가해보세요.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              측정값 추가하기
            </button>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="add-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>새 측정값 추가</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>측정 항목</label>
                <select value={activeType}>
                  {vitalTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {activeType === 'blood_pressure' ? (
                <div className="blood-pressure-inputs">
                  <div className="form-group">
                    <label>수축기 혈압</label>
                    <input type="number" placeholder="120" />
                  </div>
                  <div className="form-group">
                    <label>이완기 혈압</label>
                    <input type="number" placeholder="80" />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label>측정값</label>
                  <input 
                    type="number" 
                    placeholder={`${vitalTypes.find(t => t.id === activeType)?.name} 입력`}
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>측정 시간</label>
                <input type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} />
              </div>
              
              <div className="form-group">
                <label>메모 (선택사항)</label>
                <textarea placeholder="측정 상황이나 특이사항을 기록하세요"></textarea>
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

export default VitalSignsPage;