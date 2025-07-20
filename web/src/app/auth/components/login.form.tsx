import { Form } from '@/app/components/form';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useAuth } from '../context/auth.context';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

export function LoginForm() {
  const { login } = useAuth();

  async function loginUser(data: z.output<typeof loginSchema>) {
    try {
      await login(data.username, data.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  return (
    <Form
      schema={loginSchema}
      onSubmit={loginUser}
      defaultValues={{
        username: '',
        password: '',
      }}
    >
      {({ control, formState: { isDirty, isSubmitting } }) => (
        <div className='flex flex-col gap-4'>
          <FormField
            name='username'
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete='username'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name='password'
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type='password'
                    autoComplete='new-password'
                  />
                </FormControl>
                <FormDescription>
                  Password must be at least 8 characters long, contain uppercase
                  and lowercase letters, a number, and a special character.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            className='w-full'
            disabled={!isDirty || isSubmitting}
          >
            login
          </Button>
        </div>
      )}
    </Form>
  );
}
