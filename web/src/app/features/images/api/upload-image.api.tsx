import { useApi } from '@/lib/api';
import { useHttp } from '@/lib/http';
import { useMutation } from '@tanstack/react-query';
import z from 'zod';
import { type Image } from '../types/image';

export const requestUploadUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required.'),
  nsfw: z.boolean(),
  tags: z.array(z.string()),
});

type UploadUrlRequest = z.output<typeof requestUploadUrlSchema>;

export function useImageUploadUrl() {
  const { post } = useApi();

  return useMutation({
    mutationFn: async (request: UploadUrlRequest) => {
      return await post<{ uploadUrl: string; image: Image }, UploadUrlRequest>(
        '/v1/images/',
        request
      );
    },
  });
}

export function useImageUpload() {
  const { put } = useHttp();

  return useMutation({
    mutationFn: async ({
      uploadUrl,
      file,
    }: {
      uploadUrl: string;
      file: File;
    }) => {
      return await put<void, File>(uploadUrl, file, {
        'Content-Type': file.type,
      });
    },
  });
}
