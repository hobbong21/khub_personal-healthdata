import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { apiService } from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  apiService: {
    getToken: vi.fn(),
    clearToken: vi.fn(),
    getProfile: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('useAuth', () => {
  const mockUser = {
    id: '1',
    name: '홍길동',
    email: 'hong@example.com',
    createdAt: new Date().toISOString(),
  };

  const mockLoginCredentials = {
    email: 'hong@example.com',
    password: 'password123',
  };

  const mockRegisterData = {
    name: '홍길동',
    email: 'hong@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with unauthenticated state when no token exists', async () => {
    vi.mocked(apiService.getToken).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('verifies token and loads user profile on mount', async () => {
    vi.mocked(apiService.getToken).mockReturnValue('valid-token');
    vi.mocked(apiService.getProfile).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('clears token when verification fails', async () => {
    vi.mocked(apiService.getToken).mockReturnValue('invalid-token');
    vi.mocked(apiService.getProfile).mockRejectedValue(new Error('Invalid token'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiService.clearToken).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('logs in user successfully', async () => {
    vi.mocked(apiService.getToken).mockReturnValue(null);
    vi.mocked(apiService.login).mockResolvedValue({
      token: 'new-token',
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login(mockLoginCredentials);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('handles login failure', async () => {
    vi.mocked(apiService.getToken).mockReturnValue(null);
    vi.mocked(apiService.login).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.login(mockLoginCredentials);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('registers user successfully', async () => {
    vi.mocked(apiService.getToken).mockReturnValue(null);
    vi.mocked(apiService.register).mockResolvedValue({
      token: 'new-token',
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register(mockRegisterData);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('handles registration failure', async () => {
    vi.mocked(apiService.getToken).mockReturnValue(null);
    vi.mocked(apiService.register).mockRejectedValue(new Error('Email already exists'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.register(mockRegisterData);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Email already exists');
  });

  it('logs out user successfully', async () => {
    vi.mocked(apiService.getToken).mockReturnValue('valid-token');
    vi.mocked(apiService.getProfile).mockResolvedValue(mockUser);
    vi.mocked(apiService.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('clears local state even when logout API fails', async () => {
    vi.mocked(apiService.getToken).mockReturnValue('valid-token');
    vi.mocked(apiService.getProfile).mockResolvedValue(mockUser);
    vi.mocked(apiService.logout).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(apiService.clearToken).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('refreshes user profile', async () => {
    vi.mocked(apiService.getToken).mockReturnValue('valid-token');
    vi.mocked(apiService.getProfile).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    const updatedUser = { ...mockUser, name: '김철수' };
    vi.mocked(apiService.getProfile).mockResolvedValue(updatedUser);

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(result.current.user).toEqual(updatedUser);
  });

  it('clears error state', async () => {
    vi.mocked(apiService.getToken).mockReturnValue(null);
    vi.mocked(apiService.login).mockRejectedValue(new Error('Login failed'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.login(mockLoginCredentials);
      } catch (error) {
        // Expected
      }
    });

    expect(result.current.error).toBe('Login failed');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
