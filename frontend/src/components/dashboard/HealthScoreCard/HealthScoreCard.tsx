import React, { useMemo, useCallback } from 'react';
import styles from './HealthScoreCard.module.css';
import { HealthScoreCardProps } from './HealthScoreCard.types';

export const HealthScoreCard: React.FC<HealthScoreCardProps> = React.memo(({
  score,
  maxScore = 100,
  label = '전체 건강 점수',
  size = 'large'
}) => {
  // Memoize circle calculations
  const circleMetrics = useMemo(() => {
    const percentage = Math.min(100, (score / maxScore) * 100);
    const radius = size === 'small' ? 60 : size === 'medium' ? 80 : 100;
    const strokeWidth = size === 'small' ? 8 : size === 'medium' ? 10 : 12;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return {
      percentage,
      radius,
      strokeWidth,
      normalizedRadius,
      circumference,
      strokeDashoffset
    };
  }, [score, maxScore, size]);

  // Memoize score status getter
  const getScoreStatus = useCallback((score: number): string => {
    if (score >= 85) return '양호';
    if (score >= 70) return '보통';
    if (score >= 50) return '주의';
    return '위험';
  }, []);

  // Memoize score color getter
  const getScoreColor = useCallback((score: number): string => {
    if (score >= 85) return styles.excellent;
    if (score >= 70) return styles.good;
    if (score >= 50) return styles.warning;
    return styles.danger;
  }, []);

  // Memoize computed values
  const scoreStatus = useMemo(() => getScoreStatus(score), [score, getScoreStatus]);
  const scoreColor = useMemo(() => getScoreColor(score), [score, getScoreColor]);

  return (
    <div 
      className={`${styles.healthScoreCard} ${styles[size]}`}
      role="region"
      aria-label={`${label}: ${score}점 (${scoreStatus})`}
    >
      <div className={styles.scoreLabel} id="score-label">{label}</div>
      
      <div className={styles.scoreRing}>
        <svg
          height={circleMetrics.radius * 2}
          width={circleMetrics.radius * 2}
          className={styles.progressRing}
          role="img"
          aria-labelledby="score-label score-value"
          aria-describedby="score-status"
        >
          <title id="score-title">건강 점수 진행 상황</title>
          {/* Background circle */}
          <circle
            stroke="rgba(255, 255, 255, 0.3)"
            fill="transparent"
            strokeWidth={circleMetrics.strokeWidth}
            r={circleMetrics.normalizedRadius}
            cx={circleMetrics.radius}
            cy={circleMetrics.radius}
            aria-hidden="true"
          />
          
          {/* Progress circle */}
          <circle
            stroke="white"
            fill="transparent"
            strokeWidth={circleMetrics.strokeWidth}
            strokeDasharray={`${circleMetrics.circumference} ${circleMetrics.circumference}`}
            style={{ strokeDashoffset: circleMetrics.strokeDashoffset }}
            strokeLinecap="round"
            r={circleMetrics.normalizedRadius}
            cx={circleMetrics.radius}
            cy={circleMetrics.radius}
            className={`${styles.progressCircle} ${scoreColor}`}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={maxScore}
            aria-label={`건강 점수 ${circleMetrics.percentage.toFixed(0)}%`}
          />
        </svg>
        
        <div className={styles.scoreValue} id="score-value">
          <span className={styles.scoreNumber}>{score}</span>
          <span className={styles.scoreMax}>/{maxScore}</span>
        </div>
      </div>
      
      <div className={styles.scoreStatus} id="score-status">{scoreStatus}</div>
    </div>
  );
});

HealthScoreCard.displayName = 'HealthScoreCard';

export default HealthScoreCard;
