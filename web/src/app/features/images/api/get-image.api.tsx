import { useApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function useImages() {
  const { get } = useApi();

  return useQuery({
    queryFn: async () => {
      return await get<{ id: string; url: string; title: string }[]>('/images');
    },
    queryKey: ['images'],
  });
}
