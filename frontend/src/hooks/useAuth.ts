import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { apiService } from '../services/api';
import { UserProfile, LoginRequest, RegisterRequest } from '../types/user';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UseAuthReturn extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

/**
 * 인증 상태 관리를 위한 커스텀 훅
 * Requirements: 4.1, 4.2
 */
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // 토큰 검증 및 프로필 로드 (Requirement 4.2)
  const verifyToken = useCallback(async () => {
    const token = apiService.getToken();
    
    if (!token) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      const profile = await apiService.getProfile();
      setState({
        user: profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // 토큰이 유효하지 않은 경우
      apiService.clearToken();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : '인증 확인에 실패했습니다',
      });
    }
  }, []);

  // 컴포넌트 마운트 시 토큰 검증
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // 로그인 함수 (Requirement 4.1)
  const login = useCallback(async (credentials: LoginRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const authResponse = await apiService.login(credentials);
      
      setState({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : '로그인에 실패했습니다',
      });
      throw error;
    }
  }, []);

  // 회원가입 함수 (Requirement 4.1)
  const register = useCallback(async (userData: RegisterRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const authResponse = await apiService.register(userData);
      
      setState({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : '회원가입에 실패했습니다',
      });
      throw error;
    }
  }, []);

  // 로그아웃 함수 (Requirement 4.1)
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await apiService.logout();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // 로그아웃은 실패해도 로컬 상태는 초기화
      apiService.clearToken();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : '로그아웃에 실패했습니다',
      });
    }
  }, []);

  // 프로필 새로고침
  const refreshProfile = useCallback(async () => {
    if (!state.isAuthenticated) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const profile = await apiService.getProfile();
      setState((prev) => ({
        ...prev,
        user: profile,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '프로필 새로고침에 실패했습니다',
      }));
    }
  }, [state.isAuthenticated]);

  // 에러 초기화
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    refreshProfile,
    clearError,
  };
};

// Context API를 사용한 전역 인증 상태 관리 (선택적)
export interface AuthContextValue extends UseAuthReturn {}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
