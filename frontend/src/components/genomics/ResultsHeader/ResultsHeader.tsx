import React from 'react';
import styles from './ResultsHeader.module.css';
import { ResultsHeaderProps } from './ResultsHeader.types';

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({ healthScore, analysisMeta }) => {
  return (
    <div className={styles.resultsHeader}>
      <div className={styles.headerContent}>
        <h1>🧬 유전체 분석 결과</h1>
        <div className={styles.analysisMeta}>
          <div className={styles.metaItem}>
            <span>📅</span>
            <span>분석 날짜: {analysisMeta.date}</span>
          </div>
          <div className={styles.metaItem}>
            <span>🔬</span>
            <span>데이터 소스: {analysisMeta.source}</span>
          </div>
          <div className={styles.metaItem}>
            <span>📊</span>
            <span>분석 항목: {analysisMeta.snpCount}</span>
          </div>
        </div>
      </div>
      <div className={styles.healthScoreCircle}>
        <div className={styles.scoreNumber}>{healthScore}</div>
        <div className={styles.scoreLabel}>전체 건강 점수</div>
      </div>
    </div>
  );
};
