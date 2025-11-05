/**
 * Demo page showing the new Genomics components based on HTML prototypes
 * 
 * This file demonstrates how to use the newly created components:
 * - FileUploadArea: Drag & drop file upload with validation
 * - RiskCard: Disease risk assessment cards with factor visualization
 * - DrugCard: Pharmacogenomics drug response cards
 * - SNPTable: Sortable and paginated SNP data table
 * 
 * These components can be integrated into the existing GenomicsPage.tsx
 * or used in other parts of the application.
 */

import React, { useState } from 'react';
import { FileUploadArea } from './FileUploadArea';
import { RiskCard } from './RiskCard';
import { DrugCard } from './DrugCard';
import { SNPTable } from './SNPTable';
import type { SNPData } from './SNPTable';

export const GenomicsComponentsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'risks' | 'drugs' | 'snp'>('upload');

  // Sample data
  const riskData = [
    {
      disease: '심혈관 질환',
      riskLevel: 'low' as const,
      percentile: '상위 75% (낮은 위험도)',
      factors: { genetic: 25, lifestyle: 15, family: 10 },
    },
    {
      disease: '제2형 당뇨병',
      riskLevel: 'medium' as const,
      percentile: '상위 45% (보통 위험도)',
      factors: { genetic: 45, lifestyle: 35, family: 30 },
    },
    {
      disease: '유방암',
      riskLevel: 'high' as const,
      percentile: '상위 15% (높은 위험도)',
      factors: { genetic: 70, lifestyle: 25, family: 60 },
    },
  ];

  const drugData = [
    { drugName: '와파린 (Warfarin)', response: 'normal' as const, description: '표준 용량으로 치료 가능' },
    { drugName: '클로피도그렐 (Clopidogrel)', response: 'decreased' as const, description: '용량 조절 또는 대체 약물 고려' },
    { drugName: '심바스타틴 (Simvastatin)', response: 'increased' as const, description: '부작용 위험 증가, 용량 감소 권장' },
  ];

  const snpData: SNPData[] = [
    { snpId: 'rs1801133', chromosome: '1', position: 11856378, genotype: 'CT', trait: '엽산 대사' },
    { snpId: 'rs7412', chromosome: '19', position: 45411941, genotype: 'CC', trait: '알츠하이머 위험' },
    { snpId: 'rs1799853', chromosome: '10', position: 96702047, genotype: 'GG', trait: '와파린 반응' },
    { snpId: 'rs4680', chromosome: '22', position: 19963748, genotype: 'AG', trait: '통증 민감도' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>🧬 Genomics Components Demo</h1>
      <p>HTML 프로토타입 기반으로 구현된 유전체 분석 컴포넌트들</p>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', marginBottom: '2rem' }}>
        {['upload', 'risks', 'drugs', 'snp'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === tab ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
              color: activeTab === tab ? 'white' : '#4b5563',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {tab === 'upload' && '📁 File Upload'}
            {tab === 'risks' && '⚠️ Risk Cards'}
            {tab === 'drugs' && '💊 Drug Cards'}
            {tab === 'snp' && '🔬 SNP Table'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && (
        <FileUploadArea
          onFileSelect={(file) => console.log('File selected:', file.name)}
          onUploadComplete={(file) => console.log('Upload complete:', file.name)}
          onUploadError={(error) => alert(error)}
        />
      )}

      {activeTab === 'risks' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {riskData.map((risk, index) => (
            <RiskCard
              key={index}
              disease={risk.disease}
              riskLevel={risk.riskLevel}
              percentile={risk.percentile}
              factors={risk.factors}
              onClick={() => console.log('Clicked:', risk.disease)}
            />
          ))}
        </div>
      )}

      {activeTab === 'drugs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {drugData.map((drug, index) => (
            <DrugCard
              key={index}
              drugName={drug.drugName}
              response={drug.response}
              description={drug.description}
            />
          ))}
        </div>
      )}

      {activeTab === 'snp' && <SNPTable data={snpData} itemsPerPage={10} />}
    </div>
  );
};
