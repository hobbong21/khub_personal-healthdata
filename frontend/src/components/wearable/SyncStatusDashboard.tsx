import React from 'react';
import { SyncStatus } from '../../types/wearable';
import { wearableApi } from '../../services/wearableApi';
import './SyncStatusDashboard.css';

interface SyncStatusDashboardProps {
  syncStatuses: SyncStatus[];
  onRefresh: () => void;
}

const SyncStatusDashboard: React.FC<SyncStatusDashboardProps> = ({
  syncStatuses,
  onRefresh
}) => {
  const activeDevices = syncStatuses.filter(status => status.isActive);
  const syncingDevices = syncStatuses.filter(status => status.syncInProgress);
  const errorDevices = syncStatuses.filter(status => 
    status.errors && status.errors.length > 0
  );
  
  const totalDataPoints = syncStatuses.reduce(
    (sum, status) => sum + status.totalDataPoints, 0
  );

  const getOverallStatus = () => {
    if (syncingDevices.length > 0) return 'syncing';
    if (errorDevices.length > 0) return 'error';
    if (activeDevices.length === 0) return 'inactive';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'syncing': return '#3b82f6';
      case 'error': return '#ef4444';
      case 'inactive': return '#6b7280';
      case 'healthy': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'syncing': return '동기화 중';
      case 'error': return '오류 발생';
      case 'inactive': return '비활성화';
      case 'healthy': return '정상';
      default: return '알 수 없음';
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="sync-status-dashboard">
      <div className="dashboard-header">
        <h3>동기화 상태</h3>
        <button 
          className="refresh-button"
          onClick={onRefresh}
          title="새로고침"
        >
          🔄
        </button>
      </div>

      <div className="status-overview">
        <div className="status-card overall-status">
          <div 
            className="status-indicator large"
            style={{ backgroundColor: getStatusColor(overallStatus) }}
          ></div>
          <div className="status-info">
            <h4>전체 상태</h4>
            <p>{getStatusText(overallStatus)}</p>
          </div>
        </div>

        <div className="status-metrics">
          <div className="metric-item">
            <div className="metric-value">{activeDevices.length}</div>
            <div className="metric-label">활성 기기</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{totalDataPoints.toLocaleString()}</div>
            <div className="metric-label">총 데이터</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{syncingDevices.length}</div>
            <div className="metric-label">동기화 중</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{errorDevices.length}</div>
            <div className="metric-label">오류</div>
          </div>
        </div>
      </div>

      {syncStatuses.length > 0 && (
        <div className="devices-status-list">
          {syncStatuses.map(status => (
            <div key={status.deviceConfigId} className="device-status-item">
              <div className="device-basic-info">
                <div className="device-icon">
                  {wearableApi.getDeviceIcon(status.deviceType)}
                </div>
                <div className="device-details">
                  <h5>{status.deviceName}</h5>
                  <p>{wearableApi.getDeviceTypeName(status.deviceType)}</p>
                </div>
              </div>

              <div className="device-status-info">
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: wearableApi.getSyncStatusColor(status) }}
                ></div>
                <div className="status-text">
                  {wearableApi.getSyncStatusText(status)}
                </div>
              </div>

              <div className="device-metrics">
                <div className="metric">
                  <span className="metric-value">{status.totalDataPoints.toLocaleString()}</span>
                  <span className="metric-label">데이터</span>
                </div>
                {status.nextSyncAt && (
                  <div className="metric">
                    <span className="metric-value">
                      {new Date(status.nextSyncAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="metric-label">다음 동기화</span>
                  </div>
                )}
              </div>

              {status.errors && status.errors.length > 0 && (
                <div className="device-errors">
                  <div className="error-indicator">⚠️</div>
                  <div className="error-count">{status.errors.length}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {syncStatuses.length === 0 && (
        <div className="no-devices-status">
          <div className="no-devices-icon">📱</div>
          <p>연결된 기기가 없습니다</p>
        </div>
      )}
    </div>
  );
};

export default SyncStatusDashboard;