import React from 'react';
import HealthInsightsDashboard from '../components/ai/HealthInsightsDashboard';
import './AIInsightsPage.css';

const AIInsightsPage: React.FC = () => {
  return (
    <div className="ai-insights-page">
      <HealthInsightsDashboard />
    </div>
  );
};

export default AIInsightsPage;