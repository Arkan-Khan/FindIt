import { deleteFcmToken } from '../firebase/firebase';

export const logout = () => {
  deleteFcmToken();
  localStorage.removeItem('user');
  return true;
};