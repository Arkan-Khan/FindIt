// src/recoil/userAtom.ts
import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
};

export type UserState = {
  token: string;
  user: User;
} | null;

export const userAtom = atom<UserState>({
  key: 'userAtom',
  default: null,
  effects_UNSTABLE: [persistAtom],
});
