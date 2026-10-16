/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CircleDot,
  BarChart3,
  History,
  Settings,
  Dog,
  Sparkles,
  Heart,
} from 'lucide-react';
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
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<'log' | 'dashboard' | 'history'>('log');
  const [dog, setDog] = useState<DogProfile>(getStoredProfile);
  const [logs, setLogs] = useState<PottyLog[]>(getStoredLogs);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showRetroModal, setShowRetroModal] = useState<boolean>(false);

  // Sync state to storage
  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveProfile(dog);
  }, [dog]);

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

    setToast({
      id: String(Date.now()),
      title: `Logged ${actionLabel}${accidentNote}`,
      subtitle: `Recorded for ${dog.name}`,
      onUndo: () => {
        setLogs((prev) => prev.filter((item) => item.id !== newLog.id));
      },
    });
  };

  // Delete a log
  const handleDeleteLog = (id: string) => {
    const target = logs.find((l) => l.id === id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
    if (target) {
      setToast({
        id: String(Date.now()),
        title: 'Log deleted',
        onUndo: () => {
          setLogs((prev) => [target, ...prev].sort((a, b) => b.timestamp - a.timestamp));
        },
      });
    }
  };

  // Reset / Sample data
  const handleResetData = () => {
    setLogs([]);
    setToast({
      id: String(Date.now()),
      title: 'All logs cleared',
    });
  };

  const handleLoadSampleData = () => {
    const sample = generateSampleLogs(dog.id);
    setLogs(sample);
    haptics.triggerBothLog();
    setToast({
      id: String(Date.now()),
      title: 'Sample data loaded',
      subtitle: `${sample.length} realistic events generated`,
    });
  };

  const handleImportLogs = (importedLogs: PottyLog[]) => {
    setLogs(importedLogs);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col justify-between selection:bg-amber-200">
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
                Paws & Pots
              </h1>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                {dog.name}&apos;s Potty Tracker
              </p>
            </div>
          </div>

          {/* Top Actions: Desktop Navigation + Settings */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  haptics.triggerTick();
                  setActiveTab('log');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'log'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Big Button
              </button>
              <button
                onClick={() => {
                  haptics.triggerTick();
                  setActiveTab('dashboard');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Statistics
              </button>
              <button
                onClick={() => {
                  haptics.triggerTick();
                  setActiveTab('history');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Timeline
              </button>
            </div>

            <button
              onClick={() => {
                haptics.triggerTick();
                setShowProfileModal(true);
              }}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="Settings and Profile"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 pt-2">
        {/* Android PWA Install Banner */}
        <PWAInstallBanner />

        {activeTab === 'log' && (
          <BigButtonSection
            dog={dog}
            logs={logs}
            onLogPotty={handleLogPotty}
            onOpenRetroModal={() => setShowRetroModal(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardSection dog={dog} logs={logs} />
        )}

        {activeTab === 'history' && (
          <HistorySection
            dog={dog}
            logs={logs}
            onDeleteLog={handleDeleteLog}
            onOpenRetroModal={() => setShowRetroModal(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Android Material 3 thumb zone) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-1">
          {/* Big Button Log Tab */}
          <button
            onClick={() => {
              haptics.triggerTick();
              setActiveTab('log');
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              activeTab === 'log'
                ? 'text-amber-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`w-11 h-7 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'log' ? 'bg-amber-100 text-amber-700' : 'bg-transparent'
              }`}
            >
              <CircleDot className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight mt-0.5">Big Button</span>
          </button>

          {/* Statistics Dashboard Tab */}
          <button
            onClick={() => {
              haptics.triggerTick();
              setActiveTab('dashboard');
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              activeTab === 'dashboard'
                ? 'text-amber-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`w-11 h-7 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'dashboard' ? 'bg-amber-100 text-amber-700' : 'bg-transparent'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight mt-0.5">Statistics</span>
          </button>

          {/* Timeline History Tab */}
          <button
            onClick={() => {
              haptics.triggerTick();
              setActiveTab('history');
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              activeTab === 'history'
                ? 'text-amber-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`w-11 h-7 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'history' ? 'bg-amber-100 text-amber-700' : 'bg-transparent'
              }`}
            >
              <History className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight mt-0.5">Timeline</span>
          </button>
        </div>
      </nav>

      {/* Floating Undo Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

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
    </div>
  );
}
