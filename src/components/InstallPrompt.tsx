'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { classNames } from '@/lib/utils';
import { BeforeInstallPromptEvent } from '@/types/pwa';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      if (!(e instanceof Event)) return;
      
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show our custom install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the browser install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      // Clear the deferredPrompt variable
      setDeferredPrompt(null);
      setShowPrompt(false);

      // Optionally, send analytics event
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className={classNames(
      'fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50',
      'transform transition-all duration-500 ease-in-out',
      showPrompt ? 'translate-y-0' : 'translate-y-full'
    )}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-2 rounded-lg bg-primary shadow-lg sm:p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-primary-dark">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </span>
              <p className="ml-3 font-medium text-white truncate">
                <span className="md:hidden">Install PointMe app!</span>
                <span className="hidden md:inline">Add PointMe to your home screen for the best experience!</span>
              </p>
            </div>
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
              <button
                onClick={handleInstallClick}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50"
              >
                Install
              </button>
            </div>
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button
                type="button"
                onClick={() => setShowPrompt(false)}
                className="-mr-1 flex p-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
