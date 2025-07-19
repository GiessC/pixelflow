import { useApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import type { Image } from '../types/image';

export function useImages() {
  const { get } = useApi();

  return useQuery({
    queryFn: async () => {
      return await get<Image[]>('/v1/images');
    },
    queryKey: ['images'],
  });
}
