'use client';

import { Toaster } from 'react-hot-toast';



export function ToastContainer() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: '#fff',
          color: '#363636',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: '0.375rem',
          padding: '0.75rem 1rem',
        },
        success: {
          style: {
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
          },
        },
        error: {
          style: {
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
          },
        },
        loading: {
          style: {
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            color: '#374151',
          },
        },
      }}
    />
  );
}

 