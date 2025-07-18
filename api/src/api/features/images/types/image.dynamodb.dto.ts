import { z } from 'zod';
import { imageSchema } from './image.type';

export const imageDynamoDBDtoSchema = imageSchema
  .extend({
    pk: z.string().optional(),
    sk: z.string().optional(),
    gsi1pk: z.string().optional(),
    gsi1sk: z.string().optional(),
  })
  .transform((image) => {
    return {
      ...image,
      pk: 'IMG',
      sk: `USR#${image.createdBy}#${image.status}#FILE#${image.fileName}`,
    };
  });

export type ImageDynamoDBDto = z.infer<typeof imageDynamoDBDtoSchema>;
