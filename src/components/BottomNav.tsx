import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface BottomNavProps {
  navigationItems: BottomNavItem[];
}

export const BottomNav: React.FC<BottomNavProps> = ({ navigationItems }) => {
  return (
    <nav className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-3xl border border-slate-200/90 bg-white/95 px-3 py-1.5 shadow-lg shadow-slate-900/10 backdrop-blur-md">
      <TabsList className="mx-auto grid w-full grid-cols-3 gap-1 bg-transparent p-0">
        {navigationItems.map((navigationItem) => {
          const NavigationIcon = navigationItem.icon;

          return (
            <TabsTrigger
              key={navigationItem.id}
              value={navigationItem.id}
              className="group h-auto flex-col gap-0.5 rounded-2xl py-1 text-slate-500 data-[state=active]:bg-transparent data-[state=active]:text-amber-600 data-[state=active]:shadow-none data-[state=inactive]:font-medium data-[state=inactive]:hover:text-slate-800"
            >
              <span className="flex h-7 w-11 items-center justify-center rounded-full transition-colors group-data-[state=active]:bg-amber-100 group-data-[state=active]:text-amber-700">
                <NavigationIcon className="size-5" />
              </span>
              <span className="text-[11px] font-semibold tracking-tight">
                {navigationItem.label}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </nav>
  );
};
