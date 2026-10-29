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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3">
      <TabsList className="mx-auto grid w-full max-w-md grid-cols-3 gap-1 bg-transparent p-0">
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
