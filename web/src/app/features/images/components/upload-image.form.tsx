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
import { TagsInput } from '@/components/ui/tags-input';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  image: z.instanceof(File).refine((file) => file.type.startsWith('image/'), {
    message: 'Please upload a valid image file.',
  }),
  nsfw: z.boolean().default(false),
  tags: z
    .array(
      z.string().min(3, { message: 'Tags must be at least 3 characters long.' })
    )
    .default([]),
});

export function UploadImageForm() {
  const { mutateAsync: requestUploadUrlAsync } = useImageUploadUrl();
  const { mutateAsync: uploadImageAsync } = useImageUpload();

  return (
    <Form
      schema={formSchema}
      defaultValues={{
        nsfw: false,
        tags: [],
      }}
      onSubmit={async ({ image, nsfw, tags }) => {
        const { uploadUrl, image: uploadedImage } = await requestUploadUrlAsync(
          {
            fileName: image.name,
            nsfw,
            tags,
          }
        );
        console.log('image', uploadedImage);
        await uploadImageAsync({
          uploadUrl,
          file: image,
        });
      }}
    >
      {(form) => (
        <div className='flex flex-col gap-4'>
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
          <FormField
            name='tags'
            control={form.control as never}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <TagsInput {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name='nsfw'
            control={form.control as never}
            render={({ field }) => (
              <FormItem className='flex flex-row items-center gap-2'>
                <FormControl>
                  <Checkbox {...field} />
                </FormControl>
                <FormLabel>NSFW?</FormLabel>
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
        </div>
      )}
    </Form>
  );
}
