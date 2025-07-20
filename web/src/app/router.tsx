import { createBrowserRouter } from 'react-router';
import { Layout } from './layout';
import { App } from './pages/app';
import { UploadImagePage } from './pages/images/upload/upload-image.page';
import { GalleryPage } from './pages/gallery';
import { RegisterPage } from './pages/auth/register/register.page';

export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: App },
      {
        path: 'auth',
        children: [
          {
            path: 'register',
            Component: RegisterPage,
          },
        ],
      },
      {
        path: 'gallery',
        children: [
          {
            index: true,
            Component: GalleryPage,
          },
          {
            path: 'upload',
            Component: UploadImagePage,
          },
        ],
      },
    ],
  },
]);
