import React, { useState, memo, useMemo, useCallback } from 'react';

interface Task {
  type: 'vital_sign' | 'exercise' | 'medication' | 'journal';
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface TodaysTasksChecklistProps {
  tasks: Task[];
  onTaskToggle?: (taskIndex: number) => void;
  onAddTask?: () => void;
}

const TodaysTasksChecklist: React.FC<TodaysTasksChecklistProps> = memo(({
  tasks,
  onTaskToggle,
  onAddTask
}) => {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  const handleTaskToggle = useCallback((index: number) => {
    const updatedTasks = [...localTasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setLocalTasks(updatedTasks);
    
    if (onTaskToggle) {
      onTaskToggle(index);
    }
  }, [onTaskToggle]);

  const taskStats = useMemo(() => {
    const completedCount = localTasks.filter(task => task.completed).length;
    const totalCount = localTasks.length;
    const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    return { completedCount, totalCount, completionPercentage };
  }, [localTasks]);

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'vital_sign':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'exercise':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6.5 6.5H17.5L19 8V16L17.5 17.5H6.5L5 16V8L6.5 6.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
      case 'medication':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M10.5 2C9.67157 2 9 2.67157 9 3.5V4.5C9 5.32843 9.67157 6 10.5 6H13.5C14.3284 6 15 5.32843 15 4.5V3.5C15 2.67157 14.3284 2 13.5 2H10.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M9 6V18C9 19.1046 9.89543 20 11 20H13C14.1046 20 15 19.1046 15 18V6" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        );
      case 'journal':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  const { completedCount, totalCount, completionPercentage } = taskStats;

  return (
    <div className="todays-tasks-checklist">
      <div className="card tasks-card">
        <div className="card-header">
          <div className="tasks-header-content">
            <h3>오늘의 할 일</h3>
            <div className="task-progress">
              <span className="task-count">{completedCount}/{totalCount} 완료</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          {onAddTask && (
            <button className="btn btn-sm btn-secondary" onClick={onAddTask}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              추가
            </button>
          )}
        </div>

        <div className="card-body">
          {localTasks.length === 0 ? (
            <div className="no-tasks-message">
              <div className="no-tasks-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p>오늘 할 일이 없습니다!</p>
              <p>새로운 건강 목표를 추가해보세요.</p>
            </div>
          ) : (
            <div className="task-list">
              {localTasks.map((task, index) => (
                <div 
                  key={index} 
                  className={`task-item ${task.completed ? 'completed' : ''} ${getPriorityColor(task.priority)}`}
                >
                  <div 
                    className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                    onClick={() => handleTaskToggle(index)}
                  >
                    {task.completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>

                  <div className="task-icon">
                    {getTaskIcon(task.type)}
                  </div>

                  <div className="task-content">
                    <span className="task-title">{task.description}</span>
                    <div className="task-meta">
                      <span className={`task-priority ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)} 우선순위
                      </span>
                    </div>
                  </div>

                  <div className="task-actions">
                    <button className="task-action-btn" title="세부사항">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="19" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="5" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 완료 요약 */}
          {totalCount > 0 && (
            <div className="tasks-summary">
              <div className="summary-stats">
                <div className="summary-item">
                  <span className="summary-label">완료율</span>
                  <span className="summary-value">{Math.round(completionPercentage)}%</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">남은 작업</span>
                  <span className="summary-value">{totalCount - completedCount}개</span>
                </div>
              </div>

              {completionPercentage === 100 && (
                <div className="completion-message">
                  <div className="completion-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>오늘의 모든 할 일을 완료했습니다! 🎉</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TodaysTasksChecklist.displayName = 'TodaysTasksChecklist';

export default TodaysTasksChecklist;