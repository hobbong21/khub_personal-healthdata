import React from 'react';
import styles from './LoadingSpinner.module.css';
import { LoadingSpinnerProps } from './LoadingSpinner.types';

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  variant = 'primary',
  fullScreen = false,
  text = '로딩 중...',
}) => {
  const containerClasses = [
    styles.container,
    fullScreen ? styles.fullScreen : '',
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerClasses = [
    styles.spinner,
    styles[size],
    styles[variant],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className={spinnerClasses} aria-hidden="true"></div>
      {text && <p className={styles.text}>{text}</p>}
      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
};

// Default export for backward compatibility
export default LoadingSpinner;
