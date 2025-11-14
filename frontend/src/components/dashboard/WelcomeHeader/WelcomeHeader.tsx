import React from 'react';
import styles from './WelcomeHeader.module.css';

const WelcomeHeader: React.FC = () => {
  return (
    <div className={styles.welcomeHeader}>
      <h1>👋 안녕하세요, 홍길동님</h1>
      <p>오늘도 건강한 하루 되세요!</p>
    </div>
  );
};

export default WelcomeHeader;
