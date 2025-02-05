import { ReactNode } from 'react';

interface BaseLayoutProps {
  children: ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
} 