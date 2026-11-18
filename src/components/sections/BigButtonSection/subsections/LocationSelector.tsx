import React from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import { PottyLocation } from '@/types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { POTTY_LOCATION_OPTIONS } from '../constants';

interface LocationSelectorProps {
  selectedLocation: PottyLocation;
  dogName: string;
  isIndoorsShaking: boolean;
  onSelectLocation: (selectedLocation: PottyLocation) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  dogName,
  isIndoorsShaking,
  onSelectLocation,
}) => {
  const isIndoorsSelected = selectedLocation === 'Indoors';

  return (
    <Card className="gap-2 rounded-3xl p-3.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span>Location</span>
        </span>
        <span className="text-[11px] text-slate-500 font-medium">
          Selected:{' '}
          <strong
            className={isIndoorsSelected ? 'text-rose-600 font-bold' : 'text-slate-900 font-bold'}
          >
            {selectedLocation}
          </strong>
        </span>
      </div>

      <ToggleGroup
        type="single"
        value={selectedLocation}
        onValueChange={(value) => {
          if (value) onSelectLocation(value as PottyLocation);
        }}
        className="grid w-full grid-cols-4 gap-2"
      >
        {POTTY_LOCATION_OPTIONS.map((option) => {
          const isIndoorsOption = option.id === 'Indoors';
          const shouldShake = isIndoorsOption && isIndoorsShaking;

          return (
            <ToggleGroupItem
              key={option.id}
              value={option.id}
              aria-label={option.label}
              className={cn(
                'flex h-auto w-full flex-col gap-1 rounded-2xl border px-1 py-2.5 text-xs font-bold',
                shouldShake && 'animate-shake',
                isIndoorsOption
                  ? 'border-rose-200/80 bg-rose-50 text-rose-700 hover:bg-rose-100 data-[state=on]:border-transparent data-[state=on]:bg-rose-600 data-[state=on]:text-white data-[state=on]:shadow-md data-[state=on]:shadow-rose-600/30 data-[state=on]:ring-2 data-[state=on]:ring-rose-400'
                  : 'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200/80 data-[state=on]:border-transparent data-[state=on]:bg-slate-900 data-[state=on]:text-white data-[state=on]:shadow-md data-[state=on]:shadow-slate-900/20 data-[state=on]:ring-2 data-[state=on]:ring-slate-700'
              )}
            >
              <span className="text-base leading-none">{option.icon}</span>
              <span className="leading-tight">{option.label}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      {isIndoorsSelected && (
        <Alert variant="destructive" className={cn('mt-1', isIndoorsShaking && 'animate-shake')}>
          <AlertTriangle />
          <AlertDescription>
            Indoors is automatically recorded as an accident for {dogName}.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};
