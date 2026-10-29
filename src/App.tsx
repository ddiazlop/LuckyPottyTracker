/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CircleDot, BarChart3, History } from 'lucide-react';
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
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { ProfileModal } from './components/ProfileModal';
import { RetroactiveLogModal } from './components/RetroactiveLogModal';
import { BigButtonSection } from './components/sections/BigButtonSection';
import { DashboardSection } from './components/sections/DashboardSection';
import { HistorySection } from './components/sections/HistorySection';
import { Tabs, TabsContent } from '@/components/ui/tabs';
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

  const handleLogPotty = (newLogData: Omit<PottyLog, 'id'>) => {
    const newLog: PottyLog = {
      ...newLogData,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setLogs((prev) => [newLog, ...prev]);

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
      <AppHeader
        dogName={dog.name}
        navigationItems={TAB_ITEMS}
        onOpenSettings={() => setShowProfileModal(true)}
      />

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

      <BottomNav navigationItems={TAB_ITEMS} />

      <Toaster />

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

      <RetroactiveLogModal
        isOpen={showRetroModal}
        onClose={() => setShowRetroModal(false)}
        dog={dog}
        onAddLog={handleLogPotty}
      />
    </Tabs>
  );
}
