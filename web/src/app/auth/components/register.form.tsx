import { Form } from '@/app/components/form';
import { z } from 'zod';

const registerSchema = z
  .object({
    username: z.string().min(1, 'Username is required.'),
    email: z.string().email('Invalid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
    confirmPassword: z
      .string()
      .min(8, 'Confirm Password must be at least 8 characters long.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match.',
    path: ['confirmPassword'],
  });

export function RegisterForm() {
  function registerUser() {}

  return (
    <Form
      schema={registerSchema}
      onSubmit={registerUser}
    >
      {(form) => <>Test</>}
    </Form>
  );
}
