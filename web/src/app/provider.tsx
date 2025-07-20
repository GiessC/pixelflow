import { queryClient } from '@/lib/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { CognitoAuthProvider } from './auth/context/cognito-auth.provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CognitoAuthProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        {children}
      </QueryClientProvider>
    </CognitoAuthProvider>
  );
}
