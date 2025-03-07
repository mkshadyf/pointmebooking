'use client';

import { Button } from '@/components/ui/Button';
import React from 'react';

interface AuthButtonProps {
  type?: 'submit' | 'button';
  isLoading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  fullWidth?: boolean;
  className?: string;
}

export function AuthButton({
  type = 'submit',
  isLoading = false,
  onClick,
  children,
  variant = 'default',
  fullWidth = true,
  className = ''
}: AuthButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      loading={isLoading}
      variant={variant}
      className={`${fullWidth ? 'w-full' : ''} py-3 text-base font-semibold ${className}`}
    >
      {children}
    </Button>
  );
} 