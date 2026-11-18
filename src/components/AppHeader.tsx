import React from 'react';
import { Settings } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface AppHeaderNavigationItem {
  id: string;
  label: string;
}

interface AppHeaderProps {
  dogName: string;
  navigationItems: AppHeaderNavigationItem[];
  onOpenSettings: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  dogName,
  navigationItems,
  onOpenSettings,
}) => {
  const handleSettingsClick = () => {
    haptics.triggerTick();
    onOpenSettings();
  };

  return (
    <header className="sticky top-3 z-30 px-4">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm shadow-slate-900/5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-xs">
            <span className="text-sm">🐾</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
              Paws &amp; Pots
            </h1>
            <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
              {dogName}&apos;s Potty Tracker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TabsList className="hidden sm:inline-flex">
            {navigationItems.map((navigationItem) => (
              <TabsTrigger key={navigationItem.id} value={navigationItem.id}>
                {navigationItem.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettingsClick}
            className="rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Settings and Profile"
          >
            <Settings className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
