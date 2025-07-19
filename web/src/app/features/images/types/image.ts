import dayjs from 'dayjs';
import z from 'zod';

export const imageSchema = z.object({
  fileName: z
    .string()
    .min(1, { message: 'File name is required.' })
    .regex(/^[A-Za-z0-9\-.]*$/, { message: 'Invalid file name.' }),
  status: z
    .enum(['waiting', 'processing', 'success', 'fail'])
    .default('waiting'),
  url: z.string().optional(),
  nsfw: z.boolean().optional(),
  tags: z
    .array(
      z.string().min(3, { message: 'Tags must be at least 3 characters long.' })
    )
    .optional()
    .transform((tags) => {
      if (!tags?.length) {
        return undefined;
      }
      return tags;
    }),
  createdBy: z.string().uuid().optional(),
  createdAt: z.string().default(dayjs().toISOString()),
  updatedAt: z.string().default(dayjs().toISOString()),
});

export type Image = z.infer<typeof imageSchema>;
