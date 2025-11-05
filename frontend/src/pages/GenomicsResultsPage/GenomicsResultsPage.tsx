import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResultsHeader } from '../../components/genomics/ResultsHeader';
import { DetailedRiskSection } from '../../components/genomics/DetailedRiskSection';
import { ActionButtons } from '../../components/genomics/ActionButtons';
import { RiskDetail } from '../../components/genomics/DetailedRiskSection/DetailedRiskSection.types';
import styles from './GenomicsResultsPage.module.css';

export const GenomicsResultsPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Mock data - in real implementation, fetch from API using analysisId
  const mockData = {
    healthScore: 78,
    analysisMeta: {
      date: '2025년 1월 15일',
      source: '23andMe',
      snpCount: '850,000+ SNPs',
    },
    keyFindings: [
      {
        icon: '✅',
        title: '심혈관 질환 위험도 낮음',
        description: '유전적 요인이 평균보다 낮아 심혈관 질환 위험이 낮습니다.',
      },
      {
        icon: '⚠️',
        title: '제2형 당뇨병 주의 필요',
        description: '유전적 소인이 있어 생활습관 관리가 중요합니다.',
      },
      {
        icon: '💊',
        title: '클로피도그렐 반응 감소',
        description: '이 약물에 대한 반응이 감소되어 용량 조절이 필요할 수 있습니다.',
      },
      {
        icon: '🧬',
        title: '카페인 대사 빠름',
        description: '카페인을 빠르게 대사하는 유전자형을 가지고 있습니다.',
      },
    ],
    summaryStats: {
      risks: { high: 1, medium: 2, low: 5 },
      pharma: { normal: 12, altered: 4 },
      traits: { analyzed: 28, snpCount: '850K+' },
    },
    risks: [
      {
        id: '1',
        disease: '유방암',
        riskLevel: 'high' as const,
        score: 70,
        percentile: 15,
        description:
          '유전적 요인과 가족력으로 인해 유방암 위험도가 평균보다 높습니다. 정기적인 검진과 예방 조치가 권장됩니다.',
        factors: {
          genetic: 70,
          lifestyle: 25,
          family: 60,
        },
        recommendations: [
          '매년 유방 초음파 및 유방촬영술 검진을 받으세요',
          '유방 전문의와 상담하여 예방적 조치를 논의하세요',
          '건강한 체중을 유지하고 규칙적인 운동을 하세요',
          '알코올 섭취를 제한하고 금연하세요',
          '가족력에 대해 의사와 상세히 상담하세요',
        ],
      },
      {
        id: '2',
        disease: '제2형 당뇨병',
        riskLevel: 'medium' as const,
        score: 45,
        percentile: 45,
        description: '유전적 소인이 있으나 생활습관 개선으로 위험을 크게 낮출 수 있습니다.',
        factors: {
          genetic: 45,
          lifestyle: 35,
          family: 30,
        },
        recommendations: [
          '정기적으로 혈당 수치를 모니터링하세요',
          '균형 잡힌 식단과 당분 섭취를 제한하세요',
          '주 5회 이상 30분 이상 유산소 운동을 하세요',
          '건강한 체중을 유지하세요 (BMI 18.5-24.9)',
          '스트레스 관리와 충분한 수면을 취하세요',
        ],
      },
      {
        id: '3',
        disease: '심혈관 질환',
        riskLevel: 'low' as const,
        score: 25,
        percentile: 75,
        description: '유전적으로 심혈관 질환 위험이 낮습니다. 건강한 생활습관을 유지하세요.',
        factors: {
          genetic: 25,
          lifestyle: 15,
          family: 10,
        },
        recommendations: [
          '현재의 건강한 생활습관을 유지하세요',
          '정기적인 혈압 및 콜레스테롤 검사를 받으세요',
          '오메가-3가 풍부한 식단을 섭취하세요',
          '규칙적인 유산소 운동을 계속하세요',
          '금연과 절주를 유지하세요',
        ],
      },
    ],
    pharmacogenomics: [
      {
        id: '1',
        drug: '클로피도그렐 (Clopidogrel)',
        response: 'decreased' as const,
        genotype: 'CYP2C19 *2/*2',
        description:
          '이 약물을 활성 형태로 전환하는 능력이 감소되어 있습니다. 표준 용량으로는 충분한 효과를 얻지 못할 수 있습니다.',
        recommendations: [
          '의사와 상담하여 용량 조절을 고려하세요',
          '대체 약물 (프라수그렐, 티카그렐러) 사용을 논의하세요',
          '혈소판 기능 검사를 통해 약물 반응을 모니터링하세요',
          '이 정보를 모든 의료진에게 알리세요',
        ],
      },
      {
        id: '2',
        drug: '심바스타틴 (Simvastatin)',
        response: 'increased' as const,
        genotype: 'SLCO1B1 *5/*5',
        description:
          '근육병증 부작용 위험이 증가되어 있습니다. 낮은 용량으로 시작하거나 다른 스타틴 계열 약물을 고려해야 합니다.',
        recommendations: [
          '40mg 이상의 고용량 심바스타틴 사용을 피하세요',
          '근육통이나 약화 증상을 주의 깊게 관찰하세요',
          '정기적으로 CK (크레아틴 키나제) 수치를 검사하세요',
          '다른 스타틴 계열 약물 (아토르바스타틴, 로수바스타틴) 사용을 고려하세요',
        ],
      },
    ],
    traits: [
      {
        icon: '☕',
        title: '카페인 대사: 빠름',
        description:
          'CYP1A2 *1A/*1A - 카페인을 빠르게 대사합니다. 카페인 섭취 후 각성 효과가 짧게 지속될 수 있습니다.',
      },
      {
        icon: '🏃',
        title: '운동 능력: 지구력형',
        description:
          'ACTN3 R/X - 지구력 운동에 유리한 유전자형입니다. 마라톤이나 사이클링 같은 유산소 운동에 적합합니다.',
      },
      {
        icon: '🥛',
        title: '유당 분해: 정상',
        description: 'LCT -13910 C/T - 성인이 되어서도 유당을 정상적으로 소화할 수 있습니다.',
      },
      {
        icon: '😴',
        title: '수면 패턴: 아침형',
        description: 'PER3 4/4 - 아침 일찍 일어나는 것을 선호하는 유전자형입니다.',
      },
      {
        icon: '🍷',
        title: '알코올 대사: 느림',
        description:
          'ALDH2 *1/*2 - 알코올 분해가 느려 홍조 반응이 나타날 수 있습니다. 알코올 섭취를 제한하는 것이 좋습니다.',
      },
      {
        icon: '🧠',
        title: '기억력: 평균',
        description: 'BDNF Val/Val - 평균적인 기억력과 학습 능력을 가지고 있습니다.',
      },
    ],
  };

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setLoading(true);
        // In real implementation: await genomicsApi.getAnalysisResults(analysisId);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch analysis results:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [analysisId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>분석 결과를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      {/* Back Button */}
      <nav aria-label="페이지 네비게이션">
        <button className={styles.backButton} onClick={() => navigate('/genomics')} aria-label="유전체 분석 페이지로 돌아가기">
          <span aria-hidden="true">←</span>
          <span>유전체 분석으로 돌아가기</span>
        </button>
      </nav>

      {/* Results Header */}
      <ResultsHeader healthScore={mockData.healthScore} analysisMeta={mockData.analysisMeta} />

      {/* Key Findings */}
      <section className={styles.keyFindings} aria-label="주요 발견사항">
        <h2><span aria-hidden="true">🎯</span> 주요 발견사항</h2>
        <ul className={styles.findingsList} role="list">
          {mockData.keyFindings.map((finding, index) => (
            <li key={index} className={styles.findingItem}>
              <div className={styles.findingIcon} aria-hidden="true">{finding.icon}</div>
              <div className={styles.findingText}>
                <h4>{finding.title}</h4>
                <p>{finding.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Summary Cards */}
      <section className={styles.summaryCards} aria-label="분석 요약">
        <article className={`${styles.summaryCard} ${styles.risks}`}>
          <h3><span aria-hidden="true">📊</span> 질병 위험도 요약</h3>
          <div className={styles.summaryStats}>
            <div className={styles.statBox}>
              <span className={`${styles.statNumber} ${styles.high}`}>
                {mockData.summaryStats.risks.high}
              </span>
              <span className={styles.statLabel}>높음</span>
            </div>
            <div className={styles.statBox}>
              <span className={`${styles.statNumber} ${styles.medium}`}>
                {mockData.summaryStats.risks.medium}
              </span>
              <span className={styles.statLabel}>보통</span>
            </div>
            <div className={styles.statBox}>
              <span className={`${styles.statNumber} ${styles.low}`}>
                {mockData.summaryStats.risks.low}
              </span>
              <span className={styles.statLabel}>낮음</span>
            </div>
          </div>
        </article>

        <article className={`${styles.summaryCard} ${styles.pharma}`}>
          <h3><span aria-hidden="true">💊</span> 약물유전체학 요약</h3>
          <div className={styles.summaryStats}>
            <div className={styles.statBox}>
              <span className={`${styles.statNumber} ${styles.normal}`}>
                {mockData.summaryStats.pharma.normal}
              </span>
              <span className={styles.statLabel}>정상 반응</span>
            </div>
            <div className={styles.statBox}>
              <span className={`${styles.statNumber} ${styles.altered}`}>
                {mockData.summaryStats.pharma.altered}
              </span>
              <span className={styles.statLabel}>변경된 반응</span>
            </div>
          </div>
        </article>

        <article className={`${styles.summaryCard} ${styles.traits}`}>
          <h3><span aria-hidden="true">🎨</span> 유전적 특성 요약</h3>
          <div className={styles.summaryStats}>
            <div className={styles.statBox}>
              <span className={styles.statNumber} style={{ color: '#8b5cf6' }}>
                {mockData.summaryStats.traits.analyzed}
              </span>
              <span className={styles.statLabel}>분석된 특성</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber} style={{ color: '#8b5cf6' }}>
                {mockData.summaryStats.traits.snpCount}
              </span>
              <span className={styles.statLabel}>SNP 데이터</span>
            </div>
          </div>
        </article>
      </section>

      {/* Detailed Risk Analysis */}
      <DetailedRiskSection risks={mockData.risks} />

      {/* Pharmacogenomics Details */}
      <section className={styles.detailedSection} aria-label="약물유전체학 상세 정보">
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">💊</span>
          <span>약물유전체학 상세 정보</span>
        </h2>
        {mockData.pharmacogenomics.map((pharma) => (
          <article key={pharma.id} className={styles.pharmaCard}>
            <header className={styles.pharmaHeader}>
              <h4>{pharma.drug}</h4>
              <span className={styles.responseBadge} aria-label={`약물 반응: ${pharma.response === 'decreased' ? '감소됨' : '증가됨'}`}>
                {pharma.response === 'decreased' ? '감소된 반응' : '증가된 반응'}
              </span>
            </header>
            <div className={styles.pharmaBody}>
              <div className={styles.genotypeInfo}>
                <h5>{pharma.genotype}</h5>
                <p>{pharma.description}</p>
              </div>
              <div className={styles.pharmaRecommendations}>
                <h5><span aria-hidden="true">💡</span> 의료진 권장사항</h5>
                <ul>
                  {pharma.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Traits Details */}
      <section className={styles.detailedSection} aria-label="유전적 특성 분석">
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">🎨</span>
          <span>유전적 특성 분석</span>
        </h2>
        <ul className={styles.findingsList} role="list">
          {mockData.traits.map((trait, index) => (
            <li key={index} className={styles.findingItem}>
              <div className={styles.findingIcon} aria-hidden="true">{trait.icon}</div>
              <div className={styles.findingText}>
                <h4>{trait.title}</h4>
                <p>{trait.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Action Buttons */}
      <ActionButtons />
    </main>
  );
};

export default GenomicsResultsPage;
