import React, { useState } from 'react';
import { 
  CreateAppointmentRequest, 
  APPOINTMENT_TYPES, 
  DEPARTMENTS, 
  NOTIFICATION_TYPES,
  REMINDER_TIME_OPTIONS,
  DEFAULT_REMINDER_SETTINGS,
  ReminderSettings
} from '../../types/appointment';
import { appointmentApi } from '../../services/appointmentApi';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  initialDate?: Date;
  onClose: () => void;
  onCreate: () => void;
}

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  initialDate,
  onClose,
  onCreate,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentRequest>(() => {
    const defaultDate = initialDate || new Date();
    defaultDate.setHours(9, 0, 0, 0); // Default to 9 AM
    
    return {
      hospitalName: '',
      department: '',
      doctorName: '',
      appointmentType: 'consultation',
      purpose: '',
      appointmentDate: defaultDate.toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
      duration: 60,
      location: '',
      notes: '',
      hospitalPhone: '',
      hospitalAddress: '',
      reminderSettings: DEFAULT_REMINDER_SETTINGS,
    };
  });

  if (!isOpen) return null;

  const handleInputChange = (field: keyof CreateAppointmentRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReminderSettingsChange = (settings: ReminderSettings) => {
    setFormData(prev => ({
      ...prev,
      reminderSettings: settings,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.hospitalName.trim()) {
        alert('병원명을 입력해주세요.');
        return;
      }
      
      if (!formData.department.trim()) {
        alert('진료과를 선택해주세요.');
        return;
      }
      
      // Validate appointment date
      const appointmentDate = new Date(formData.appointmentDate);
      if (appointmentDate <= new Date()) {
        alert('예약 날짜는 현재 시간 이후여야 합니다.');
        return;
      }

      await appointmentApi.createAppointment(formData);
      onCreate();
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      const errorMessage = error.response?.data?.error || '예약 생성에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-appointment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>새 예약 등록</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Basic Information */}
            <div className="form-section">
              <h3>기본 정보</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="hospitalName">병원명 *</label>
                  <input
                    type="text"
                    id="hospitalName"
                    value={formData.hospitalName}
                    onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                    placeholder="병원명을 입력하세요"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">진료과 *</label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    required
                  >
                    <option value="">진료과를 선택하세요</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="doctorName">담당의</label>
                  <input
                    type="text"
                    id="doctorName"
                    value={formData.doctorName}
                    onChange={(e) => handleInputChange('doctorName', e.target.value)}
                    placeholder="담당의명을 입력하세요"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="appointmentType">예약 유형 *</label>
                  <select
                    id="appointmentType"
                    value={formData.appointmentType}
                    onChange={(e) => handleInputChange('appointmentType', e.target.value)}
                    required
                  >
                    {APPOINTMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="form-section">
              <h3>일정 정보</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="appointmentDate">예약 일시 *</label>
                  <input
                    type="datetime-local"
                    id="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">예상 소요시간 (분)</label>
                  <input
                    type="number"
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    min="5"
                    max="480"
                    step="5"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">위치</label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="진료실, 건물명 등"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section">
              <h3>연락처 정보</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="hospitalPhone">병원 전화번호</label>
                  <input
                    type="tel"
                    id="hospitalPhone"
                    value={formData.hospitalPhone}
                    onChange={(e) => handleInputChange('hospitalPhone', e.target.value)}
                    placeholder="02-1234-5678"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="hospitalAddress">병원 주소</label>
                  <input
                    type="text"
                    id="hospitalAddress"
                    value={formData.hospitalAddress}
                    onChange={(e) => handleInputChange('hospitalAddress', e.target.value)}
                    placeholder="병원 주소를 입력하세요"
                  />
                </div>
              </div>
            </div>

            {/* Purpose and Notes */}
            <div className="form-section">
              <h3>추가 정보</h3>
              <div className="form-group">
                <label htmlFor="purpose">예약 목적</label>
                <input
                  type="text"
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  placeholder="진료 목적을 간단히 입력하세요"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">메모</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="추가 메모사항이 있으면 입력하세요"
                  rows={3}
                />
              </div>
            </div>

            {/* Reminder Settings */}
            <div className="form-section">
              <h3>알림 설정</h3>
              <div className="reminder-settings">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.reminderSettings?.enabled || false}
                      onChange={(e) => handleReminderSettingsChange({
                        ...formData.reminderSettings!,
                        enabled: e.target.checked,
                      })}
                    />
                    알림 사용
                  </label>
                </div>

                {formData.reminderSettings?.enabled && (
                  <div className="reminder-notifications">
                    {formData.reminderSettings.notifications.map((notification, index) => (
                      <div key={index} className="reminder-notification">
                        <select
                          value={notification.type}
                          onChange={(e) => {
                            const newNotifications = [...formData.reminderSettings!.notifications];
                            newNotifications[index] = {
                              ...notification,
                              type: e.target.value as any,
                            };
                            handleReminderSettingsChange({
                              ...formData.reminderSettings!,
                              notifications: newNotifications,
                            });
                          }}
                        >
                          {NOTIFICATION_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={notification.timeBeforeAppointment}
                          onChange={(e) => {
                            const newNotifications = [...formData.reminderSettings!.notifications];
                            newNotifications[index] = {
                              ...notification,
                              timeBeforeAppointment: parseInt(e.target.value),
                            };
                            handleReminderSettingsChange({
                              ...formData.reminderSettings!,
                              notifications: newNotifications,
                            });
                          }}
                        >
                          {REMINDER_TIME_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            const newNotifications = formData.reminderSettings!.notifications.filter((_, i) => i !== index);
                            handleReminderSettingsChange({
                              ...formData.reminderSettings!,
                              notifications: newNotifications,
                            });
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        const newNotifications = [
                          ...formData.reminderSettings!.notifications,
                          {
                            type: 'in_app' as any,
                            timeBeforeAppointment: 60,
                          },
                        ];
                        handleReminderSettingsChange({
                          ...formData.reminderSettings!,
                          notifications: newNotifications,
                        });
                      }}
                    >
                      알림 추가
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '등록 중...' : '예약 등록'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};