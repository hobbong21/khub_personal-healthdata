import React from 'react';
import styles from './DrugCard.module.css';
import { DrugCardProps } from './DrugCard.types';

export const DrugCard: React.FC<DrugCardProps> = ({
  drugName,
  response,
  description,
}) => {
  const getResponseClass = () => {
    switch (response) {
      case 'normal':
        return styles.normal;
      case 'increased':
        return styles.increased;
      case 'decreased':
        return styles.decreased;
      default:
        return '';
    }
  };

  const getResponseText = () => {
    switch (response) {
      case 'normal':
        return '정상 반응';
      case 'increased':
        return '증가된 반응';
      case 'decreased':
        return '감소된 반응';
      default:
        return response;
    }
  };

  return (
    <div className={styles.drugCard}>
      <div className={styles.drugName}>{drugName}</div>
      <span className={`${styles.drugResponse} ${getResponseClass()}`}>
        {getResponseText()}
      </span>
      <div className={styles.drugDescription}>{description}</div>
    </div>
  );
};
