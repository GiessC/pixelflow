import { createBrowserRouter } from 'react-router';
import { Layout } from './layout';
import { App } from './pages/app';
import { UploadImagePage } from './pages/images/upload/upload-image.page';
import { GalleryPage } from './pages/gallery';

export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: App },
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
