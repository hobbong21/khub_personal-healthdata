import React, { useMemo, useCallback } from 'react';
import styles from './RiskCard.module.css';
import { RiskCardProps } from './RiskCard.types';

export const RiskCard: React.FC<RiskCardProps> = React.memo(({
  disease,
  riskLevel,
  riskScore,
  percentile,
  factors,
  onClick,
}) => {
  // Memoize risk level class
  const riskLevelClass = useMemo(() => {
    switch (riskLevel) {
      case 'low':
        return styles.low;
      case 'medium':
        return styles.medium;
      case 'high':
        return styles.high;
      default:
        return '';
    }
  }, [riskLevel]);

  // Memoize risk level text
  const riskLevelText = useMemo(() => {
    switch (riskLevel) {
      case 'low':
        return '낮음';
      case 'medium':
        return '보통';
      case 'high':
        return '높음';
      default:
        return '';
    }
  }, [riskLevel]);

  // Memoize factor color getter
  const getFactorColor = useCallback((factorType: string) => {
    switch (factorType) {
      case 'genetic':
        return '#8b5cf6';
      case 'lifestyle':
        return '#3b82f6';
      case 'family':
        return '#10b981';
      default:
        return '#cbd5e0';
    }
  }, []);

  // Memoize factor label getter
  const getFactorLabel = useCallback((factorType: string) => {
    switch (factorType) {
      case 'genetic':
        return '유전적 요인';
      case 'lifestyle':
        return '생활습관';
      case 'family':
        return '가족력';
      default:
        return factorType;
    }
  }, []);

  // Memoize keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  }, [onClick]);

  return (
    <div
      className={`${styles.riskCard} ${riskLevelClass}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${disease} 위험도 카드`}
    >
      <div className={styles.riskTitle}>{disease}</div>
      <div className={`${styles.riskScore} ${riskLevelClass}`}>
        {riskLevelText}
      </div>
      <div className={styles.riskPercentile}>{percentile}</div>

      {factors && (
        <div className={styles.riskFactors}>
          {Object.entries(factors).map(([factorType, value]) => {
            const numValue = typeof value === 'number' ? value : 0;
            return (
              <div key={factorType} className={styles.factorItem}>
                <span className={styles.factorLabel}>{getFactorLabel(factorType)}</span>
                <div className={styles.factorBar}>
                  <div
                    className={styles.factorFill}
                    style={{
                      width: `${numValue}%`,
                      backgroundColor: getFactorColor(factorType),
                    }}
                  />
                </div>
                <span className={styles.factorValue}>{numValue}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

RiskCard.displayName = 'RiskCard';

export default RiskCard;
