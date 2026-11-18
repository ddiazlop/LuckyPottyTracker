import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Droplets,
  Sparkles,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { DogProfile, PottyRecord, PottyType, PottyLocation } from '../../types';
import { haptics } from '../../utils/haptics';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface BigButtonSectionProps {
  dog: DogProfile;
  onAddRecord: (record: Omit<PottyRecord, 'id'>) => void;
}

const LOCATION_OPTIONS: { id: PottyLocation; label: string; icon: string }[] = [
  { id: 'Walk', label: 'Walk', icon: '🚶' },
  { id: 'Terrace', label: 'Terrace', icon: '🪴' },
  { id: 'Park', label: 'Park', icon: '🌳' },
  { id: 'Indoors', label: 'Indoors', icon: '🏠' },
];

const TIME_OFFSETS = [
  { label: 'Now', offset: 0 },
  { label: '-5m', offset: 5 },
  { label: '-15m', offset: 15 },
  { label: '-30m', offset: 30 },
];

const MotionButton = motion.create(Button);

export const BigButtonSection: React.FC<BigButtonSectionProps> = ({
  dog,
  onAddRecord,
}) => {
  const [location, setLocation] = useState<PottyLocation>('Walk');
  const [isIndoorsShaking, setIsIndoorsShaking] = useState<boolean>(false);
  const [timeOffsetMinutes, setTimeOffsetMinutes] = useState<number>(0);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

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

  const handlePress = (type: PottyType) => {
    // 1. Tactile haptic & sound feedback
    if (type === 'pee') {
      haptics.triggerPeeFeedback();
    } else if (type === 'poop') {
      haptics.triggerPoopFeedback();
    } else if (type === 'both') {
      haptics.triggerBothFeedback();
    } else {
      haptics.triggerMealFeedback();
    }

    // 2. Calculate timestamp based on selected offset
    const recordTimestamp = Date.now() - timeOffsetMinutes * 60 * 1000;

    // 3. Submit record (Meals indoors are normal and not accidents)
    onAddRecord({
      dogId: dog.id,
      type,
      timestamp: recordTimestamp,
      isAccident: type === 'meal' ? false : isAccident,
      location,
      notes: notes.trim() || undefined,
    });

    // Reset one-time detail states
    if (notes) setNotes('');
    if (timeOffsetMinutes !== 0) setTimeOffsetMinutes(0);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 flex flex-col gap-4">
      {/* LOCATION SELECTOR - PLACED PROMINENTLY ON TOP OF THE BIG BUTTONS */}
      <Card className="gap-2 rounded-3xl p-3.5">
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
        <ToggleGroup
          type="single"
          value={location}
          onValueChange={(value) => {
            if (value) handleLocationSelect(value as PottyLocation);
          }}
          className="grid w-full grid-cols-4 gap-2"
        >
          {LOCATION_OPTIONS.map((opt) => {
            const isIndoors = opt.id === 'Indoors';
            const shouldShake = isIndoors && isIndoorsShaking;

            return (
              <ToggleGroupItem
                key={opt.id}
                value={opt.id}
                aria-label={opt.label}
                className={cn(
                  'flex h-auto w-full flex-col gap-1 rounded-2xl border px-1 py-2.5 text-xs font-bold',
                  shouldShake && 'animate-shake',
                  isIndoors
                    ? 'border-rose-200/80 bg-rose-50 text-rose-700 hover:bg-rose-100 data-[state=on]:border-transparent data-[state=on]:bg-rose-600 data-[state=on]:text-white data-[state=on]:shadow-md data-[state=on]:shadow-rose-600/30 data-[state=on]:ring-2 data-[state=on]:ring-rose-400'
                    : 'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200/80 data-[state=on]:border-transparent data-[state=on]:bg-slate-900 data-[state=on]:text-white data-[state=on]:shadow-md data-[state=on]:shadow-slate-900/20 data-[state=on]:ring-2 data-[state=on]:ring-slate-700'
                )}
              >
                <span className="text-base leading-none">{opt.icon}</span>
                <span className="leading-tight">{opt.label}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>

        {/* Dynamic warning banner when Indoors is selected with shake feedback */}
        {isAccident && (
          <Alert
            variant="destructive"
            className={cn('mt-1', isIndoorsShaking && 'animate-shake')}
          >
            <AlertTriangle />
            <AlertDescription>
              Indoors is automatically recorded as an accident for {dog.name}.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Time Offset Selector (Just now vs 5m/15m/30m ago) */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-semibold text-slate-600">Recorded time:</span>
        <ToggleGroup
          type="single"
          value={String(timeOffsetMinutes)}
          onValueChange={(value) => {
            if (!value) return;
            haptics.triggerTick();
            setTimeOffsetMinutes(Number(value));
          }}
          className="gap-1 rounded-xl bg-slate-200/70 p-1"
        >
          {TIME_OFFSETS.map((item) => (
            <ToggleGroupItem
              key={item.offset}
              value={String(item.offset)}
              className="h-auto rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 data-[state=on]:bg-white data-[state=on]:text-slate-900 data-[state=on]:shadow-xs"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* GIGANTIC TACTILE BUTTONS */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* PEE BUTTON */}
        <MotionButton
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => handlePress('pee')}
          variant="ghost"
          className="group relative h-auto min-h-[160px] w-full flex-col gap-0 overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-5 text-white shadow-lg shadow-amber-500/25 hover:bg-transparent hover:brightness-105"
        >
          <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
          <span className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3 shadow-inner">
            <Droplets className="w-9 h-9 text-white drop-shadow-sm" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight">PEE</span>
          <span className="text-xs font-medium text-amber-100 mt-1">
            Record at {location}
          </span>
        </MotionButton>

        {/* POOP BUTTON */}
        <MotionButton
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => handlePress('poop')}
          variant="ghost"
          className="group relative h-auto min-h-[160px] w-full flex-col gap-0 overflow-hidden rounded-3xl border border-stone-600/40 bg-gradient-to-br from-amber-800 via-stone-800 to-amber-950 p-5 text-white shadow-lg shadow-amber-950/20 hover:bg-transparent hover:brightness-105"
        >
          <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
          <span className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-3 shadow-inner text-3xl">
            💩
          </span>
          <span className="text-2xl font-extrabold tracking-tight">POOP</span>
          <span className="text-xs font-medium text-stone-300 mt-1">
            Record at {location}
          </span>
        </MotionButton>
      </div>

      {/* COMBO BUTTON: BOTH PEE & POOP */}
      <MotionButton
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => handlePress('both')}
        variant="ghost"
        className="h-auto min-h-[52px] w-full gap-2.5 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500 to-stone-800 p-3 text-xs font-bold text-white shadow-md shadow-slate-900/10 hover:bg-transparent hover:brightness-105 sm:text-sm"
      >
        <Sparkles className="w-4 h-4 text-amber-200" />
        <span>Recorded Both (Pee + Poop) at {location}</span>
      </MotionButton>

      {/* FEED MEAL BUTTON */}
      <MotionButton
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => handlePress('meal')}
        variant="ghost"
        className="h-auto min-h-[52px] w-full justify-between gap-2.5 whitespace-normal rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 py-3 text-xs font-bold text-white shadow-md shadow-emerald-700/15 hover:bg-transparent hover:brightness-105 sm:px-5 sm:text-sm"
      >
        <span className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-base">
            🥣
          </span>
          <span className="text-left">
            <span className="block leading-tight font-extrabold">LOG MEAL / FED {dog.name.toUpperCase()}</span>
            <span className="text-[10px] font-normal text-emerald-100 block">Compare digestion &amp; potty delay in stats</span>
          </span>
        </span>
        <span className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-lg text-emerald-50 shrink-0">
          Feed 🍖
        </span>
      </MotionButton>

      {/* Optional Quick Note Tray */}
      <Collapsible open={showNotes} onOpenChange={setShowNotes}>
        <Card className="gap-0 overflow-hidden rounded-2xl p-0">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => haptics.triggerTick()}
              className="h-auto w-full justify-between rounded-none px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <div className="px-4 pb-4 pt-2 border-t border-slate-100">
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. right after meal, sudden urge"
                className="text-xs"
              />
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
