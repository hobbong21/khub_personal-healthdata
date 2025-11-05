import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface InsightCardProps {
  type: 'positive' | 'warning' | 'alert' | 'info';
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
  actionText: string;
  actionLink: string;
}

const InsightCard: React.FC<InsightCardProps> = ({
  type,
  priority,
  icon,
  title,
  description,
  actionText,
  actionLink,
}) => {
  const borderColors = {
    positive: 'border-l-green-500',
    warning: 'border-l-yellow-500',
    alert: 'border-l-red-500',
    info: 'border-l-blue-500',
  };

  const iconBgs = {
    positive: 'bg-green-100',
    warning: 'bg-yellow-100',
    alert: 'bg-red-100',
    info: 'bg-blue-100',
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  };

  const priorityLabels = {
    high: '높음',
    medium: '보통',
    low: '낮음',
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-card border-l-4 ${borderColors[type]} transition-all hover:-translate-y-1 hover:shadow-card-hover`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${iconBgs[type]}`}>
          {icon}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[priority]}`}>
          {priorityLabels[priority]}
        </span>
      </div>
      <h3 className="text-lg font-bold text-dark mb-2">{title}</h3>
      <p className="text-gray mb-4 leading-relaxed">{description}</p>
      <Link to={actionLink} className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
        <span>{actionText}</span>
        <span>→</span>
      </Link>
    </div>
  );
};

interface TrendCardProps {
  label: string;
  value: string;
  change: string;
  isUp: boolean;
}

const TrendCard: React.FC<TrendCardProps> = ({ label, value, change, isUp }) => (
  <div className="p-6 border-2 border-gray-200 rounded-xl">
    <div className="text-sm text-gray mb-2">{label}</div>
    <div className="text-3xl font-bold text-dark mb-2">{value}</div>
    <div className={`inline-flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
      <span>{isUp ? '↑' : '↓'}</span>
      <span>{change}</span>
    </div>
    <div className="h-16 bg-gradient-to-t from-primary/10 to-transparent rounded-md mt-4"></div>
  </div>
);

const AIInsightsPage: React.FC = () => {
  const [currentLang] = useState<'ko' | 'en'>('ko');
  const [activeFilter, setActiveFilter] = useState('30일');

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Navigation - Same as Dashboard */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-[70px]">
            <Link to="/" className="flex items-center gap-3 text-primary font-bold text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-2xl">
                🏥
              </div>
              <span>KnowledgeHub</span>
            </Link>

            <ul className="flex gap-2 items-center">
              <li>
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all">
                  <span className="text-lg">📊</span>
                  <span>대시보드</span>
                </Link>
              </li>
              <li>
                <Link to="/health-data" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all">
                  <span className="text-lg">📝</span>
                  <span>건강 데이터</span>
                </Link>
              </li>
              <li>
                <Link to="/ai-insights" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all bg-blue-50 text-primary">
                  <span className="text-lg">🤖</span>
                  <span>AI 인사이트</span>
                </Link>
              </li>
              <li>
                <Link to="/genomics" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all">
                  <span className="text-lg">🧬</span>
                  <span>유전체 분석</span>
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all">
                  <span className="text-lg">📅</span>
                  <span>진료 예약</span>
                </Link>
              </li>
            </ul>

            <div className="flex gap-3 items-center">
              <Link to="/" className="bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-lg font-semibold text-[14px] inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-primary transition-all">
                <span>🏠</span>
                <span>홈</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-12 rounded-xl mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">🤖 AI 인사이트</h1>
              <p className="text-lg opacity-90">인공지능이 분석한 맞춤형 건강 인사이트와 추천사항</p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
              ✨ AI 분석 완료
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* AI Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-card mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark">AI 건강 요약</h2>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full text-sm font-semibold">
                  <span>🤖</span>
                  <span>GPT-4 분석</span>
                </span>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-primary mb-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  최근 7일간의 건강 데이터를 분석한 결과, 전반적인 건강 상태는 양호합니다. 
                  혈압과 심박수가 정상 범위를 유지하고 있으며, 수면 패턴도 개선되고 있습니다. 
                  다만, 운동량이 권장 수준보다 약간 부족하므로 주 3회 이상의 유산소 운동을 권장합니다. 
                  또한, 최근 스트레스 수치가 상승하는 경향이 있어 명상이나 요가 같은 이완 활동을 추천드립니다.
                </p>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span>📅 분석 기간: 최근 7일</span>
                  <span>🔄 마지막 업데이트: 2시간 전</span>
                  <span>📊 신뢰도: 95%</span>
                </div>
              </div>
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InsightCard
                type="positive"
                priority="low"
                icon="✅"
                title="수면 패턴 개선"
                description="지난 주 대비 평균 수면 시간이 30분 증가했습니다. 규칙적인 수면 패턴을 유지하고 있어 긍정적입니다."
                actionText="자세히 보기"
                actionLink="#"
              />
              <InsightCard
                type="warning"
                priority="medium"
                icon="⚠️"
                title="운동량 부족"
                description="이번 주 운동 시간이 목표의 60%에 그쳤습니다. 주 3회 이상, 회당 30분 이상의 유산소 운동을 권장합니다."
                actionText="운동 계획 세우기"
                actionLink="#"
              />
              <InsightCard
                type="alert"
                priority="high"
                icon="🚨"
                title="스트레스 수치 상승"
                description="최근 3일간 심박변이도(HRV)가 감소하여 스트레스 수치가 높아졌습니다. 휴식과 이완 활동이 필요합니다."
                actionText="스트레스 관리 팁"
                actionLink="#"
              />
              <InsightCard
                type="info"
                priority="low"
                icon="💡"
                title="수분 섭취 권장"
                description="현재 날씨와 활동량을 고려할 때, 하루 2L 이상의 물 섭취를 권장합니다. 현재 평균 1.5L 수준입니다."
                actionText="알림 설정하기"
                actionLink="#"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Health Score */}
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h3 className="text-lg font-bold text-dark mb-4">종합 건강 점수</h3>
              <div className="text-center py-8">
                <div className="w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-4">
                  <span className="text-5xl font-bold text-white">85</span>
                </div>
                <div className="text-sm text-gray mb-2">양호</div>
                <div className="inline-flex items-center gap-1 text-green-600 font-semibold">
                  <span>↑</span>
                  <span>+3점 (지난주 대비)</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h3 className="text-lg font-bold text-dark mb-4">주요 지표</h3>
              <div className="space-y-4">
                {[
                  { label: '평균 혈압', value: '120/80' },
                  { label: '평균 심박수', value: '72 bpm' },
                  { label: '평균 수면', value: '7.5시간' },
                  { label: '주간 운동', value: '180분' },
                ].map((stat, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray">{stat.label}</span>
                    <span className="font-bold text-dark">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h3 className="text-lg font-bold text-dark mb-4">AI 추천사항</h3>
              <div className="space-y-3">
                {[
                  { icon: '🏃', title: '운동 추천', text: '오후 3-5시 사이 30분 걷기 운동을 추천합니다.' },
                  { icon: '🧘', title: '명상 시간', text: '취침 전 10분 명상으로 수면의 질을 높여보세요.' },
                  { icon: '💧', title: '수분 섭취', text: '2시간마다 물 한 잔씩 마시는 습관을 들여보세요.' },
                ].map((rec, index) => (
                  <div key={index} className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-all">
                    <div className="font-semibold text-dark mb-1">{rec.icon} {rec.title}</div>
                    <div className="text-sm text-gray">{rec.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trends Section */}
        <div className="bg-white p-8 rounded-xl shadow-card">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-dark">건강 트렌드 분석</h2>
            <div className="flex gap-2">
              {['7일', '30일', '90일', '1년'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                    activeFilter === filter
                      ? 'bg-primary border-primary text-white'
                      : 'border-gray-200 text-gray hover:border-primary hover:text-primary'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TrendCard label="평균 혈압" value="118/78" change="2% 감소" isUp={false} />
            <TrendCard label="평균 심박수" value="70 bpm" change="3% 감소" isUp={false} />
            <TrendCard label="수면 시간" value="7.5h" change="8% 증가" isUp={true} />
            <TrendCard label="운동 시간" value="180분" change="15% 감소" isUp={false} />
            <TrendCard label="스트레스 지수" value="65/100" change="12% 증가" isUp={true} />
            <TrendCard label="수분 섭취" value="1.5L" change="5% 증가" isUp={true} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-12 px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">KnowledgeHub</h3>
            <p className="text-white/70">AI 기반 개인 건강 관리의 새로운 표준</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="text-white/70 hover:text-white transition-colors">대시보드</Link></li>
              <li><Link to="/health-data" className="text-white/70 hover:text-white transition-colors">건강 데이터</Link></li>
              <li><Link to="/ai-insights" className="text-white/70 hover:text-white transition-colors">AI 인사이트</Link></li>
              <li><Link to="/genomics" className="text-white/70 hover:text-white transition-colors">유전체 분석</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">회사</h3>
            <ul className="space-y-2">
              <li><Link to="/#about" className="text-white/70 hover:text-white transition-colors">회사소개</Link></li>
              <li><Link to="/#team" className="text-white/70 hover:text-white transition-colors">팀</Link></li>
              <li><Link to="/guide" className="text-white/70 hover:text-white transition-colors">가이드</Link></li>
              <li><Link to="/contact" className="text-white/70 hover:text-white transition-colors">문의하기</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">법적 고지</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">이용약관</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">개인정보처리방침</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">의료정보 고지</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-center text-white/70 text-sm">
          <p>&copy; 2025 KnowledgeHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AIInsightsPage;
