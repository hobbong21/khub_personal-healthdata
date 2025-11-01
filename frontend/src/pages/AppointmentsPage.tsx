import React, { useState, useEffect } from 'react';
import { AppointmentCalendar } from '../components/appointment/AppointmentCalendar';
import { AppointmentList } from '../components/appointment/AppointmentList';
import { CreateAppointmentModal } from '../components/appointment/CreateAppointmentModal';
import { appointmentApi } from '../services/appointmentApi';
import { Appointment, AppointmentStats } from '../types/appointment';
import './AppointmentsPage.css';

type ViewMode = 'calendar' | 'list';

export const AppointmentsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [upcomingResponse, statsResponse] = await Promise.all([
        appointmentApi.getUpcomingAppointments(7), // Next 7 days
        appointmentApi.getAppointmentStats(),
      ]);

      setUpcomingAppointments(upcomingResponse.appointments);
      setStats(statsResponse.stats);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = () => {
    loadInitialData(); // Refresh data after creating appointment
    setShowCreateModal(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `오늘 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `내일 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="appointments-page">
      <div className="page-header">
        <div className="header-content">
          <h1>병원 예약 관리</h1>
          <p>병원 예약을 효율적으로 관리하고 알림을 설정하세요.</p>
        </div>
        
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            새 예약 등록
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-value">{stats.totalAppointments}</div>
            <div className="stat-label">총 예약</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.upcomingAppointments}</div>
            <div className="stat-label">예정된 예약</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completedAppointments}</div>
            <div className="stat-label">완료된 예약</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.cancelledAppointments}</div>
            <div className="stat-label">취소된 예약</div>
          </div>
        </div>
      )}

      <div className="appointments-content">
        {/* Sidebar */}
        <div className="appointments-sidebar">
          {/* View Mode Toggle */}
          <div className="view-toggle">
            <h3>보기 모드</h3>
            <div className="toggle-buttons">
              <button
                className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('calendar')}
              >
                캘린더
              </button>
              <button
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('list')}
              >
                목록
              </button>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="upcoming-appointments">
            <h3>다가오는 예약</h3>
            {loading ? (
              <div className="loading-text">로딩 중...</div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="empty-state">
                <p>예정된 예약이 없습니다.</p>
              </div>
            ) : (
              <div className="upcoming-list">
                {upcomingAppointments.slice(0, 5).map(appointment => (
                  <div key={appointment.id} className="upcoming-item">
                    <div className="upcoming-date">
                      {formatDate(appointment.appointmentDate)}
                    </div>
                    <div className="upcoming-details">
                      <div className="hospital-name">{appointment.hospitalName}</div>
                      <div className="department">{appointment.department}</div>
                    </div>
                  </div>
                ))}
                
                {upcomingAppointments.length > 5 && (
                  <div className="more-appointments">
                    +{upcomingAppointments.length - 5}개 더
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Department Stats */}
          {stats && stats.appointmentsByDepartment.length > 0 && (
            <div className="department-stats">
              <h3>진료과별 예약</h3>
              <div className="department-list">
                {stats.appointmentsByDepartment.slice(0, 5).map(item => (
                  <div key={item.department} className="department-item">
                    <span className="department-name">{item.department}</span>
                    <span className="department-count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="appointments-main">
          {viewMode === 'calendar' ? (
            <AppointmentCalendar
              onDateSelect={(date) => {
                // Could open create modal with selected date
                console.log('Date selected:', date);
              }}
            />
          ) : (
            <AppointmentList />
          )}
        </div>
      </div>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateAppointment}
      />
    </div>
  );
};