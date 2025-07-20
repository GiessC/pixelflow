import { Button } from '@/components/ui/button';
import { Image, Upload } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router';

export function AppLayout() {
  return (
    <div className='flex flex-col h-full w-full'>
      <Navbar />
      <Outlet />
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className='bg-gray-800 p-4 w-full sticky top-0 z-10'>
      <div className='container mx-auto flex'>
        {window.location.pathname !== '/app/gallery' && (
          <Button
            variant='outline'
            onClick={() => navigate('/app/gallery')}
          >
            <Image /> Gallery
          </Button>
        )}
        {window.location.pathname !== '/app/gallery/upload' && (
          <>
            <div className='grow' />
            <Button
              variant='outline'
              onClick={() => navigate('/app/gallery/upload')}
            >
              <Upload /> Upload
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
