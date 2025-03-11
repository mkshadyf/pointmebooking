import { ToastProvider } from '@/components/providers/ToastProvider';
import React from 'react';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        {/* Wrap the entire app with ToastProvider to enable global toast functionality */}
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
} 