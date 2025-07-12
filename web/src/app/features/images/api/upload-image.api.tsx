import { useApi } from '@/lib/api';
import { useHttp } from '@/lib/http';
import { useMutation } from '@tanstack/react-query';
import z from 'zod';

export const requestUploadUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required.'),
});

type UploadUrlRequest = z.output<typeof requestUploadUrlSchema>;

export function useImageUploadUrl() {
  const { post } = useApi();

  return useMutation({
    mutationFn: async (request: UploadUrlRequest) => {
      return await post<{ uploadUrl: string }, UploadUrlRequest>(
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
      const formData = new FormData();
      formData.append('file', file);
      return await put<void, FormData>(uploadUrl, formData);
    },
  });
}
