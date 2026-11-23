import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { ToastProvider } from '../components/ui';
import { createAppRouter } from './router';

export function App() {
  const [router] = useState(createAppRouter);

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
