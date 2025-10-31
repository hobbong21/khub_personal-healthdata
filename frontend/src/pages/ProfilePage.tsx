// ProfilePage component
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileManager from '../components/profile/ProfileManager';

// 프로필 페이지 컴포넌트 (요구사항 1.2, 1.3, 1.4, 1.5)
export function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">로딩 중...</div>
      </div>
    );
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>프로필 관리</h1>
        <p>개인 정보와 건강 데이터를 관리하세요</p>
      </div>

      <div className="page-content">
        <ProfileManager />
      </div>
    </div>
  );
}

export default ProfilePage;