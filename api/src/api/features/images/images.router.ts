import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { S3Service } from '../../../aws/features/s3/s3.service';
import { Image, imageSchema } from './types/image.type';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { getImagePk, imageDynamoDBDtoSchema } from './types/image.dynamodb.dto';
import { transaction } from '../../utils/transaction';
import { authentication } from '../../../middlewares';

const router = Router();

const uploadUrlSchema = z.object({
  fileName: z.string(),
  nsfw: z.boolean().default(false),
  tags: z
    .array(
      z
        .string()
        .min(3, { message: 'Sorry, a tag must be 3 characters or more.' }),
    )
    .optional()
    .default([]),
  userId: z.string().uuid().optional(), // TODO: replace with auth
});

router.post(
  '/',
  authentication,
  async (request: Request, response: Response) => {
    console.log('Received request to upload image:', request.body);
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
  },
);

const getImageRequestSchema = z.object({
  limit: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (value) {
          const num = parseInt(value);
          return !isNaN(num) && num > 0 && num <= 100;
        }
        return true;
      },
      {
        message: 'Limit must be a number between 1 and 100.',
      },
    )
    .transform((value) => {
      return value ? parseInt(value) : undefined;
    }),
  cursor: z.string().base64().optional(),
});

router.get('/', async (rawRequest: Request, response: Response) => {
  const request = getImageRequestSchema.parse({
    limit: rawRequest.query.limit,
    cursor: rawRequest.query.cursor,
  });
  const dynamoDB = new DynamoDB();
  try {
    const result = await dynamoDB.query({
      TableName: process.env.IMAGE_TABLE_NAME,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'pk',
      },
      ExpressionAttributeValues: {
        ':pk': { S: getImagePk() },
      },
      Limit: request.limit,
      ExclusiveStartKey: request.cursor
        ? JSON.parse(Buffer.from(request.cursor, 'base64').toString())
        : undefined,
    });
    const images = result.Items?.map((item) => unmarshall(item));
    response.status(200).json({
      images,
      prev: request.cursor,
      next: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
            'base64',
          )
        : undefined,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    response.status(500).json({ error: 'Failed to fetch images.' });
  }
});

export default router;
