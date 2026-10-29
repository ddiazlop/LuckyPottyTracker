/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CircleDot, BarChart3, History, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { DogProfile, PottyLog } from './types';
import {
  DEFAULT_PROFILE,
  generateSampleLogs,
  getStoredLogs,
  getStoredProfile,
  saveLogs,
  saveProfile,
} from './utils/storage';
import { haptics } from './utils/haptics';
import { BigButtonSection } from './components/BigButtonSection';
import { DashboardSection } from './components/DashboardSection';
import { HistorySection } from './components/HistorySection';
import { ProfileModal } from './components/ProfileModal';
import { RetroactiveLogModal } from './components/RetroactiveLogModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';

type TabId = 'log' | 'dashboard' | 'history';

const TAB_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'log', label: 'Big Button', icon: CircleDot },
  { id: 'dashboard', label: 'Statistics', icon: BarChart3 },
  { id: 'history', label: 'Timeline', icon: History },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('log');
  const [dog, setDog] = useState<DogProfile>(getStoredProfile);
  const [logs, setLogs] = useState<PottyLog[]>(getStoredLogs);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showRetroModal, setShowRetroModal] = useState<boolean>(false);

  // Sync state to storage
  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveProfile(dog);
  }, [dog]);

  const handleTabChange = (value: string) => {
    haptics.triggerTick();
    setActiveTab(value as TabId);
  };

  // Log a new potty event
  const handleLogPotty = (newLogData: Omit<PottyLog, 'id'>) => {
    const newLog: PottyLog = {
      ...newLogData,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setLogs((prev) => [newLog, ...prev]);

    // Show undo toast
    const actionLabel =
      newLog.type === 'meal'
        ? 'Meal / Feeding'
        : newLog.type === 'both'
        ? 'Pee & Poop'
        : newLog.type === 'pee'
        ? 'Pee'
        : 'Poop';
    const accidentNote = newLog.isAccident ? ' (Accident)' : '';

    toast(`Logged ${actionLabel}${accidentNote}`, {
      description: `Recorded for ${dog.name}`,
      action: {
        label: 'Undo',
        onClick: () => {
          haptics.triggerUndo();
          setLogs((prev) => prev.filter((item) => item.id !== newLog.id));
        },
      },
    });
  };

  // Delete a log
  const handleDeleteLog = (id: string) => {
    const target = logs.find((l) => l.id === id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
    if (target) {
      toast('Log deleted', {
        action: {
          label: 'Undo',
          onClick: () => {
            haptics.triggerUndo();
            setLogs((prev) => [target, ...prev].sort((a, b) => b.timestamp - a.timestamp));
          },
        },
      });
    }
  };

  // Reset / Sample data
  const handleResetData = () => {
    setLogs([]);
    toast('All logs cleared');
  };

  const handleLoadSampleData = () => {
    const sample = generateSampleLogs(dog.id);
    setLogs(sample);
    haptics.triggerBothLog();
    toast.success('Sample data loaded', {
      description: `${sample.length} realistic events generated`,
    });
  };

  const handleImportLogs = (importedLogs: PottyLog[]) => {
    setLogs(importedLogs);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="min-h-screen flex-col justify-between gap-0 bg-slate-100/70 text-slate-900 selection:bg-amber-200"
    >
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-xs">
              <span className="text-sm">🐾</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                Paws &amp; Pots
              </h1>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                {dog.name}&apos;s Potty Tracker
              </p>
            </div>
          </div>

          {/* Top Actions: Desktop Navigation + Settings */}
          <div className="flex items-center gap-2">
            <TabsList className="hidden sm:inline-flex">
              {TAB_ITEMS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                haptics.triggerTick();
                setShowProfileModal(true);
              }}
              className="rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Settings and Profile"
            >
              <Settings className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 pt-2">
        <TabsContent value="log">
          <BigButtonSection
            dog={dog}
            logs={logs}
            onLogPotty={handleLogPotty}
            onOpenRetroModal={() => setShowRetroModal(true)}
          />
        </TabsContent>

        <TabsContent value="dashboard">
          <DashboardSection dog={dog} logs={logs} />
        </TabsContent>

        <TabsContent value="history">
          <HistorySection
            dog={dog}
            logs={logs}
            onDeleteLog={handleDeleteLog}
            onOpenRetroModal={() => setShowRetroModal(true)}
          />
        </TabsContent>
      </main>

      {/* Mobile Bottom Navigation Bar (Android Material 3 thumb zone) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3">
        <TabsList className="mx-auto grid w-full max-w-md grid-cols-3 gap-1 bg-transparent p-0">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="group h-auto flex-col gap-0.5 rounded-2xl py-1 text-slate-500 data-[state=active]:bg-transparent data-[state=active]:text-amber-600 data-[state=active]:shadow-none data-[state=inactive]:font-medium data-[state=inactive]:hover:text-slate-800"
              >
                <span className="flex h-7 w-11 items-center justify-center rounded-full transition-colors group-data-[state=active]:bg-amber-100 group-data-[state=active]:text-amber-700">
                  <Icon className="size-5" />
                </span>
                <span className="text-[11px] font-semibold tracking-tight">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </nav>

      {/* Floating Undo Toast */}
      <Toaster />

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        dog={dog}
        onSaveProfile={(updated) => setDog(updated)}
        onResetData={handleResetData}
        onLoadSampleData={handleLoadSampleData}
        logs={logs}
        onImportLogs={handleImportLogs}
      />

      {/* Retroactive Past Log Modal */}
      <RetroactiveLogModal
        isOpen={showRetroModal}
        onClose={() => setShowRetroModal(false)}
        dog={dog}
        onAddLog={handleLogPotty}
      />
    </Tabs>
  );
}
