import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../services/authApi';
import { CreateUserRequest, LoginRequest, User } from '../types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: CreateUserRequest) => Promise<void>;
  logout: () => void;
  socialLogin: (provider: string, accessToken: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuthSuccess = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }, []);

  const validateAndSetUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const response = await authApi.validateToken();
        // Upon validation, API should return user data. Use it.
        if (response.data && response.data.user) {
            const validatedUser = response.data.user;
            setUser(validatedUser);
            localStorage.setItem('user_data', JSON.stringify(validatedUser));
        } else {
            // If validation fails or response is malformed, log out.
            logout();
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        logout();
      }
    }
    setLoading(false);
  }, [logout]);

  useEffect(() => {
    validateAndSetUser();
  }, [validateAndSetUser]);

  const login = async (credentials: LoginRequest) => {
    const response = await authApi.loginUser(credentials);
    // Safely destructure with checks
    if (response.data && response.data.data) {
        const { user, token } = response.data.data;
        if(user && token) {
            handleAuthSuccess(user, token);
        } else {
            throw new Error('Login failed: Invalid user or token received.');
        }
    } else {
      throw new Error(response.data.message || 'Login failed: Invalid response from server.');
    }
  };

  const register = async (userData: CreateUserRequest) => {
    await authApi.registerUser(userData);
  };

  const socialLogin = async (provider: string, accessToken: string) => {
    const response = await authApi.socialLogin(provider, accessToken);
    // Safely destructure with checks
    if (response.data && response.data.data) {
        const { user, token } = response.data.data;
        if(user && token) {
            handleAuthSuccess(user, token);
        } else {
            throw new Error('Social login failed: Invalid user or token received.');
        }
    } else {
        throw new Error(response.data.message || 'Social login failed: Invalid response from server.');
    }
  };

  const requestPasswordReset = async (email: string) => {
    await authApi.requestPasswordReset(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await authApi.resetPassword(token, newPassword);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    socialLogin,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};