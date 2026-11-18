import React from 'react';
import { MapPin } from 'lucide-react';
import { PottyLocation } from '@/types';
import { Card } from '@/components/ui/card';

interface LocationDistributionCardProps {
  dogName: string;
  recordedEventsCount: number;
  locationCounts: Record<PottyLocation, number>;
}

interface LocationTileStyle {
  location: PottyLocation;
  label: string;
  containerClassName: string;
  labelClassName: string;
  valueClassName: string;
  captionClassName: string;
  captionOverride?: string;
}

const LOCATION_TILES: LocationTileStyle[] = [
  {
    location: 'Walk',
    label: 'Walk',
    containerClassName: 'bg-amber-50 border border-amber-100',
    labelClassName: 'text-amber-900',
    valueClassName: 'text-amber-800',
    captionClassName: 'text-amber-700',
  },
  {
    location: 'Terrace',
    label: 'Terrace',
    containerClassName: 'bg-sky-50 border border-sky-100',
    labelClassName: 'text-sky-900',
    valueClassName: 'text-sky-800',
    captionClassName: 'text-sky-700',
  },
  {
    location: 'Park',
    label: 'Park',
    containerClassName: 'bg-emerald-50 border border-emerald-100',
    labelClassName: 'text-emerald-900',
    valueClassName: 'text-emerald-800',
    captionClassName: 'text-emerald-700',
  },
  {
    location: 'Indoors',
    label: 'Indoors',
    containerClassName: 'bg-rose-50 border border-rose-100',
    labelClassName: 'text-rose-900',
    valueClassName: 'text-rose-800',
    captionClassName: 'text-rose-600 font-semibold',
    captionOverride: 'Accidents',
  },
];

export const LocationDistributionCard: React.FC<LocationDistributionCardProps> = ({
  dogName,
  recordedEventsCount,
  locationCounts,
}) => {
  return (
    <Card className="gap-0 p-4">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
        <MapPin className="w-4 h-4 text-amber-600" />
        <span>Location Distribution</span>
      </h3>
      <p className="text-[11px] text-slate-500 mb-3">
        Breakdown across {recordedEventsCount} recorded events for {dogName}
      </p>

      <div className="grid grid-cols-4 gap-2 text-center">
        {LOCATION_TILES.map((tile) => {
          const locationCount = locationCounts[tile.location];
          const locationPercentage =
            recordedEventsCount > 0
              ? Math.round((locationCount / recordedEventsCount) * 100)
              : 0;

          return (
            <div key={tile.location} className={`p-2.5 rounded-2xl ${tile.containerClassName}`}>
              <span className={`text-xs font-bold block ${tile.labelClassName}`}>
                {tile.label}
              </span>
              <span className={`text-base font-extrabold tabular-nums ${tile.valueClassName}`}>
                {locationCount}
              </span>
              <span
                className={`text-[10px] block mt-0.5 tabular-nums ${tile.captionClassName}`}
              >
                {tile.captionOverride ?? `${locationPercentage}%`}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
