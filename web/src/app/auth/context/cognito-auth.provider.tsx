import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AuthContext, type AuthContextValue } from './auth.context';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, signIn, signUp, type JWT } from 'aws-amplify/auth';
import type { AuthUser } from '../types/auth-user.type';
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

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens?.idToken?.payload.sub) {
          const user = extractUserFromIdToken(session.tokens?.idToken);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<AuthUser> => {
      const response = await signIn({
        username,
        password,
      });
      if (
        !response.isSignedIn &&
        response.nextStep.signInStep === 'CONFIRM_SIGN_UP'
      ) {
        toast.error(
          'Please confirm your account before logging in. Check your email for the confirmation code.'
        );
        throw new Error('User has not confirmed their email.');
      }
      if (!response.isSignedIn) {
        throw new Error('Login failed. Please check your credentials.');
      }
      const { tokens } = await fetchAuthSession();
      const user = extractUserFromIdToken(tokens?.idToken);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return user;
    },
    []
  );

  function extractUserFromIdToken(idToken: JWT | undefined): AuthUser {
    const idTokenPayload = idToken?.payload as IdTokenPayload;
    return {
      id: idTokenPayload.sub,
      email: idTokenPayload.email,
      username: idTokenPayload['cognito:username'],
      token: idToken?.toString(),
    };
  }

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

  const contextValue = useMemo(
    (): AuthContextValue => ({
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      login,
      logout: async () => {
        throw new Error('Logout not implemented');
      },
      register,
    }),
    [authState, login]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type IdTokenPayload = {
  aud: string;
  auth_time: number;
  'cognito:username': string;
  email: string;
  email_verified: boolean;
  event_id: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  origin_jti: string;
  sub: string;
  token_use: 'id';
};
