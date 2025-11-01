import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 번역 데이터
const translations = {
  ko: {
    // 공통
    'common.khub': 'K-hub',
    'common.loading': '로딩 중...',
    'common.signin': '로그인',
    'common.signout': '로그아웃',
    'common.getstarted': '시작하기',
    'common.learnmore': '자세히 보기',
    'common.contact': '문의하기',
    'common.about': '회사소개',
    'common.features': '기능',
    'common.solutions': '솔루션',
    'common.platform': '플랫폼',
    'common.resources': '리소스',
    'common.company': '회사',
    'common.email': '이메일',
    'common.password': '비밀번호',
    'common.name': '이름',
    'common.submit': '제출',
    'common.save': '저장',
    'common.cancel': '취소',
    'common.back': '뒤로',
    'common.next': '다음',
    'common.previous': '이전',
    
    // 랜딩페이지
    'landing.hero.badge': 'AI 기반 개인 맞춤형 건강 관리',
    'landing.hero.title': '개인 건강 관리의',
    'landing.hero.highlight': '미래',
    'landing.hero.description': 'K-hub는 개인의 건강 데이터를 체계적으로 수집, 분석하여\n맞춤형 건강 관리 솔루션을 제공하는 통합 플랫폼입니다.',
    'landing.hero.cta.primary': '무료로 시작하기',
    'landing.hero.cta.secondary': '데모 영상 보기',
    'landing.hero.stats.users': '활성 사용자',
    'landing.hero.stats.security': '데이터 보안',
    'landing.hero.stats.monitoring': 'AI 모니터링',
    
    // 솔루션 섹션
    'landing.solutions.title': '모든 건강 관리 요구사항을\n하나의 플랫폼에서',
    'landing.solutions.description': '개인부터 의료기관까지, 다양한 사용자의 건강 관리 니즈를 충족하는 통합 솔루션',
    'landing.solutions.individual.title': '개인 사용자',
    'landing.solutions.individual.description': 'AI 기반 분석으로 개인의 건강 패턴을 파악하고, 맞춤형 건강 관리 솔루션을 제공합니다.',
    'landing.solutions.individual.feature1': '실시간 바이탈 사인 모니터링',
    'landing.solutions.individual.feature2': 'AI 기반 건강 예측 및 권장사항',
    'landing.solutions.individual.feature3': '통합 의료 기록 관리',
    'landing.solutions.individual.cta': '개인 플랜 시작하기',
    
    'landing.solutions.healthcare.title': '의료기관',
    'landing.solutions.healthcare.description': '환자 데이터 통합 관리와 AI 기반 진단 지원으로 의료 서비스 품질을 향상시킵니다.',
    'landing.solutions.healthcare.feature1': '환자 데이터 통합 대시보드',
    'landing.solutions.healthcare.feature2': 'AI 진단 지원 시스템',
    'landing.solutions.healthcare.feature3': '원격 환자 모니터링',
    'landing.solutions.healthcare.cta': '의료기관 상담 신청',
    
    'landing.solutions.enterprise.title': '기업',
    'landing.solutions.enterprise.description': '직원들의 건강 관리를 통해 생산성 향상과 의료비 절감을 실현합니다.',
    'landing.solutions.enterprise.feature1': '직원 건강 현황 대시보드',
    'landing.solutions.enterprise.feature2': '건강 검진 관리 시스템',
    'landing.solutions.enterprise.feature3': '웰니스 프로그램 운영',
    'landing.solutions.enterprise.cta': '기업 솔루션 문의',
    
    // 플랫폼 기능
    'landing.features.title': '포괄적인 건강 관리를 위한\n모든 기능을 하나의 플랫폼에서',
    'landing.features.ai.title': 'AI 건강 분석',
    'landing.features.ai.description': '머신러닝 기반 개인 맞춤형 건강 인사이트와 질병 예측 서비스',
    'landing.features.genomic.title': '유전체 분석',
    'landing.features.genomic.description': '개인 유전 정보 기반 질병 위험도 평가 및 약물 반응성 분석',
    'landing.features.wearable.title': '웨어러블 연동',
    'landing.features.wearable.description': '다양한 웨어러블 기기와 연동하여 실시간 건강 데이터 수집',
    'landing.features.records.title': '통합 의료 기록',
    'landing.features.records.description': '모든 진료 기록과 검사 결과를 체계적으로 관리하는 통합 시스템',
    'landing.features.medication.title': '스마트 복약 관리',
    'landing.features.medication.description': '약물 상호작용 경고와 복약 알림으로 안전한 복약 지원',
    'landing.features.security.title': '의료급 보안',
    'landing.features.security.description': 'HIPAA 준수 및 최고 수준의 암호화로 개인 건강 정보 보호',
    
    // CTA 섹션
    'landing.cta.title': '더 건강한 미래를\n지금 시작하세요',
    'landing.cta.description': 'K-hub와 함께 개인 맞춤형 건강 관리의 새로운 경험을 시작해보세요.',
    'landing.cta.primary': '무료로 시작하기',
    'landing.cta.secondary': '상담 신청하기',
    
    // 로그인 페이지
    'login.title': 'K-hub에 오신 것을 환영합니다',
    'login.subtitle': '건강 대시보드에 로그인하세요',
    'login.email.label': '이메일',
    'login.email.placeholder': '이메일을 입력하세요',
    'login.password.label': '비밀번호',
    'login.password.placeholder': '비밀번호를 입력하세요',
    'login.signin.button': '로그인',
    'login.signin.loading': '로그인 중...',
    'login.demo.text': '가입 없이 체험해보고 싶으신가요?',
    'login.demo.button': '데모 계정 체험',
    'login.back': '← 홈으로 돌아가기',
    
    // 대시보드
    'dashboard.title': 'K-hub 대시보드',
    'dashboard.welcome': '안녕하세요, {name}님!',
    'dashboard.subtitle': '오늘의 건강 현황을 확인해보세요',
    
    // 사이드바 메뉴
    'dashboard.menu.overview': '개요',
    'dashboard.menu.healthdata': '건강 데이터',
    'dashboard.menu.medications': '복약 관리',
    'dashboard.menu.appointments': '예약',
    'dashboard.menu.reports': '리포트',
    'dashboard.menu.settings': '설정',
    
    // 건강 데이터
    'dashboard.health.bloodpressure': '혈압',
    'dashboard.health.heartrate': '심박수',
    'dashboard.health.steps': '일일 걸음수',
    'dashboard.health.sleep': '수면 시간',
    'dashboard.health.weight': '체중',
    'dashboard.health.normal': '정상 범위',
    'dashboard.health.resting': '안정시',
    'dashboard.health.goal': '목표의',
    'dashboard.health.quality': '좋은 품질',
    'dashboard.health.trends': '건강 트렌드',
    
    // 빠른 작업
    'dashboard.quickactions.title': '빠른 작업',
    'dashboard.quickactions.logdata': '건강 데이터 기록',
    'dashboard.quickactions.logdata.desc': '바이탈 사인과 증상 기록',
    'dashboard.quickactions.medications': '복약 관리',
    'dashboard.quickactions.medications.desc': '처방전과 복용량 추적',
    'dashboard.quickactions.appointments': '예약 잡기',
    'dashboard.quickactions.appointments.desc': '의료진과 예약 잡기',
    
    // 건강 데이터 입력
    'healthdata.title': '건강 데이터 기록',
    'healthdata.bloodpressure.label': '혈압',
    'healthdata.bloodpressure.systolic': '수축기',
    'healthdata.bloodpressure.diastolic': '이완기',
    'healthdata.heartrate.label': '심박수 (bpm)',
    'healthdata.weight.label': '체중 (kg)',
    'healthdata.steps.label': '일일 걸음수',
    'healthdata.sleep.label': '수면 시간',
    'healthdata.save': '건강 데이터 저장',
    'healthdata.success': '건강 데이터가 성공적으로 업데이트되었습니다!',
    
    // 푸터
    'footer.copyright': '© 2024 K-hub. All rights reserved.',
    'footer.product': '제품',
    'footer.support': '지원',
    'footer.company': '회사',
    'footer.features': '기능',
    'footer.pricing': '요금제',
    'footer.security': '보안',
    'footer.help': '도움말',
    'footer.contact': '문의하기',
    'footer.api': 'API 문서',
    'footer.about': '회사 소개',
    'footer.privacy': '개인정보처리방침',
    'footer.terms': '이용약관',
  },
  
  en: {
    // Common
    'common.khub': 'K-hub',
    'common.loading': 'Loading...',
    'common.signin': 'Sign in',
    'common.signout': 'Sign out',
    'common.getstarted': 'Get started',
    'common.learnmore': 'Learn more',
    'common.contact': 'Contact',
    'common.about': 'About',
    'common.features': 'Features',
    'common.solutions': 'Solutions',
    'common.platform': 'Platform',
    'common.resources': 'Resources',
    'common.company': 'Company',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.name': 'Name',
    'common.submit': 'Submit',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    
    // Landing page
    'landing.hero.badge': 'AI-powered personalized healthcare',
    'landing.hero.title': 'The future of',
    'landing.hero.highlight': 'personal health management',
    'landing.hero.description': 'K-hub systematically collects and analyzes your personal health data\nto provide tailored health management solutions through an integrated platform.',
    'landing.hero.cta.primary': 'Start for free',
    'landing.hero.cta.secondary': 'Watch demo',
    'landing.hero.stats.users': 'Active users',
    'landing.hero.stats.security': 'Data security',
    'landing.hero.stats.monitoring': 'AI monitoring',
    
    // Solutions section
    'landing.solutions.title': 'Comprehensive health management\nfor everyone',
    'landing.solutions.description': 'From individuals to healthcare institutions, we provide integrated solutions\nthat meet diverse health management needs.',
    'landing.solutions.individual.title': 'For Individuals',
    'landing.solutions.individual.description': 'AI-powered personal health insights and predictive analytics tailored to your unique health profile and lifestyle.',
    'landing.solutions.individual.feature1': 'Real-time vital signs monitoring',
    'landing.solutions.individual.feature2': 'AI health predictions & recommendations',
    'landing.solutions.individual.feature3': 'Integrated medical records management',
    'landing.solutions.individual.cta': 'Start personal plan',
    
    'landing.solutions.healthcare.title': 'For Healthcare Providers',
    'landing.solutions.healthcare.description': 'Comprehensive patient data integration and AI-powered diagnostic support to enhance healthcare service quality.',
    'landing.solutions.healthcare.feature1': 'Unified patient data dashboard',
    'landing.solutions.healthcare.feature2': 'AI diagnostic support system',
    'landing.solutions.healthcare.feature3': 'Remote patient monitoring',
    'landing.solutions.healthcare.cta': 'Request consultation',
    
    'landing.solutions.enterprise.title': 'For Enterprises',
    'landing.solutions.enterprise.description': 'Employee health management platform that improves productivity and reduces healthcare costs through wellness programs.',
    'landing.solutions.enterprise.feature1': 'Employee health status dashboard',
    'landing.solutions.enterprise.feature2': 'Health screening management',
    'landing.solutions.enterprise.feature3': 'Wellness program operations',
    'landing.solutions.enterprise.cta': 'Enterprise inquiry',
    
    // Platform features
    'landing.features.title': 'Everything you need for\ncomprehensive health management',
    'landing.features.ai.title': 'AI Health Analysis',
    'landing.features.ai.description': 'Machine learning-based personalized health insights and disease prediction services',
    'landing.features.genomic.title': 'Genomic Analysis',
    'landing.features.genomic.description': 'Personal genetic information-based disease risk assessment and drug response analysis',
    'landing.features.wearable.title': 'Wearable Integration',
    'landing.features.wearable.description': 'Real-time health data collection through integration with various wearable devices',
    'landing.features.records.title': 'Integrated Medical Records',
    'landing.features.records.description': 'Comprehensive system for systematically managing all medical records and test results',
    'landing.features.medication.title': 'Smart Medication Management',
    'landing.features.medication.description': 'Safe medication support with drug interaction warnings and medication reminders',
    'landing.features.security.title': 'Medical-Grade Security',
    'landing.features.security.description': 'HIPAA compliance and highest level encryption to protect personal health information',
    
    // CTA section
    'landing.cta.title': 'Start your healthier future\ntoday',
    'landing.cta.description': 'Begin a new experience of personalized health management with K-hub.',
    'landing.cta.primary': 'Start for free',
    'landing.cta.secondary': 'Request consultation',
    
    // Login page
    'login.title': 'Welcome to K-hub',
    'login.subtitle': 'Sign in to your health dashboard',
    'login.email.label': 'Email',
    'login.email.placeholder': 'Enter your email',
    'login.password.label': 'Password',
    'login.password.placeholder': 'Enter your password',
    'login.signin.button': 'Sign In',
    'login.signin.loading': 'Signing in...',
    'login.demo.text': 'Want to try without signing up?',
    'login.demo.button': 'Try Demo Account',
    'login.back': '← Back to Home',
    
    // Dashboard
    'dashboard.title': 'K-hub Dashboard',
    'dashboard.welcome': 'Welcome back, {name}!',
    'dashboard.subtitle': 'Here\'s your health overview for today',
    
    // Sidebar menu
    'dashboard.menu.overview': 'Overview',
    'dashboard.menu.healthdata': 'Health Data',
    'dashboard.menu.medications': 'Medications',
    'dashboard.menu.appointments': 'Appointments',
    'dashboard.menu.reports': 'Reports',
    'dashboard.menu.settings': 'Settings',
    
    // Health data
    'dashboard.health.bloodpressure': 'Blood Pressure',
    'dashboard.health.heartrate': 'Heart Rate',
    'dashboard.health.steps': 'Daily Steps',
    'dashboard.health.sleep': 'Sleep Quality',
    'dashboard.health.weight': 'Weight',
    'dashboard.health.normal': 'Normal range',
    'dashboard.health.resting': 'Resting rate',
    'dashboard.health.goal': 'of goal',
    'dashboard.health.quality': 'Good quality',
    'dashboard.health.trends': 'Health Trends',
    
    // Quick actions
    'dashboard.quickactions.title': 'Quick Actions',
    'dashboard.quickactions.logdata': 'Log Health Data',
    'dashboard.quickactions.logdata.desc': 'Record vitals and symptoms',
    'dashboard.quickactions.medications': 'Manage Medications',
    'dashboard.quickactions.medications.desc': 'Track prescriptions and doses',
    'dashboard.quickactions.appointments': 'Schedule Appointment',
    'dashboard.quickactions.appointments.desc': 'Book with healthcare providers',
    
    // Health data input
    'healthdata.title': 'Log Health Data',
    'healthdata.bloodpressure.label': 'Blood Pressure',
    'healthdata.bloodpressure.systolic': 'Systolic',
    'healthdata.bloodpressure.diastolic': 'Diastolic',
    'healthdata.heartrate.label': 'Heart Rate (bpm)',
    'healthdata.weight.label': 'Weight (kg)',
    'healthdata.steps.label': 'Daily Steps',
    'healthdata.sleep.label': 'Sleep Hours',
    'healthdata.save': 'Save Health Data',
    'healthdata.success': 'Health data updated successfully!',
    
    // Footer
    'footer.copyright': '© 2024 K-hub. All rights reserved.',
    'footer.product': 'Product',
    'footer.support': 'Support',
    'footer.company': 'Company',
    'footer.features': 'Features',
    'footer.pricing': 'Pricing',
    'footer.security': 'Security',
    'footer.help': 'Help Center',
    'footer.contact': 'Contact Us',
    'footer.api': 'API Documentation',
    'footer.about': 'About Us',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('k-hub-language');
    return (saved as Language) || 'ko'; // 기본값을 한국어로 설정
  });

  useEffect(() => {
    localStorage.setItem('k-hub-language', language);
  }, [language]);

  const t = (key: string, params?: Record<string, string>): string => {
    let text = translations[language][key] || key;
    
    // 매개변수 치환
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, value);
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};