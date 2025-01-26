'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { classNames } from '@/lib/utils';
import { BeforeInstallPromptEvent } from '@/types/pwa';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isInstalled = localStorage.getItem('pwa-installed') === 'true';
      setIsStandalone(isInStandaloneMode || isInstalled);
    };

    checkStandalone();

    const handler = async (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      // Show our custom install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa-installed', 'true');
      setIsStandalone(true);
      setShowPrompt(false);
    });

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
      console.log(`User response to the install prompt: ${outcome}`);

      // Clear the deferredPrompt variable
      setDeferredPrompt(null);
      setShowPrompt(false);

      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        setIsStandalone(true);
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 mr-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Install PointMe App
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Add PointMe to your home screen for quick access to your bookings and services.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleInstallClick}
            className={classNames(
              'px-4 py-2 text-sm font-medium rounded-md',
              'text-white bg-primary hover:bg-primary/90',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
            )}
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
