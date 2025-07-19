// import {
//   type ControllerRenderProps,
//   type FieldPath,
//   type FieldValues,
// } from 'react-hook-form';
// import { cn } from '@/lib/utils';
// import { useState } from 'react';
// import { Badge } from './badge';

import { useState, type KeyboardEvent } from 'react';
import { Input } from './input';
import { Badge } from './badge';
import { X } from 'lucide-react';
import { Button } from './button';

// type TagsInputProps<
//   TFormValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFormValues> = FieldPath<TFormValues>
// > = ControllerRenderProps<TFormValues, TName> & {
//   defaultValue: string[];
// };

// export function TagsInput<
//   TFormValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFormValues> = FieldPath<TFormValues>
// >({
//   defaultValue,
//   onChange,
//   onBlur,
//   value,
//   name,
//   ref,
// }: TagsInputProps<TFormValues, TName>) {
//   const [tags, setTags] = useState<string[]>(defaultValue);

//   return (
//     <input
//       id={name}
//       ref={ref}
//       className={cn(
//         'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
//         'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
//         'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
//       )}
//     >
//       {tags?.map((tag) => (
//         <Badge key={tag}>{tag}</Badge>
//       ))}
//     </input>
//   );
// }
interface TagsInputProps {
  value: string[];
  onChange: (updatedTags: string[]) => void;
  placeholder?: string;
}

export function TagsInput({
  value: tags,
  onChange,
  placeholder,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  function handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      const trimmed = inputValue.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onChange([...tags, trimmed]);
      }
      setInputValue('');
    }
    if (event.code === 'Backspace' && !inputValue && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(tagIndex: number) {
    onChange(tags.filter((_, index) => index !== tagIndex));
  }

  return (
    <div className='flex flex-col border border-input rounded-md focus-within:ring-2 focus-within:ring-primary'>
      <div className='flex flex-wrap space-x-1 min-h-0'>
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant='secondary'
            className='flex space-x-1 m-1'
          >
            {tag}
            <Button
              variant='ghost'
              className='cursor-pointer !p-0 w-auto h-auto'
              onClick={() => removeTag(index)}
            >
              <X />
            </Button>
          </Badge>
        ))}
      </div>
      <Input
        className='flex-1 !ring-0 border-none'
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
}
