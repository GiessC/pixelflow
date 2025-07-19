import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { S3Service } from '../../../aws/features/s3/s3.service';
import { Image, imageSchema } from './types/image.type';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { imageDynamoDBDtoSchema } from './types/image.dynamodb.dto';
import { transaction } from '../../utils/transaction';

const router = Router();

const uploadUrlSchema = z.object({
  fileName: z.string(),
  nsfw: z.boolean(),
  tags: z.array(
    z
      .string()
      .min(3, { message: 'Sorry, a tag must be 3 characters or more.' }),
  ),
  userId: z.string().uuid().optional(), // TODO: replace with auth
});

router.post('/', async (request: Request, response: Response) => {
  const {
    data: uploadRequest,
    success,
    error,
  } = uploadUrlSchema.safeParse(request.body);
  if (!success) {
    return response
      .status(400)
      .json({ error: 'Invalid request body.', issues: error?.issues });
  }
  const { fileName, userId } = uploadRequest;
  await transaction({
    actions: [
      async function uploadFileToS3(): Promise<string> {
        const s3Service = new S3Service();
        return await s3Service.getUploadUrl({ fileName, userId });
      },
      async function writeImageToDynamoDB(): Promise<Image> {
        const image = imageSchema.parse({
          fileName: `${userId}/${uploadRequest.fileName}`,
          nsfw: uploadRequest.nsfw,
          tags: uploadRequest.tags,
        });
        const dynamoDB = new DynamoDB();
        await dynamoDB.putItem({
          Item: marshall(imageDynamoDBDtoSchema.parse(image), {
            removeUndefinedValues: true,
          }),
          TableName: process.env.IMAGE_TABLE_NAME,
        });
        return image;
      },
    ],
    onFailure: (
      failedStep: number,
      transactionError: unknown,
    ): void | Promise<void> => {
      console.error(
        `Transaction failed at step ${failedStep}.`,
        transactionError,
      );
      response.status(500).json({
        error: `Transaction failed at step ${failedStep}.`,
        message: 'An error occurred while processing your request.',
      });
    },
    onSuccess: ({ step1: uploadUrl, step2: image }): void | Promise<void> => {
      response.status(201).json({
        message: 'Image upload URL generated successfully.',
        uploadUrl,
        image,
      });
    },
  });
});

export default router;
