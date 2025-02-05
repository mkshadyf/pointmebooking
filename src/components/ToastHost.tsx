'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { ToastBar, Toaster, toast } from 'react-hot-toast';

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
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        className: '',
        duration: 5000,
        style: {
          background: '#fff',
          color: '#363636',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div
              className={`${
                (t.type in toastConfig ? toastConfig[t.type as keyof typeof toastConfig].className : 'bg-white')
              } flex items-center w-full max-w-md p-4 text-gray-500 shadow-lg rounded-lg pointer-events-auto`}
            >
              <div className="flex-shrink-0">
                {(t.type in toastConfig) ? toastConfig[t.type as keyof typeof toastConfig].icon : icon}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </ToastBar>
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