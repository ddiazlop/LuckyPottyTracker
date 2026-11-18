import React from 'react';
import { TimeOfDayDistribution } from '@/types';
import { haptics } from '@/utils/haptics';
import { Alert } from '@/components/ui/alert';
import { MetricTab } from '../constants';

interface HourlyHistogramProps {
  timeOfDayData: TimeOfDayDistribution[];
  selectedMetricTab: MetricTab;
  selectedHour: number | null;
  onSelectHour: (selectedHour: number | null) => void;
}

const readMetricCount = (
  hourData: TimeOfDayDistribution,
  selectedMetricTab: MetricTab
): number => {
  if (selectedMetricTab === 'pee') return hourData.peecount;
  if (selectedMetricTab === 'poop') return hourData.poopcount;
  if (selectedMetricTab === 'meal') return hourData.mealcount;
  return hourData.total;
};

const readBarClassName = (
  count: number,
  isSelected: boolean,
  selectedMetricTab: MetricTab
): string => {
  if (isSelected) return 'bg-amber-600 ring-2 ring-amber-400';
  if (count === 0) return 'bg-slate-100 hover:bg-slate-200';
  if (selectedMetricTab === 'meal') return 'bg-emerald-600 hover:bg-emerald-700';
  if (selectedMetricTab === 'poop') return 'bg-stone-700 hover:bg-stone-800';
  return 'bg-amber-500 hover:bg-amber-600';
};

export const HourlyHistogram: React.FC<HourlyHistogramProps> = ({
  timeOfDayData,
  selectedMetricTab,
  selectedHour,
  onSelectHour,
}) => {
  const maximumHourlyCount = Math.max(
    1,
    ...timeOfDayData.map((hourData) => readMetricCount(hourData, selectedMetricTab))
  );

  const selectedHourData = selectedHour !== null ? timeOfDayData[selectedHour] : null;

  return (
    <div className="pt-2">
      <div className="h-32 flex items-end gap-1 px-1 border-b border-slate-200">
        {timeOfDayData.map((hourData) => {
          const count = readMetricCount(hourData, selectedMetricTab);
          const heightPercentage =
            count > 0 ? Math.max(12, Math.round((count / maximumHourlyCount) * 100)) : 4;
          const isSelected = selectedHour === hourData.hour;

          return (
            <button
              key={hourData.hour}
              onClick={() => {
                haptics.triggerTick();
                onSelectHour(isSelected ? null : hourData.hour);
              }}
              title={`${hourData.label}: ${hourData.peecount} pees, ${hourData.poopcount} poops, ${hourData.mealcount} meals`}
              className="flex-1 flex flex-col items-center justify-end h-full group focus:outline-hidden"
            >
              <div
                style={{ height: `${heightPercentage}%` }}
                className={`w-full rounded-t-sm transition-all duration-200 ${readBarClassName(
                  count,
                  isSelected,
                  selectedMetricTab
                )}`}
              />
            </button>
          );
        })}
      </div>

      <div className="flex justify-between text-[10px] text-slate-600 pt-1.5 px-0.5 tabular-nums font-medium">
        <span>12 AM</span>
        <span>3 AM</span>
        <span>6 AM</span>
        <span>9 AM</span>
        <span>12 PM</span>
        <span>3 PM</span>
        <span>6 PM</span>
        <span>9 PM</span>
      </div>

      {selectedHourData && (
        <Alert className="mt-3 justify-between border-amber-200/80 bg-amber-50 text-amber-950">
          <span className="font-bold">{selectedHourData.label} window</span>
          <span className="flex items-center gap-2.5 text-amber-900 font-semibold tabular-nums text-[11px]">
            <span>💧 {selectedHourData.peecount} pees</span>
            <span>💩 {selectedHourData.poopcount} poops</span>
            <span>🥣 {selectedHourData.mealcount} meals</span>
          </span>
        </Alert>
      )}
    </div>
  );
};
