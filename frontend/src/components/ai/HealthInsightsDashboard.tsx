import React, { useState, useEffect } from 'react';
import { aiApi } from '../../services/aiApi';
import { HealthInsights, PredictionResult } from '../../types/ai';
import { useAuth } from '../../contexts/AuthContext';
import RiskPredictionCard from './RiskPredictionCard';
import RiskFactorAnalysis from './RiskFactorAnalysis';
import HealthRecommendations from './HealthRecommendations';
import DeteriorationPatterns from './DeteriorationPatterns';
import LoadingSpinner from '../common/LoadingSpinner';
import './HealthInsightsDashboard.css';

const HealthInsightsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<HealthInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadHealthInsights();
    }
  }, [user?.id]);

  const loadHealthInsights = async () => {
    try {
      setError(null);
      const data = await aiApi.getHealthInsights(user!.id);
      setInsights(data);
    } catch (err) {
      console.error('Failed to load health insights:', err);
      setError('건강 인사이트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHealthInsights();
  };

  const generateNewPrediction = async (predictionType: 'cardiovascular' | 'diabetes' | 'general_health') => {
    try {
      setRefreshing(true);
      await aiApi.generateRiskPrediction(user!.id, { predictionType });
      await loadHealthInsights();
    } catch (err) {
      console.error('Failed to generate new prediction:', err);
      setError('새로운 예측을 생성하는데 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="health-insights-loading">
        <LoadingSpinner />
        <p>AI 건강 인사이트를 분석하고 있습니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-insights-error">
        <div className="error-content">
          <h3>오류가 발생했습니다</h3>
          <p>{error}</p>
          <button onClick={loadHealthInsights} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="health-insights-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>AI 건강 인사이트</h1>
          <p>인공지능 기반 건강 분석 및 예측</p>
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

      {insights && (
        <div className="insights-content">
          {/* Risk Predictions Section */}
          <section className="risk-predictions-section">
            <h2>질병 위험도 예측</h2>
            <div className="risk-predictions-grid">
              {insights.cardiovascularRisk && (
                <RiskPredictionCard
                  title="심혈관 질환 위험도"
                  prediction={insights.cardiovascularRisk}
                  onRefresh={() => generateNewPrediction('cardiovascular')}
                />
              )}
              {insights.diabetesRisk && (
                <RiskPredictionCard
                  title="당뇨병 위험도"
                  prediction={insights.diabetesRisk}
                  onRefresh={() => generateNewPrediction('diabetes')}
                />
              )}
            </div>
          </section>

          {/* Risk Factor Analysis Section */}
          {insights.riskFactorAnalysis && (
            <section className="risk-factors-section">
              <h2>위험 요인 분석</h2>
              <RiskFactorAnalysis prediction={insights.riskFactorAnalysis} />
            </section>
          )}

          {/* Health Deterioration Patterns */}
          {insights.deteriorationAnalysis && (
            <section className="deterioration-section">
              <h2>건강 악화 패턴 분석</h2>
              <DeteriorationPatterns prediction={insights.deteriorationAnalysis} />
            </section>
          )}

          {/* Personalized Recommendations */}
          {insights.recommendations && (
            <section className="recommendations-section">
              <h2>맞춤형 건강 권장사항</h2>
              <HealthRecommendations prediction={insights.recommendations} />
            </section>
          )}

          {/* Insights Summary */}
          <section className="insights-summary">
            <div className="summary-card">
              <h3>분석 요약</h3>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">분석 생성 시간</span>
                  <span className="stat-value">
                    {new Date(insights.generatedAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">분석된 항목</span>
                  <span className="stat-value">
                    {[
                      insights.cardiovascularRisk && '심혈관',
                      insights.diabetesRisk && '당뇨병',
                      insights.riskFactorAnalysis && '위험요인',
                      insights.deteriorationAnalysis && '건강패턴',
                      insights.recommendations && '권장사항'
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {!insights && (
        <div className="no-insights">
          <div className="no-insights-content">
            <h3>아직 분석된 인사이트가 없습니다</h3>
            <p>건강 데이터를 입력하고 첫 번째 AI 분석을 받아보세요.</p>
            <button onClick={handleRefresh} className="generate-button">
              인사이트 생성하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthInsightsDashboard;