import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { DefaultProps } from '@/types/default-props';
import { cn } from '@/lib/utils';
import { LoginForm } from './login.form';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

export function LoginCard({ className }: DefaultProps) {
  const navigate = useNavigate();

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to log in.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className='mt-4'>
          <p className='text-muted-foreground text-sm'>
            Don't have an account?
          </p>{' '}
          <Button
            size='sm'
            onClick={() => navigate('/auth/register')}
          >
            Register
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
