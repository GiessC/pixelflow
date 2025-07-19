import { z } from 'zod';
import { Image, imageSchema } from './image.type';

export function getImagePk(): string {
  return 'IMG';
}

export function getImageSk(
  creatorId: Image['createdBy'],
  status: Image['status'],
  fileName: Image['fileName'],
): string {
  return `USR#${creatorId}#${status}#FILE#${fileName}`;
}

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
      pk: getImagePk(),
      sk: getImageSk(image.createdBy, image.status, image.fileName),
    };
  });

export type ImageDynamoDBDto = z.infer<typeof imageDynamoDBDtoSchema>;
