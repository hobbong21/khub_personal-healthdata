import React, { useCallback, useMemo } from 'react';
import styles from './StatCard.module.css';
import { StatCardProps } from './StatCard.types';

export const StatCard: React.FC<StatCardProps> = React.memo(({
  icon,
  value,
  label,
  unit,
  change,
  variant = 'default',
  onClick
}) => {
  const isClickable = !!onClick;

  // Memoize keyboard event handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  }, [onClick]);

  // Memoize className computation
  const cardClassName = useMemo(() => 
    `${styles.statCard} ${isClickable ? styles.clickable : ''}`,
    [isClickable]
  );

  const iconClassName = useMemo(() => 
    `${styles.statIcon} ${styles[variant]}`,
    [variant]
  );

  return (
    <article
      className={cardClassName}
      onClick={onClick}
      role={isClickable ? 'button' : 'article'}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      aria-label={`${label}: ${value}${unit || ''}${change ? `, ${change.positive ? '증가' : '감소'} ${change.value}` : ''}`}
    >
      <div className={styles.statCardHeader}>
        <div className={styles.statContent}>
          <div className={styles.statValue}>
            {value}
            {unit && <span className={styles.statUnit}>{unit}</span>}
          </div>
          <div className={styles.statLabel}>{label}</div>
        </div>
        
        <div className={iconClassName} aria-hidden="true">
          {typeof icon === 'string' ? (
            <span className={styles.iconEmoji}>{icon}</span>
          ) : (
            icon
          )}
        </div>
      </div>

      {change && (
        <div 
          className={`${styles.statChange} ${change.positive ? styles.positive : styles.negative}`}
          aria-label={`변화: ${change.positive ? '증가' : '감소'} ${change.value}`}
        >
          <span className={styles.changeIcon} aria-hidden="true">
            {change.positive ? '↑' : '↓'}
          </span>
          <span className={styles.changeValue}>{change.value}</span>
        </div>
      )}
    </article>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
