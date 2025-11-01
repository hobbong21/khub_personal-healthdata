import React, { useState } from 'react';
import { Appointment, APPOINTMENT_STATUSES, APPOINTMENT_TYPES } from '../../types/appointment';
import { appointmentApi } from '../../services/appointmentApi';
import { EditAppointmentModal } from './EditAppointmentModal';

interface AppointmentModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  if (!isOpen) return null;

  const statusInfo = APPOINTMENT_STATUSES.find(s => s.value === appointment.status);
  const typeInfo = APPOINTMENT_TYPES.find(t => t.value === appointment.appointmentType);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '1시간 (기본)';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}시간 ${mins}분`;
    } else if (hours > 0) {
      return `${hours}시간`;
    } else {
      return `${mins}분`;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setLoading(true);
      await appointmentApi.updateAppointmentStatus(appointment.id, newStatus as any);
      onUpdate();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      alert('예약 상태 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('정말로 이 예약을 취소하시겠습니까?')) return;
    
    try {
      setLoading(true);
      await appointmentApi.cancelAppointment(appointment.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert('예약 취소에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 예약을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    try {
      setLoading(true);
      await appointmentApi.deleteAppointment(appointment.id);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      alert('예약 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content appointment-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>예약 상세 정보</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          <div className="modal-body">
            <div className="appointment-details">
              {/* Status Badge */}
              <div className="appointment-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: statusInfo?.color }}
                >
                  {statusInfo?.label}
                </span>
              </div>

              {/* Basic Information */}
              <div className="detail-section">
                <h3>기본 정보</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>병원명</label>
                    <span>{appointment.hospitalName}</span>
                  </div>
                  <div className="detail-item">
                    <label>진료과</label>
                    <span>{appointment.department}</span>
                  </div>
                  {appointment.doctorName && (
                    <div className="detail-item">
                      <label>담당의</label>
                      <span>{appointment.doctorName}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>예약 유형</label>
                    <span>{typeInfo?.label}</span>
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="detail-section">
                <h3>일정 정보</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>예약 일시</label>
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="detail-item">
                    <label>예상 소요시간</label>
                    <span>{formatDuration(appointment.duration)}</span>
                  </div>
                  {appointment.location && (
                    <div className="detail-item">
                      <label>위치</label>
                      <span>{appointment.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              {(appointment.hospitalPhone || appointment.hospitalAddress) && (
                <div className="detail-section">
                  <h3>연락처 정보</h3>
                  <div className="detail-grid">
                    {appointment.hospitalPhone && (
                      <div className="detail-item">
                        <label>전화번호</label>
                        <span>
                          <a href={`tel:${appointment.hospitalPhone}`}>
                            {appointment.hospitalPhone}
                          </a>
                        </span>
                      </div>
                    )}
                    {appointment.hospitalAddress && (
                      <div className="detail-item">
                        <label>주소</label>
                        <span>{appointment.hospitalAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Purpose and Notes */}
              {(appointment.purpose || appointment.notes) && (
                <div className="detail-section">
                  <h3>추가 정보</h3>
                  {appointment.purpose && (
                    <div className="detail-item">
                      <label>예약 목적</label>
                      <p>{appointment.purpose}</p>
                    </div>
                  )}
                  {appointment.notes && (
                    <div className="detail-item">
                      <label>메모</label>
                      <p>{appointment.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reminder Settings */}
              {appointment.reminderSettings?.enabled && (
                <div className="detail-section">
                  <h3>알림 설정</h3>
                  <div className="reminder-list">
                    {appointment.reminderSettings.notifications.map((notification, index) => (
                      <div key={index} className="reminder-item">
                        <span className="reminder-type">{notification.type}</span>
                        <span className="reminder-time">
                          {notification.timeBeforeAppointment}분 전
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <div className="action-buttons">
              {/* Status Update Buttons */}
              {appointment.status === 'scheduled' && (
                <button
                  className="btn btn-success"
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={loading}
                >
                  확정
                </button>
              )}
              
              {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={loading}
                >
                  완료
                </button>
              )}

              {/* Edit Button */}
              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <button
                  className="btn btn-outline"
                  onClick={() => setShowEditModal(true)}
                  disabled={loading}
                >
                  수정
                </button>
              )}

              {/* Cancel Button */}
              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <button
                  className="btn btn-warning"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  취소
                </button>
              )}

              {/* Delete Button */}
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                삭제
              </button>

              <button className="btn btn-outline" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditAppointmentModal
          appointment={appointment}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            setShowEditModal(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
};