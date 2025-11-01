import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Smartphone, CheckCircle, XCircle, Settings, Sync } from 'lucide-react';
import { googleFitApi, GoogleFitConnectionStatus, GoogleFitSyncResult } from '../../services/googleFitApi';



/**
 * Google Fit 연동 컴포넌트
 * 요구사항 17.3: 안드로이드 기기 데이터 동기화
 */
export const GoogleFitIntegration: React.FC = () => {
  const [status, setStatus] = useState<GoogleFitConnectionStatus>({ isConnected: false });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<GoogleFitSyncResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      const data = await googleFitApi.getConnectionStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      console.error('Error checking Google Fit status:', err);
      setError('연결 상태 확인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await googleFitApi.getAuthUrl();
      
      // 새 창에서 Google Fit 인증 페이지 열기
      window.open(data.authUrl, 'google-fit-auth', 'width=500,height=600');
      
      // 인증 완료 후 상태 새로고침을 위한 리스너
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'GOOGLE_FIT_AUTH_SUCCESS') {
          checkConnectionStatus();
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);
    } catch (err) {
      console.error('Error connecting to Google Fit:', err);
      setError(err instanceof Error ? err.message : '연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      await googleFitApi.disconnect();
      setStatus({ isConnected: false });
      setSyncResult(null);
    } catch (err) {
      console.error('Error disconnecting Google Fit:', err);
      setError(err instanceof Error ? err.message : '연동 해제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSyncResult(null);

      const syncOptions = {
        dataTypes: status.syncSettings?.dataTypes || ['steps', 'heart_rate', 'calories'],
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 전
        endDate: new Date().toISOString(),
      };

      const result = await googleFitApi.syncData(syncOptions);
      setSyncResult(result);
      await checkConnectionStatus(); // 상태 업데이트
    } catch (err) {
      console.error('Error syncing Google Fit data:', err);
      setError(err instanceof Error ? err.message : '동기화에 실패했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSync = (lastSyncAt?: string) => {
    if (!lastSyncAt) return '동기화 기록 없음';
    
    const date = new Date(lastSyncAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const getDataTypeLabel = (dataType: string) => {
    const labels: Record<string, string> = {
      steps: '걸음 수',
      heart_rate: '심박수',
      calories: '칼로리',
      sleep: '수면',
      weight: '체중',
      blood_pressure: '혈압',
      distance: '이동 거리',
      exercise_sessions: '운동 세션',
    };
    return labels[dataType] || dataType;
  };

  if (loading && !status.isConnected) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Google Fit 연결 상태 확인 중...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
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
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status.isConnected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">연결됨</span>
                  {status.deviceName && (
                    <Badge variant="secondary">{status.deviceName}</Badge>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">연결되지 않음</span>
                </>
              )}
            </div>

            <div className="flex gap-2">
              {status.isConnected ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    설정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSync}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Sync className="h-4 w-4 mr-1" />
                    )}
                    동기화
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDisconnect}
                    disabled={loading}
                  >
                    연동 해제
                  </Button>
                </>
              ) : (
                <Button onClick={handleConnect} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Smartphone className="h-4 w-4 mr-2" />
                  )}
                  Google Fit 연결
                </Button>
              )}
            </div>
          </div>

          {status.isConnected && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">마지막 동기화:</span>
                <div className="font-medium">{formatLastSync(status.lastSyncAt)}</div>
              </div>
              <div>
                <span className="text-gray-600">데이터 소스:</span>
                <div className="font-medium">
                  {status.syncStatus?.totalDataSources || 0}개
                </div>
              </div>
            </div>
          )}

          {syncResult && (
            <Alert className={syncResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CheckCircle className={`h-4 w-4 ${syncResult.success ? 'text-green-500' : 'text-red-500'}`} />
              <AlertDescription>
                <div className="space-y-1">
                  <div>
                    {syncResult.success 
                      ? `${syncResult.syncedDataCount}개의 데이터 포인트가 동기화되었습니다.`
                      : '일부 데이터 동기화에 실패했습니다.'
                    }
                  </div>
                  {syncResult.dataTypesProcessed.length > 0 && (
                    <div className="text-xs">
                      처리된 데이터: {syncResult.dataTypesProcessed.map(getDataTypeLabel).join(', ')}
                    </div>
                  )}
                  {syncResult.errors && syncResult.errors.length > 0 && (
                    <div className="text-xs text-red-600">
                      오류: {syncResult.errors.join(', ')}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {showSettings && status.isConnected && status.syncSettings && (
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">동기화 설정</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">자동 동기화:</span>
                  <div className="font-medium">
                    {status.syncSettings.autoSync ? '활성화' : '비활성화'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">동기화 간격:</span>
                  <div className="font-medium">{status.syncSettings.syncInterval}분</div>
                </div>
              </div>

              <div>
                <span className="text-gray-600 text-sm">동기화 데이터 타입:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {status.syncSettings.dataTypes.map((dataType) => (
                    <Badge key={dataType} variant="outline" className="text-xs">
                      {getDataTypeLabel(dataType)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {status.isConnected && status.syncStatus && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">사용 가능한 데이터</h4>
              <div className="flex flex-wrap gap-1">
                {status.syncStatus.availableDataTypes.map((dataType, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {dataType}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};