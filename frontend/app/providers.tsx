'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './context/auth.context';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4CAF50',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: '#E53E3E',
            },
          },
        }}
      />
      {children}
    </AuthProvider>
  );
}
