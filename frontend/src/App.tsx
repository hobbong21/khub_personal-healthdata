import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HealthDataProvider } from './contexts/HealthDataContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

import './App.css';

// ============================================
// 지연 로딩 컴포넌트 (Lazy Loading Components)
// ============================================

// 인증 페이지 (Public Pages)
const AuthPage = lazy(() => import('./pages/AuthPage'));

// 공개 정보 페이지 (Public Info Pages)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ContactPageNew = lazy(() => import('./pages/Contact/ContactPage'));

// 메인 대시보드
const EnhancedDashboard = lazy(() => import('./pages/EnhancedDashboard'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));

// 404 페이지
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// 건강 데이터 관리
const VitalSignsPage = lazy(() => import('./pages/health/VitalSignsPage'));
const HealthJournalPage = lazy(() => import('./pages/health/HealthJournalPage'));
const HealthDataInputPage = lazy(() => import('./pages/HealthDataInputPage'));
const MedicalRecordsPage = lazy(() => import('./pages/MedicalRecordsPage'));
const MedicationSchedulePage = lazy(() => import('./pages/medication/MedicationSchedulePage'));
const MedicationTrackingPage = lazy(() => import('./pages/MedicationTrackingPage'));

// 예약 및 일정
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const AppointmentBookingPage = lazy(() => import('./pages/AppointmentBookingPage'));
const AppointmentsPageNew = lazy(() => import('./pages/Appointments/AppointmentsPage'));

// AI 및 분석
const AIInsightsPage = lazy(() => import('./pages/AIInsightsPage'));
const AIInsightsPageNew = lazy(() => import('./pages/AIInsights/AIInsightsPage'));
const GenomicsPage = lazy(() => import('./pages/GenomicsPage'));
const GenomicsPageNew = lazy(() => import('./pages/Genomics/GenomicsPage'));
const GenomicsResultsPage = lazy(() => import('./pages/GenomicsResultsPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const NLPPage = lazy(() => import('./pages/NLPPage'));

// 가족 및 유전
const FamilyHistoryPage = lazy(() => import('./pages/FamilyHistoryPage'));

// 기기 연동
const WearablePage = lazy(() => import('./pages/WearablePage'));
const RemoteMonitoringPage = lazy(() => import('./pages/RemoteMonitoringPage'));

// 사용자 설정
const EnhancedProfilePage = lazy(() => import('./pages/EnhancedProfilePage'));

// ============================================
// 메인 앱 컴포넌트 (Main App Component)
// ============================================

function App() {
  return (
    <AuthProvider>
      <HealthDataProvider>
        <Router>
          <div className="App">

            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* ==================== */}
                {/* 리다이렉트 (Redirects) */}
                {/* ==================== */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/auth" element={<Navigate to="/login" replace />} />
                
                {/* ==================== */}
                {/* 공개 페이지 (Public Pages) */}
                {/* ==================== */}
                
                {/* 인증 페이지 */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                
                {/* 정보 페이지 */}
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/contact" element={<ContactPageNew />} />
                

                {/* ==================== */}
                {/* 보호된 페이지 (Protected Pages) */}
                {/* ==================== */}
                
                {/* 메인 대시보드 */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/old" 
                  element={
                    <ProtectedRoute>
                      <EnhancedDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 건강 데이터 관리 */}
                <Route 
                  path="/health/vitals" 
                  element={
                    <ProtectedRoute>
                      <VitalSignsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/health/journal" 
                  element={
                    <ProtectedRoute>
                      <HealthJournalPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/health/input" 
                  element={
                    <ProtectedRoute>
                      <HealthDataInputPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/medical-records" 
                  element={
                    <ProtectedRoute>
                      <MedicalRecordsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/medications" 
                  element={
                    <ProtectedRoute>
                      <MedicationSchedulePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/medications/tracking" 
                  element={
                    <ProtectedRoute>
                      <MedicationTrackingPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 예약 및 일정 */}
                <Route 
                  path="/appointments" 
                  element={
                    <ProtectedRoute>
                      <AppointmentsPageNew />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/appointments/booking" 
                  element={
                    <ProtectedRoute>
                      <AppointmentBookingPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* AI 및 분석 */}
                <Route 
                  path="/ai-insights" 
                  element={
                    <ProtectedRoute>
                      <AIInsightsPageNew />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/genomics" 
                  element={
                    <ProtectedRoute>
                      <GenomicsPageNew />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/genomics/results/:analysisId" 
                  element={
                    <ProtectedRoute>
                      <GenomicsResultsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/recommendations" 
                  element={
                    <ProtectedRoute>
                      <RecommendationsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/nlp" 
                  element={
                    <ProtectedRoute>
                      <NLPPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 가족 및 유전 */}
                <Route 
                  path="/family-history" 
                  element={
                    <ProtectedRoute>
                      <FamilyHistoryPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 기기 연동 */}
                <Route 
                  path="/wearable" 
                  element={
                    <ProtectedRoute>
                      <WearablePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/remote-monitoring" 
                  element={
                    <ProtectedRoute>
                      <RemoteMonitoringPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 사용자 설정 */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <EnhancedProfilePage />
                    </ProtectedRoute>
                  } 
                />

                {/* ==================== */}
                {/* 404 Not Found */}
                {/* ==================== */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </HealthDataProvider>
    </AuthProvider>
  );
}

export default App;