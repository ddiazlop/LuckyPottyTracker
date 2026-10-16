import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Droplets,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { DogProfile, PottyLog, PottyType, PottyLocation } from '../types';
import { haptics } from '../utils/haptics';
import { formatTimeAgo, formatClockTime } from '../utils/stats';

interface BigButtonSectionProps {
  dog: DogProfile;
  logs: PottyLog[];
  onLogPotty: (log: Omit<PottyLog, 'id'>) => void;
  onOpenRetroModal: () => void;
}

const LOCATION_OPTIONS: { id: PottyLocation; label: string; icon: string }[] = [
  { id: 'Walk', label: 'Walk', icon: '🚶' },
  { id: 'Terrace', label: 'Terrace', icon: '🪴' },
  { id: 'Park', label: 'Park', icon: '🌳' },
  { id: 'Indoors', label: 'Indoors', icon: '🏠' },
];

export const BigButtonSection: React.FC<BigButtonSectionProps> = ({
  dog,
  logs,
  onLogPotty,
  onOpenRetroModal,
}) => {
  const [location, setLocation] = useState<PottyLocation>('Walk');
  const [isIndoorsShaking, setIsIndoorsShaking] = useState<boolean>(false);
  const [timeOffsetMinutes, setTimeOffsetMinutes] = useState<number>(0);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [lastLoggedType, setLastLoggedType] = useState<PottyType | null>(null);

  // If it's Indoors, it's ALWAYS an accident
  const isAccident = location === 'Indoors';

  const handleLocationSelect = (selectedLoc: PottyLocation) => {
    if (selectedLoc === 'Indoors') {
      // Trigger warning haptic vibration and audio feedback
      haptics.triggerUndo();
      setIsIndoorsShaking(true);
      setTimeout(() => setIsIndoorsShaking(false), 500);
    } else {
      haptics.triggerTick();
    }
    setLocation(selectedLoc);
  };

  // Live timer tick to update "X min ago"
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Calculate last pee, poop, and meal timestamps
  const lastPeeLog = logs.find((l) => l.type === 'pee' || l.type === 'both');
  const lastPoopLog = logs.find((l) => l.type === 'poop' || l.type === 'both');
  const lastMealLog = logs.find((l) => l.type === 'meal');

  // Elapsed hours for urgency state
  const mostRecentTimestamp = Math.max(lastPeeLog?.timestamp || 0, lastPoopLog?.timestamp || 0);
  const elapsedHours = mostRecentTimestamp > 0
    ? (currentTime - mostRecentTimestamp) / (1000 * 60 * 60)
    : 0;
  const isDueSoon = elapsedHours >= (dog.targetIntervalHours || 4);

  const handlePress = (type: PottyType) => {
    // 1. Tactile haptic & sound feedback
    if (type === 'pee') {
      haptics.triggerPeeLog();
    } else if (type === 'poop') {
      haptics.triggerPoopLog();
    } else if (type === 'both') {
      haptics.triggerBothLog();
    } else {
      haptics.triggerMealLog();
    }

    // 2. Playful confetti celebration
    try {
      confetti({
        particleCount: type === 'meal' ? 35 : type === 'both' ? 45 : 30,
        spread: 60,
        origin: { y: 0.65 },
        colors:
          type === 'meal'
            ? ['#10b981', '#34d399', '#f59e0b']
            : type === 'pee'
            ? ['#f59e0b', '#fbbf24', '#38bdf8']
            : ['#b45309', '#78350f', '#10b981'],
        disableForReducedMotion: true,
      });
    } catch {
      // Confetti fallback
    }

    // 3. Calculate timestamp based on selected offset
    const logTimestamp = currentTime - timeOffsetMinutes * 60 * 1000;

    // 4. Submit log (Meals indoors are normal and not accidents)
    onLogPotty({
      dogId: dog.id,
      type,
      timestamp: logTimestamp,
      isAccident: type === 'meal' ? false : isAccident,
      location,
      notes: notes.trim() || undefined,
    });

    // Flash confirmation
    setLastLoggedType(type);
    setTimeout(() => setLastLoggedType(null), 2500);

    // Reset one-time detail states
    if (notes) setNotes('');
    if (timeOffsetMinutes !== 0) setTimeOffsetMinutes(0);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 flex flex-col gap-4">
      {/* Dog Status & Hold Time Header */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={dog.avatarUrl}
                alt={dog.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/20"
                referrerPolicy="no-referrer"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isDueSoon ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">{dog.name}</h2>
                {dog.isPuppy && (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    Puppy
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isDueSoon ? 'Potty outing recommended soon' : 'All good & comfortable'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.triggerTick();
              onOpenRetroModal();
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-transform"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Past Log</span>
          </button>
        </div>

        {/* Hold Trackers */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
          <div className="bg-amber-50/60 rounded-2xl p-2.5 border border-amber-100/70">
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-800 mb-1">
              <Droplets className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">Last Peed</span>
            </div>
            <p className="text-xs font-bold text-slate-800 tabular-nums">
              {formatTimeAgo(lastPeeLog?.timestamp ?? null, currentTime)}
            </p>
            {lastPeeLog && (
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                {formatClockTime(lastPeeLog.timestamp)}
              </p>
            )}
          </div>

          <div className="bg-orange-50/60 rounded-2xl p-2.5 border border-orange-100/70">
            <div className="flex items-center gap-1 text-xs font-semibold text-orange-900 mb-1">
              <span className="text-xs leading-none">💩</span>
              <span className="truncate">Last Pooped</span>
            </div>
            <p className="text-xs font-bold text-slate-800 tabular-nums">
              {formatTimeAgo(lastPoopLog?.timestamp ?? null, currentTime)}
            </p>
            {lastPoopLog && (
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                {formatClockTime(lastPoopLog.timestamp)}
              </p>
            )}
          </div>

          <div className="bg-emerald-50/60 rounded-2xl p-2.5 border border-emerald-100/70">
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-800 mb-1">
              <span className="text-xs leading-none">🥣</span>
              <span className="truncate">Last Fed</span>
            </div>
            <p className="text-xs font-bold text-slate-800 tabular-nums">
              {formatTimeAgo(lastMealLog?.timestamp ?? null, currentTime)}
            </p>
            {lastMealLog && (
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                {formatClockTime(lastMealLog.timestamp)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* LOCATION SELECTOR - PLACED PROMINENTLY ON TOP OF THE BIG BUTTONS */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Location</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Selected: <strong className={location === 'Indoors' ? 'text-rose-600 font-bold' : 'text-slate-900 font-bold'}>{location}</strong>
          </span>
        </div>

        {/* 4 Large Location Selector Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {LOCATION_OPTIONS.map((opt) => {
            const isSelected = location === opt.id;
            const isIndoors = opt.id === 'Indoors';
            const shouldShake = isIndoors && isIndoorsShaking;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleLocationSelect(opt.id)}
                className={`py-2.5 px-1 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                  shouldShake ? 'animate-shake' : ''
                } ${
                  isSelected
                    ? isIndoors
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400'
                      : 'bg-slate-900 text-white shadow-md shadow-slate-900/20 ring-2 ring-slate-700'
                    : isIndoors
                    ? 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <span className="text-base leading-none">{opt.icon}</span>
                <span className="leading-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic warning banner when Indoors is selected with shake feedback */}
        {isAccident && (
          <div
            className={`p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-2 text-rose-900 text-xs mt-1 transition-all ${
              isIndoorsShaking ? 'animate-shake' : ''
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="font-medium text-[11px] leading-tight">
              Indoors is automatically logged as an accident for {dog.name}.
            </p>
          </div>
        )}
      </div>

      {/* Time Offset Selector (Just now vs 5m/15m/30m ago) */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-semibold text-slate-600">Logged time:</span>
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
          {[
            { label: 'Now', offset: 0 },
            { label: '-5m', offset: 5 },
            { label: '-15m', offset: 15 },
            { label: '-30m', offset: 30 },
          ].map((item) => (
            <button
              key={item.offset}
              onClick={() => {
                haptics.triggerTick();
                setTimeOffsetMinutes(item.offset);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeOffsetMinutes === item.offset
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* GIGANTIC TACTILE BUTTONS */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* PEE BUTTON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => handlePress('pee')}
          className="relative overflow-hidden group select-none min-h-[160px] rounded-3xl p-5 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 flex flex-col items-center justify-center text-center cursor-pointer border border-amber-300/40 active:shadow-inner"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3 shadow-inner">
            <Droplets className="w-9 h-9 text-white drop-shadow-sm" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">PEE</span>
          <span className="text-xs font-medium text-amber-100 mt-1">
            Log at {location}
          </span>
        </motion.button>

        {/* POOP BUTTON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => handlePress('poop')}
          className="relative overflow-hidden group select-none min-h-[160px] rounded-3xl p-5 bg-gradient-to-br from-amber-800 via-stone-800 to-amber-950 text-white shadow-lg shadow-amber-950/20 flex flex-col items-center justify-center text-center cursor-pointer border border-stone-600/40 active:shadow-inner"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-3 shadow-inner text-3xl">
            💩
          </div>
          <span className="text-2xl font-extrabold tracking-tight">POOP</span>
          <span className="text-xs font-medium text-stone-300 mt-1">
            Log at {location}
          </span>
        </motion.button>
      </div>

      {/* COMBO BUTTON: BOTH PEE & POOP */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => handlePress('both')}
        className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-amber-500 to-stone-800 text-white p-3 shadow-md shadow-slate-900/10 flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm cursor-pointer border border-amber-400/30 active:scale-95 transition-transform"
      >
        <Sparkles className="w-4 h-4 text-amber-200" />
        <span>Logged Both (Pee + Poop) at {location}</span>
      </motion.button>

      {/* FEED MEAL BUTTON */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => handlePress('meal')}
        className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-3 shadow-md shadow-emerald-700/15 flex items-center justify-between px-4 sm:px-5 font-bold text-xs sm:text-sm cursor-pointer border border-emerald-400/30 active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-base">
            🥣
          </div>
          <div className="text-left">
            <span className="block leading-tight font-extrabold">LOG MEAL / FED {dog.name.toUpperCase()}</span>
            <span className="text-[10px] font-normal text-emerald-100 block">Compare digestion &amp; potty delay in stats</span>
          </div>
        </div>
        <span className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-lg text-emerald-50 shrink-0">
          Feed 🍖
        </span>
      </motion.button>

      {/* Success Badge Banner */}
      <AnimatePresence>
        {lastLoggedType && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-500 text-white rounded-2xl text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {lastLoggedType === 'meal'
                ? `Recorded Meal for ${dog.name} at ${formatClockTime(currentTime)}! 🥣`
                : `Recorded ${lastLoggedType.toUpperCase()} for ${dog.name} at ${location}${isAccident ? ' (Accident)' : ''}!`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional Quick Note Tray */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <button
          onClick={() => {
            haptics.triggerTick();
            setShowNotes(!showNotes);
          }}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Add Note {notes ? `("${notes}")` : '(Optional)'}</span>
          </span>
          {showNotes ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {showNotes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4 pt-1 flex flex-col gap-2 border-t border-slate-100"
            >
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. right after meal, sudden urge"
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
