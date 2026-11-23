import { createBrowserRouter } from 'react-router';
import type { RouteObject } from 'react-router';
import { AboutPage } from '../features/about/AboutPage';
import { PrivacyPage } from '../features/about/PrivacyPage';
import { CalendarPlaceholder } from './CalendarPlaceholder';
import { Layout } from './Layout';
import { NotFound } from './NotFound';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <CalendarPlaceholder /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
