import React, { useState, useEffect } from 'react';
import { wearableApi } from '../../services/wearableApi';
import { WearableDeviceConfig, SyncStatus } from '../../types/wearable';
import DeviceConnectionModal from './DeviceConnectionModal';
import DeviceCard from './DeviceCard';
import SyncStatusDashboard from './SyncStatusDashboard';
import './WearableDeviceManager.css';

const WearableDeviceManager: React.FC = () => {
  const [devices, setDevices] = useState<WearableDeviceConfig[]>([]);
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDevicesAndStatus();
  }, []);

  const loadDevicesAndStatus = async () => {
    try {
      setLoading(true);
      const [devicesData, statusData] = await Promise.all([
        wearableApi.getUserDevices(),
        wearableApi.getSyncStatus()
      ]);
      
      setDevices(devicesData);
      setSyncStatuses(statusData);
      setError(null);
    } catch (err) {
      console.error('Failed to load devices and status:', err);
      setError('기기 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceConnected = (newDevice: WearableDeviceConfig) => {
    setDevices(prev => [...prev, newDevice]);
    setShowConnectionModal(false);
    loadDevicesAndStatus(); // 상태 새로고침
  };

  const handleDeviceDisconnected = async (deviceId: string) => {
    try {
      await wearableApi.disconnectDevice(deviceId);
      setDevices(prev => prev.filter(device => device.id !== deviceId));
      setSyncStatuses(prev => prev.filter(status => status.deviceConfigId !== deviceId));
    } catch (err) {
      console.error('Failed to disconnect device:', err);
      setError('기기 연동 해제에 실패했습니다.');
    }
  };

  const handleDeviceUpdated = (updatedDevice: WearableDeviceConfig) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === updatedDevice.id ? updatedDevice : device
      )
    );
    loadDevicesAndStatus(); // 상태 새로고침
  };

  const handleManualSync = async (deviceId: string) => {
    try {
      // 동기화 상태 업데이트
      setSyncStatuses(prev => 
        prev.map(status => 
          status.deviceConfigId === deviceId 
            ? { ...status, syncInProgress: true }
            : status
        )
      );

      const result = await wearableApi.triggerManualSync(deviceId);
      
      if (result.success) {
        // 성공 시 상태 새로고침
        await loadDevicesAndStatus();
      } else {
        setError('동기화에 실패했습니다.');
      }
    } catch (err) {
      console.error('Manual sync failed:', err);
      setError('동기화 중 오류가 발생했습니다.');
      // 동기화 상태 복원
      setSyncStatuses(prev => 
        prev.map(status => 
          status.deviceConfigId === deviceId 
            ? { ...status, syncInProgress: false }
            : status
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="wearable-manager">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>기기 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wearable-manager">
      <div className="wearable-header">
        <h2>웨어러블 기기 관리</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowConnectionModal(true)}
        >
          + 기기 연동
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button 
            className="error-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* 동기화 상태 대시보드 */}
      <SyncStatusDashboard 
        syncStatuses={syncStatuses}
        onRefresh={loadDevicesAndStatus}
      />

      {/* 연결된 기기 목록 */}
      <div className="devices-section">
        <h3>연결된 기기</h3>
        {devices.length === 0 ? (
          <div className="no-devices">
            <div className="no-devices-icon">📱</div>
            <h4>연결된 기기가 없습니다</h4>
            <p>웨어러블 기기를 연동하여 건강 데이터를 자동으로 수집하세요.</p>
            <button 
              className="btn-primary"
              onClick={() => setShowConnectionModal(true)}
            >
              첫 번째 기기 연동하기
            </button>
          </div>
        ) : (
          <div className="devices-grid">
            {devices.map(device => {
              const syncStatus = syncStatuses.find(
                status => status.deviceConfigId === device.id
              );
              
              return (
                <DeviceCard
                  key={device.id}
                  device={device}
                  syncStatus={syncStatus}
                  onDisconnect={() => handleDeviceDisconnected(device.id)}
                  onUpdate={handleDeviceUpdated}
                  onManualSync={() => handleManualSync(device.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 기기 연결 모달 */}
      {showConnectionModal && (
        <DeviceConnectionModal
          onClose={() => setShowConnectionModal(false)}
          onDeviceConnected={handleDeviceConnected}
        />
      )}
    </div>
  );
};

export default WearableDeviceManager;