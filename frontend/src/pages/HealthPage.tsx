import React, { useState } from 'react';
import VitalSignsForm from '../components/health/VitalSignsForm';
import VitalSignsTracker from '../components/health/VitalSignsTracker';
import HealthJournalForm from '../components/health/HealthJournalForm';
import HealthJournalViewer from '../components/health/HealthJournalViewer';
import HealthDataDashboard from '../components/health/HealthDataDashboard';

const HealthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vitals' | 'journal' | 'vital-input' | 'journal-input'>('dashboard');
  const [selectedType, setSelectedType] = useState('weight');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRecordSuccess = () => {
    // 기록 성공 시 트래커 새로고침
    setRefreshKey(prev => prev + 1);
    // 바이탈 사인 기록 후 바이탈 추적으로, 건강 일지 기록 후 건강 일지로
    if (activeTab === 'vital-input') {
      setActiveTab('vitals');
    } else if (activeTab === 'journal-input') {
      setActiveTab('journal');
    }
  };

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: '🏠' },
    { id: 'vitals', label: '바이탈 사인', icon: '📊' },
    { id: 'journal', label: '건강 일지', icon: '📝' },
    { id: 'vital-input', label: '바이탈 기록', icon: '🩺' },
    { id: 'journal-input', label: '일지 작성', icon: '✏️' }
  ] as const;

  return (
    <div className="health-page">
      {/* 페이지 헤더 */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">건강 관리</h1>
          <p className="page-subtitle">바이탈 사인을 기록하고 건강 트렌드를 추적하세요</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab fade-in">
            <HealthDataDashboard
              key={refreshKey}
            />
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="tracker-tab fade-in">
            <VitalSignsTracker
              key={refreshKey}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="journal-tab fade-in">
            <HealthJournalViewer
              key={refreshKey}
            />
          </div>
        )}

        {activeTab === 'vital-input' && (
          <div className="input-tab fade-in">
            <VitalSignsForm
              onSuccess={handleRecordSuccess}
              onCancel={() => setActiveTab('vitals')}
            />
          </div>
        )}

        {activeTab === 'journal-input' && (
          <div className="journal-input-tab fade-in">
            <HealthJournalForm
              onSuccess={handleRecordSuccess}
              onCancel={() => setActiveTab('journal')}
            />
          </div>
        )}
      </div>

      {/* 빠른 액션 버튼 */}
      <div className="quick-actions">
        <button
          className="quick-action-btn primary"
          onClick={() => setActiveTab(activeTab.includes('journal') ? 'journal-input' : 'vital-input')}
        >
          <span className="action-icon">➕</span>
          <span className="action-label">빠른 기록</span>
        </button>
      </div>
    </div>
  );
};

export default HealthPage;