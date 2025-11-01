import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/common/Header'
import Sidebar from './components/common/Sidebar'
import Dashboard from './pages/Dashboard'
import EnhancedDashboard from './pages/EnhancedDashboard'
import SimpleLandingPage from './pages/SimpleLandingPage'
import AuthPage from './pages/AuthPage'
import HealthPage from './pages/HealthPage'
import VitalSignsPage from './pages/health/VitalSignsPage'
import HealthJournalPage from './pages/health/HealthJournalPage'
import ProfilePage from './pages/ProfilePage'
import EnhancedProfilePage from './pages/EnhancedProfilePage'
import { MedicationPage } from './pages/MedicationPage'
import MedicationSchedulePage from './pages/medication/MedicationSchedulePage'
import FamilyHistoryPage from './pages/FamilyHistoryPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import GenomicsPage from './pages/GenomicsPage'
import AIInsightsPage from './pages/AIInsightsPage'
import NLPPage from './pages/NLPPage'
import WearablePage from './pages/WearablePage'
import MedicalRecordsPage from './pages/MedicalRecordsPage'
import RecommendationsPage from './pages/RecommendationsPage'
import RemoteMonitoringPage from './pages/RemoteMonitoringPage'
import { GoogleFitCallback } from './pages/GoogleFitCallback'
import './App.css'
import './styles/auth.css'
import './styles/profile.css'
import './styles/health.css'
import './styles/dashboard.css'
import './styles/medication.css'
import './styles/familyHistory.css'
import './styles/appointment.css'
import './pages/MedicalRecordsPage.css'
import './pages/RecommendationsPage.css'

const queryClient = new QueryClient()

// 보호된 라우트 컴포넌트
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// 메인 앱 레이아웃
function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<SimpleLandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <EnhancedDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/original" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/health" 
              element={
                <ProtectedRoute>
                  <HealthPage />
                </ProtectedRoute>
              } 
            />
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
              path="/profile" 
              element={
                <ProtectedRoute>
                  <EnhancedProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/original" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/medication" 
              element={
                <ProtectedRoute>
                  <MedicationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/medication/schedule" 
              element={
                <ProtectedRoute>
                  <MedicationSchedulePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/family-history" 
              element={
                <ProtectedRoute>
                  <FamilyHistoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/appointments" 
              element={
                <ProtectedRoute>
                  <AppointmentsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/genomics" 
              element={
                <ProtectedRoute>
                  <GenomicsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-insights" 
              element={
                <ProtectedRoute>
                  <AIInsightsPage />
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
            <Route 
              path="/wearable" 
              element={
                <ProtectedRoute>
                  <WearablePage />
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
              path="/recommendations" 
              element={
                <ProtectedRoute>
                  <RecommendationsPage />
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
            <Route 
              path="/google-fit/callback" 
              element={
                <ProtectedRoute>
                  <GoogleFitCallback />
                </ProtectedRoute>
              } 
            />
            <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App