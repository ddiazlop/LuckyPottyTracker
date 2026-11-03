/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CircleDot, BarChart3, History } from 'lucide-react';
import { usePottyTrackerData } from './hooks/usePottyTrackerData';
import { haptics } from './utils/haptics';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { ProfileModal } from './components/ProfileModal';
import { RetroactiveRecordModal } from './components/RetroactiveRecordModal';
import { StartupFailureNotice } from './components/StartupFailureNotice';
import { StartupLoader } from './components/StartupLoader';
import { BigButtonSection } from './components/sections/BigButtonSection';
import { DashboardSection } from './components/sections/DashboardSection';
import { HistorySection } from './components/sections/HistorySection';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';

type TabId = 'record' | 'dashboard' | 'history';

const TAB_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'record', label: 'Big Button', icon: CircleDot },
  { id: 'dashboard', label: 'Statistics', icon: BarChart3 },
  { id: 'history', label: 'Timeline', icon: History },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('record');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showRetroModal, setShowRetroModal] = useState<boolean>(false);

  const {
    startupState,
    dog,
    records,
    addRecord,
    deleteRecord,
    clearRecords,
    loadSampleRecords,
    importRecords,
    saveProfile,
  } = usePottyTrackerData();

  if (startupState.status === 'loading') {
    return <StartupLoader />;
  }

  if (startupState.status === 'failed') {
    return <StartupFailureNotice failureMessage={startupState.failureMessage} />;
  }

  const handleTabChange = (value: string) => {
    haptics.triggerTick();
    setActiveTab(value as TabId);
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
        <TabsContent value="record">
          <BigButtonSection
            dog={dog}
            records={records}
            onAddRecord={addRecord}
            onOpenRetroModal={() => setShowRetroModal(true)}
          />
        </TabsContent>

        <TabsContent value="dashboard">
          <DashboardSection dog={dog} records={records} />
        </TabsContent>

        <TabsContent value="history">
          <HistorySection
            dog={dog}
            records={records}
            onDeleteRecord={deleteRecord}
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
        onSaveProfile={saveProfile}
        onResetData={clearRecords}
        onLoadSampleData={loadSampleRecords}
        records={records}
        onImportRecords={importRecords}
      />

      <RetroactiveRecordModal
        isOpen={showRetroModal}
        onClose={() => setShowRetroModal(false)}
        dog={dog}
        onAddRecord={addRecord}
      />
    </Tabs>
  );
}
