import { cn } from '@/lib/utils';
import type { Image } from '../types/image';

interface GalleryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  image: Image;
}

export function GalleryImage({
  className,
  image,
  ...props
}: GalleryImageProps) {
  return (
    <img
      {...props}
      className={cn('rounded-md max-w-64', className)}
      src={image.url}
      alt={image.fileName}
      loading='lazy'
    />
  );
}
