import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService';

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ success: false, error: { code: 'NO_TOKEN', message: 'No token provided' } });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
        const userProfile = await UserService.getUserProfile(decoded.userId);

        if (!userProfile) {
            res.status(401).json({ success: false, error: { code: 'INVALID_USER', message: 'User not found' } });
            return;
        }

        req.user = userProfile;
        next();
    } catch (error) {
        res.status(403).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' } });
    }
};

export const authorizeRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || user.role !== requiredRole) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'You do not have permission to perform this action',
        },
      });
      return;
    }
    next();
  };
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            const userProfile = await UserService.getUserProfile(decoded.userId);
            if (userProfile) {
                req.user = userProfile;
            }
        } catch (error) {
            // The token is optional, so we can ignore errors and proceed without a user.
        }
    }
    next();
};
