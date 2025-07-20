import { cn } from '@/lib/utils';
import type { Image } from '../types/image';
import { useNavigate } from 'react-router';

interface GalleryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  image: Image;
}

export function GalleryImage({
  className,
  image,
  ...props
}: GalleryImageProps) {
  const navigate = useNavigate();

  function goToImagePage() {
    navigate(`/gallery/${image.fileName}`);
  }

  return (
    <div
      className='cursor-pointer rounded-lg hover:scale-102 transition-transform hover:shadow-xl transition-shadow'
      onClick={goToImagePage}
    >
      <img
        {...props}
        className={cn('rounded-md max-w-64', className)}
        src={image.url}
        alt={image.fileName}
        loading='lazy'
      />
    </div>
  );
}
