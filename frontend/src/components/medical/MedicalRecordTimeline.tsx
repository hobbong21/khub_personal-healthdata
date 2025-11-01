import React, { useState, useEffect } from 'react';
import { MedicalApi, MedicalRecordTimelineItem } from '../../services/medicalApi';
import './MedicalRecordTimeline.css';

interface MedicalRecordTimelineProps {
  className?: string;
}

const MedicalRecordTimeline: React.FC<MedicalRecordTimelineProps> = ({ className }) => {
  const [timelineItems, setTimelineItems] = useState<MedicalRecordTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MedicalRecordTimelineItem | null>(null);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const timeline = await MedicalApi.getMedicalRecordTimeline();
      setTimelineItems(timeline);
    } catch (err) {
      setError('진료 기록 타임라인을 불러오는데 실패했습니다.');
      console.error('Timeline loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'visit':
        return '🏥';
      case 'test':
        return '🔬';
      case 'prescription':
        return '💊';
      case 'appointment':
        return '📅';
      default:
        return '📋';
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'visit':
        return 'timeline-visit';
      case 'test':
        return 'timeline-test';
      case 'prescription':
        return 'timeline-prescription';
      case 'appointment':
        return 'timeline-appointment';
      default:
        return 'timeline-default';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleItemClick = (item: MedicalRecordTimelineItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className={`medical-timeline ${className || ''}`}>
        <div className="timeline-loading">
          <div className="loading-spinner"></div>
          <p>진료 기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`medical-timeline ${className || ''}`}>
        <div className="timeline-error">
          <p>{error}</p>
          <button onClick={loadTimeline} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`medical-timeline ${className || ''}`}>
      <div className="timeline-header">
        <h2>진료 기록 타임라인</h2>
        <p>시간순으로 정렬된 진료 이력을 확인하세요</p>
      </div>

      {timelineItems.length === 0 ? (
        <div className="timeline-empty">
          <p>등록된 진료 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="timeline-container">
          {timelineItems.map((item, index) => (
            <div
              key={item.id}
              className={`timeline-item ${getTimelineColor(item.type)}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="timeline-marker">
                <span className="timeline-icon">{getTimelineIcon(item.type)}</span>
              </div>
              
              <div className="timeline-content">
                <div className="timeline-date">
                  <span className="date">{formatDate(item.date)}</span>
                  <span className="time">{formatTime(item.date)}</span>
                </div>
                
                <div className="timeline-info">
                  <h3 className="timeline-title">{item.title}</h3>
                  <p className="timeline-description">{item.description}</p>
                  
                  {item.hospitalName && (
                    <div className="timeline-details">
                      <span className="hospital">{item.hospitalName}</span>
                      {item.department && (
                        <span className="department"> • {item.department}</span>
                      )}
                      {item.doctorName && (
                        <span className="doctor"> • {item.doctorName}</span>
                      )}
                    </div>
                  )}
                  
                  {item.status && (
                    <span className={`timeline-status status-${item.status}`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 상세 정보 모달 */}
      {selectedItem && (
        <div className="timeline-modal-overlay" onClick={closeModal}>
          <div className="timeline-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItem.title}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="modal-info">
                <p><strong>날짜:</strong> {formatDate(selectedItem.date)} {formatTime(selectedItem.date)}</p>
                <p><strong>설명:</strong> {selectedItem.description}</p>
                
                {selectedItem.hospitalName && (
                  <p><strong>병원:</strong> {selectedItem.hospitalName}</p>
                )}
                
                {selectedItem.department && (
                  <p><strong>진료과:</strong> {selectedItem.department}</p>
                )}
                
                {selectedItem.doctorName && (
                  <p><strong>담당의:</strong> {selectedItem.doctorName}</p>
                )}
                
                {selectedItem.status && (
                  <p><strong>상태:</strong> {selectedItem.status}</p>
                )}
              </div>
              
              {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                <div className="modal-metadata">
                  <h4>추가 정보</h4>
                  {Object.entries(selectedItem.metadata).map(([key, value]) => (
                    <p key={key}>
                      <strong>{key}:</strong> {JSON.stringify(value)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordTimeline;