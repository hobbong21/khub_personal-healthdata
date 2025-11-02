import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HealthDataProvider } from './contexts/HealthDataContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

// 지연 로딩을 위한 컴포넌트들
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const HealthDataPage = lazy(() => import('./pages/HealthDataPage'));
const MedicalRecordsPage = lazy(() => import('./pages/MedicalRecordsPage'));
const MedicationPage = lazy(() => import('./pages/MedicationPage'));
const GenomicsPage = lazy(() => import('./pages/GenomicsPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function App() {
  return (
    <AuthProvider>
      <HealthDataProvider>
        <Router>
          <div className="App">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/health" element={
                  <ProtectedRoute>
                    <HealthDataPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/medical-records" element={
                  <ProtectedRoute>
                    <MedicalRecordsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/medications" element={
                  <ProtectedRoute>
                    <MedicationPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/genomics" element={
                  <ProtectedRoute>
                    <GenomicsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/recommendations" element={
                  <ProtectedRoute>
                    <RecommendationsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </HealthDataProvider>
    </AuthProvider>
  );
}

export default App;