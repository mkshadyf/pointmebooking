'use client';

import { useToast } from '@/hooks/useToast';
import { Toast } from './Toast';
import { Toaster } from 'react-hot-toast';

const toastVariantMap = {
  success: 'success',
  error: 'destructive',
  warning: 'warning',
  info: 'info',
  default: 'default'
} as const;

type ToastType = keyof typeof toastVariantMap;

 