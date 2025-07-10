import {
  FormProvider,
  useForm,
  type FieldValues,
  type SubmitHandler,
  type UseFormProps,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z, ZodTypeAny } from 'zod';

interface FormProps<
  TSchema extends ZodTypeAny,
  TFormInput extends FieldValues = FieldValues,
  TContext = unknown,
  TFormOutput extends FieldValues = TFormInput
> extends Pick<
    UseFormProps<TFormInput, TContext, TFormOutput>,
    'defaultValues'
  > {
  schema: TSchema;
  onSubmit: SubmitHandler<TFormOutput>;
  options?: Omit<
    UseFormProps<TFormInput, TContext, TFormOutput>,
    'onSubmit' | 'resolver' | 'mode' | 'reValidateMode' | 'defaultValues'
  >;
  children: (
    form: ReturnType<typeof useForm<TFormInput, TContext, TFormOutput>>
  ) => React.ReactNode;
}

export function Form<
  TSchema extends ZodTypeAny,
  TFormInput extends FieldValues = z.input<TSchema>,
  TContext = unknown,
  TFormOutput extends FieldValues = z.output<TSchema>
>({
  schema,
  onSubmit,
  defaultValues,
  children,
  options = {},
}: FormProps<TSchema, TFormInput, TContext, TFormOutput>) {
  const form = useForm({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
    ...options,
  });
  const { handleSubmit } = form;

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>{children(form)}</form>
    </FormProvider>
  );
}
