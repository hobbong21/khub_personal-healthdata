import React, { useState } from 'react';
import { Medication, medicationApi } from '../../services/medicationApi';

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
  onUpdated: () => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({ 
  medication, 
  onEdit, 
  onUpdated 
}) => {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleActive = async () => {
    try {
      setLoading(true);
      await medicationApi.updateMedication(medication.id, {
        isActive: !medication.isActive
      });
      onUpdated();
    } catch (error) {
      console.error('약물 상태 변경 실패:', error);
      alert('약물 상태 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`'${medication.name}' 약물을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);
      await medicationApi.deleteMedication(medication.id);
      onUpdated();
    } catch (error) {
      console.error('약물 삭제 실패:', error);
      alert('약물 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getDaysRemaining = () => {
    if (!medication.endDate) return null;
    const endDate = new Date(medication.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className={`medication-card ${!medication.isActive ? 'inactive' : ''}`}>
      <div className="card-header">
        <div className="medication-info">
          <h3 className="medication-name">{medication.name}</h3>
          {medication.genericName && (
            <p className="generic-name">({medication.genericName})</p>
          )}
        </div>
        
        <div className="card-actions">
          <button
            className="btn btn-icon"
            onClick={() => setShowDetails(!showDetails)}
            title="상세 정보"
          >
            {showDetails ? '▲' : '▼'}
          </button>
          <button
            className="btn btn-icon"
            onClick={onEdit}
            title="수정"
          >
            ✏️
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="dosage-info">
          <span className="dosage">{medication.dosage}</span>
          <span className="frequency">{medication.frequency}</span>
          {medication.route && <span className="route">({medication.route})</span>}
        </div>

        {medication.purpose && (
          <div className="purpose">
            <strong>복용 목적:</strong> {medication.purpose}
          </div>
        )}

        <div className="date-info">
          <div className="start-date">
            <strong>시작일:</strong> {formatDate(medication.startDate)}
          </div>
          {medication.endDate && (
            <div className="end-date">
              <strong>종료일:</strong> {formatDate(medication.endDate)}
              {daysRemaining !== null && (
                <span className={`days-remaining ${daysRemaining <= 7 ? 'warning' : ''}`}>
                  ({daysRemaining > 0 ? `${daysRemaining}일 남음` : '종료됨'})
                </span>
              )}
            </div>
          )}
        </div>

        {/* 스케줄 정보 */}
        {medication.medicationSchedules.length > 0 && (
          <div className="schedules">
            <strong>복용 시간:</strong>
            <div className="schedule-list">
              {medication.medicationSchedules.map(schedule => (
                <span key={schedule.id} className="schedule-item">
                  {schedule.scheduledTime} ({schedule.timeOfDay})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 상세 정보 (접힌 상태에서 보이는 내용) */}
        {showDetails && (
          <div className="detailed-info">
            {medication.prescribedBy && (
              <div className="prescribed-by">
                <strong>처방의:</strong> {medication.prescribedBy}
              </div>
            )}
            
            {medication.pharmacy && (
              <div className="pharmacy">
                <strong>약국:</strong> {medication.pharmacy}
              </div>
            )}

            {medication.notes && (
              <div className="notes">
                <strong>메모:</strong> {medication.notes}
              </div>
            )}

            {/* 최근 복약 기록 */}
            {medication.dosageLogs.length > 0 && (
              <div className="recent-logs">
                <strong>최근 복약 기록:</strong>
                <div className="log-list">
                  {medication.dosageLogs.slice(0, 3).map(log => (
                    <div key={log.id} className="log-item">
                      {formatDate(log.takenAt)} - {log.dosageTaken}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 부작용 */}
            {medication.sideEffects.length > 0 && (
              <div className="side-effects">
                <strong>부작용:</strong>
                <div className="side-effect-list">
                  {medication.sideEffects.map(effect => (
                    <span 
                      key={effect.id} 
                      className={`side-effect ${effect.severity}`}
                    >
                      {effect.effectName} ({effect.severity})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="status-info">
          <span className={`status ${medication.isActive ? 'active' : 'inactive'}`}>
            {medication.isActive ? '복용 중' : '중단됨'}
          </span>
        </div>

        <div className="footer-actions">
          <button
            className={`btn btn-sm ${medication.isActive ? 'btn-warning' : 'btn-success'}`}
            onClick={handleToggleActive}
            disabled={loading}
          >
            {loading ? '처리 중...' : (medication.isActive ? '중단' : '재개')}
          </button>
          
          <button
            className="btn btn-sm btn-danger"
            onClick={handleDelete}
            disabled={loading}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};