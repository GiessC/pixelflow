import { z } from 'zod';

export const userSchema = z.object({
  userId: z.string(),
  username: z.string(),
  email: z.string().email(),
});

export type BaseUser = z.infer<typeof userSchema>;

export class User {
  private readonly _userId: string;
  private readonly _username: string;
  private readonly _email: string;

  constructor(user: BaseUser) {
    this._userId = user.userId;
    this._username = user.username;
    this._email = user.email;
  }
}

export const publicUserSchema = userSchema.pick({
  userId: true,
  username: true,
});

export type BasePublicUser = z.infer<typeof publicUserSchema>;

export class PublicUser {
  private readonly _userId: string;
  private readonly _username: string;

  constructor(user: BasePublicUser) {
    this._userId = user.userId;
    this._username = user.username;
  }
}
