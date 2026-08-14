'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

const STORAGE_KEY = 'cookie-consent';
const ACCENT = '#ab9685';

const defaultPrefs = { essential: true, analytics: false, marketing: false };

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState(defaultPrefs);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const save = (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    setVisible(false);
    setPrefsOpen(false);
  };

  const acceptAll = () => save({ essential: true, analytics: true, marketing: true });

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[100] bg-[#404040] text-white px-4 py-5 md:px-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="flex-1">
            <p className="font-semibold mb-1">We use cookies</p>
            <p className="text-sm text-white/70">
              We use cookies to improve your experience and performance on our website. You can manage your
              preferences by clicking &quot;Change Preferences&quot;.{' '}
              <Link href="/privacy-policy" className="underline hover:opacity-80">
                Privacy Policy
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setPrefsOpen(true)}
              className="text-sm underline hover:opacity-80"
            >
              Change Preferences
            </button>
            <Button
              onClick={acceptAll}
              style={{ backgroundColor: ACCENT }}
              className="hover:opacity-90 rounded-full px-6"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <label className="flex items-start gap-3">
              <input type="checkbox" checked disabled className="mt-1 w-5 h-5 shrink-0" />
              <span>
                <span className="block font-medium">Essential</span>
                <span className="block text-sm text-black/60">Required for the website to function properly.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                className="mt-1 w-5 h-5 shrink-0 cursor-pointer"
              />
              <span>
                <span className="block font-medium">Analytics</span>
                <span className="block text-sm text-black/60">Helps us understand how visitors use our website.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                className="mt-1 w-5 h-5 shrink-0 cursor-pointer"
              />
              <span>
                <span className="block font-medium">Marketing</span>
                <span className="block text-sm text-black/60">Used to deliver relevant promotions and offers.</span>
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => save(prefs)}>Save Preferences</Button>
            <Button
              onClick={acceptAll}
              style={{ backgroundColor: ACCENT }}
              className="hover:opacity-90"
            >
              Accept All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
