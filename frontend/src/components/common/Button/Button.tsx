import React from 'react';
import styles from './Button.module.css';
import { ButtonProps } from './Button.types';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true" role="status">
          <span className={styles.spinnerIcon}></span>
        </span>
      )}
      {icon && !loading && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      {children && <span className={styles.content}>{children}</span>}
      {loading && <span className="sr-only">로딩 중...</span>}
    </button>
  );
};
