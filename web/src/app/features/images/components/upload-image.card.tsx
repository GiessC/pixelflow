import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadImageForm } from './upload-image.form';
import type { DefaultProps } from '@/types/default-props';

export function UploadImageCard({ className }: DefaultProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
      </CardHeader>
      <CardContent>
        <UploadImageForm />
      </CardContent>
    </Card>
  );
}
