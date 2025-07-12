import { createBrowserRouter } from 'react-router';
import { Layout } from './layout';
import { App } from './pages/app';
import { UploadImagePage } from './pages/images/upload/upload-image.page';

export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: App },
      {
        path: 'images',
        children: [
          {
            path: 'upload',
            Component: UploadImagePage,
          },
        ],
      },
    ],
  },
]);
