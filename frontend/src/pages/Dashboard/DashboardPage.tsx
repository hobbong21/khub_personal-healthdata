import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  value: string;
  label: string;
  icon: string;
  iconBg: string;
  change: string;
  changeType: 'positive' | 'negative';
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon, iconBg, change, changeType }) => (
  <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 cursor-pointer">
    <div className="flex justify-between items-center mb-4">
      <div>
        <div className="text-3xl font-bold text-dark mb-1">{value}</div>
        <div className="text-sm text-gray">{label}</div>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${iconBg}`}>
        {icon}
      </div>
    </div>
    <div className={`inline-flex items-center text-sm px-2 py-1 rounded-md ${
      changeType === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
    }`}>
      {change}
    </div>
  </div>
);

interface ActivityItemProps {
  icon: string;
  iconBg: string;
  title: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, iconBg, title, time }) => (
  <div className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 text-xl ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="font-semibold text-dark mb-1">{title}</div>
      <div className="text-sm text-gray">{time}</div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<'ko' | 'en'>('ko');

  const toggleLanguage = () => {
    setCurrentLang(prev => prev === 'ko' ? 'en' : 'ko');
  };

  const t = {
    ko: {
      welcome: '👋 안녕하세요, 홍길동님',
      subtitle: '오늘도 건강한 하루 되세요!',
      healthScore: '전체 건강 점수',
      status: '양호',
      bloodPressure: '혈압 (mmHg)',
      heartRate: '심박수 (bpm)',
      weight: '체중 (kg)',
      bloodSugar: '혈당 (mg/dL)',
      normalRange: '↑ 정상 범위',
      stable: '↑ 안정적',
      normal: '↑ 정상',
      writeJournal: '건강 일지 작성',
      medicationRecord: '복약 기록',
      bookAppointment: '병원 예약',
      aiInsights: 'AI 인사이트',
      healthTrends: '📈 건강 트렌드 (최근 7일)',
      recentActivity: '🕐 최근 활동',
      exerciseRecord: '💪 운동 기록',
      sleepPattern: '😴 수면 패턴',
      chartPlaceholder: '차트 영역 (Chart.js 또는 Recharts)',
      exercisePlaceholder: '운동 시간 및 칼로리 차트',
      sleepPlaceholder: '수면 시간 및 질 차트',
      morningMed: '아침 약 복용 완료',
      exercise30: '운동 30분 완료',
      journalWritten: '건강 일지 작성',
      appointmentConfirmed: '병원 예약 확인',
      hoursAgo2: '2시간 전',
      hoursAgo5: '5시간 전',
      yesterday: '어제',
      daysAgo2: '2일 전',
    },
    en: {
      welcome: '👋 Hello, Gildong Hong',
      subtitle: 'Have a healthy day today!',
      healthScore: 'Overall Health Score',
      status: 'Good',
      bloodPressure: 'Blood Pressure (mmHg)',
      heartRate: 'Heart Rate (bpm)',
      weight: 'Weight (kg)',
      bloodSugar: 'Blood Sugar (mg/dL)',
      normalRange: '↑ Normal Range',
      stable: '↑ Stable',
      normal: '↑ Normal',
      writeJournal: 'Write Health Journal',
      medicationRecord: 'Medication Record',
      bookAppointment: 'Book Appointment',
      aiInsights: 'AI Insights',
      healthTrends: '📈 Health Trends (Last 7 Days)',
      recentActivity: '🕐 Recent Activity',
      exerciseRecord: '💪 Exercise Record',
      sleepPattern: '😴 Sleep Pattern',
      chartPlaceholder: 'Chart Area (Chart.js or Recharts)',
      exercisePlaceholder: 'Exercise Time and Calorie Chart',
      sleepPlaceholder: 'Sleep Time and Quality Chart',
      morningMed: 'Morning Medication Completed',
      exercise30: '30 Minutes Exercise Completed',
      journalWritten: 'Health Journal Written',
      appointmentConfirmed: 'Appointment Confirmed',
      hoursAgo2: '2 hours ago',
      hoursAgo5: '5 hours ago',
      yesterday: 'Yesterday',
      daysAgo2: '2 days ago',
    },
  };

  const text = t[currentLang];

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Navigation */}
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
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all bg-blue-50 text-primary">
                  <span className="text-lg">📊</span>
                  <span>{currentLang === 'ko' ? '대시보드' : 'Dashboard'}</span>
                </Link>
              </li>
              <li>
                <Link to="/health-data" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all">
                  <span className="text-lg">📝</span>
                  <span>{currentLang === 'ko' ? '건강 데이터' : 'Health Data'}</span>
                </Link>
              </li>
              <li>
                <Link to="/ai-insights" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all">
                  <span className="text-lg">🤖</span>
                  <span>{currentLang === 'ko' ? 'AI 인사이트' : 'AI Insights'}</span>
                </Link>
              </li>
              <li>
                <Link to="/genomics" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all">
                  <span className="text-lg">🧬</span>
                  <span>{currentLang === 'ko' ? '유전체 분석' : 'Genomics'}</span>
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all">
                  <span className="text-lg">📅</span>
                  <span>{currentLang === 'ko' ? '진료 예약' : 'Appointments'}</span>
                </Link>
              </li>
            </ul>

            <div className="flex gap-3 items-center">
              <button
                onClick={toggleLanguage}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold text-[14px] transition-all"
              >
                {currentLang === 'ko' ? 'EN' : 'KO'}
              </button>
              <Link to="/" className="bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-lg font-semibold text-[14px] inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-primary transition-all">
                <span>🏠</span>
                <span>{currentLang === 'ko' ? '홈' : 'Home'}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        {/* Welcome Header */}
        <div className="bg-white p-8 rounded-xl shadow-card mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">{text.welcome}</h1>
          <p className="text-gray">{text.subtitle}</p>
        </div>

        {/* Health Score */}
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-10 rounded-xl text-center mb-8 shadow-lg">
          <div className="text-lg opacity-90 mb-4">{text.healthScore}</div>
          <div className="text-7xl font-bold my-4">85</div>
          <div className="text-xl opacity-95">{text.status}</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            value="120/80"
            label={text.bloodPressure}
            icon="❤️"
            iconBg="bg-blue-100"
            change={text.normalRange}
            changeType="positive"
          />
          <StatCard
            value="72"
            label={text.heartRate}
            icon="💓"
            iconBg="bg-green-100"
            change={text.stable}
            changeType="positive"
          />
          <StatCard
            value="68.5"
            label={text.weight}
            icon="⚖️"
            iconBg="bg-purple-100"
            change="↓ -0.5kg"
            changeType="negative"
          />
          <StatCard
            value="95"
            label={text.bloodSugar}
            icon="🩸"
            iconBg="bg-red-100"
            change={text.normal}
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/health-data" className="bg-white p-6 rounded-xl shadow-card text-center hover:border-primary hover:-translate-y-1 transition-all border-2 border-transparent">
            <div className="text-3xl mb-2">📝</div>
            <div className="font-semibold text-dark">{text.writeJournal}</div>
          </Link>
          <Link to="/medications" className="bg-white p-6 rounded-xl shadow-card text-center hover:border-primary hover:-translate-y-1 transition-all border-2 border-transparent">
            <div className="text-3xl mb-2">💊</div>
            <div className="font-semibold text-dark">{text.medicationRecord}</div>
          </Link>
          <Link to="/appointments" className="bg-white p-6 rounded-xl shadow-card text-center hover:border-primary hover:-translate-y-1 transition-all border-2 border-transparent">
            <div className="text-3xl mb-2">🏥</div>
            <div className="font-semibold text-dark">{text.bookAppointment}</div>
          </Link>
          <Link to="/ai-insights" className="bg-white p-6 rounded-xl shadow-card text-center hover:border-primary hover:-translate-y-1 transition-all border-2 border-transparent">
            <div className="text-3xl mb-2">🤖</div>
            <div className="font-semibold text-dark">{text.aiInsights}</div>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-card">
            <h3 className="text-xl font-bold text-dark mb-6">{text.healthTrends}</h3>
            <div className="h-[300px] bg-gradient-to-t from-primary/10 to-transparent rounded-lg flex items-center justify-center text-gray">
              {text.chartPlaceholder}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-8 rounded-xl shadow-card">
            <h3 className="text-xl font-bold text-dark mb-6">{text.recentActivity}</h3>
            <ActivityItem icon="💊" iconBg="bg-blue-100" title={text.morningMed} time={text.hoursAgo2} />
            <ActivityItem icon="🏃" iconBg="bg-green-100" title={text.exercise30} time={text.hoursAgo5} />
            <ActivityItem icon="📝" iconBg="bg-purple-100" title={text.journalWritten} time={text.yesterday} />
            <ActivityItem icon="🏥" iconBg="bg-red-100" title={text.appointmentConfirmed} time={text.daysAgo2} />
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-card">
            <h3 className="text-xl font-bold text-dark mb-6">{text.exerciseRecord}</h3>
            <div className="h-[300px] bg-gradient-to-t from-primary/10 to-transparent rounded-lg flex items-center justify-center text-gray">
              {text.exercisePlaceholder}
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-card">
            <h3 className="text-xl font-bold text-dark mb-6">{text.sleepPattern}</h3>
            <div className="h-[300px] bg-gradient-to-t from-primary/10 to-transparent rounded-lg flex items-center justify-center text-gray">
              {text.sleepPlaceholder}
            </div>
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
            <h3 className="text-lg font-semibold mb-4">{currentLang === 'ko' ? '서비스' : 'Services'}</h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="text-white/70 hover:text-white transition-colors">{currentLang === 'ko' ? '대시보드' : 'Dashboard'}</Link></li>
              <li><Link to="/health-data" className="text-white/70 hover:text-white transition-colors">{currentLang === 'ko' ? '건강 데이터' : 'Health Data'}</Link></li>
              <li><Link to="/ai-insights" className="text-white/70 hover:text-white transition-colors">{currentLang === 'ko' ? 'AI 인사이트' : 'AI Insights'}</Link></li>
              <li><Link to="/genomics" className="text-white/70 hover:text-white transition-colors">{currentLang === 'ko' ? '유전체 분석' : 'Genomics'}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{currentLang === 'ko' ? '회사' : 'Company'}</h3>
            <ul className="space-y-2">
              <li><Link to="/#about" className="text-white/70 hover:text-white transition-colors">{currentLang === 'ko' ? '회사소개' : 'About'}</Link></li>
              <li><Link to="/#team" className="text-white/70 hover:text-white transition-colors">{currentLang === 'ko' ? '팀' : 'Team'}</Link></li>
              <li><Link to="/guide" className="text-white/70 hover:text-white transition-colors">{currentLang === 'ko' ? '가이드' : 'Guide'}</Link></li>
              <li><Link to="/contact" className="text-white/70 hover:text-white transition-colors">{currentLang === 'ko' ? '문의하기' : 'Contact'}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{currentLang === 'ko' ? '법적 고지' : 'Legal'}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{currentLang === 'ko' ? '이용약관' : 'Terms'}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{currentLang === 'ko' ? '개인정보처리방침' : 'Privacy'}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{currentLang === 'ko' ? '의료정보 고지' : 'Medical Disclaimer'}</a></li>
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

export default DashboardPage;
