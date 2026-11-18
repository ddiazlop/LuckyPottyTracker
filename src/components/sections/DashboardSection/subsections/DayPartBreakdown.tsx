import React from 'react';
import { Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import { PottyStatistics } from '@/types';

interface DayPartBreakdownProps {
  timeOfDayBuckets: PottyStatistics['timeOfDayBuckets'];
}

const DAY_PART_TILES: {
  bucketKey: keyof PottyStatistics['timeOfDayBuckets'];
  label: string;
  icon: React.ElementType;
  iconClassName: string;
}[] = [
  { bucketKey: 'morning', label: 'Morning', icon: Sunrise, iconClassName: 'text-amber-500' },
  { bucketKey: 'afternoon', label: 'Afternoon', icon: Sun, iconClassName: 'text-amber-600' },
  { bucketKey: 'evening', label: 'Evening', icon: Sunset, iconClassName: 'text-orange-600' },
  { bucketKey: 'night', label: 'Night', icon: Moon, iconClassName: 'text-indigo-500' },
];

export const DayPartBreakdown: React.FC<DayPartBreakdownProps> = ({ timeOfDayBuckets }) => {
  const totalTimeOfDay =
    timeOfDayBuckets.morning +
    timeOfDayBuckets.afternoon +
    timeOfDayBuckets.evening +
    timeOfDayBuckets.night;

  return (
    <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100">
      {DAY_PART_TILES.map(({ bucketKey, label, icon: DayPartIcon, iconClassName }) => {
        const bucketCount = timeOfDayBuckets[bucketKey];
        const bucketPercentage =
          totalTimeOfDay > 0 ? Math.round((bucketCount / totalTimeOfDay) * 100) : 0;

        return (
          <div key={bucketKey} className="text-center p-2 rounded-xl bg-slate-50">
            <DayPartIcon className={`w-4 h-4 mx-auto mb-1 ${iconClassName}`} />
            <span className="text-[11px] font-medium text-slate-500 block">{label}</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">{bucketCount}</span>
            <span className="text-[10px] text-slate-600 block tabular-nums">
              {bucketPercentage}%
            </span>
          </div>
        );
      })}
    </div>
  );
};
