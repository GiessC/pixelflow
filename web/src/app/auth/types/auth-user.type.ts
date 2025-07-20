import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authUserSchema = z.object({
  id: z.string().min(1, { message: 'ID is required.' }).uuid(),
  email: z.string().min(1, { message: 'Email is required.' }).email(),
  username: z.string().min(1, { message: 'Username is required.' }),
  token: z.string().optional(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
