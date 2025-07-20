import { useApi } from '@/lib/api';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { Image } from '../types/image';

export function useImages() {
  const { get } = useApi();

  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      return await get<
        { images: Image[]; prev?: string; next?: string },
        { cursor: string | undefined; limit: number | undefined }
      >('/v1/images', {
        cursor: pageParam,
        limit: pageParam === undefined ? 100 : 20,
      });
    },
    queryKey: ['images'],
    getNextPageParam: (lastPage) => {
      return lastPage.next;
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage.prev;
    },
    initialPageParam: undefined as string | undefined,
  });
}
