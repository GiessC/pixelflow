import { Outlet } from 'react-router';
import { Providers } from './provider';

export function BaseLayout() {
  return (
    <div className='h-full flex flex-col'>
      <div className='flex flex-grow'>
        <Providers>
          <Outlet />
        </Providers>
      </div>
    </div>
  );
}
