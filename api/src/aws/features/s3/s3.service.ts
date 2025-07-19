import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { InternalServerError } from '../../../api/errors/http/internal-server-error';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Service {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client();
  }

  public async getUploadUrl({
    fileName,
    userId,
  }: {
    fileName: string;
    userId: string | undefined;
  }): Promise<string> {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new InternalServerError(
        'S3_BUCKET_NAME environment variable is not set.',
      );
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${userId}/${fileName}`,
    });
    const ONE_HOUR_SECONDS = 60 * 60;
    return await getSignedUrl(this.s3Client, command, {
      expiresIn: ONE_HOUR_SECONDS,
    });
  }
}
