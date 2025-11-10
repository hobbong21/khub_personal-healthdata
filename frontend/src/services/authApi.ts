import { api } from './api';
import { CreateUserRequest, LoginRequest } from '../types/user';

export const registerUser = (userData: CreateUserRequest) => {
  return api.post('/auth/register', userData);
};

export const loginUser = (credentials: LoginRequest) => {
  return api.post('/auth/login', credentials);
};

export const socialLogin = (provider: string, accessToken: string) => {
  return api.post('/auth/social-login', { provider, accessToken });
};

export const requestPasswordReset = (email: string) => {
  return api.post('/auth/request-password-reset', { email });
};

export const resetPassword = (token: string, newPassword: string) => {
  return api.post('/auth/reset-password', { token, newPassword });
};

export const validateToken = () => {
  return api.post('/auth/validate');
};
