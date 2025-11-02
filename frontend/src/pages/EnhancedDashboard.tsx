import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { HealthMetric, HealthMetricGrid } from '../components/ui/HealthMetric';
import './EnhancedDashboard.css';

interface HealthMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: string;
  icon: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  color: string;
}

interface UpcomingEvent {
  id: string;
  type: 'appointment' | 'medication' | 'checkup';
  title: string;
  time: string;
  location?: string;
  status: 'upcoming' | 'today' | 'overdue';
}

const EnhancedDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [quickActions] = useState<QuickAction[]>([
    {
      id: '1',
      title: '바이탈 사인 기록',
      description: '혈압, 맥박, 체온 등을 기록하세요',
      icon: '💓',
      link: '/health',
      color: '#ff6b6b'
    },
    {
      id: '2',
      title: '복약 확인',
      description: '오늘의 복약 일정을 확인하세요',
      icon: '💊',
      link: '/medication',
      color: '#4ecdc4'
    },
    {
      id: '3',
      title: '운동 기록',
      description: '운동량과 활동을 기록하세요',
      icon: '🏃‍♂️',
      link: '/wearable',
      color: '#45b7d1'
    },
    {
      id: '4',
      title: 'AI 분석',
      description: '건강 데이터 AI 분석 결과를 확인하세요',
      icon: '🤖',
      link: '/ai-insights',
      color: '#f9ca24'
    }
  ]);

  const [upcomingEvents] = useState<UpcomingEvent[]>([
    {
      id: '1',
      type: 'appointment',
      title: '정기 검진',
      time: '오늘 오후 2:00',
      location: '서울대병원 내과',
      status: 'today'
    },
    {
      id: '2',
      type: 'medication',
      title: '혈압약 복용',
      time: '오늘 오후 6:00',
      status: 'upcoming'
    },
    {
      id: '3',
      type: 'checkup',
      title: '혈당 측정',
      time: '내일 오전 8:00',
      status: 'upcoming'
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Mock health metrics data
    setHealthMetrics([
      {
        id: '1',
        name: '혈압',
        value: '120/80',
        unit: 'mmHg',
        status: 'good',
        trend: 'stable',
        change: '±0',
        icon: '🩺'
      },
      {
        id: '2',
        name: '심박수',
        value: '72',
        unit: 'bpm',
        status: 'good',
        trend: 'down',
        change: '-2',
        icon: '💓'
      },
      {
        id: '3',
        name: '체중',
        value: '68.5',
        unit: 'kg',
        status: 'good',
        trend: 'down',
        change: '-0.3',
        icon: '⚖️'
      },
      {
        id: '4',
        name: '혈당',
        value: '95',
        unit: 'mg/dL',
        status: 'good',
        trend: 'stable',
        change: '±2',
        icon: '🩸'
      }
    ]);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '좋은 아침입니다';
    if (hour < 18) return '좋은 오후입니다';
    return '좋은 저녁입니다';
  };

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <Card variant="elevated" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {getGreeting()}, <span className="text-primary-100">김건강</span>님! 👋
                </h1>
                <p className="text-primary-100 text-lg">
                  오늘도 건강한 하루 되세요. 현재 시간: {currentTime.toLocaleTimeString('ko-KR')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold">85</div>
                    <div className="text-xs">점</div>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">건강 점수</div>
                  <div className="text-primary-100">우수 (+3점)</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">빠른 실행</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.id} to={action.link}>
                <Card hover className="h-full transition-fast">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{action.icon}</div>
                    <h3 className="font-semibold text-primary mb-2">{action.title}</h3>
                    <p className="text-sm text-secondary">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Health Metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>오늘의 건강 지표</CardTitle>
              <Link to="/health" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                전체 보기 →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <HealthMetricGrid columns={2}>
              {healthMetrics.map((metric) => (
                <HealthMetric
                  key={metric.id}
                  title={metric.name}
                  value={metric.value}
                  unit={metric.unit}
                  icon={<span className="text-2xl">{metric.icon}</span>}
                  status={metric.status as 'normal' | 'warning' | 'critical'}
                  trend={metric.trend as 'up' | 'down' | 'stable'}
                  trendValue={metric.change}
                />
              ))}
            </HealthMetricGrid>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>다가오는 일정</CardTitle>
              <Link to="/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                전체 보기 →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                  <div className="text-2xl">
                    {event.type === 'appointment' && '🏥'}
                    {event.type === 'medication' && '💊'}
                    {event.type === 'checkup' && '📋'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-primary">{event.title}</h4>
                    <p className="text-sm text-secondary">{event.time}</p>
                    {event.location && <p className="text-xs text-tertiary">{event.location}</p>}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.status === 'today' ? 'bg-warning text-white' :
                    event.status === 'upcoming' ? 'bg-info text-white' :
                    'bg-error text-white'
                  }`}>
                    {event.status === 'today' && '오늘'}
                    {event.status === 'upcoming' && '예정'}
                    {event.status === 'overdue' && '지연'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Preview */}
        <Card variant="medical">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                🤖 AI 건강 인사이트
              </CardTitle>
              <Link to="/ai-insights" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                자세히 보기 →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">개인화된 권장사항</h4>
                    <p className="text-sm text-green-700">최근 데이터를 바탕으로 주 3회 유산소 운동을 권장합니다.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">주의사항</h4>
                    <p className="text-sm text-yellow-700">수면 패턴이 불규칙합니다. 일정한 수면 시간을 유지해보세요.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📈</div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">개선 사항</h4>
                    <p className="text-sm text-blue-700">지난 주 대비 활동량이 15% 증가했습니다. 좋은 추세입니다!</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Trends Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>건강 트렌드</CardTitle>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded-md">7일</button>
                <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">30일</button>
                <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">90일</button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-t from-primary-50 to-transparent rounded-lg flex items-end justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
                <div className="w-8 bg-primary-500 rounded-t" style={{ height: '60%' }}></div>
                <div className="w-8 bg-primary-500 rounded-t" style={{ height: '65%' }}></div>
                <div className="w-8 bg-primary-500 rounded-t" style={{ height: '70%' }}></div>
                <div className="w-8 bg-primary-500 rounded-t" style={{ height: '68%' }}></div>
                <div className="w-8 bg-primary-500 rounded-t" style={{ height: '75%' }}></div>
                <div className="w-8 bg-primary-500 rounded-t" style={{ height: '80%' }}></div>
                <div className="w-8 bg-primary-500 rounded-t" style={{ height: '85%' }}></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-around text-xs text-gray-500 pb-2">
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span>토</span>
                <span>일</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>최근 활동</CardTitle>
              <Link to="/health" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                전체 보기 →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="text-xl">💓</div>
                <div className="flex-1">
                  <p className="font-medium text-primary">혈압 측정 - 120/80 mmHg</p>
                  <span className="text-sm text-tertiary">2시간 전</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="text-xl">💊</div>
                <div className="flex-1">
                  <p className="font-medium text-primary">약물 복용 - 혈압약</p>
                  <span className="text-sm text-tertiary">4시간 전</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="text-xl">🚶</div>
                <div className="flex-1">
                  <p className="font-medium text-primary">운동 기록 - 30분 걷기</p>
                  <span className="text-sm text-tertiary">어제</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedDashboard;