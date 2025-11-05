import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ContactItemProps {
  icon: string;
  title: string;
  content: string;
  subtext?: string;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, title, content, subtext }) => (
  <div className="flex items-start gap-6">
    <div className="w-15 h-15 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white text-3xl flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-dark text-lg mb-2">{title}</h4>
      <p className="text-gray">{content}</p>
      {subtext && <p className="text-sm text-gray mt-2">{subtext}</p>}
    </div>
  </div>
);

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => (
  <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all">
    <div className="font-semibold text-dark text-lg mb-3">{question}</div>
    <div className="text-gray leading-relaxed">{answer}</div>
  </div>
);

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('문의가 성공적으로 전송되었습니다!\n24시간 이내에 답변드리겠습니다.');
    setFormData({ name: '', email: '', type: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
                <Link to="/genomics" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all">
                  <span className="text-lg">🧬</span>
                  <span>유전체 분석</span>
                </Link>
              </li>
            </ul>

            <div className="flex gap-3 items-center">
              <Link to="/guide" className="border-2 border-primary text-primary px-5 py-2.5 rounded-lg font-semibold text-[14px] inline-flex items-center gap-2 hover:bg-blue-50 transition-all">
                <span>📚</span>
                <span>가이드</span>
              </Link>
              <Link to="/" className="bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-lg font-semibold text-[14px] inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-primary transition-all">
                <span>🏠</span>
                <span>홈</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-16 rounded-xl text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">💬 문의하기</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            KnowledgeHub에 대해 궁금한 점이 있으신가요? 언제든지 문의해 주세요!
          </p>
        </div>

        {/* Contact Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Info */}
          <div className="bg-white p-12 rounded-xl shadow-card">
            <h2 className="text-3xl font-bold text-dark mb-4">연락처 정보</h2>
            <p className="text-gray text-lg mb-8 leading-relaxed">
              저희 팀이 최대한 빠르게 답변드리겠습니다. 
              아래 연락처로 직접 문의하실 수도 있습니다.
            </p>

            <div className="space-y-8">
              <ContactItem
                icon="📧"
                title="이메일"
                content="support@knowledgehub.com"
                subtext="24시간 이내 답변"
              />
              <ContactItem
                icon="📞"
                title="전화"
                content="02-1234-5678"
                subtext="평일 09:00 - 18:00"
              />
              <ContactItem
                icon="📍"
                title="주소"
                content="서울특별시 강남구 테헤란로 123"
                subtext="KnowledgeHub 빌딩 5층"
              />
              <ContactItem
                icon="💬"
                title="실시간 채팅"
                content="평일 09:00 - 18:00"
                subtext="채팅 시작하기 →"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-12 rounded-xl shadow-card">
            <h3 className="text-2xl font-bold text-dark mb-6">메시지 보내기</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">이름 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">이메일 *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">문의 유형 *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="">선택해주세요</option>
                  <option value="general">일반 문의</option>
                  <option value="technical">기술 지원</option>
                  <option value="billing">결제 문의</option>
                  <option value="partnership">제휴 문의</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">제목 *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="문의 제목"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">메시지 *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="문의 내용을 자세히 입력해주세요"
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors resize-vertical"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-primary transition-all"
              >
                메시지 보내기
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white p-12 rounded-xl shadow-card">
          <h2 className="text-3xl font-bold text-dark text-center mb-3">자주 묻는 질문</h2>
          <p className="text-center text-gray mb-8">문의하기 전에 자주 묻는 질문을 확인해보세요</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FAQItem
              question="서비스 이용 요금은 어떻게 되나요?"
              answer="기본 기능은 무료로 제공됩니다. AI 인사이트, 유전체 분석 등 고급 기능은 프리미엄 플랜에서 이용 가능합니다."
            />
            <FAQItem
              question="데이터 보안은 어떻게 관리되나요?"
              answer="모든 건강 데이터는 암호화되어 저장되며, HIPAA 및 GDPR 규정을 준수합니다. 사용자의 동의 없이는 절대 제3자와 공유되지 않습니다."
            />
            <FAQItem
              question="웨어러블 기기와 연동이 가능한가요?"
              answer="Apple Watch, Fitbit, Samsung Health 등 주요 웨어러블 기기와 연동이 가능합니다. 자동으로 건강 데이터를 동기화할 수 있습니다."
            />
            <FAQItem
              question="환불 정책은 어떻게 되나요?"
              answer="프리미엄 플랜 구독 후 7일 이내에는 전액 환불이 가능합니다. 자세한 환불 정책은 이용약관을 참고해주세요."
            />
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

export default ContactPage;
