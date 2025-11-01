import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Smartphone, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface GoogleFitDevice {
  id: string;
  deviceName: string;
  isActive: boolean;
  lastSyncAt?: string;
  syncSettings: {
    autoSync: boolean;
    syncInterval: number;
    dataTypes: string[];
  };
}

interface GoogleFitConnectionStatus {
  isConnected: boolean;
  hasValidToken: boolean;
  lastSyncAt?: string;
  availableDataSources: string[];
  errors: string[];
}

export const GoogleFitIntegration: React.FC = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<GoogleFitDevice[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<GoogleFitConnectionStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Google Fit에서 지원하는 데이터 타입
  const supportedDataTypes = [
    { id: 'heart_rate', name: '심박수', unit: 'bpm' },
    { id: 'steps', name: '걸음 수', unit: '걸음' },
    { id: 'calories', name: '소모 칼로리', unit: 'kcal' },
    { id: 'sleep', name: '수면', unit: '분' },
    { id: 'weight', name: '체중', unit: 'kg' },
    { id: 'distance', name: '이동 거리', unit: 'km' },
    { id: 'exercise_sessions', name: '운동 세션', unit: '분' },
  ];

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await fetch('/api/wearable/devices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const googleFitDevices = data.data.filter((device: any) => device.deviceType === 'google_fit');
        setDevices(googleFitDevices);

        // 첫 번째 Google Fit 기기의 연결 상태 확인
        if (googleFitDevices.length > 0) {
          checkConnectionStatus(googleFitDevices[0].id);
        }
      }
    } catch (error) {
      console.error('기기 목록 로드 실패:', error);
      setError('기기 목록을 불러오는데 실패했습니다.');
    }
  };

  const checkConnectionStatus = async (deviceConfigId: string) => {
    try {
      const response = await fetch(`/api/google-fit/connection-status/${deviceConfigId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data.data);
      }
    } catch (error) {
      console.error('연결 상태 확인 실패:', error);
    }
  };

  const initiateGoogleFitConnection = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Google Fit 인증 URL 생성
      const redirectUri = `${window.location.origin}/google-fit/callback`;
      const response = await fetch(`/api/google-fit/auth-url?redirectUri=${encodeURIComponent(redirectUri)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Google OAuth 페이지로 리다이렉트
        window.location.href = data.data.authUrl;
      } else {
        throw new Error('인증 URL 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Google Fit 연결 실패:', error);
      setError(error instanceof Error ? error.message : 'Google Fit 연결에 실패했습니다.');
    } finally {
      setIsConnecting(false);
    }
  };

  const syncGoogleFitData = async (deviceConfigId: string) => {
    setIsSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/google-fit/sync/${deviceConfigId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataTypes: ['heart_rate', 'steps', 'calories', 'sleep', 'weight'],
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${data.syncedDataCount}개의 데이터가 성공적으로 동기화되었습니다.`);
        loadDevices(); // 기기 목록 새로고침
        if (deviceConfigId) {
          checkConnectionStatus(deviceConfigId);
        }
      } else {
        throw new Error(data.message || '동기화에 실패했습니다.');
      }
    } catch (error) {
      console.error('Google Fit 동기화 실패:', error);
      setError(error instanceof Error ? error.message : 'Google Fit 동기화에 실패했습니다.');
    } finally {
      setIsSyncing(false);
    }
  };

  const disconnectGoogleFit = async (deviceConfigId: string) => {
    try {
      const response = await fetch(`/api/wearable/devices/${deviceConfigId}/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setSuccess('Google Fit 연동이 해제되었습니다.');
        loadDevices();
        setConnectionStatus(null);
      } else {
        throw new Error('연동 해제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Google Fit 연동 해제 실패:', error);
      setError(error instanceof Error ? error.message : 'Google Fit 연동 해제에 실패했습니다.');
    }
  };

  const formatLastSync = (lastSyncAt?: string) => {
    if (!lastSyncAt) return '동기화 기록 없음';
    
    const date = new Date(lastSyncAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    return `${Math.floor(diffMinutes / 1440)}일 전`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Google Fit 연동
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {devices.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Google Fit이 연결되지 않음
              </h3>
              <p className="text-gray-500 mb-4">
                Google Fit을 연결하여 안드로이드 기기의 건강 데이터를 자동으로 동기화하세요.
              </p>
              <Button 
                onClick={initiateGoogleFitConnection}
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    연결 중...
                  </>
                ) : (
                  'Google Fit 연결'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{device.deviceName}</h4>
                        <p className="text-sm text-gray-500">
                          마지막 동기화: {formatLastSync(device.lastSyncAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={device.isActive ? "default" : "secondary"}>
                        {device.isActive ? '활성' : '비활성'}
                      </Badge>
                      {connectionStatus?.isConnected && (
                        <Badge variant="outline" className="text-green-600">
                          연결됨
                        </Badge>
                      )}
                    </div>
                  </div>

                  {connectionStatus && (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">토큰 상태:</span>
                          <span className={`ml-2 ${connectionStatus.hasValidToken ? 'text-green-600' : 'text-red-600'}`}>
                            {connectionStatus.hasValidToken ? '유효' : '만료됨'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">데이터 소스:</span>
                          <span className="ml-2">{connectionStatus.availableDataSources.length}개</span>
                        </div>
                      </div>
                      
                      {connectionStatus.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-red-600">오류:</p>
                          <ul className="text-sm text-red-600 list-disc list-inside">
                            {connectionStatus.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-2">동기화 데이터 타입</h5>
                    <div className="flex flex-wrap gap-2">
                      {device.syncSettings.dataTypes.map((dataType) => {
                        const typeInfo = supportedDataTypes.find(t => t.id === dataType);
                        return (
                          <Badge key={dataType} variant="outline">
                            {typeInfo?.name || dataType}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => syncGoogleFitData(device.id)}
                      disabled={isSyncing || !connectionStatus?.isConnected}
                      size="sm"
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          동기화 중...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          수동 동기화
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => checkConnectionStatus(device.id)}
                      variant="outline"
                      size="sm"
                    >
                      상태 확인
                    </Button>
                    
                    <Button
                      onClick={() => disconnectGoogleFit(device.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      연동 해제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Google Fit 지원 데이터</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {supportedDataTypes.map((type) => (
                <div key={type.id} className="flex justify-between">
                  <span className="text-blue-800">{type.name}</span>
                  <span className="text-blue-600">{type.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};