import React, { useState } from 'react';
import { PharmacogenomicsDisplayProps, WARNING_LEVELS } from '../../types/genomics';

const PharmacogenomicsDisplay: React.FC<PharmacogenomicsDisplayProps> = ({
  pharmacogenomicsData,
  medications = []
}) => {
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'moderate'>('all');

  const drugEntries = Object.entries(pharmacogenomicsData);
  
  const filteredDrugs = drugEntries.filter(([drug, data]) => {
    if (filterLevel === 'all') return true;
    return data.warningLevel === filterLevel;
  });

  const getMetabolismIcon = (metabolism: string) => {
    switch (metabolism) {
      case 'poor': return '🐌';
      case 'intermediate': return '🚶';
      case 'normal': return '🏃';
      case 'rapid': return '🏃‍♂️';
      case 'ultrarapid': return '⚡';
      default: return '❓';
    }
  };

  const getEfficacyIcon = (efficacy: string) => {
    switch (efficacy) {
      case 'reduced': return '📉';
      case 'normal': return '➡️';
      case 'increased': return '📈';
      default: return '❓';
    }
  };

  const renderDrugCard = (drug: string, data: any) => {
    const warningLevel = WARNING_LEVELS[data.warningLevel];
    const isCurrentMedication = medications.includes(drug);

    return (
      <div
        key={drug}
        className={`drug-card ${selectedDrug === drug ? 'selected' : ''} ${isCurrentMedication ? 'current-medication' : ''}`}
        onClick={() => setSelectedDrug(selectedDrug === drug ? null : drug)}
      >
        <div className="drug-header">
          <div className="drug-name">
            <h4>{drug}</h4>
            {isCurrentMedication && (
              <span className="current-med-badge">복용 중</span>
            )}
          </div>
          <div 
            className="warning-badge"
            style={{ backgroundColor: warningLevel.color }}
          >
            {warningLevel.label}
          </div>
        </div>

        <div className="drug-summary">
          <div className="metabolism-info">
            <span className="icon">{getMetabolismIcon(data.metabolism)}</span>
            <span className="label">대사:</span>
            <span className="value">{data.metabolism}</span>
          </div>
          <div className="efficacy-info">
            <span className="icon">{getEfficacyIcon(data.efficacy)}</span>
            <span className="label">효과:</span>
            <span className="value">{data.efficacy}</span>
          </div>
        </div>

        {selectedDrug === drug && (
          <div className="drug-details">
            <div className="dosage-recommendation">
              <h5>용량 권장사항</h5>
              <p>{data.dosageRecommendation}</p>
            </div>
            <div className="evidence-info">
              <h5>근거</h5>
              <p>{data.evidence}</p>
            </div>
            {isCurrentMedication && (
              <div className="current-med-warning">
                <strong>⚠️ 현재 복용 중인 약물입니다.</strong>
                <p>의료진과 상담하여 용량 조절이 필요한지 확인하세요.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSummaryStats = () => {
    const stats = {
      total: drugEntries.length,
      high: drugEntries.filter(([, data]) => data.warningLevel === 'high').length,
      moderate: drugEntries.filter(([, data]) => data.warningLevel === 'moderate').length,
      low: drugEntries.filter(([, data]) => data.warningLevel === 'low').length,
    };

    return (
      <div className="summary-stats">
        <div className="stat-item">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">분석된 약물</div>
        </div>
        <div className="stat-item high">
          <div className="stat-number">{stats.high}</div>
          <div className="stat-label">높은 주의</div>
        </div>
        <div className="stat-item moderate">
          <div className="stat-number">{stats.moderate}</div>
          <div className="stat-label">보통 주의</div>
        </div>
        <div className="stat-item low">
          <div className="stat-number">{stats.low}</div>
          <div className="stat-label">낮은 주의</div>
        </div>
      </div>
    );
  };

  if (drugEntries.length === 0) {
    return (
      <div className="no-pharmacogenomics-data">
        <div className="no-data-icon">💊</div>
        <h3>약물유전체학 데이터가 없습니다</h3>
        <p>유전체 데이터를 업로드하여 약물 반응 분석을 받아보세요.</p>
      </div>
    );
  }

  return (
    <div className="pharmacogenomics-display">
      <div className="pharmacogenomics-header">
        <h3>약물유전체학 분석</h3>
        <p>유전적 변이에 따른 약물 대사 및 반응 예측 결과입니다.</p>
      </div>

      {renderSummaryStats()}

      <div className="filter-controls">
        <label htmlFor="warning-filter">주의 수준 필터:</label>
        <select
          id="warning-filter"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value as any)}
        >
          <option value="all">전체</option>
          <option value="high">높은 주의</option>
          <option value="moderate">보통 주의</option>
        </select>
      </div>

      <div className="drugs-grid">
        {filteredDrugs.map(([drug, data]) => renderDrugCard(drug, data))}
      </div>

      <div className="pharmacogenomics-info">
        <h4>약물유전체학이란?</h4>
        <div className="info-content">
          <p>
            약물유전체학은 개인의 유전적 변이가 약물의 효과와 부작용에 미치는 영향을 연구하는 분야입니다.
            이 분석을 통해 개인에게 최적화된 약물 선택과 용량 조절이 가능합니다.
          </p>
          
          <div className="metabolism-guide">
            <h5>대사 속도 가이드</h5>
            <div className="guide-items">
              <div className="guide-item">
                <span className="icon">🐌</span>
                <span className="term">Poor (느림):</span>
                <span className="description">약물 대사가 매우 느려 용량 감소 필요</span>
              </div>
              <div className="guide-item">
                <span className="icon">🚶</span>
                <span className="term">Intermediate (중간):</span>
                <span className="description">약물 대사가 다소 느려 용량 조절 고려</span>
              </div>
              <div className="guide-item">
                <span className="icon">🏃</span>
                <span className="term">Normal (정상):</span>
                <span className="description">정상적인 약물 대사, 표준 용량 적용</span>
              </div>
              <div className="guide-item">
                <span className="icon">🏃‍♂️</span>
                <span className="term">Rapid (빠름):</span>
                <span className="description">약물 대사가 빨라 용량 증가 고려</span>
              </div>
              <div className="guide-item">
                <span className="icon">⚡</span>
                <span className="term">Ultrarapid (매우 빠름):</span>
                <span className="description">약물 대사가 매우 빨라 대체 약물 고려</span>
              </div>
            </div>
          </div>

          <div className="important-notice">
            <h5>⚠️ 중요 안내사항</h5>
            <ul>
              <li>이 결과는 참고용이며, 실제 처방은 반드시 의료진과 상담하세요.</li>
              <li>현재 복용 중인 약물이 있다면 의료진에게 이 결과를 공유하세요.</li>
              <li>약물 변경이나 용량 조절은 의료진의 지시에 따라 진행하세요.</li>
              <li>부작용이 발생하면 즉시 의료진과 상담하세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacogenomicsDisplay;