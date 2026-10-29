import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { DogProfile, PottyLog, PottyType, PottyLocation } from '../types';
import { haptics } from '../utils/haptics';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RetroactiveLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dog: DogProfile;
  onAddLog: (log: Omit<PottyLog, 'id'>) => void;
}

const AVAILABLE_LOCATIONS: PottyLocation[] = ['Walk', 'Terrace', 'Park', 'Indoors'];

const TYPE_OPTIONS: { id: PottyType; label: string }[] = [
  { id: 'pee', label: '💧 Pee' },
  { id: 'poop', label: '💩 Poop' },
  { id: 'both', label: '✨ Both' },
  { id: 'meal', label: '🥣 Meal' },
];

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toTimeInputValue = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export const RetroactiveLogModal: React.FC<RetroactiveLogModalProps> = ({
  isOpen,
  onClose,
  dog,
  onAddLog,
}) => {
  const [date, setDate] = useState<string>(toDateInputValue(new Date()));
  const [time, setTime] = useState<string>(toTimeInputValue(new Date()));
  const [type, setType] = useState<PottyType>('pee');
  const [location, setLocation] = useState<PottyLocation>('Walk');
  const [notes, setNotes] = useState<string>('');

  // Refresh the defaults each time the modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setDate(toDateInputValue(now));
      setTime(toTimeInputValue(now));
    }
  }, [isOpen]);

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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            <Clock className="w-5 h-5 text-amber-600" />
            Log Past Event
          </DialogTitle>
          <DialogDescription>
            Backfill something {dog.name} did earlier today or on a previous day.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Potty / Activity Type */}
          <div>
            <Label className="mb-1.5">What did {dog.name} do?</Label>
            <ToggleGroup
              type="single"
              value={type}
              onValueChange={(value) => {
                if (!value) return;
                haptics.triggerTick();
                setType(value as PottyType);
              }}
              className="grid w-full grid-cols-4 gap-1.5"
            >
              {TYPE_OPTIONS.map((item) => (
                <ToggleGroupItem
                  key={item.id}
                  value={item.id}
                  className={cn(
                    'h-auto rounded-xl px-1 py-2 text-xs font-bold',
                    'bg-slate-100 text-slate-700 hover:bg-slate-200',
                    item.id === 'meal'
                      ? 'data-[state=on]:bg-emerald-600 data-[state=on]:text-white data-[state=on]:shadow-xs'
                      : 'data-[state=on]:bg-amber-600 data-[state=on]:text-white data-[state=on]:shadow-xs'
                  )}
                >
                  {item.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="retro-date">Date</Label>
              <Input
                id="retro-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="font-semibold"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="retro-time">Time</Label>
              <Input
                id="retro-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="font-semibold"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label className="mb-1.5">Location</Label>
            <ToggleGroup
              type="single"
              value={location}
              onValueChange={(value) => {
                if (!value) return;
                haptics.triggerTick();
                setLocation(value as PottyLocation);
              }}
              className="grid w-full grid-cols-4 gap-1"
            >
              {AVAILABLE_LOCATIONS.map((loc) => {
                const isIndoorsBtn = loc === 'Indoors';
                return (
                  <ToggleGroupItem
                    key={loc}
                    value={loc}
                    className={cn(
                      'h-auto rounded-xl px-1 py-2 text-[11px] font-semibold',
                      isIndoorsBtn
                        ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 data-[state=on]:border-transparent data-[state=on]:bg-rose-600 data-[state=on]:text-white data-[state=on]:shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 data-[state=on]:bg-slate-900 data-[state=on]:text-white data-[state=on]:shadow-xs'
                    )}
                  >
                    {loc}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>

          {/* Accident Notice */}
          {location === 'Indoors' ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertDescription>
                Indoors is automatically recorded as an accident.
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-[11px] text-slate-500">
              Clean outdoor outing ({location}).
            </p>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="retro-notes">Note (optional)</Label>
            <Input
              id="retro-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. During afternoon loop"
              className="font-normal"
            />
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Past Log</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
