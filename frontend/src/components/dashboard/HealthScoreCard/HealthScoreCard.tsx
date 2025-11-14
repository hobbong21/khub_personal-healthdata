import React from 'react';
import styles from './HealthScoreCard.module.css';

const HealthScoreCard: React.FC = () => {
  return (
    <div className={styles.healthScoreCard}>
      <div className={styles.healthScoreLabel}>전체 건강 점수</div>
      <div className={styles.healthScoreValue}>85</div>
      <div className={styles.healthScoreStatus}>양호</div>
    </div>
  );
};

export default HealthScoreCard;
