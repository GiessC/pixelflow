import { VirtualizedMasonry } from '@/app/components/virtualized-masonry';
import { useImages } from '../api/get-image.api';
import { useMemo } from 'react';
import { GalleryImage } from './gallery-image';

export function ImageList() {
  const { data: imageData, isLoading, error } = useImages();

  const allImages = useMemo(() => {
    return imageData?.pages.flatMap((page) => page.images) ?? [];
  }, [imageData]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading images</div>;

  return (
    <VirtualizedMasonry
      items={allImages}
      overscan={75}
      numberOfColumns={{
        default: 2,
        sm: 3,
        md: 4,
        lg: 5,
        xl: 6,
        '2xl': 6,
      }}
      renderItem={(image) => (
        <GalleryImage
          key={`${image.fileName}-${image.createdBy}`}
          image={image}
          className='w-full mb-3'
        />
      )}
    />
  );
}
