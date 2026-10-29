import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { haptics } from '../utils/haptics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    haptics.triggerTick();
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <Card className="mx-4 mb-1 mt-2 flex-row items-center justify-between gap-3 rounded-2xl border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-100 p-3 text-slate-800 shadow-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-amber-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">Install Android / Mobile App</p>
            <p className="text-[11px] text-slate-500 truncate">1-tap home screen access with full haptics</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" onClick={handleInstallClick} className="rounded-xl">
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              haptics.triggerTick();
              setDismissed(true);
            }}
            className="rounded-lg text-slate-400 hover:bg-transparent hover:text-slate-600"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Install Paws &amp; Pots</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 leading-relaxed">
            To install this Android/iOS web app on your home screen:
          </p>
          <ol className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">1</span>
              <span>Tap the <Share2 className="w-3.5 h-3.5 inline mx-1 text-sky-600" /> <strong>Share</strong> button in your browser toolbar.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">2</span>
              <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">3</span>
              <span>Open from your home screen for full native screen experience!</span>
            </li>
          </ol>
          <DialogFooter>
            <Button variant="dark" onClick={() => setShowIOSModal(false)} className="w-full">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
