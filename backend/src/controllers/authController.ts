import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { generateToken, refreshToken as refreshJwtToken } from '../utils/jwt';
import { CreateUserRequest, LoginRequest, AuthResponse, UserProfile } from '../types/user';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const userData: CreateUserRequest = req.body;
    const user = await UserService.registerUser(userData);
    res.status(201).json({ success: true, message: 'User registered successfully', data: user });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ success: false, error: { code: 'REGISTRATION_FAILED', message: errorMessage } });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as LoginRequest;
    const user = await UserService.authenticateUser(email, password);

    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'LOGIN_FAILED', message: 'Invalid credentials' },
      });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });
    const response: AuthResponse = { user, token };

    res.json({ success: true, message: 'Login successful', data: response });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, error: { code: 'LOGIN_ERROR', message: errorMessage } });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  // In a real-world scenario, you might want to invalidate the token on the server-side.
  res.json({ success: true, message: 'Logout successful' });
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }
    const userProfile = await UserService.getUserProfile(req.user.id);
    res.json({ success: true, data: userProfile });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, error: { code: 'PROFILE_FETCH_ERROR', message: errorMessage } });
  }
}

export async function refreshAuthToken(req: Request, res: Response): Promise<void> {
    const { token } = req.body;
    if (!token) {
        res.status(400).json({ success: false, error: { code: 'TOKEN_MISSING', message: 'Refresh token is required' } });
        return;
    }
    try {
        const newToken = refreshJwtToken(token);
        res.json({ success: true, data: { token: newToken } });
    } catch (error) {
        res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' } });
    }
}

export async function validateToken(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }
  res.json({ success: true, message: 'Token is valid', data: { user: req.user } });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body;
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    try {
        await UserService.changePassword(req.user.id, currentPassword, newPassword);
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ success: false, error: { code: 'PASSWORD_CHANGE_FAILED', message: errorMessage } });
    }
}
