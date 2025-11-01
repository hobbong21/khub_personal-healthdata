import React, { useState, useEffect } from 'react';
import { wearableApi } from '../../services/wearableApi';
import { 
  WearableDeviceConfig, 
  DeviceAuthRequest, 
  WearableDataType,
  DataTypeInfo 
} from '../../types/wearable';
import './DeviceConnectionModal.css';

interface DeviceConnectionModalProps {
  onClose: () => void;
  onDeviceConnected: (device: WearableDeviceConfig) => void;
}

const DeviceConnectionModal: React.FC<DeviceConnectionModalProps> = ({
  onClose,
  onDeviceConnected
}) => {
  const [step, setStep] = useState<'select' | 'configure' | 'auth' | 'connecting'>('select');
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [deviceName, setDeviceName] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(60);
  const [selectedDataTypes, setSelectedDataTypes] = useState<WearableDataType[]>([]);
  const [supportedDataTypes, setSupportedDataTypes] = useState<DataTypeInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deviceTypes = [
    {
      type: 'apple_health',
      name: 'Apple Health',
      icon: '🍎',
      description: 'iPhone의 건강 앱과 연동',
      available: true
    },
    {
      type: 'google_fit',
      name: 'Google Fit',
      icon: '🏃‍♂️',
      description: 'Google Fit 앱과 연동',
      available: true
    },
    {
      type: 'fitbit',
      name: 'Fitbit',
      icon: '⌚',
      description: 'Fitbit 웨어러블 기기와 연동',
      available: true
    },
    {
      type: 'samsung_health',
      name: 'Samsung Health',
      icon: '📱',
      description: 'Samsung Health 앱과 연동',
      available: true
    }
  ];

  useEffect(() => {
    if (selectedDeviceType) {
      loadSupportedDataTypes();
    }
  }, [selectedDeviceType]);

  const loadSupportedDataTypes = async () => {
    try {
      const dataTypes = await wearableApi.getSupportedDataTypes(selectedDeviceType);
      setSupportedDataTypes(dataTypes);
      
      // 기본 데이터 타입 선택
      const defaultTypes: WearableDataType[] = ['heart_rate', 'steps', 'weight'];
      const availableDefaults = defaultTypes.filter(type => 
        dataTypes.some(dt => dt.type === type)
      );
      setSelectedDataTypes(availableDefaults);
    } catch (err) {
      console.error('Failed to load supported data types:', err);
      setError('지원 데이터 타입을 불러오는데 실패했습니다.');
    }
  };

  const handleDeviceTypeSelect = (deviceType: string) => {
    setSelectedDeviceType(deviceType);
    setDeviceName(wearableApi.getDeviceTypeName(deviceType));
    setStep('configure');
  };

  const handleDataTypeToggle = (dataType: WearableDataType) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataType)
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const handleConnect = async () => {
    if (!selectedDeviceType || !deviceName || selectedDataTypes.length === 0) {
      setError('모든 필수 정보를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authRequest: DeviceAuthRequest = {
        deviceType: selectedDeviceType as any,
        deviceName,
        syncSettings: {
          autoSync,
          syncInterval,
          dataTypes: selectedDataTypes
        }
      };

      // OAuth가 필요한 기기 타입인 경우
      if (['google_fit', 'fitbit', 'samsung_health'].includes(selectedDeviceType)) {
        setStep('auth');
        
        // OAuth URL 생성 및 리다이렉트
        const redirectUri = `${window.location.origin}/wearable/callback`;
        let authUrl = '';
        
        switch (selectedDeviceType) {
          case 'google_fit':
            authUrl = wearableApi.getGoogleFitAuthUrl(redirectUri);
            break;
          case 'fitbit':
            authUrl = wearableApi.getFitbitAuthUrl(redirectUri);
            break;
          case 'samsung_health':
            authUrl = wearableApi.getSamsungHealthAuthUrl(redirectUri);
            break;
        }
        
        // 새 창에서 OAuth 진행
        const authWindow = window.open(authUrl, 'wearable_auth', 'width=600,height=700');
        
        // OAuth 완료 대기
        const checkAuthComplete = setInterval(() => {
          try {
            if (authWindow?.closed) {
              clearInterval(checkAuthComplete);
              // OAuth 완료 후 처리 (실제 구현에서는 콜백 URL에서 처리)
              setStep('connecting');
              completeConnection(authRequest);
            }
          } catch (err) {
            // Cross-origin 에러는 무시
          }
        }, 1000);
        
      } else {
        // Apple Health는 직접 연결
        setStep('connecting');
        await completeConnection(authRequest);
      }
    } catch (err) {
      console.error('Connection failed:', err);
      setError('기기 연결에 실패했습니다.');
      setLoading(false);
    }
  };

  const completeConnection = async (authRequest: DeviceAuthRequest) => {
    try {
      const result = await wearableApi.authenticateDevice(authRequest);
      
      if (result.success && result.deviceConfig) {
        onDeviceConnected(result.deviceConfig);
      } else {
        setError(result.message || '기기 연결에 실패했습니다.');
        setStep('configure');
      }
    } catch (err) {
      console.error('Connection completion failed:', err);
      setError('기기 연결 완료 중 오류가 발생했습니다.');
      setStep('configure');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="step-content">
            <h3>연동할 기기를 선택하세요</h3>
            <div className="device-types-grid">
              {deviceTypes.map(device => (
                <button
                  key={device.type}
                  className={`device-type-card ${!device.available ? 'disabled' : ''}`}
                  onClick={() => device.available && handleDeviceTypeSelect(device.type)}
                  disabled={!device.available}
                >
                  <div className="device-type-icon">{device.icon}</div>
                  <div className="device-type-info">
                    <h4>{device.name}</h4>
                    <p>{device.description}</p>
                  </div>
                  {!device.available && (
                    <div className="coming-soon">곧 지원 예정</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'configure':
        return (
          <div className="step-content">
            <h3>동기화 설정</h3>
            
            <div className="form-group">
              <label htmlFor="deviceName">기기 이름</label>
              <input
                id="deviceName"
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="예: 내 iPhone"
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
            </div>

            {autoSync && (
              <div className="form-group">
                <label htmlFor="syncInterval">동기화 간격 (분)</label>
                <select
                  id="syncInterval"
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(Number(e.target.value))}
                >
                  <option value={15}>15분</option>
                  <option value={30}>30분</option>
                  <option value={60}>1시간</option>
                  <option value={120}>2시간</option>
                  <option value={360}>6시간</option>
                  <option value={720}>12시간</option>
                  <option value={1440}>24시간</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label>동기화할 데이터 타입</label>
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
                      <span className="data-type-name">{dataType.name}</span>
                      <span className="data-type-unit">({dataType.unit})</span>
                    </div>
                  </label>
                ))}
              </div>
              {selectedDataTypes.length === 0 && (
                <p className="error-text">최소 하나의 데이터 타입을 선택해주세요.</p>
              )}
            </div>
          </div>
        );

      case 'auth':
        return (
          <div className="step-content auth-step">
            <div className="auth-icon">🔐</div>
            <h3>인증 진행 중</h3>
            <p>새 창에서 {wearableApi.getDeviceTypeName(selectedDeviceType)} 인증을 완료해주세요.</p>
            <div className="auth-spinner">
              <div className="spinner"></div>
            </div>
          </div>
        );

      case 'connecting':
        return (
          <div className="step-content connecting-step">
            <div className="connecting-icon">⚡</div>
            <h3>기기 연결 중</h3>
            <p>잠시만 기다려주세요...</p>
            <div className="connecting-spinner">
              <div className="spinner"></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="device-connection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>웨어러블 기기 연동</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {renderStepContent()}
        </div>

        <div className="modal-footer">
          {step === 'configure' && (
            <>
              <button
                className="btn-secondary"
                onClick={() => setStep('select')}
              >
                이전
              </button>
              <button
                className="btn-primary"
                onClick={handleConnect}
                disabled={loading || selectedDataTypes.length === 0}
              >
                {loading ? '연결 중...' : '연결하기'}
              </button>
            </>
          )}
          
          {step === 'select' && (
            <button className="btn-secondary" onClick={onClose}>
              취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceConnectionModal;