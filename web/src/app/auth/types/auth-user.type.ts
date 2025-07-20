import dayjs from 'dayjs';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authUserSchema = z.object({
  id: z.string().min(1, { message: 'ID is required.' }).uuid(),
  email: z.string().min(1, { message: 'Email is required.' }).email(),
  username: z.string().min(1, { message: 'Username is required.' }),
  createdAt: z.string().default(() => dayjs().toISOString()),
});

export type AuthUser = z.infer<typeof authUserSchema>;
