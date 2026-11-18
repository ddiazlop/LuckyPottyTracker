import React from 'react';
import { PottyStatistics } from '@/types';
import { formatClockTime, formatTimeAgo } from '@/utils/stats';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface FeedingPottyCorrelationCardProps {
  dogName: string;
  stats: PottyStatistics;
}

export const FeedingPottyCorrelationCard: React.FC<FeedingPottyCorrelationCardProps> = ({
  dogName,
  stats,
}) => {
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <span className="text-base leading-none">🥣</span>
          <span>Feeding vs. Potty Correlation</span>
        </h3>
        <Badge variant="emerald">{stats.totalMeals} meals recorded</Badge>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">
        Compares meal intake with digestion timing to pinpoint post-meal walk windows
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
          <span className="text-[11px] font-bold text-emerald-900 block mb-0.5">
            Avg Poop Delay After Meal
          </span>
          <p className="text-2xl font-extrabold text-emerald-950 tabular-nums">
            {stats.avgMinutesToPoopAfterMeal ? `${stats.avgMinutesToPoopAfterMeal}m` : '—'}
          </p>
          <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium leading-tight">
            {stats.avgMinutesToPoopAfterMeal
              ? `${dogName} typically eliminates ~${stats.avgMinutesToPoopAfterMeal} mins after eating`
              : 'Needs at least 1 recorded meal & poop pair'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-700 block mb-0.5">
            Daily Feeding Pace
          </span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {stats.avgMealsPerDay}
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium leading-tight">
            meals / day recorded
          </span>
        </div>
      </div>

      {stats.lastMealTimestamp && (
        <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Last meal recorded:</span>
          <strong className="text-slate-900 tabular-nums">
            {formatTimeAgo(stats.lastMealTimestamp)} (at {formatClockTime(stats.lastMealTimestamp)})
          </strong>
        </div>
      )}
    </Card>
  );
};
