import { useImages } from '../api/get-image.api';

export function ImageList() {
  const { data, isLoading, error } = useImages();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading images</div>;

  return (
    <div>
      {data?.map((image) => (
        <img
          key={image.id}
          src={image.url}
          alt={image.title}
        />
      ))}
    </div>
  );
}
