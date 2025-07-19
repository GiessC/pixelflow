import { useImages } from '../api/get-image.api';
import { GalleryImage } from '@/app/features/images/components/gallery-image';
import { type Image } from '@/app/features/images/types/image';
import { Masonry } from '@/app/components/masonry';

export function ImageList() {
  const { data: images, isLoading, error } = useImages();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading images</div>;

  return (
    <Masonry
      className='m-2'
      columns={{
        default: 1,
        sm: 2,
        md: 3,
        lg: 4,
      }}
    >
      {images?.map((image: Image) => (
        <GalleryImage
          key={image.fileName}
          image={image}
          width='100%'
        />
      )) ?? []}
    </Masonry>
  );
}
