import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RegisterForm } from './register.form';
import type { DefaultProps } from '@/types/default-props';
import { cn } from '@/lib/utils';

export function RegisterCard({ className }: DefaultProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Enter your details to create a new account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
