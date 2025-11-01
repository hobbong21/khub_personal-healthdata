import React, { useState, useEffect } from 'react';
import { WearableDeviceConfig, WearableDataType, DataTypeInfo } from '../../types/wearable';
import { wearableApi } from '../../services/wearableApi';
import './DeviceSettingsModal.css';

interface DeviceSettingsModalProps {
  device: WearableDeviceConfig;
  onClose: () => void;
  onUpdate: (device: WearableDeviceConfig) => void;
  onDisconnect: () => void;
}

const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  device,
  onClose,
  onUpdate,
  onDisconnect
}) => {
  const [deviceName, setDeviceName] = useState(device.deviceName);
  const [autoSync, setAutoSync] = useState(device.syncSettings.autoSync);
  const [syncInterval, setSyncInterval] = useState(device.syncSettings.syncInterval);
  const [selectedDataTypes, setSelectedDataTypes] = useState<WearableDataType[]>(
    device.syncSettings.dataTypes
  );
  const [supportedDataTypes, setSupportedDataTypes] = useState<DataTypeInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  useEffect(() => {
    loadSupportedDataTypes();
  }, []);

  const loadSupportedDataTypes = async () => {
    try {
      const dataTypes = await wearableApi.getSupportedDataTypes(device.deviceType);
      setSupportedDataTypes(dataTypes);
    } catch (err) {
      console.error('Failed to load supported data types:', err);
      setError('지원 데이터 타입을 불러오는데 실패했습니다.');
    }
  };

  const handleDataTypeToggle = (dataType: WearableDataType) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataType)
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const handleSave = async () => {
    if (!deviceName.trim()) {
      setError('기기 이름을 입력해주세요.');
      return;
    }

    if (selectedDataTypes.length === 0) {
      setError('최소 하나의 데이터 타입을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedDevice = await wearableApi.updateDeviceConfig(device.id, {
        deviceName: deviceName.trim(),
        syncSettings: {
          autoSync,
          syncInterval,
          dataTypes: selectedDataTypes
        }
      });

      onUpdate(updatedDevice);
      onClose();
    } catch (err) {
      console.error('Failed to update device settings:', err);
      setError('설정 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await wearableApi.disconnectDevice(device.id);
      onDisconnect();
      onClose();
    } catch (err) {
      console.error('Failed to disconnect device:', err);
      setError('기기 연동 해제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      deviceName !== device.deviceName ||
      autoSync !== device.syncSettings.autoSync ||
      syncInterval !== device.syncSettings.syncInterval ||
      JSON.stringify(selectedDataTypes.sort()) !== JSON.stringify(device.syncSettings.dataTypes.sort())
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="device-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-info">
            <div className="device-icon">
              {wearableApi.getDeviceIcon(device.deviceType)}
            </div>
            <div>
              <h2>기기 설정</h2>
              <p>{wearableApi.getDeviceTypeName(device.deviceType)}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="settings-section">
            <h3>기본 설정</h3>
            
            <div className="form-group">
              <label htmlFor="deviceName">기기 이름</label>
              <input
                id="deviceName"
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="기기 이름을 입력하세요"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                />
                자동 동기화 활성화
              </label>
              <p className="help-text">
                활성화하면 설정된 간격으로 자동으로 데이터를 동기화합니다.
              </p>
            </div>

            {autoSync && (
              <div className="form-group">
                <label htmlFor="syncInterval">동기화 간격</label>
                <select
                  id="syncInterval"
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(Number(e.target.value))}
                >
                  <option value={15}>15분마다</option>
                  <option value={30}>30분마다</option>
                  <option value={60}>1시간마다</option>
                  <option value={120}>2시간마다</option>
                  <option value={360}>6시간마다</option>
                  <option value={720}>12시간마다</option>
                  <option value={1440}>24시간마다</option>
                </select>
                <p className="help-text">
                  짧은 간격일수록 더 자주 동기화되지만 배터리 소모가 증가할 수 있습니다.
                </p>
              </div>
            )}
          </div>

          <div className="settings-section">
            <h3>동기화 데이터 타입</h3>
            <p className="section-description">
              동기화할 건강 데이터 타입을 선택하세요. 필요한 데이터만 선택하면 동기화 속도가 향상됩니다.
            </p>
            
            <div className="data-types-grid">
              {supportedDataTypes.map(dataType => (
                <label
                  key={dataType.type}
                  className={`data-type-item ${
                    selectedDataTypes.includes(dataType.type) ? 'selected' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDataTypes.includes(dataType.type)}
                    onChange={() => handleDataTypeToggle(dataType.type)}
                  />
                  <div className="data-type-info">
                    <span className="data-type-icon">
                      {wearableApi.getDataTypeIcon(dataType.type)}
                    </span>
                    <div className="data-type-details">
                      <span className="data-type-name">{dataType.name}</span>
                      <span className="data-type-unit">({dataType.unit})</span>
                      <span className="data-type-category">{dataType.category}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {selectedDataTypes.length === 0 && (
              <p className="error-text">최소 하나의 데이터 타입을 선택해주세요.</p>
            )}
          </div>

          <div className="settings-section danger-zone">
            <h3>위험 구역</h3>
            <p className="section-description">
              기기 연동을 해제하면 모든 동기화 설정이 삭제되며, 기존 데이터는 유지됩니다.
            </p>
            
            {!showDisconnectConfirm ? (
              <button
                className="btn-danger"
                onClick={() => setShowDisconnectConfirm(true)}
              >
                기기 연동 해제
              </button>
            ) : (
              <div className="disconnect-confirm">
                <p>정말로 이 기기의 연동을 해제하시겠습니까?</p>
                <div className="confirm-buttons">
                  <button
                    className="btn-danger"
                    onClick={handleDisconnect}
                    disabled={loading}
                  >
                    {loading ? '해제 중...' : '예, 해제합니다'}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowDisconnectConfirm(false)}
                    disabled={loading}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={loading || !hasChanges() || selectedDataTypes.length === 0}
          >
            {loading ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceSettingsModal;