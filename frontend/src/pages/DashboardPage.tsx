import React from 'react';
import WelcomeHeader from '../components/dashboard/WelcomeHeader/WelcomeHeader';
import HealthScoreCard from '../components/dashboard/HealthScoreCard/HealthScoreCard';
import StatCardGrid from '../components/dashboard/StatCardGrid/StatCardGrid';

const DashboardPage: React.FC = () => {
  return (
    <div>
      <WelcomeHeader />
      <HealthScoreCard />
      <StatCardGrid />
    </div>
  );
};

export default DashboardPage;
