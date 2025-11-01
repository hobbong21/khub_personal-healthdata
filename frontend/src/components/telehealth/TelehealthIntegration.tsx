import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  Settings, 
  ExternalLink,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface TelehealthPlatform {
  name: string;
  displayName: string;
  description: string;
  features: string[];
  setupRequired: string[];
}

interface TelehealthIntegration {
  id: string;
  platformName: string;
  platformUserId?: string;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
}

interface TelehealthSession {
  id: string;
  healthcareProviderName: string;
  sessionType: 'consultation' | 'follow_up' | 'emergency';
  scheduledTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  sessionUrl?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  createdAt: string;
}

const TelehealthIntegration: React.FC = () => {
  const [platforms, setPlatforms] = useState<TelehealthPlatform[]>([]);
  const [integrations, setIntegrations] = useState<TelehealthIntegration[]>([]);
  const [sessions, setSessions] = useState<TelehealthSession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<TelehealthSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewIntegration, setShowNewIntegration] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      const [platformsRes, integrationsRes, sessionsRes, upcomingRes] = await Promise.all([
        fetch('/api/telehealth/platforms', { headers }),
        fetch('/api/telehealth/integrations', { headers }),
        fetch('/api/telehealth/sessions?limit=20', { headers }),
        fetch('/api/telehealth/sessions/upcoming', { headers }),
      ]);

      if (!platformsRes.ok || !integrationsRes.ok || !sessionsRes.ok || !upcomingRes.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const [platformsData, integrationsData, sessionsData, upcomingData] = await Promise.all([
        platformsRes.json(),
        integrationsRes.json(),
        sessionsRes.json(),
        upcomingRes.json(),
      ]);

      setPlatforms(platformsData.platforms);
      setIntegrations(integrationsData.integrations);
      setSessions(sessionsData.sessions);
      setUpcomingSessions(upcomingData.sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const createIntegration = async (platformName: string, settings: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/telehealth/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          platformName,
          integrationSettings: settings,
        }),
      });

      if (!response.ok) {
        throw new Error('플랫폼 연동에 실패했습니다.');
      }

      await fetchData();
      setShowNewIntegration(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const createSession = async (sessionData: {
    healthcareProviderName: string;
    sessionType: 'consultation' | 'follow_up' | 'emergency';
    scheduledTime: string;
    telehealthIntegrationId?: string;
  }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/telehealth/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error('세션 생성에 실패했습니다.');
      }

      await fetchData();
      setShowNewSession(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/telehealth/sessions/${sessionId}/start`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('세션 시작에 실패했습니다.');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const endSession = async (sessionId: string, notes?: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/telehealth/sessions/${sessionId}/end`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionNotes: notes }),
      });

      if (!response.ok) {
        throw new Error('세션 종료에 실패했습니다.');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <Video className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'no_show':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '예약됨';
      case 'in_progress':
        return '진행 중';
      case 'completed':
        return '완료됨';
      case 'cancelled':
        return '취소됨';
      case 'no_show':
        return '노쇼';
      default:
        return status;
    }
  };

  const getSessionTypeText = (type: string) => {
    switch (type) {
      case 'consultation':
        return '상담';
      case 'follow_up':
        return '후속 진료';
      case 'emergency':
        return '응급 진료';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>텔레헬스 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* 예정된 세션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            예정된 텔레헬스 세션
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(session.status)}
                    <div>
                      <h4 className="font-semibold">{session.healthcareProviderName}</h4>
                      <p className="text-sm text-gray-600">
                        {getSessionTypeText(session.sessionType)} • {new Date(session.scheduledTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{getStatusText(session.status)}</Badge>
                    {session.status === 'scheduled' && (
                      <Button onClick={() => startSession(session.id)} size="sm">
                        <Video className="h-4 w-4 mr-1" />
                        시작
                      </Button>
                    )}
                    {session.status === 'in_progress' && (
                      <Button onClick={() => endSession(session.id)} size="sm" variant="outline">
                        종료
                      </Button>
                    )}
                    {session.sessionUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={session.sessionUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          참여
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">예정된 텔레헬스 세션이 없습니다.</p>
              <Button onClick={() => setShowNewSession(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                새 세션 예약
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 플랫폼 연동 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              텔레헬스 플랫폼 연동
            </div>
            <Button onClick={() => setShowNewIntegration(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              연동 추가
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {integrations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {integrations.map((integration) => {
                const platform = platforms.find(p => p.name === integration.platformName);
                return (
                  <div key={integration.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{platform?.displayName || integration.platformName}</h4>
                      <Badge className={integration.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                        {integration.isActive ? '활성' : '비활성'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{platform?.description}</p>
                    {integration.lastSyncAt && (
                      <p className="text-xs text-gray-500">
                        마지막 동기화: {new Date(integration.lastSyncAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">연동된 텔레헬스 플랫폼이 없습니다.</p>
              <p className="text-sm text-gray-500 mb-4">
                플랫폼을 연동하면 자동으로 세션 URL이 생성되고 진료 기록이 동기화됩니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 최근 세션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            최근 텔레헬스 세션
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(session.status)}
                    <div>
                      <h4 className="font-semibold">{session.healthcareProviderName}</h4>
                      <p className="text-sm text-gray-600">
                        {getSessionTypeText(session.sessionType)} • {new Date(session.scheduledTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge>{getStatusText(session.status)}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">텔레헬스 세션 기록이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 지원되는 플랫폼 */}
      {showNewIntegration && (
        <Card>
          <CardHeader>
            <CardTitle>새 플랫폼 연동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {platforms.map((platform) => (
                <div key={platform.name} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{platform.displayName}</h4>
                  <p className="text-sm text-gray-600 mb-3">{platform.description}</p>
                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-1">주요 기능:</h5>
                    <ul className="text-xs text-gray-600">
                      {platform.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-1">설정 필요:</h5>
                    <ul className="text-xs text-gray-600">
                      {platform.setupRequired.map((requirement, index) => (
                        <li key={index}>• {requirement}</li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={() => createIntegration(platform.name, {})}
                    size="sm" 
                    className="w-full"
                  >
                    연동하기
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowNewIntegration(false)} variant="outline">
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TelehealthIntegration;