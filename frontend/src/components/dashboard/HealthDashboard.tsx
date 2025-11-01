import React, { useState, useCallback, memo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import HealthMetricsCards from './HealthMetricsCards';
import TrendCharts from './TrendCharts';
import TodaysTasksChecklist from './TodaysTasksChecklist';
import { healthApiService } from '../../services/healthApi';
import { tasksApi, Task } from '../../services/tasksApi';
import { DashboardSummaryResponse, HealthTrendResponse } from '../../types/health';

type DashboardData = DashboardSummaryResponse;
type TrendData = {
  trends: HealthTrendResponse[];
  period: string;
  days: number;
};

const HealthDashboard: React.FC = memo(() => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('monthly');
  const queryClient = useQueryClient();

  // Dashboard data query with caching
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => healthApiService.getDashboardData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Trend data query with period dependency
  const {
    data: trendData
  } = useQuery({
    queryKey: ['trends', selectedPeriod],
    queryFn: () => {
      const days = selectedPeriod === 'daily' ? 7 : selectedPeriod === 'weekly' ? 28 : 90;
      return healthApiService.getHealthTrends(selectedPeriod, days);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Today's tasks query
  const {
    data: todayTasks,
    isLoading: isTasksLoading,
    error: tasksError
  } = useQuery({
    queryKey: ['todayTasks'],
    queryFn: () => tasksApi.getTodayTasks(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });

  const handlePeriodChange = useCallback((period: string) => {
    setSelectedPeriod(period);
  }, []);

  const handleTaskToggle = useCallback(async (taskIndex: number) => {
    if (!todayTasks || taskIndex >= todayTasks.length) return;
    
    const task = todayTasks[taskIndex];
    
    try {
      // API 호출로 태스크 상태 업데이트
      await tasksApi.toggleTaskCompletion(task.id);
      
      // Update the cache
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (error) {
      console.error('Error toggling task:', error);
      // 에러 처리 - 사용자에게 알림을 보여줄 수 있음
    }
  }, [todayTasks, queryClient]);

  const handleAddTask = useCallback(async () => {
    // 태스크 추가 기능 구현
    const taskDescription = prompt('새로운 할 일을 입력하세요:');
    if (!taskDescription || taskDescription.trim() === '') return;

    // 태스크 타입 선택 (간단한 구현)
    const taskType = prompt(
      '태스크 유형을 선택하세요:\n1. vital_sign (바이탈 사인)\n2. exercise (운동)\n3. medication (복약)\n4. journal (일지)\n\n숫자를 입력하세요 (1-4):'
    );

    const typeMap: { [key: string]: 'vital_sign' | 'exercise' | 'medication' | 'journal' } = {
      '1': 'vital_sign',
      '2': 'exercise',
      '3': 'medication',
      '4': 'journal'
    };

    const selectedType = typeMap[taskType || ''] || 'journal';

    try {
      await tasksApi.createTask({
        type: selectedType,
        description: taskDescription.trim(),
        priority: 'medium'
      });

      // Update the cache
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (error) {
      console.error('Error creating task:', error);
      alert('태스크 생성 중 오류가 발생했습니다.');
    }
  }, [queryClient]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      refetchDashboard(),
      queryClient.invalidateQueries({ queryKey: ['trends'] })
    ]);
  }, [refetchDashboard, queryClient]);

  const loading = isDashboardLoading || isTasksLoading;
  const error = dashboardError || tasksError;

  // Type-safe data casting
  const typedDashboardData = dashboardData as DashboardData | undefined;
  const typedTrendData = trendData as TrendData | undefined;

  if (loading) {
    return (
      <div className="health-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>대시보드 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="health-dashboard error">
        <div className="error-message">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>데이터를 불러올 수 없습니다</h3>
          <p>{error instanceof Error ? error.message : String(error)}</p>
          <button className="btn btn-primary" onClick={refreshData}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="health-dashboard">
      {/* 대시보드 헤더 */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1 className="dashboard-title">건강 대시보드</h1>
            <p className="dashboard-subtitle">
              {typedDashboardData ? `총 ${typedDashboardData.healthMetrics.totalRecords}개의 건강 기록` : '건강 데이터 요약'}
            </p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={refreshData}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 4V10H7M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 9C20.0295 7.99742 19.3336 7.12504 18.4604 6.45933C17.5871 5.79362 16.5652 5.35482 15.4853 5.17811C14.4053 5.0014 13.2973 5.09319 12.2596 5.44616C11.222 5.79913 10.2854 6.40313 9.53 7.2L1 16M23 8L14.47 16.8C13.7146 17.5969 12.778 18.2009 11.7404 18.5538C10.7027 18.9068 9.59471 18.9986 8.51474 18.8219C7.43477 18.6452 6.41287 18.2064 5.53963 17.5407C4.66639 16.875 3.97052 16.0026 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              새로고침
            </button>
          </div>
        </div>
      </div>

      {typedDashboardData && (
        <>
          {/* 건강 지표 카드 */}
          <HealthMetricsCards
            latestVitalSigns={typedDashboardData.healthMetrics.latestVitalSigns}
            averageCondition={typedDashboardData.healthMetrics.averageCondition}
            weeklyProgress={typedDashboardData.healthMetrics.weeklyProgress}
          />

          {/* 메인 콘텐츠 그리드 */}
          <div className="dashboard-content grid grid-cols-3 gap-6">
            {/* 트렌드 차트 (2/3 너비) */}
            <div className="col-span-2">
              {typedTrendData && (
                <TrendCharts
                  trends={typedTrendData.trends}
                  period={selectedPeriod}
                  onPeriodChange={handlePeriodChange}
                />
              )}
            </div>

            {/* 오늘의 할 일 (1/3 너비) */}
            <div className="col-span-1">
              <TodaysTasksChecklist
                tasks={todayTasks || []}
                onTaskToggle={handleTaskToggle}
                onAddTask={handleAddTask}
              />
            </div>
          </div>

          {/* 목표 달성률 섹션 */}
          {(typedDashboardData.goals.weightGoal || typedDashboardData.goals.exerciseGoal) && (
            <div className="goals-section">
              <div className="card goals-card">
                <div className="card-header">
                  <h3>목표 달성률</h3>
                </div>
                <div className="card-body">
                  <div className="goals-grid grid grid-cols-2 gap-6">
                    {typedDashboardData.goals.weightGoal && (
                      <div className="goal-item">
                        <div className="goal-header">
                          <div className="goal-icon weight">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="goal-info">
                            <h4>체중 목표</h4>
                            <p>{typedDashboardData.goals.weightGoal.current}kg → {typedDashboardData.goals.weightGoal.target}kg</p>
                          </div>
                        </div>
                        <div className="goal-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill weight" 
                              style={{ width: `${Math.min(100, typedDashboardData.goals.weightGoal.progress)}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{typedDashboardData.goals.weightGoal.progress}%</span>
                        </div>
                      </div>
                    )}

                    {typedDashboardData.goals.exerciseGoal && (
                      <div className="goal-item">
                        <div className="goal-header">
                          <div className="goal-icon exercise">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M6.5 6.5H17.5L19 8V16L17.5 17.5H6.5L5 16V8L6.5 6.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                          </div>
                          <div className="goal-info">
                            <h4>운동 목표</h4>
                            <p>주 {typedDashboardData.goals.exerciseGoal.current}회 / {typedDashboardData.goals.exerciseGoal.target}회</p>
                          </div>
                        </div>
                        <div className="goal-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill exercise" 
                              style={{ width: `${Math.min(100, typedDashboardData.goals.exerciseGoal.progress)}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{typedDashboardData.goals.exerciseGoal.progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 트렌드 요약 */}
          <div className="trends-summary">
            <div className="card trends-summary-card">
              <div className="card-header">
                <h3>건강 트렌드 요약</h3>
              </div>
              <div className="card-body">
                <div className="trends-grid grid grid-cols-3 gap-4">
                  <div className="trend-summary-item">
                    <div className="trend-icon weight">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="trend-content">
                      <span className="trend-label">체중 변화</span>
                      <span className={`trend-value ${typedDashboardData.trends.weightTrend}`}>
                        {typedDashboardData.trends.weightTrend === 'increasing' ? '증가 추세' :
                         typedDashboardData.trends.weightTrend === 'decreasing' ? '감소 추세' : '안정적'}
                      </span>
                    </div>
                  </div>

                  <div className="trend-summary-item">
                    <div className="trend-icon condition">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                    <div className="trend-content">
                      <span className="trend-label">컨디션</span>
                      <span className={`trend-value ${typedDashboardData.trends.conditionTrend}`}>
                        {typedDashboardData.trends.conditionTrend === 'improving' ? '개선 중' :
                         typedDashboardData.trends.conditionTrend === 'declining' ? '주의 필요' : '안정적'}
                      </span>
                    </div>
                  </div>

                  <div className="trend-summary-item">
                    <div className="trend-icon exercise">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M6.5 6.5H17.5L19 8V16L17.5 17.5H6.5L5 16V8L6.5 6.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                    <div className="trend-content">
                      <span className="trend-label">운동 빈도</span>
                      <span className="trend-value">
                        주 {typedDashboardData.trends.exerciseFrequency}회
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

HealthDashboard.displayName = 'HealthDashboard';

export default HealthDashboard;