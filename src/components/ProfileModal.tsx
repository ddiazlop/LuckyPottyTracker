import React, { useState } from 'react';
import {
  X,
  Dog,
  Volume2,
  VolumeX,
  Vibrate,
  RotateCcw,
  Download,
  Upload,
  Check,
  Shield,
  Clock,
} from 'lucide-react';
import { DogProfile, PottyLog, DogLifeStage } from '../types';
import { haptics } from '../utils/haptics';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  dog: DogProfile;
  onSaveProfile: (profile: DogProfile) => void;
  onResetData: () => void;
  onLoadSampleData: () => void;
  logs: PottyLog[];
  onImportLogs: (logs: PottyLog[]) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  dog,
  onSaveProfile,
  onResetData,
  onLoadSampleData,
  logs,
  onImportLogs,
}) => {
  const [name, setName] = useState(dog.name);
  const [breed, setBreed] = useState(dog.breed);
  const [lifeStage, setLifeStage] = useState<DogLifeStage>(
    dog.lifeStage || (dog.isPuppy ? 'puppy' : 'adult')
  );
  const [targetInterval, setTargetInterval] = useState(dog.targetIntervalHours);
  const [soundEnabled, setSoundEnabled] = useState(haptics.isSoundEnabled());
  const [hapticsEnabled, setHapticsEnabled] = useState(haptics.isHapticsEnabled());

  if (!isOpen) return null;

  const handleSave = () => {
    haptics.triggerTick();
    onSaveProfile({
      ...dog,
      name: name.trim() || 'My Dog',
      breed: breed.trim() || 'Dog',
      lifeStage,
      isPuppy: lifeStage === 'puppy',
      targetIntervalHours: Number(targetInterval) || 4,
    });
    onClose();
  };

  const handleExport = () => {
    haptics.triggerTick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${dog.name.toLowerCase()}_potty_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportLogs(parsed);
            haptics.triggerBothLog();
            alert(`Successfully imported ${parsed.length} logs!`);
          }
        } catch {
          alert('Invalid JSON file format.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl text-slate-900 border border-slate-100 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Dog className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">Dog Profile & App Settings</h2>
          </div>
          <button
            onClick={() => {
              haptics.triggerTick();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 py-4 text-xs">
          {/* Dog Name */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Dog&apos;s Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. Lucky"
            />
          </div>

          {/* Breed */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Breed / Mix</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. Golden Retriever"
            />
          </div>

          {/* Life Stage Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Life Stage</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  haptics.triggerTick();
                  setLifeStage('puppy');
                  if (targetInterval > 3) setTargetInterval(2.5);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  lifeStage === 'puppy'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-900 shadow-xs ring-2 ring-amber-500/30'
                    : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-xl mb-1">🐾</div>
                <div>
                  <span className="font-bold text-xs block leading-tight">Puppy</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">&lt; 1 year</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.triggerTick();
                  setLifeStage('adult');
                  if (targetInterval < 3 || targetInterval > 6) setTargetInterval(4);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  lifeStage === 'adult'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-900 shadow-xs ring-2 ring-blue-500/30'
                    : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-xl mb-1">🐕</div>
                <div>
                  <span className="font-bold text-xs block leading-tight">Adult</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">1–7 years</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.triggerTick();
                  setLifeStage('senior');
                  if (targetInterval > 4.5) setTargetInterval(3.5);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  lifeStage === 'senior'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-900 shadow-xs ring-2 ring-purple-500/30'
                    : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-xl mb-1">🦴</div>
                <div>
                  <span className="font-bold text-xs block leading-tight">Senior</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">7+ years</span>
                </div>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              {lifeStage === 'puppy' && '🐾 Puppies have developing bladders: require frequent breaks (1.5–3h) and quick post-meal timing.'}
              {lifeStage === 'adult' && '🐕 Adults have mature bladder control: comfortably hold 4–6h with a steady daily routine.'}
              {lifeStage === 'senior' && '🦴 Senior dogs need gentler pacing, frequent relief (2.5–4h), and arthritis/mobility consideration.'}
            </p>
          </div>

          {/* Target Daytime Hold Interval */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Target Hold Time (Hours)</label>
              <span className="font-bold text-amber-700 tabular-nums">{targetInterval} hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={targetInterval}
              onChange={(e) => setTargetInterval(parseFloat(e.target.value))}
              className="w-full accent-amber-600"
            />
            <p className="text-[11px] text-slate-600 mt-1">
              Typical hold times: Puppies 1.5–3h • Adults 4–6h • Seniors 2.5–4h
            </p>
          </div>

          {/* Tactile & Sound Settings */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <span className="font-bold text-slate-900 block">Expressive Feedback</span>

            {/* Haptic vibration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 font-medium">Haptic Vibration</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !hapticsEnabled;
                  setHapticsEnabled(next);
                  haptics.setHapticsEnabled(next);
                  if (next) haptics.triggerPeeLog();
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  hapticsEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Tactile Sound FX */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-slate-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-slate-700 font-medium">Tactile Sound Effects</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  haptics.setSoundEnabled(next);
                  if (next) haptics.triggerPeeLog();
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  soundEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Data Controls */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="font-bold text-slate-900 block">Data & Sample Set</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  haptics.triggerTick();
                  onLoadSampleData();
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Sample Data</span>
              </button>

              <button
                onClick={handleExport}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="cursor-pointer text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  haptics.triggerUndo();
                  if (window.confirm('Clear all potty records?')) {
                    onResetData();
                  }
                }}
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                Clear All Logs
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={() => {
              haptics.triggerTick();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
