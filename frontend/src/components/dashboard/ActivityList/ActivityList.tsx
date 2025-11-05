import React, { useMemo, useCallback } from 'react';
import styles from './ActivityList.module.css';
import { ActivityListProps, Activity } from './ActivityList.types';
import { formatRelativeTime } from '../../../utils/timeFormatter';

export const ActivityList: React.FC<ActivityListProps> = React.memo(({
  activities,
  maxItems = 10,
  onActivityClick
}) => {
  // Memoize displayed activities
  const displayedActivities = useMemo(() => 
    activities.slice(0, maxItems),
    [activities, maxItems]
  );

  // Memoize icon color getter
  const getActivityIconColor = useCallback((type: Activity['type']): string => {
    switch (type) {
      case 'measurement':
        return styles.blue;
      case 'medication':
        return styles.green;
      case 'appointment':
        return styles.red;
      case 'exercise':
        return styles.purple;
      case 'journal':
        return styles.yellow;
      default:
        return styles.default;
    }
  }, []);

  // Memoize activity click handler
  const handleActivityClick = useCallback((activity: Activity) => {
    onActivityClick?.(activity);
  }, [onActivityClick]);

  // Memoize keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent, activity: Activity) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivityClick(activity);
    }
  }, [handleActivityClick]);

  return (
    <div className={styles.activityCard} role="region" aria-label="최근 활동 목록">
      <h3 className={styles.activityTitle}>
        <span aria-hidden="true">🕐</span> 최근 활동
      </h3>
      
      <div className={styles.activityList} role="list">
        {displayedActivities.length === 0 ? (
          <div className={styles.emptyState} role="status">
            <p>최근 활동이 없습니다</p>
          </div>
        ) : (
          displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className={`${styles.activityItem} ${onActivityClick ? styles.clickable : ''}`}
              onClick={() => handleActivityClick(activity)}
              onKeyDown={(e) => handleKeyDown(e, activity)}
              role={onActivityClick ? 'button' : 'listitem'}
              tabIndex={onActivityClick ? 0 : undefined}
              aria-label={`${activity.title}, ${activity.timestamp ? formatRelativeTime(activity.timestamp) : activity.time}`}
            >
              <div className={`${styles.activityIcon} ${getActivityIconColor(activity.type)}`}>
                <span className={styles.iconEmoji} aria-hidden="true">{activity.icon}</span>
              </div>
              
              <div className={styles.activityContent}>
                <div className={styles.activityItemTitle}>{activity.title}</div>
                <div className={styles.activityTime}>
                  {activity.timestamp 
                    ? formatRelativeTime(activity.timestamp)
                    : activity.time
                  }
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > maxItems && (
        <div className={styles.activityFooter}>
          <button 
            className={styles.viewMoreButton}
            aria-label={`더 보기. ${activities.length - maxItems}개의 추가 활동 표시`}
          >
            더 보기 ({activities.length - maxItems}개 더)
          </button>
        </div>
      )}
    </div>
  );
});

ActivityList.displayName = 'ActivityList';

export default ActivityList;
