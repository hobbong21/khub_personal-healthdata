import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/common/Header'
import Sidebar from './components/common/Sidebar'
import Dashboard from './pages/Dashboard'
import AuthPage from './pages/AuthPage'
import HealthPage from './pages/HealthPage'
import ProfilePage from './pages/ProfilePage'
import { MedicationPage } from './pages/MedicationPage'
import FamilyHistoryPage from './pages/FamilyHistoryPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import './App.css'
import './styles/auth.css'
import './styles/profile.css'
import './styles/health.css'
import './styles/dashboard.css'
import './styles/medication.css'
import './styles/familyHistory.css'
import './styles/appointment.css'

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
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
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
              path="/profile" 
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