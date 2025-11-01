import React, { useState, useEffect } from 'react';
import { notificationApi, MedicationNotification, PushNotificationManager } from '../../services/notificationApi';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<MedicationNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    
    // 푸시 알림 매니저 초기화
    const pushManager = PushNotificationManager.getInstance();
    pushManager.initialize();

    // 주기적으로 읽지 않은 알림 개수 업데이트
    const interval = setInterval(loadUnreadCount, 30000); // 30초마다
    
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('알림 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { count } = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('읽지 않은 알림 개수 로딩 실패:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const handleCreateReminders = async () => {
    try {
      await notificationApi.createMedicationReminders();
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('복약 알림 생성 실패:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationApi.testPushNotification('테스트 알림', '푸시 알림이 정상적으로 작동합니다.');
    } catch (error) {
      console.error('테스트 알림 실패:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return '💊';
      case 'interaction': return '⚠️';
      case 'side_effect': return '🩺';
      case 'refill': return '📦';
      default: return '🔔';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notification-center">
      {/* 알림 버튼 */}
      <button 
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="notification-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {/* 알림 드롭다운 */}
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>알림</h3>
            <div className="notification-actions">
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleCreateReminders}
                title="복약 알림 생성"
              >
                복약 알림
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={handleTestNotification}
                title="테스트 알림"
              >
                테스트
              </button>
              <button 
                className="close-btn"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>
          </div>

          <div className="notification-body">
            {loading ? (
              <div className="notification-loading">
                <div className="spinner"></div>
                <p>알림을 불러오는 중...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <div className="empty-icon">🔔</div>
                <p>새로운 알림이 없습니다</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.slice(0, 10).map(notification => (
                  <div 
                    key={notification.id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  >
                    <div className="notification-content">
                      <div className="notification-header-item">
                        <span className="notification-type-icon">
                          {getTypeIcon(notification.type)}
                        </span>
                        <span className="notification-title">
                          {notification.title}
                        </span>
                        <span 
                          className="notification-priority"
                          style={{ backgroundColor: getPriorityColor(notification.priority) }}
                        >
                          {notification.priority}
                        </span>
                      </div>
                      
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      
                      <div className="notification-time">
                        {formatTime(notification.scheduledFor)}
                        {notification.sentAt && (
                          <span className="sent-indicator">전송됨</span>
                        )}
                      </div>
                    </div>
                    
                    {!notification.isRead && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 10 && (
            <div className="notification-footer">
              <button className="btn btn-link">
                모든 알림 보기 ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};