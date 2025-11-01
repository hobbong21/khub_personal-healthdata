import React, { useState, useEffect } from 'react';
import { 
  Appointment, 
  AppointmentFilters, 
  APPOINTMENT_STATUSES, 
  APPOINTMENT_TYPES,
  DEPARTMENTS 
} from '../../types/appointment';
import { appointmentApi } from '../../services/appointmentApi';
import { AppointmentModal } from './AppointmentModal';

interface AppointmentListProps {
  filters?: AppointmentFilters;
  onAppointmentSelect?: (appointment: Appointment) => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  filters: externalFilters,
  onAppointmentSelect,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<AppointmentFilters>(externalFilters || {});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  // Load appointments
  const loadAppointments = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await appointmentApi.getAppointments(filters, page, pagination.limit);
      
      setAppointments(response.appointments);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
      });
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load appointments when filters or page changes
  useEffect(() => {
    loadAppointments(1);
  }, [filters]);

  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
    onAppointmentSelect?.(appointment);
  };

  // Handle filter change
  const handleFilterChange = (field: keyof AppointmentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '1시간';
    
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

  // Get status info
  const getStatusInfo = (status: string) => {
    return APPOINTMENT_STATUSES.find(s => s.value === status);
  };

  // Get type info
  const getTypeInfo = (type: string) => {
    return APPOINTMENT_TYPES.find(t => t.value === type);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    loadAppointments(newPage);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="appointment-list">
      {/* Filters */}
      <div className="appointment-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>상태</label>
            <select
              value={filters.status?.[0] || ''}
              onChange={(e) => handleFilterChange('status', e.target.value ? [e.target.value] : undefined)}
            >
              <option value="">전체</option>
              {APPOINTMENT_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>진료과</label>
            <select
              value={filters.department?.[0] || ''}
              onChange={(e) => handleFilterChange('department', e.target.value ? [e.target.value] : undefined)}
            >
              <option value="">전체</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>예약 유형</label>
            <select
              value={filters.appointmentType?.[0] || ''}
              onChange={(e) => handleFilterChange('appointmentType', e.target.value ? [e.target.value] : undefined)}
            >
              <option value="">전체</option>
              {APPOINTMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>병원명</label>
            <input
              type="text"
              value={filters.hospitalName || ''}
              onChange={(e) => handleFilterChange('hospitalName', e.target.value || undefined)}
              placeholder="병원명 검색"
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>시작일</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
            />
          </div>

          <div className="filter-group">
            <label>종료일</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
            />
          </div>

          <div className="filter-actions">
            <button
              className="btn btn-outline"
              onClick={() => setFilters({})}
            >
              필터 초기화
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">로딩 중...</div>
        </div>
      )}

      {/* Appointment List */}
      {!loading && (
        <>
          <div className="appointment-items">
            {appointments.length === 0 ? (
              <div className="empty-state">
                <p>예약이 없습니다.</p>
              </div>
            ) : (
              appointments.map(appointment => {
                const statusInfo = getStatusInfo(appointment.status);
                const typeInfo = getTypeInfo(appointment.appointmentType);

                return (
                  <div
                    key={appointment.id}
                    className="appointment-item"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="appointment-header">
                      <div className="appointment-title">
                        <h4>{appointment.hospitalName}</h4>
                        <span className="department">{appointment.department}</span>
                      </div>
                      <div className="appointment-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: statusInfo?.color }}
                        >
                          {statusInfo?.label}
                        </span>
                      </div>
                    </div>

                    <div className="appointment-details">
                      <div className="detail-item">
                        <span className="label">일시:</span>
                        <span className="value">{formatDate(appointment.appointmentDate)}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="label">유형:</span>
                        <span className="value">{typeInfo?.label}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="label">소요시간:</span>
                        <span className="value">{formatDuration(appointment.duration)}</span>
                      </div>

                      {appointment.doctorName && (
                        <div className="detail-item">
                          <span className="label">담당의:</span>
                          <span className="value">{appointment.doctorName}</span>
                        </div>
                      )}

                      {appointment.purpose && (
                        <div className="detail-item">
                          <span className="label">목적:</span>
                          <span className="value">{appointment.purpose}</span>
                        </div>
                      )}
                    </div>

                    {appointment.notes && (
                      <div className="appointment-notes">
                        <p>{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                이전
              </button>

              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, pagination.page - 2) + i;
                  if (pageNumber > totalPages) return null;

                  return (
                    <button
                      key={pageNumber}
                      className={`btn ${pageNumber === pagination.page ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                className="btn btn-outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
              >
                다음
              </button>

              <div className="pagination-info">
                <span>
                  {pagination.total}개 중 {((pagination.page - 1) * pagination.limit) + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)}개 표시
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedAppointment(null);
          }}
          onUpdate={() => {
            loadAppointments(pagination.page);
            setShowModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};