import { User, UserState } from '../types/user';

export const getUserData = (user: UserState): User => {
  if (!user) return {} as User;
  
  return 'message' in user.user ? (user.user as any).user : user.user;
};