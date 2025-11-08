/**
 * AI Insights Dashboard Component
 * 
 * Displays comprehensive AI-powered health insights including:
 * - AI-generated health summary
 * - Categorized insight cards
 * - Health score visualization
 * - Quick stats panel
 * - Personalized recommendations
 * - Trend analysis with period filters
 * 
 * Requirements: 1.5, 2.6, 3.5, 4.4, 4.5, 5.5, 6.5, 6.6, 7.4, 8.5
 */

import React, { useState, useEffect } from 'react';
import { aiInsightsApi, AIInsightsResponse } from '../../services/aiInsightsApi';
import LoadingSpinner from '../common/LoadingSpinner';
import './AIInsightsDashboard.css';

const AIInsightsDashboard: React.FC = () => {
  // State management - Requirement 1.5, 7.4, 8.5
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<number>(30); // Default 30 days

  // Data fetching on component mount - Requirement 1.5, 7.4
  useEffect(() => {
    loadInsights();
  }, []);

  /**
   * Load all AI insights from the API
   */
  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await aiInsightsApi.getAllInsights();
      setInsights(data);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
      setError(err instanceof Error ? err.message : 'AI 인사이트를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle refresh button click - Requirement 7.4
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const data = await aiInsightsApi.refreshInsights();
      setInsights(data);
    } catch (err) {
      console.error('Failed to refresh insights:', err);
      setError(err instanceof Error ? err.message : '인사이트를 새로고침하는데 실패했습니다');
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Handle period filter change - Requirement 6.5, 6.6
   */
  const handleFilterChange = async (period: number) => {
    try {
      setActiveFilter(period);
      setError(null);
      
      // Fetch new trend data for the selected period
      const trends = await aiInsightsApi.getTrends(period);
      
      if (insights) {
        setInsights({
          ...insights,
          trends
        });
      }
    } catch (err) {
      console.error('Failed to load trends:', err);
      setError(err instanceof Error ? err.message : '트렌드 데이터를 불러오는데 실패했습니다');
    }
  };

  // Loading state - Requirement 8.5
  if (loading) {
    return (
      <div className="ai-insights-loading">
        <LoadingSpinner />
        <p>AI 건강 인사이트를 분석하고 있습니다...</p>
      </div>
    );
  }

  // Error state - Requirement 8.5
  if (error) {
    return (
      <div className="ai-insights-error">
        <div className="error-content">
          <h3>오류가 발생했습니다</h3>
          <p>{error}</p>
          <button onClick={loadInsights} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // No data state - Requirement 8.5
  if (!insights) {
    return (
      <div className="ai-insights-empty">
        <div className="empty-content">
          <h3>아직 분석된 인사이트가 없습니다</h3>
          <p>건강 데이터를 입력하고 첫 번째 AI 분석을 받아보세요.</p>
          <button onClick={loadInsights} className="generate-button">
            인사이트 생성하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights-dashboard">
      {/* Header with refresh button */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>AI 건강 인사이트</h1>
          <p>인공지능 기반 건강 분석 및 맞춤형 추천</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={handleRefresh} 
            className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            {refreshing ? '분석 중...' : '새로고침'}
          </button>
        </div>
      </div>

      <div className="insights-content">
        <div className="main-content">
          {/* AI Summary Section - Requirement 1.5 */}
          <section className="ai-summary-section">
            <div className="summary-card">
              <div className="summary-header">
                <h2>AI 건강 요약</h2>
                <div className="summary-meta">
                  <span className="period">{insights.summary.period}</span>
                  <span className="confidence">신뢰도: {Math.round(insights.summary.confidence * 100)}%</span>
                </div>
              </div>
              <div className="summary-content">
                <p className="summary-text">{insights.summary.text}</p>
                
                {insights.summary.keyFindings.positive.length > 0 && (
                  <div className="key-findings positive">
                    <h4>긍정적 발견사항</h4>
                    <ul>
                      {insights.summary.keyFindings.positive.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {insights.summary.keyFindings.concerning.length > 0 && (
                  <div className="key-findings concerning">
                    <h4>주의가 필요한 사항</h4>
                    <ul>
                      {insights.summary.keyFindings.concerning.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="summary-footer">
                <span className="last-updated">
                  마지막 업데이트: {new Date(insights.summary.lastUpdated).toLocaleString('ko-KR')}
                </span>
              </div>
            </div>
          </section>

          {/* Insight Cards Section - Requirement 2.6 */}
          <section className="insights-cards-section">
            <h2>건강 인사이트</h2>
            <div className="insights-grid">
              {insights.insights.map((insight) => (
                <div 
                  key={insight.id} 
                  className={`insight-card ${insight.type} priority-${insight.priority}`}
                >
                  <div className="insight-header">
                    <span className="insight-icon">{insight.icon}</span>
                    <span className={`priority-badge ${insight.priority}`}>
                      {insight.priority === 'high' ? '높음' : insight.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                  <h3 className="insight-title">{insight.title}</h3>
                  <p className="insight-description">{insight.description}</p>
                  {insight.actionText && (
                    <button className="insight-action">
                      {insight.actionText}
                    </button>
                  )}
                  <div className="insight-footer">
                    <span className="related-metrics">
                      {insight.relatedMetrics.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Health Score Widget - Requirement 3.5 */}
          <section className="health-score-section">
            <div className="health-score-card">
              <h2>종합 건강 점수</h2>
              <div className="score-visualization">
                <div className="score-circle">
                  <svg viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="#e0e0e0"
                      strokeWidth="20"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke={
                        insights.healthScore.category === 'excellent' ? '#4caf50' :
                        insights.healthScore.category === 'good' ? '#8bc34a' :
                        insights.healthScore.category === 'fair' ? '#ff9800' : '#f44336'
                      }
                      strokeWidth="20"
                      strokeDasharray={`${insights.healthScore.score * 5.65} 565`}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div className="score-value">
                    <span className="score-number">{insights.healthScore.score}</span>
                    <span className="score-label">{insights.healthScore.categoryLabel}</span>
                  </div>
                </div>
              </div>
              <div className="score-change">
                <span className={`change-indicator ${insights.healthScore.changeDirection}`}>
                  {insights.healthScore.changeDirection === 'up' ? '↑' : 
                   insights.healthScore.changeDirection === 'down' ? '↓' : '→'}
                </span>
                <span className="change-value">
                  {insights.healthScore.change > 0 ? '+' : ''}{insights.healthScore.change}점
                </span>
                <span className="change-text">지난 주 대비</span>
              </div>
              <div className="score-components">
                <div className="component">
                  <span className="component-label">혈압</span>
                  <div className="component-bar">
                    <div 
                      className="component-fill"
                      style={{ width: `${insights.healthScore.components.bloodPressure.score}%` }}
                    />
                  </div>
                  <span className="component-score">{insights.healthScore.components.bloodPressure.score}</span>
                </div>
                <div className="component">
                  <span className="component-label">심박수</span>
                  <div className="component-bar">
                    <div 
                      className="component-fill"
                      style={{ width: `${insights.healthScore.components.heartRate.score}%` }}
                    />
                  </div>
                  <span className="component-score">{insights.healthScore.components.heartRate.score}</span>
                </div>
                <div className="component">
                  <span className="component-label">수면</span>
                  <div className="component-bar">
                    <div 
                      className="component-fill"
                      style={{ width: `${insights.healthScore.components.sleep.score}%` }}
                    />
                  </div>
                  <span className="component-score">{insights.healthScore.components.sleep.score}</span>
                </div>
                <div className="component">
                  <span className="component-label">운동</span>
                  <div className="component-bar">
                    <div 
                      className="component-fill"
                      style={{ width: `${insights.healthScore.components.exercise.score}%` }}
                    />
                  </div>
                  <span className="component-score">{insights.healthScore.components.exercise.score}</span>
                </div>
                <div className="component">
                  <span className="component-label">스트레스</span>
                  <div className="component-bar">
                    <div 
                      className="component-fill"
                      style={{ width: `${insights.healthScore.components.stress.score}%` }}
                    />
                  </div>
                  <span className="component-score">{insights.healthScore.components.stress.score}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Trends Section - Requirement 6.5, 6.6 */}
          <section className="trends-section">
            <div className="trends-header">
              <h2>건강 트렌드 분석</h2>
              <div className="period-filters">
                <button 
                  className={`filter-button ${activeFilter === 7 ? 'active' : ''}`}
                  onClick={() => handleFilterChange(7)}
                >
                  7일
                </button>
                <button 
                  className={`filter-button ${activeFilter === 30 ? 'active' : ''}`}
                  onClick={() => handleFilterChange(30)}
                >
                  30일
                </button>
                <button 
                  className={`filter-button ${activeFilter === 90 ? 'active' : ''}`}
                  onClick={() => handleFilterChange(90)}
                >
                  90일
                </button>
                <button 
                  className={`filter-button ${activeFilter === 365 ? 'active' : ''}`}
                  onClick={() => handleFilterChange(365)}
                >
                  1년
                </button>
              </div>
            </div>
            <div className="trends-grid">
              {insights.trends.map((trend, index) => (
                <div key={index} className="trend-card">
                  <h3 className="trend-label">{trend.label}</h3>
                  <div className="trend-value">
                    <span className="current-value">{trend.currentValue}</span>
                    <span className={`trend-indicator ${trend.isImproving ? 'improving' : 'worsening'}`}>
                      {trend.changeDirection === 'up' ? '↑' : 
                       trend.changeDirection === 'down' ? '↓' : '→'}
                      {Math.abs(trend.change)}%
                    </span>
                  </div>
                  <div className="trend-comparison">
                    <span className="previous-value">이전: {trend.previousValue}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="insights-sidebar">
          {/* Quick Stats Panel - Requirement 4.4, 4.5 */}
          <div className="quick-stats-panel">
            <h3>주요 지표</h3>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-label">혈압</span>
                <span className="stat-value">
                  {insights.quickStats.bloodPressure.value} {insights.quickStats.bloodPressure.unit}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">심박수</span>
                <span className="stat-value">
                  {insights.quickStats.heartRate.value === 0 ? '데이터 없음' : 
                   `${insights.quickStats.heartRate.value} ${insights.quickStats.heartRate.unit}`}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">수면</span>
                <span className="stat-value">
                  {insights.quickStats.sleep.value === 0 ? '데이터 없음' : 
                   `${insights.quickStats.sleep.value} ${insights.quickStats.sleep.unit}`}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">주간 운동</span>
                <span className="stat-value">
                  {insights.quickStats.exercise.value === 0 ? '데이터 없음' : 
                   `${insights.quickStats.exercise.value} ${insights.quickStats.exercise.unit}`}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations Panel - Requirement 5.5 */}
          <div className="recommendations-panel">
            <h3>맞춤형 추천</h3>
            <div className="recommendations-list">
              {insights.recommendations
                .sort((a, b) => a.priority - b.priority)
                .map((recommendation) => (
                  <div key={recommendation.id} className="recommendation-item">
                    <span className="recommendation-icon">{recommendation.icon}</span>
                    <div className="recommendation-content">
                      <h4 className="recommendation-title">{recommendation.title}</h4>
                      <p className="recommendation-description">{recommendation.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AIInsightsDashboard;
