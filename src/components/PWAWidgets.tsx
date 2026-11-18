import React, {useEffect, useState} from 'react';
import {Download, WifiOff} from 'lucide-react';
import type {Language} from '../types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'; platform: string}>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as {standalone?: boolean}).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const {outcome} = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    install,
  };
}

export const PWAInstallButton: React.FC<{lang: Language}> = ({lang}) => {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl border border-emerald-600 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-4 h-4" />
        {lang === 'bn' ? 'অ্যান্ড্রয়েড / হোমস্ক্রিনে ইনস্টল' : 'Install App'}
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          {lang === 'bn' ? 'আইফোনে ইনস্টল' : 'Install on iOS'}
        </button>

        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'হোম স্ক্রিনে আরবি শিখি যুক্ত করুন' : 'Install Arbi Sikkhi on iPhone'}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'bn'
                  ? '১. সাফারির নিচের Share বাটনে ট্যাপ করুন। ২. নিচে স্ক্রল করে Add to Home Screen নির্বাচন করুন।'
                  : '1. Tap the Share icon in Safari toolbar. 2. Scroll down and select Add to Home Screen.'}
              </p>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="mt-5 w-full min-h-[44px] rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC<{lang: Language}> = ({lang}) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        {lang === 'bn'
          ? 'অফলাইন মোড — সংরক্ষিত পাঠ ও অডিও ব্যবহৃত হচ্ছে'
          : 'Offline Mode — Using cached lessons & audio'}
      </span>
    </div>
  );
};
