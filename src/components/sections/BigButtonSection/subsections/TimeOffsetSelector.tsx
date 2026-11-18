import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TIME_OFFSET_OPTIONS } from '../constants';

interface TimeOffsetSelectorProps {
  selectedOffsetMinutes: number;
  onSelectOffsetMinutes: (offsetMinutes: number) => void;
}

export const TimeOffsetSelector: React.FC<TimeOffsetSelectorProps> = ({
  selectedOffsetMinutes,
  onSelectOffsetMinutes,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <span className="text-xs font-semibold text-slate-600">Recorded time:</span>
      <ToggleGroup
        type="single"
        value={String(selectedOffsetMinutes)}
        onValueChange={(value) => {
          if (!value) return;
          onSelectOffsetMinutes(Number(value));
        }}
        className="gap-1 rounded-xl bg-slate-200/70 p-1"
      >
        {TIME_OFFSET_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.offsetMinutes}
            value={String(option.offsetMinutes)}
            className="h-auto rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 data-[state=on]:bg-white data-[state=on]:text-slate-900 data-[state=on]:shadow-xs"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};
