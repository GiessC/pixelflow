import { Form } from '@/app/components/form';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';

const registerSchema = z
  .object({
    username: z.string().min(1, 'Username is required.'),
    email: z
      .string({ required_error: 'Email is required.' })
      .min(1, 'Email is required.')
      .email('Invalid email address.'),
    password: z
      .string({ required_error: 'Password is required.' })
      .min(1, 'Password is required.')
      .min(8, 'Password must be at least 8 characters long.'),
    confirmPassword: z
      .string({ required_error: 'Please confirm your password.' })
      .min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match.',
    path: ['confirmPassword'],
  });

export function RegisterForm() {
  function registerUser(data: z.output<typeof registerSchema>) {
    console.log('Registering user:', data);
  }

  return (
    <Form
      schema={registerSchema}
      onSubmit={registerUser}
      defaultValues={{
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
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
            name='email'
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete='email'
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
                    placeholder='Must be at least 8 characters'
                    autoComplete='new-password'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name='confirmPassword'
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type='password'
                    autoComplete='new-password'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            className='w-full'
            disabled={!isDirty || isSubmitting}
          >
            Register
          </Button>
        </div>
      )}
    </Form>
  );
}
