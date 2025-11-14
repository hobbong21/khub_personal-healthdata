import React from 'react';
import { StatCard } from '../StatCard/StatCard';
import styles from './StatCardGrid.module.css';

const StatCardGrid: React.FC = () => {
  return (
    <div className={styles.statsGrid}>
      <StatCard
        icon="❤️"
        value="120/80"
        label="혈압"
        unit="mmHg"
        change={{ positive: true, value: '정상 범위' }}
        variant="blue"
      />
      <StatCard
        icon="💓"
        value="72"
        label="심박수"
        unit="bpm"
        change={{ positive: true, value: '안정적' }}
        variant="green"
      />
      <StatCard
        icon="⚖️"
        value="68.5"
        label="체중"
        unit="kg"
        change={{ positive: false, value: '-0.5kg' }}
        variant="purple"
      />
      <StatCard
        icon="🩸"
        value="95"
        label="혈당"
        unit="mg/dL"
        change={{ positive: true, value: '정상' }}
        variant="red"
      />
    </div>
  );
};

export default StatCardGrid;
