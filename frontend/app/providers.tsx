'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './context/auth.context';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            className: '',
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        {children}
      </>
    </AuthProvider>
  );
}
