import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { UserProfile, AuthResponse } from '../types/user';
import apiService from '../services/api';

// 인증 상태 인터페이스 (요구사항 1.1, 1.5)
interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 인증 액션 타입
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: UserProfile }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }
  | { type: 'CLEAR_ERROR' };

// 초기 상태
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// 리듀서 함수
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// 컨텍스트 인터페이스
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updateData: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 프로바이더 컴포넌트 (요구사항 1.1, 1.2, 1.3, 1.4, 1.5)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 컴포넌트 마운트 시 토큰 확인 및 프로필 로드
  useEffect(() => {
    const initializeAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          dispatch({ type: 'AUTH_START' });
          const user = await apiService.getProfile();
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } catch (error) {
          console.error('프로필 로드 실패:', error);
          apiService.clearToken();
          dispatch({ type: 'AUTH_FAILURE', payload: '인증이 만료되었습니다' });
        }
      }
    };

    initializeAuth();
  }, []);

  // 로그인 함수 (요구사항 1.1, 1.5)
  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const authResponse: AuthResponse = await apiService.login({ email, password });
      dispatch({ type: 'AUTH_SUCCESS', payload: authResponse.user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // 회원가입 함수 (요구사항 1.1, 1.2, 1.3, 1.5)
  const register = async (userData: any): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const authResponse: AuthResponse = await apiService.register(userData);
      dispatch({ type: 'AUTH_SUCCESS', payload: authResponse.user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // 로그아웃 함수 (요구사항 1.1, 1.5)
  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // 프로필 업데이트 함수 (요구사항 1.2, 1.3, 1.4)
  const updateProfile = async (updateData: any): Promise<void> => {
    try {
      const updatedUser = await apiService.updateProfile(updateData);
      dispatch({ type: 'UPDATE_PROFILE', payload: updatedUser });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // 프로필 새로고침 함수
  const refreshProfile = async (): Promise<void> => {
    try {
      const user = await apiService.getProfile();
      dispatch({ type: 'UPDATE_PROFILE', payload: user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '프로필 새로고침에 실패했습니다';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // 에러 클리어 함수
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 커스텀 훅 (요구사항 1.1, 1.5)
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;