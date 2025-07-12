import { Form } from '@/app/components/form';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useImageUpload, useImageUploadUrl } from '../api/upload-image.api';
import z from 'zod';

const formSchema = z.object({
  image: z.instanceof(File).refine((file) => file.type.startsWith('image/'), {
    message: 'Please upload a valid image file.',
  }),
});

export function UploadImageForm() {
  const { mutateAsync: requestUploadUrlAsync } = useImageUploadUrl();
  const { mutateAsync: uploadImageAsync } = useImageUpload();

  return (
    <Form
      schema={formSchema}
      onSubmit={async ({ image }) => {
        const { uploadUrl } = await requestUploadUrlAsync({
          fileName: image.name,
        });
        await uploadImageAsync({
          uploadUrl,
          file: image,
        });
      }}
    >
      {(form) => (
        <>
          <FormField
            name='image'
            control={form.control as never}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    type='file'
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        onChange(file);
                      } else {
                        onChange(null);
                      }
                    }}
                    max={1}
                    accept='image/*'
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            Upload Image
          </Button>
        </>
      )}
    </Form>
  );
}
