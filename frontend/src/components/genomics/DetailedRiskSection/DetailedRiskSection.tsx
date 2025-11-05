import React, { useState } from 'react';
import styles from './DetailedRiskSection.module.css';
import { DetailedRiskSectionProps, RiskDetail } from './DetailedRiskSection.types';

const RiskAccordionItem: React.FC<{ risk: RiskDetail }> = ({ risk }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const getRiskBadgeClass = () => {
    switch (risk.riskLevel) {
      case 'high':
        return styles.high;
      case 'medium':
        return styles.medium;
      case 'low':
        return styles.low;
      default:
        return '';
    }
  };

  const getRiskLabel = () => {
    switch (risk.riskLevel) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return '';
    }
  };

  return (
    <div className={`${styles.accordion} ${isOpen ? styles.active : ''}`}>
      <button
        className={styles.accordionHeader}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={`risk-content-${risk.id}`}
        aria-label={`${risk.disease} 위험도 상세 정보 ${isOpen ? '닫기' : '열기'}`}
      >
        <div className={styles.accordionTitle}>
          <h4>{risk.disease}</h4>
          <span className={`${styles.riskBadge} ${getRiskBadgeClass()}`} aria-label={`위험도: ${getRiskLabel()}`}>
            {getRiskLabel()}
          </span>
        </div>
        <span className={styles.accordionIcon} aria-hidden="true">+</span>
      </button>
      <div 
        className={styles.accordionContent}
        id={`risk-content-${risk.id}`}
        role="region"
        aria-labelledby={`risk-header-${risk.id}`}
      >
        <div className={styles.accordionBody}>
          <div className={styles.riskScoreDisplay}>
            <div className={`${styles.scoreCircleSmall} ${getRiskBadgeClass()}`}>
              <div className={styles.number}>{risk.score}%</div>
              <div className={styles.label}>위험도</div>
            </div>
            <div className={styles.riskInfo}>
              <h5>상위 {risk.percentile}% ({getRiskLabel()} 위험도)</h5>
              <p>{risk.description}</p>
            </div>
          </div>

          <div className={styles.factorBreakdown}>
            <h5>위험 요인 분석</h5>
            <div className={styles.factorItem}>
              <span className={styles.factorLabel} id={`genetic-label-${risk.id}`}>유전적 요인</span>
              <div 
                className={styles.factorBar}
                role="progressbar"
                aria-valuenow={risk.factors.genetic}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-labelledby={`genetic-label-${risk.id}`}
              >
                <div
                  className={`${styles.factorFill} ${styles.genetic}`}
                  style={{ width: `${risk.factors.genetic}%` }}
                />
              </div>
              <span className={styles.factorValue} aria-label={`${risk.factors.genetic}퍼센트`}>{risk.factors.genetic}%</span>
            </div>
            <div className={styles.factorItem}>
              <span className={styles.factorLabel} id={`lifestyle-label-${risk.id}`}>생활습관</span>
              <div 
                className={styles.factorBar}
                role="progressbar"
                aria-valuenow={risk.factors.lifestyle}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-labelledby={`lifestyle-label-${risk.id}`}
              >
                <div
                  className={`${styles.factorFill} ${styles.lifestyle}`}
                  style={{ width: `${risk.factors.lifestyle}%` }}
                />
              </div>
              <span className={styles.factorValue} aria-label={`${risk.factors.lifestyle}퍼센트`}>{risk.factors.lifestyle}%</span>
            </div>
            <div className={styles.factorItem}>
              <span className={styles.factorLabel} id={`family-label-${risk.id}`}>가족력</span>
              <div 
                className={styles.factorBar}
                role="progressbar"
                aria-valuenow={risk.factors.family}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-labelledby={`family-label-${risk.id}`}
              >
                <div
                  className={`${styles.factorFill} ${styles.family}`}
                  style={{ width: `${risk.factors.family}%` }}
                />
              </div>
              <span className={styles.factorValue} aria-label={`${risk.factors.family}퍼센트`}>{risk.factors.family}%</span>
            </div>
          </div>

          <div className={styles.recommendations}>
            <h5>💡 맞춤 권장사항</h5>
            <ul className={styles.recommendationList}>
              {risk.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DetailedRiskSection: React.FC<DetailedRiskSectionProps> = ({ risks }) => {
  return (
    <div className={styles.detailedSection} role="region" aria-label="상세 질병 위험도 분석">
      <h2 className={styles.sectionTitle}>
        <span aria-hidden="true">📈</span>
        <span>상세 질병 위험도 분석</span>
      </h2>
      <div role="list">
        {risks.map((risk) => (
          <div key={risk.id} role="listitem">
            <RiskAccordionItem risk={risk} />
          </div>
        ))}
      </div>
    </div>
  );
};
