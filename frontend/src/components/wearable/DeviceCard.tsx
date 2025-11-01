import React, { useState } from 'react';
import { WearableDeviceConfig, SyncStatus } from '../../types/wearable';
import { wearableApi } from '../../services/wearableApi';
import DeviceSettingsModal from './DeviceSettingsModal';
import './DeviceCard.css';

interface DeviceCardProps {
  device: WearableDeviceConfig;
  syncStatus?: SyncStatus;
  onDisconnect: () => void;
  onUpdate: (device: WearableDeviceConfig) => void;
  onManualSync: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  syncStatus,
  onDisconnect,
  onUpdate,
  onManualSync
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleActive = async () => {
    try {
      setIsToggling(true);
      const updatedDevice = await wearableApi.updateDeviceConfig(device.id, {
        isActive: !device.isActive
      });
      onUpdate(updatedDevice);
    } catch (error) {
      console.error('Failed to toggle device status:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const formatLastSync = (lastSyncAt?: string) => {
    if (!lastSyncAt) return '동기화 안됨';
    
    const lastSync = new Date(lastSyncAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  };

  const getSyncStatusColor = () => {
    if (!device.isActive) return '#6b7280';
    if (syncStatus?.syncInProgress) return '#3b82f6';
    if (syncStatus?.errors && syncStatus.errors.length > 0) return '#ef4444';
    if (syncStatus?.lastSyncAt) {
      const lastSync = new Date(syncStatus.lastSyncAt);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceSync < 2) return '#10b981';
      if (hoursSinceSync < 24) return '#f59e0b';
      return '#ef4444';
    }
    return '#6b7280';
  };

  const deviceIcon = wearableApi.getDeviceIcon(device.deviceType);
  const deviceTypeName = wearableApi.getDeviceTypeName(device.deviceType);
  const syncStatusColor = getSyncStatusColor();

  return (
    <>
      <div className={`device-card ${!device.isActive ? 'inactive' : ''}`}>
        <div className="device-header">
          <div className="device-info">
            <div className="device-icon">{deviceIcon}</div>
            <div className="device-details">
              <h4 className="device-name">{device.deviceName}</h4>
              <p className="device-type">{deviceTypeName}</p>
            </div>
          </div>
          <div className="device-actions">
            <button
              className="btn-icon"
              onClick={() => setShowSettings(true)}
              title="설정"
            >
              ⚙️
            </button>
          </div>
        </div>

        <div className="device-status">
          <div className="status-item">
            <div 
              className="status-indicator"
              style={{ backgroundColor: syncStatusColor }}
            ></div>
            <div className="status-info">
              <span className="status-label">동기화 상태</span>
              <span className="status-value">
                {syncStatus?.syncInProgress ? '동기화 중...' : 
                 device.isActive ? formatLastSync(syncStatus?.lastSyncAt) : '비활성화됨'}
              </span>
            </div>
          </div>

          {syncStatus && (
            <div className="status-item">
              <span className="status-label">데이터 포인트</span>
              <span className="status-value">{syncStatus.totalDataPoints.toLocaleString()}개</span>
            </div>
          )}
        </div>

        <div className="device-sync-settings">
          <div className="sync-info">
            <span className="sync-label">자동 동기화</span>
            <span className="sync-value">
              {device.syncSettings.autoSync ? 
                `${device.syncSettings.syncInterval}분마다` : 
                '비활성화'}
            </span>
          </div>
          <div className="sync-info">
            <span className="sync-label">데이터 타입</span>
            <span className="sync-value">{device.syncSettings.dataTypes.length}개 선택</span>
          </div>
        </div>

        {syncStatus?.errors && syncStatus.errors.length > 0 && (
          <div className="device-errors">
            <div className="error-header">
              <span className="error-icon">⚠️</span>
              <span>동기화 오류</span>
            </div>
            <div className="error-list">
              {syncStatus.errors.slice(0, 2).map((error, index) => (
                <div key={index} className="error-item">{error}</div>
              ))}
              {syncStatus.errors.length > 2 && (
                <div className="error-more">
                  +{syncStatus.errors.length - 2}개 더
                </div>
              )}
            </div>
          </div>
        )}

        <div className="device-controls">
          <button
            className={`btn-toggle ${device.isActive ? 'active' : ''}`}
            onClick={handleToggleActive}
            disabled={isToggling}
          >
            {isToggling ? '처리 중...' : (device.isActive ? '비활성화' : '활성화')}
          </button>
          
          {device.isActive && (
            <button
              className="btn-sync"
              onClick={onManualSync}
              disabled={syncStatus?.syncInProgress}
            >
              {syncStatus?.syncInProgress ? '동기화 중...' : '수동 동기화'}
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <DeviceSettingsModal
          device={device}
          onClose={() => setShowSettings(false)}
          onUpdate={onUpdate}
          onDisconnect={onDisconnect}
        />
      )}
    </>
  );
};

export default DeviceCard;