import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { RegisterForm } from './register.form';

export function RegisterCard() {
  return (
    <Card>
      <CardTitle>Register</CardTitle>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
