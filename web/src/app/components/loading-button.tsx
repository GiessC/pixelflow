import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function LoadingButton() {
  return (
    <Button disabled>
      <Loader2 className='animate-spin' />
      Please wait
    </Button>
  );
}
