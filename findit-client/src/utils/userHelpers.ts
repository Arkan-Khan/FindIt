import { User, UserState } from '../types/user';

export const getUserData = (user: UserState): User => {
  if (!user) return {} as User;
  
  // Check if user.user is the actual User object or if it has a nested user property
  return 'message' in user.user ? (user.user as any).user : user.user;
};