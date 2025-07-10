import { z } from 'zod';
import { PublicUser, publicUserSchema } from '../../../types/user/user';

export const imageSchema = z.object({
  imageId: z.string(),
  filePath: z.string(),
  creator: publicUserSchema,
});

export class Image {
  private readonly _imageId: string;
  private readonly _filePath: string;
  private readonly _creator: PublicUser;

  constructor(image: z.infer<typeof imageSchema>) {
    this._imageId = image.imageId;
    this._filePath = image.filePath;
    this._creator = new PublicUser(image.creator);
  }
}
