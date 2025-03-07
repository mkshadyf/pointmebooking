'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Toaster, toast } from 'react-hot-toast';

const toastConfig = {
  success: {
    icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    className: 'border-l-4 border-green-500 bg-white',
  },
  error: {
    icon: <XCircleIcon className="w-6 h-6 text-red-500" />,
    className: 'border-l-4 border-red-500 bg-white',
  },
  loading: {
    icon: <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500" />,
    className: 'border-l-4 border-gray-500 bg-white',
  },
  warning: {
    icon: <ExclamationCircleIcon className="w-6 h-6 text-yellow-500" />,
    className: 'border-l-4 border-yellow-500 bg-white',
  },
  info: {
    icon: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
    className: 'border-l-4 border-blue-500 bg-white',
  },
};

export default function ToastHost() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={12}
      toastOptions={{
        duration: 5000,
        style: {
          background: '#ffffff',
          color: '#1f2937',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(229, 231, 235, 1)',
          fontSize: '14px',
          maxWidth: '400px',
          width: 'auto',
        },
        success: {
          style: {
            backgroundColor: '#f0fdf4',
            borderLeft: '4px solid #22c55e',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#ffffff',
          },
        },
        error: {
          style: {
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #ef4444',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
        loading: {
          style: {
            backgroundColor: '#f3f4f6',
            borderLeft: '4px solid #6b7280',
          },
        },
      }}
    >
      {(t) => (
        <div
          className={`${
            (t.type in toastConfig ? toastConfig[t.type as keyof typeof toastConfig].className : 'bg-white')
          } flex items-center w-full max-w-md p-4 text-gray-800 shadow-md rounded-lg pointer-events-auto animate-fadeIn`}
        >
          <div className="flex-shrink-0">
            {(t.type in toastConfig) ? toastConfig[t.type as keyof typeof toastConfig].icon : t.icon}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {typeof t.message === 'function' ? t.message(t) : t.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md transition-colors duration-200"
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </Toaster>
  );
}

// Helper functions for showing toasts
export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  warning: (message: string) => toast(message, { icon: toastConfig.warning.icon }),
  info: (message: string) => toast(message, { icon: toastConfig.info.icon }),
}; 