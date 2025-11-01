import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { appointmentApi } from '../../services/appointmentApi';
import { Appointment, CalendarEvent, APPOINTMENT_STATUSES } from '../../types/appointment';
import { AppointmentModal } from './AppointmentModal';
import { CreateAppointmentModal } from './CreateAppointmentModal';

const localizer = momentLocalizer(moment);

interface AppointmentCalendarProps {
  onAppointmentSelect?: (appointment: Appointment) => void;
  onDateSelect?: (date: Date) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  onAppointmentSelect,
  onDateSelect,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load appointments for the current view
  const loadAppointments = async (start: Date, end: Date) => {
    try {
      setLoading(true);
      const { appointments } = await appointmentApi.getAppointmentsForCalendar(
        start.toISOString(),
        end.toISOString()
      );

      const calendarEvents: CalendarEvent[] = appointments.map(appointment => {
        const startDate = new Date(appointment.appointmentDate);
        const endDate = new Date(startDate);
        
        if (appointment.duration) {
          endDate.setMinutes(endDate.getMinutes() + appointment.duration);
        } else {
          endDate.setHours(endDate.getHours() + 1); // Default 1 hour
        }

        const statusInfo = APPOINTMENT_STATUSES.find(s => s.value === appointment.status);

        return {
          id: appointment.id,
          title: `${appointment.hospitalName} - ${appointment.department}`,
          start: startDate,
          end: endDate,
          resource: appointment,
          allDay: false,
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate date range for current view
  const getDateRange = (date: Date, view: View) => {
    const start = moment(date).startOf(view === Views.MONTH ? 'month' : view).toDate();
    const end = moment(date).endOf(view === Views.MONTH ? 'month' : view).toDate();
    
    // Extend range for month view to include partial weeks
    if (view === Views.MONTH) {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(end.getDate() + (6 - end.getDay()));
    }
    
    return { start, end };
  };

  // Load appointments when view or date changes
  useEffect(() => {
    const { start, end } = getDateRange(currentDate, currentView);
    loadAppointments(start, end);
  }, [currentDate, currentView]);

  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    const appointment = event.resource;
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowAppointmentModal(true);
      onAppointmentSelect?.(appointment);
    }
  };

  // Handle slot selection (empty time slot)
  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    setSelectedDate(start);
    setShowCreateModal(true);
    onDateSelect?.(start);
  };

  // Handle navigation
  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  // Handle view change
  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  // Custom event style
  const eventStyleGetter = (event: CalendarEvent) => {
    const appointment = event.resource;
    if (!appointment) return {};

    const statusInfo = APPOINTMENT_STATUSES.find(s => s.value === appointment.status);
    const backgroundColor = statusInfo?.color || '#3b82f6';

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: appointment.status === 'cancelled' ? 0.6 : 1,
        color: 'white',
        border: 'none',
        fontSize: '12px',
      },
    };
  };

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="calendar-toolbar">
      <div className="calendar-nav">
        <button 
          className="btn btn-outline"
          onClick={() => onNavigate('PREV')}
        >
          이전
        </button>
        <button 
          className="btn btn-outline"
          onClick={() => onNavigate('TODAY')}
        >
          오늘
        </button>
        <button 
          className="btn btn-outline"
          onClick={() => onNavigate('NEXT')}
        >
          다음
        </button>
      </div>
      
      <div className="calendar-title">
        <h3>{label}</h3>
      </div>
      
      <div className="calendar-views">
        <button 
          className={`btn ${currentView === Views.MONTH ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onView(Views.MONTH)}
        >
          월
        </button>
        <button 
          className={`btn ${currentView === Views.WEEK ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onView(Views.WEEK)}
        >
          주
        </button>
        <button 
          className={`btn ${currentView === Views.DAY ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onView(Views.DAY)}
        >
          일
        </button>
      </div>
    </div>
  );

  const handleAppointmentUpdate = () => {
    // Reload appointments after update
    const { start, end } = getDateRange(currentDate, currentView);
    loadAppointments(start, end);
    setShowAppointmentModal(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentCreate = () => {
    // Reload appointments after creation
    const { start, end } = getDateRange(currentDate, currentView);
    loadAppointments(start, end);
    setShowCreateModal(false);
    setSelectedDate(null);
  };

  return (
    <div className="appointment-calendar">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">로딩 중...</div>
        </div>
      )}
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        view={currentView}
        date={currentDate}
        selectable
        popup
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: CustomToolbar,
        }}
        messages={{
          next: '다음',
          previous: '이전',
          today: '오늘',
          month: '월',
          week: '주',
          day: '일',
          agenda: '일정',
          date: '날짜',
          time: '시간',
          event: '예약',
          noEventsInRange: '이 기간에 예약이 없습니다.',
          showMore: (total: number) => `+${total} 더보기`,
        }}
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }) => 
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
          dayHeaderFormat: 'M월 D일 (ddd)',
          dayRangeHeaderFormat: ({ start, end }) =>
            `${moment(start).format('M월 D일')} - ${moment(end).format('M월 D일')}`,
        }}
      />

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          isOpen={showAppointmentModal}
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
          }}
          onUpdate={handleAppointmentUpdate}
        />
      )}

      {/* Create Appointment Modal */}
      {selectedDate && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          initialDate={selectedDate}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
          }}
          onCreate={handleAppointmentCreate}
        />
      )}
    </div>
  );
};