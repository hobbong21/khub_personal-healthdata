import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

// 인증 모달 컴포넌트 (요구사항 1.1, 1.5)
export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  if (!isOpen) {
    return null;
  }

  const handleSuccess = () => {
    onClose();
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={handleSwitchMode}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={handleSwitchMode}
          />
        )}
      </div>
    </div>
  );
}

export default AuthModal;