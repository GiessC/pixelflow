import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Request, Response, Router } from 'express';
import { z } from 'zod';

const router = Router();

const uploadUrlSchema = z.object({
  fileName: z.string(),
});

router.post('/', async (request: Request, response: Response) => {
  const { data, success, error } = uploadUrlSchema.safeParse(request.body);
  if (!success) {
    return response
      .status(400)
      .json({ error: 'Invalid request body.', issues: error?.issues });
  }
  const { fileName } = data;
  const client = new S3Client();
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
  });
  const ONE_HOUR_SECONDS = 60 * 60;
  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: ONE_HOUR_SECONDS,
  });
  return response.json({ uploadUrl });
});

export default router;
