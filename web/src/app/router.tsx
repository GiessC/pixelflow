import { createBrowserRouter } from 'react-router';
import { BaseLayout } from './base-layout';
import { App } from './pages/app';
import { UploadImagePage } from './pages/images/upload/upload-image.page';
import { GalleryPage } from './pages/gallery';
import { RegisterPage } from './pages/auth/register/register.page';
import { LoginPage } from './pages/auth/login/login.page';
import { RequireUnauthenticated } from './auth/components/require-unauthenticated';
import { RequireAuthenticated } from './auth/components/require-authenticated';
import { AppLayout } from './layout';

export const router = createBrowserRouter([
  {
    Component: BaseLayout,
    children: [
      { index: true, Component: App },
      {
        path: 'auth',
        Component: RequireUnauthenticated,
        children: [
          {
            path: 'register',
            Component: RegisterPage,
          },
          {
            path: 'login',
            Component: LoginPage,
          },
        ],
      },
      {
        path: 'app',
        Component: RequireAuthenticated,
        children: [
          {
            path: '',
            Component: AppLayout,
            children: [
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
        ],
      },
    ],
  },
]);
