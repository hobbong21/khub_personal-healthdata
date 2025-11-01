import React, { useState, useEffect } from 'react';
import { recommendationApi } from '../services/recommendationApi';
import { PersonalizedRecommendations, RecommendationStats } from '../types/recommendations';
import RecommendationsDashboard from '../components/recommendations/RecommendationsDashboard';
import RecommendationsList from '../components/recommendations/RecommendationsList';
import EffectivenessTracker from '../components/recommendations/EffectivenessTracker';
import GenerateRecommendationsModal from '../components/recommendations/GenerateRecommendationsModal';
import './RecommendationsPage.css';

const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'tracking'>('overview');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [recommendationsData, statsData] = await Promise.all([
        recommendationApi.getLatestRecommendations(),
        recommendationApi.getRecommendationStats(),
      ]);

      setRecommendations(recommendationsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading recommendations data:', err);
      setError('건강 권장사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      setLoading(true);
      const newRecommendations = await recommendationApi.generateRecommendations();
      setRecommendations(newRecommendations);
      setShowGenerateModal(false);
      
      // Reload stats
      const statsData = await recommendationApi.getRecommendationStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('권장사항 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImplementationUpdate = async () => {
    // Reload data after implementation update
    await loadData();
  };

  if (loading) {
    return (
      <div className="recommendations-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>건강 권장사항을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <div className="page-header">
        <div className="header-content">
          <h1>맞춤형 건강 권장사항</h1>
          <p>개인화된 건강 관리 가이드와 추천사항을 확인하세요</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowGenerateModal(true)}
          >
            새 권장사항 생성
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            개요
          </button>
          <button
            className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            권장사항
          </button>
          <button
            className={`tab ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracking')}
          >
            효과 추적
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <RecommendationsDashboard
            recommendations={recommendations}
            stats={stats}
            onGenerateNew={() => setShowGenerateModal(true)}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsList
            recommendations={recommendations}
            onImplementationUpdate={handleImplementationUpdate}
          />
        )}

        {activeTab === 'tracking' && (
          <EffectivenessTracker
            recommendations={recommendations}
            onUpdate={handleImplementationUpdate}
          />
        )}
      </div>

      {!recommendations && !loading && (
        <div className="no-recommendations">
          <div className="no-recommendations-content">
            <div className="no-recommendations-icon">📋</div>
            <h3>아직 권장사항이 없습니다</h3>
            <p>개인화된 건강 권장사항을 생성하여 맞춤형 건강 관리를 시작하세요.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowGenerateModal(true)}
            >
              첫 권장사항 생성하기
            </button>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <GenerateRecommendationsModal
          onGenerate={handleGenerateRecommendations}
          onClose={() => setShowGenerateModal(false)}
        />
      )}
    </div>
  );
};

export default RecommendationsPage;