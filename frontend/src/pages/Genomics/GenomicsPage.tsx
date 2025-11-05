import React from 'react';
import { Link } from 'react-router-dom';

interface RiskCardProps {
  level: 'low' | 'medium' | 'high';
  title: string;
  percentile: string;
  factors: { label: string; value: number; color: string }[];
}

const RiskCard: React.FC<RiskCardProps> = ({ level, title, percentile, factors }) => {
  const levelColors = {
    low: 'border-t-green-500',
    medium: 'border-t-yellow-500',
    high: 'border-t-red-500',
  };

  const levelLabels = {
    low: '낮음',
    medium: '보통',
    high: '높음',
  };

  const levelTextColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  };

  return (
    <div className={`bg-white p-8 rounded-xl shadow-card border-t-4 ${levelColors[level]} hover:-translate-y-2 hover:shadow-card-hover transition-all cursor-pointer`}>
      <div className="text-xl font-bold text-dark mb-4">{title}</div>
      <div className={`text-5xl font-bold mb-2 ${levelTextColors[level]}`}>{levelLabels[level]}</div>
      <div className="text-sm text-gray mb-6">{percentile}</div>
      
      <div className="space-y-4 pt-6 border-t border-gray-200">
        {factors.map((factor, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray">{factor.label}</span>
              <span className="font-semibold">{factor.value}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${factor.color}`}
                style={{ width: `${factor.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GenomicsPage: React.FC = () => {
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
                <Link to="/genomics" className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px] transition-all bg-blue-50 text-primary">
                  <span className="text-lg">🧬</span>
                  <span>유전체 분석</span>
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
          <h1 className="text-4xl font-bold mb-4">🧬 유전체 분석</h1>
          <p className="text-xl opacity-90 mb-6">당신의 유전적 특성을 이해하고 맞춤형 건강 관리를 시작하세요</p>
          <div className="flex gap-4">
            <Link to="/genomics/results" className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all inline-flex items-center gap-2">
              <span>📊</span>
              <span>상세 분석 결과 보기</span>
            </Link>
            <Link to="/dashboard" className="bg-white/20 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all inline-flex items-center gap-2">
              <span>←</span>
              <span>대시보드로 돌아가기</span>
            </Link>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white p-12 rounded-xl shadow-card text-center mb-8">
          <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 hover:border-primary hover:bg-gray-50 transition-all cursor-pointer">
            <div className="text-6xl mb-4">📁</div>
            <div className="text-xl font-semibold text-gray-700 mb-2">유전자 데이터 파일을 업로드하세요</div>
            <div className="text-sm text-gray">23andMe, Ancestry, 또는 기타 유전자 검사 결과 파일 (TXT, CSV)</div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <RiskCard
            level="low"
            title="심혈관 질환"
            percentile="상위 75% (낮은 위험도)"
            factors={[
              { label: '유전적 요인', value: 25, color: 'bg-purple-500' },
              { label: '생활습관', value: 15, color: 'bg-blue-500' },
              { label: '가족력', value: 10, color: 'bg-green-500' },
            ]}
          />
          <RiskCard
            level="medium"
            title="제2형 당뇨병"
            percentile="상위 45% (보통 위험도)"
            factors={[
              { label: '유전적 요인', value: 45, color: 'bg-purple-500' },
              { label: '생활습관', value: 35, color: 'bg-blue-500' },
              { label: '가족력', value: 30, color: 'bg-green-500' },
            ]}
          />
          <RiskCard
            level="low"
            title="알츠하이머"
            percentile="상위 80% (낮은 위험도)"
            factors={[
              { label: '유전적 요인', value: 20, color: 'bg-purple-500' },
              { label: '생활습관', value: 10, color: 'bg-blue-500' },
              { label: '가족력', value: 5, color: 'bg-green-500' },
            ]}
          />
          <RiskCard
            level="high"
            title="유방암"
            percentile="상위 15% (높은 위험도)"
            factors={[
              { label: '유전적 요인', value: 70, color: 'bg-purple-500' },
              { label: '생활습관', value: 25, color: 'bg-blue-500' },
              { label: '가족력', value: 60, color: 'bg-green-500' },
            ]}
          />
        </div>

        {/* Pharmacogenomics */}
        <div className="bg-white p-8 rounded-xl shadow-card mb-8">
          <h2 className="text-2xl font-bold text-dark mb-6">💊 약물유전체학 (Pharmacogenomics)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: '와파린 (Warfarin)', response: 'normal', desc: '표준 용량으로 치료 가능' },
              { name: '클로피도그렐 (Clopidogrel)', response: 'decreased', desc: '용량 조절 또는 대체 약물 고려' },
              { name: '심바스타틴 (Simvastatin)', response: 'increased', desc: '부작용 위험 증가, 용량 감소 권장' },
              { name: '코데인 (Codeine)', response: 'normal', desc: '표준 용량으로 치료 가능' },
            ].map((drug, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all">
                <div className="font-bold text-dark mb-2">{drug.name}</div>
                <span className={`inline-block px-3 py-1 rounded-md text-sm font-semibold mb-3 ${
                  drug.response === 'normal' ? 'bg-green-100 text-green-700' :
                  drug.response === 'increased' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {drug.response === 'normal' ? '정상 반응' :
                   drug.response === 'increased' ? '증가된 반응' : '감소된 반응'}
                </span>
                <div className="text-sm text-gray">{drug.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SNP Data */}
        <div className="bg-white p-8 rounded-xl shadow-card">
          <h2 className="text-2xl font-bold text-dark mb-6">🔬 SNP 데이터</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">SNP ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">염색체</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">위치</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">유전자형</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">관련 특성</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'rs1801133', chr: '1', pos: '11856378', genotype: 'CT', trait: '엽산 대사' },
                  { id: 'rs7412', chr: '19', pos: '45411941', genotype: 'CC', trait: '알츠하이머 위험' },
                  { id: 'rs1799853', chr: '10', pos: '96702047', genotype: 'GG', trait: '와파린 반응' },
                  { id: 'rs4680', chr: '22', pos: '19963748', genotype: 'AG', trait: '통증 민감도' },
                ].map((snp, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">{snp.id}</td>
                    <td className="px-6 py-4">{snp.chr}</td>
                    <td className="px-6 py-4">{snp.pos}</td>
                    <td className="px-6 py-4 font-mono font-bold text-purple-600">{snp.genotype}</td>
                    <td className="px-6 py-4">{snp.trait}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default GenomicsPage;
