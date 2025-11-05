import React, { useCallback, useMemo } from 'react';
import { Navigation } from '../../components/common/Navigation/Navigation';
import { Footer } from '../../components/common/Footer/Footer';
import { HealthScoreCard } from '../../components/dashboard/HealthScoreCard';
import { StatCard } from '../../components/dashboard/StatCard';
import { HealthTrendChart } from '../../components/dashboard/HealthTrendChart';
import { ActivityList } from '../../components/dashboard/ActivityList';
import { useHealthData } from '../../hooks/useHealthData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const { healthData, chartData, activities, loading, error, refetch } = useHealthData();

  // Memoize retry handler
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={handleRetry} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return null;
  }

  return (
    <>
      <Navigation />
      <main className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1><span aria-hidden="true">👋</span> 안녕하세요, {healthData.userName}님</h1>
          <p>오늘도 건강한 하루 되세요!</p>
        </header>

        {/* Health Score */}
        <section aria-label="전체 건강 점수">
          <HealthScoreCard score={healthData.healthScore} />
        </section>

        {/* Stats Grid */}
        <section className={styles.statsGrid} aria-label="주요 건강 지표">
          <StatCard
            icon="❤️"
            value={healthData.bloodPressure}
            label="혈압 (mmHg)"
            variant="blue"
            change={{ value: '정상 범위', positive: true }}
          />
          <StatCard
            icon="💓"
            value={healthData.heartRate}
            label="심박수 (bpm)"
            variant="green"
            change={{ value: '안정적', positive: true }}
          />
          <StatCard
            icon="⚖️"
            value={healthData.weight}
            label="체중 (kg)"
            variant="purple"
            change={{ value: '-0.5kg', positive: false }}
          />
          <StatCard
            icon="🩸"
            value={healthData.bloodSugar}
            label="혈당 (mg/dL)"
            variant="red"
            change={{ value: '정상', positive: true }}
          />
        </section>

        {/* Quick Actions */}
        <nav className={styles.quickActions} aria-label="빠른 작업">
          <button className={styles.actionButton} aria-label="건강 일지 작성">
            <div className={styles.actionIcon} aria-hidden="true">📝</div>
            <div className={styles.actionText}>건강 일지 작성</div>
          </button>
          <button className={styles.actionButton} aria-label="복약 기록">
            <div className={styles.actionIcon} aria-hidden="true">💊</div>
            <div className={styles.actionText}>복약 기록</div>
          </button>
          <button className={styles.actionButton} aria-label="병원 예약">
            <div className={styles.actionIcon} aria-hidden="true">🏥</div>
            <div className={styles.actionText}>병원 예약</div>
          </button>
          <button className={styles.actionButton} aria-label="검사 결과 보기">
            <div className={styles.actionIcon} aria-hidden="true">📊</div>
            <div className={styles.actionText}>검사 결과 보기</div>
          </button>
        </nav>

        {/* Main Content Grid */}
        <section className={styles.contentGrid} aria-label="건강 트렌드 및 활동">
          <HealthTrendChart data={chartData} />
          <ActivityList activities={activities} />
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
