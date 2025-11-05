import React, { ReactNode } from 'react';
import { AuthContext, useAuth } from '../hooks/useAuth';

export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 전역 인증 상태를 제공하는 Provider 컴포넌트
 * Requirements: 4.1, 4.2
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
