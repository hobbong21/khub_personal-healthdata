import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HealthDataProvider } from './contexts/HealthDataContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

import './App.css';

// ... (기존 지연 로딩 컴포넌트)

const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

function App() {
  return (
    <AuthProvider>
      <HealthDataProvider>
        <Router>
          <div className="App">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* ... (기존 라우트) */}
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                {/* ... (기존 라우트) */}
              </Routes>
            </Suspense>
          </div>
        </Router>
      </HealthDataProvider>
    </AuthProvider>
  );
}

export default App;