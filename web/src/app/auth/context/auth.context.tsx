import { createContext, useContext } from 'react';
import type { AuthUser } from '../types/auth-user.type';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<AuthUser>;
}

export const AuthContext = createContext<AuthContextValue | undefined>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {
    throw new Error('login function not implemented');
  },
  logout: async () => {
    throw new Error('logout function not implemented');
  },
  register: async () => {
    throw new Error('register function not implemented');
  },
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
