import React, { useState } from 'react';
import { X, Clock, AlertTriangle } from 'lucide-react';
import { DogProfile, PottyLog, PottyType, PottyLocation } from '../types';
import { haptics } from '../utils/haptics';

interface RetroactiveLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dog: DogProfile;
  onAddLog: (log: Omit<PottyLog, 'id'>) => void;
}

const AVAILABLE_LOCATIONS: PottyLocation[] = ['Walk', 'Terrace', 'Park', 'Indoors'];

export const RetroactiveLogModal: React.FC<RetroactiveLogModalProps> = ({
  isOpen,
  onClose,
  dog,
  onAddLog,
}) => {
  if (!isOpen) return null;

  // Defaults to today & current time rounded to 5 mins
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  const [date, setDate] = useState<string>(dateStr);
  const [time, setTime] = useState<string>(timeStr);
  const [type, setType] = useState<PottyType>('pee');
  const [location, setLocation] = useState<PottyLocation>('Walk');
  const [notes, setNotes] = useState<string>('');

  // Indoors is ALWAYS an accident
  const isAccident = location === 'Indoors';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const [yr, mo, dy] = date.split('-').map(Number);
    const [hr, mn] = time.split(':').map(Number);
    const targetDate = new Date(yr, mo - 1, dy, hr, mn, 0);

    if (type === 'pee') haptics.triggerPeeLog();
    else if (type === 'poop') haptics.triggerPoopLog();
    else if (type === 'both') haptics.triggerBothLog();
    else haptics.triggerMealLog();

    onAddLog({
      dogId: dog.id,
      type,
      timestamp: targetDate.getTime(),
      isAccident: type === 'meal' ? false : isAccident,
      location,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-slate-900 border border-slate-100 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Log Past Event</h3>
          </div>
          <button
            onClick={() => {
              haptics.triggerTick();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          {/* Potty / Activity Type */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">What did {dog.name} do?</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: 'pee', label: '💧 Pee' },
                  { id: 'poop', label: '💩 Poop' },
                  { id: 'both', label: '✨ Both' },
                  { id: 'meal', label: '🥣 Meal' },
                ] as const
              ).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    haptics.triggerTick();
                    setType(item.id);
                  }}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    type === item.id
                      ? item.id === 'meal'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Location</label>
            <div className="grid grid-cols-4 gap-1">
              {AVAILABLE_LOCATIONS.map((loc) => {
                const isSelected = location === loc;
                const isIndoorsBtn = loc === 'Indoors';
                return (
                  <button
                    type="button"
                    key={loc}
                    onClick={() => {
                      haptics.triggerTick();
                      setLocation(loc);
                    }}
                    className={`py-2 rounded-xl font-semibold text-[11px] transition-all ${
                      isSelected
                        ? isIndoorsBtn
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-900 text-white shadow-xs'
                        : isIndoorsBtn
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accident Notice */}
          {location === 'Indoors' ? (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-2 text-rose-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <p className="font-medium text-[11px]">
                Indoors is automatically recorded as an accident.
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">
              Clean outdoor outing ({location}).
            </p>
          )}

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Note (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. During afternoon loop"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs"
            >
              Save Past Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
