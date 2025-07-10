import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { S3Service } from '../../../aws/features/s3/s3.service';

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
  const s3Service = new S3Service();
  const uploadUrl = await s3Service.getUploadUrl({ fileName });
  return response.json({ uploadUrl });
});

export default router;
