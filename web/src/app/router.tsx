import { createBrowserRouter } from 'react-router';
import { Layout } from './layout';
import { App } from './pages/app';

export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [{ index: true, Component: App }],
  },
]);
