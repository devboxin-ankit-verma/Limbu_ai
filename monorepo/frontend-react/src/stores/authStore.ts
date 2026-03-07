import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  setAuth: (token: string, user: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('authToken', token);
        }
        set({ token, user });
      },
      logout: () => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('authToken');
        }
        set({ token: null, user: null });
      },
    }),
    { name: 'share-market-auth' }
  )
);
