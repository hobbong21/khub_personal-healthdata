import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Play, 
  Square,
  Bell,
  Share2
} from 'lucide-react';
import './RemoteMonitoringPage.css';

interface RemoteMonitoringSession {
  id: string;
  sessionType: 'continuous' | 'scheduled' | 'emergency';
  status: 'active' | 'paused' | 'completed' | 'terminated';
  startTime: string;
  endTime?: string;
  monitoringParameters?: any;
  alertThresholds?: any;
}

interface RealTimeHealthData {
  id: string;
  dataType: string;
  value: any;
  unit?: string;
  deviceSource?: string;
  isCritical: boolean;
  recordedAt: string;
}

interface HealthAlert {
  id: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  isAcknowledged: boolean;
  createdAt: string;
}

interface HealthcareDataShare {
  id: string;
  healthcareProviderEmail: string;
  healthcareProviderName?: string;
  sharedDataTypes: string[];
  accessLevel: 'read_only' | 'read_write';
  isActive: boolean;
  createdAt: string;
}

interface DashboardData {
  activeSession: RemoteMonitoringSession | null;
  recentData: RealTimeHealthData[];
  unacknowledgedAlerts: HealthAlert[];
  dataShares: HealthcareDataShare[];
}

const RemoteMonitoringPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStartSession, setShowStartSession] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // 실시간 업데이트를 위한 폴링 (실제로는 WebSocket 사용 권장)
    const interval = setInterval(fetchDashboardData, 30000); // 30초마다 업데이트
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/remote-monitoring/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('대시보드 데이터를 불러오는데 실패했습니다.');
      }

      const result = await response.json();
      setDashboardData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const startMonitoringSession = async (sessionType: 'continuous' | 'scheduled' | 'emergency') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/remote-monitoring/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionType,
          monitoringParameters: {
            heartRate: true,
            bloodPressure: true,
            temperature: true,
            oxygenSaturation: true,
          },
          alertThresholds: {
            heart_rate: { min: 60, max: 100 },
            blood_pressure: { 
              systolic_min: 90, systolic_max: 140,
              diastolic_min: 60, diastolic_max: 90 
            },
            temperature: { min: 36.0, max: 37.5 },
            oxygen_saturation: { min: 95 },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('모니터링 세션 시작에 실패했습니다.');
      }

      await fetchDashboardData();
      setShowStartSession(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const endMonitoringSession = async () => {
    if (!dashboardData?.activeSession) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/remote-monitoring/sessions/${dashboardData.activeSession.id}/end`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('모니터링 세션 종료에 실패했습니다.');
      }

      await fetchDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/remote-monitoring/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('알림 확인에 실패했습니다.');
      }

      await fetchDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'heart_rate':
        return <Heart className="h-4 w-4" />;
      case 'blood_pressure':
        return <Activity className="h-4 w-4" />;
      case 'temperature':
        return <Thermometer className="h-4 w-4" />;
      case 'oxygen_saturation':
        return <Droplets className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDataValue = (dataType: string, value: any) => {
    if (dataType === 'blood_pressure' && typeof value === 'object') {
      return `${value.systolic}/${value.diastolic}`;
    }
    return value.toString();
  };

  if (loading) {
    return (
      <div className="remote-monitoring-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>원격 모니터링 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="remote-monitoring-page">
      <div className="page-header">
        <h1>원격 모니터링 대시보드</h1>
        <p>실시간 건강 상태 모니터링 및 이상 징후 감지</p>
      </div>

      {error && (
        <Alert className="error-alert">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 모니터링 세션 상태 */}
      <Card className="session-status-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            모니터링 세션 상태
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData?.activeSession ? (
            <div className="active-session">
              <div className="session-info">
                <Badge className={`status-badge ${dashboardData.activeSession.status}`}>
                  {dashboardData.activeSession.status === 'active' ? '활성' : '비활성'}
                </Badge>
                <span className="session-type">
                  {dashboardData.activeSession.sessionType === 'continuous' ? '연속 모니터링' :
                   dashboardData.activeSession.sessionType === 'scheduled' ? '예약 모니터링' : '응급 모니터링'}
                </span>
                <span className="session-duration">
                  시작: {new Date(dashboardData.activeSession.startTime).toLocaleString()}
                </span>
              </div>
              <Button onClick={endMonitoringSession} variant="outline" className="end-session-btn">
                <Square className="h-4 w-4 mr-2" />
                세션 종료
              </Button>
            </div>
          ) : (
            <div className="no-session">
              <p>활성화된 모니터링 세션이 없습니다.</p>
              {!showStartSession ? (
                <Button onClick={() => setShowStartSession(true)} className="start-session-btn">
                  <Play className="h-4 w-4 mr-2" />
                  모니터링 시작
                </Button>
              ) : (
                <div className="session-type-selection">
                  <h3>모니터링 타입 선택</h3>
                  <div className="session-buttons">
                    <Button onClick={() => startMonitoringSession('continuous')}>
                      연속 모니터링
                    </Button>
                    <Button onClick={() => startMonitoringSession('scheduled')}>
                      예약 모니터링
                    </Button>
                    <Button onClick={() => startMonitoringSession('emergency')} variant="destructive">
                      응급 모니터링
                    </Button>
                  </div>
                  <Button onClick={() => setShowStartSession(false)} variant="outline">
                    취소
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="dashboard-grid">
        {/* 실시간 건강 데이터 */}
        <Card className="real-time-data-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              실시간 건강 데이터
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentData && dashboardData.recentData.length > 0 ? (
              <div className="data-list">
                {dashboardData.recentData.slice(0, 10).map((data) => (
                  <div key={data.id} className={`data-item ${data.isCritical ? 'critical' : ''}`}>
                    <div className="data-icon">
                      {getDataTypeIcon(data.dataType)}
                    </div>
                    <div className="data-info">
                      <span className="data-type">{data.dataType}</span>
                      <span className="data-value">
                        {formatDataValue(data.dataType, data.value)} {data.unit}
                      </span>
                      <span className="data-time">
                        {new Date(data.recordedAt).toLocaleString()}
                      </span>
                    </div>
                    {data.isCritical && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">최근 건강 데이터가 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 건강 알림 */}
        <Card className="health-alerts-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              건강 알림
              {dashboardData?.unacknowledgedAlerts && dashboardData.unacknowledgedAlerts.length > 0 && (
                <Badge className="alert-count">
                  {dashboardData.unacknowledgedAlerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.unacknowledgedAlerts && dashboardData.unacknowledgedAlerts.length > 0 ? (
              <div className="alerts-list">
                {dashboardData.unacknowledgedAlerts.map((alert) => (
                  <div key={alert.id} className="alert-item">
                    <div className={`severity-indicator ${getSeverityColor(alert.severity)}`}></div>
                    <div className="alert-content">
                      <h4>{alert.title}</h4>
                      <p>{alert.message}</p>
                      <span className="alert-time">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      onClick={() => acknowledgeAlert(alert.id)}
                      size="sm"
                      variant="outline"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      확인
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-alerts">미확인 알림이 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 의료진 데이터 공유 */}
        <Card className="data-shares-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              의료진 데이터 공유
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.dataShares && dashboardData.dataShares.length > 0 ? (
              <div className="shares-list">
                {dashboardData.dataShares.map((share) => (
                  <div key={share.id} className="share-item">
                    <div className="share-info">
                      <div className="provider-info">
                        <Users className="h-4 w-4" />
                        <span className="provider-name">
                          {share.healthcareProviderName || share.healthcareProviderEmail}
                        </span>
                      </div>
                      <div className="share-details">
                        <Badge className={share.isActive ? 'active' : 'inactive'}>
                          {share.isActive ? '활성' : '비활성'}
                        </Badge>
                        <span className="access-level">
                          {share.accessLevel === 'read_only' ? '읽기 전용' : '읽기/쓰기'}
                        </span>
                      </div>
                      <div className="shared-data-types">
                        공유 데이터: {share.sharedDataTypes.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-shares">설정된 데이터 공유가 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RemoteMonitoringPage;