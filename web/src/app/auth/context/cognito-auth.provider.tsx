import type { PropsWithChildren } from 'react';
import { AuthContext } from './auth.context';
import { Amplify } from 'aws-amplify';
import { signUp } from 'aws-amplify/auth';
import type { AuthUser } from '../types/auth-user.type';
import dayjs from 'dayjs';
import { toast } from 'sonner';

export function CognitoAuthProvider({ children }: PropsWithChildren) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID!,
        userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID!,
        loginWith: {
          username: true,
        },
      },
    },
  });

  async function register(
    username: string,
    email: string,
    password: string
  ): Promise<AuthUser> {
    try {
      const response = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      toast.success(
        'Registration successful! Please check your email to confirm your account.'
      );
      return {
        id: response.userId!,
        email,
        username,
        createdAt: dayjs().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'UsernameExistsException') {
        toast.error('Username already exists. Please choose a different one.');
        throw new Error('Username already exists.');
      }
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: async () => {
          throw new Error('Login not implemented');
        },
        logout: async () => {
          throw new Error('Logout not implemented');
        },
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
