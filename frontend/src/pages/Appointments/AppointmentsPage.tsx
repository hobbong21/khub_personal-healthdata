import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  value: string;
  label: string;
  icon: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon, iconBg }) => (
  <div className="bg-white p-6 rounded-xl shadow-card">
    <div className="flex items-center gap-4">
      <div className={`w-15 h-15 rounded-xl flex items-center justify-center text-3xl ${iconBg}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-dark">{value}</h3>
        <p className="text-sm text-gray">{label}</p>
      </div>
    </div>
  </div>
);

interface UpcomingItemProps {
  date: string;
  title: string;
  location: string;
}

const UpcomingItem: React.FC<UpcomingItemProps> = ({ date, title, location }) => (
  <div className="p-4 border-2 border-gray-200 rounded-lg mb-4 hover:border-primary hover:shadow-md transition-all">
    <div className="flex items-center gap-2 text-sm text-primary font-semibold mb-2">
      <span>📅</span>
      <span>{date}</span>
    </div>
    <div className="font-semibold text-dark mb-1">{title}</div>
    <div className="text-sm text-gray">{location}</div>
  </div>
);

const AppointmentsPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(5);
  const [currentMonth] = useState('2025년 11월');

  const daysWithAppointments = [7, 12, 20];

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
                <Link to="/medical-records" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all">
                  <span className="text-lg">🏥</span>
                  <span>진료 기록</span>
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all bg-blue-50 text-primary">
                  <span className="text-lg">📅</span>
                  <span>진료 예약</span>
                </Link>
              </li>
              <li>
                <Link to="/medications" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all">
                  <span className="text-lg">💊</span>
                  <span>복약 관리</span>
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
              <h1 className="text-4xl font-bold mb-2">📅 진료 예약</h1>
              <p className="text-lg opacity-90">병원 예약을 관리하고 일정을 확인하세요</p>
            </div>
            <button className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center gap-2">
              <span>➕</span>
              <span>새 예약 추가</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard value="3" label="예정된 예약" icon="📅" iconBg="bg-blue-100" />
          <StatCard value="12" label="완료된 예약" icon="✅" iconBg="bg-green-100" />
          <StatCard value="2일" label="다음 예약까지" icon="⏰" iconBg="bg-yellow-100" />
          <StatCard value="5" label="방문 병원" icon="🏥" iconBg="bg-purple-100" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-card">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-dark">예약 캘린더</h2>
              <div className="flex items-center gap-4">
                <button className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-xl transition-all">
                  ◀
                </button>
                <span className="font-semibold text-gray-700 min-w-[150px] text-center">{currentMonth}</span>
                <button className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-xl transition-all">
                  ▶
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray text-sm py-3">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const hasAppointment = daysWithAppointments.includes(day);
                const isToday = day === 5;
                const isSelected = day === selectedDay;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative
                      ${isSelected ? 'bg-primary border-primary text-white' : 'border-gray-200 hover:border-primary hover:bg-gray-50'}
                      ${isToday && !isSelected ? 'bg-blue-50 border-blue-500' : ''}
                    `}
                  >
                    <span className="font-semibold text-[15px]">{day}</span>
                    {hasAppointment && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Today's Appointments */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-dark mb-4">오늘의 예약</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 border-l-4 border-primary p-4 rounded-lg">
                  <div className="font-bold text-primary mb-2">오전 10:00</div>
                  <div className="font-semibold text-dark mb-1">정기 검진</div>
                  <div className="text-sm text-gray">김철수 의사 - 서울대학교병원 내과</div>
                </div>
                <div className="bg-gray-50 border-l-4 border-primary p-4 rounded-lg">
                  <div className="font-bold text-primary mb-2">오후 2:30</div>
                  <div className="font-semibold text-dark mb-1">치과 검진</div>
                  <div className="text-sm text-gray">이영희 의사 - 강남치과의원</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h3 className="text-lg font-bold text-dark mb-4">다가오는 예약</h3>
              <UpcomingItem
                date="11월 7일 (목) 오전 9:00"
                title="혈액 검사"
                location="서울대학교병원 진단검사의학과"
              />
              <UpcomingItem
                date="11월 12일 (화) 오후 3:00"
                title="피부과 진료"
                location="강남피부과의원"
              />
              <UpcomingItem
                date="11월 20일 (수) 오전 11:00"
                title="정형외과 재진"
                location="연세세브란스병원 정형외과"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-card">
              <h3 className="text-lg font-bold text-dark mb-4">빠른 작업</h3>
              <div className="space-y-3">
                <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-xl">
                    ➕
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-dark">새 예약 추가</div>
                    <div className="text-sm text-gray">병원 예약 일정 등록</div>
                  </div>
                </button>
                <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-xl">
                    📋
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-dark">예약 내역</div>
                    <div className="text-sm text-gray">과거 예약 기록 보기</div>
                  </div>
                </button>
                <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-xl">
                    🔍
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-dark">병원 찾기</div>
                    <div className="text-sm text-gray">주변 병원 검색</div>
                  </div>
                </button>
                <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-xl">
                    📤
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-dark">캘린더 내보내기</div>
                    <div className="text-sm text-gray">Google 캘린더 연동</div>
                  </div>
                </button>
              </div>
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
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="text-white/70 hover:text-white transition-colors">대시보드</Link></li>
              <li><Link to="/health-data" className="text-white/70 hover:text-white transition-colors">건강 데이터</Link></li>
              <li><Link to="/ai-insights" className="text-white/70 hover:text-white transition-colors">AI 인사이트</Link></li>
              <li><Link to="/genomics" className="text-white/70 hover:text-white transition-colors">유전체 분석</Link></li>
              <li><Link to="/appointments" className="text-white/70 hover:text-white transition-colors">진료 예약</Link></li>
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

export default AppointmentsPage;
