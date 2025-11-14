import { UserProfile } from './user';

declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}