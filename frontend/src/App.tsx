import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HealthDataProvider } from './contexts/HealthDataContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

import './App.css';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const HealthDataInputPage = lazy(() => import('./pages/HealthDataInputPage'));
const AiInsightsPage = lazy(() => import('./pages/AIInsightsPage'));
const GenomicsPage = lazy(() => import('./pages/GenomicsPage'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// A component to handle root path redirection
const RootRedirect = () => {
  // Correctly destructure 'user' and 'loading' from useAuth
  const { user, loading } = useAuth();

  // While checking auth status, show a loading spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect based on the presence of the 'user' object
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/home" replace />;
};

function App() {
  return (
    <AuthProvider>
      <HealthDataProvider>
        <Router>
          <div className="App">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<RootRedirect />} />

                {/* Public Routes */}
                <Route path="/home" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/health-data-input" element={<ProtectedRoute><HealthDataInputPage /></ProtectedRoute>} />
                <Route path="/ai-insights" element={<ProtectedRoute><AiInsightsPage /></ProtectedRoute>} />
                <Route path="/genomics" element={<ProtectedRoute><GenomicsPage /></ProtectedRoute>} />
                <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />

                {/* Fallback redirect */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </HealthDataProvider>
    </AuthProvider>
  );
}

export default App;
