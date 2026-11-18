import React from 'react';
import { Clock, Droplets, ShieldCheck } from 'lucide-react';
import { PottyStatistics } from '@/types';
import { Card } from '@/components/ui/card';

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  caption: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, caption }) => {
  return (
    <Card className="gap-0 rounded-2xl p-3.5 shadow-2xs">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{value}</p>
      <span className="text-[11px] text-slate-500">{caption}</span>
    </Card>
  );
};

interface PottyKpiGridProps {
  stats: PottyStatistics;
  targetIntervalHours: number;
}

export const PottyKpiGrid: React.FC<PottyKpiGridProps> = ({ stats, targetIntervalHours }) => {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <KpiCard
        icon={<Droplets className="w-3.5 h-3.5 text-amber-600" />}
        label="Avg Pees / Day"
        value={String(stats.avgPeesPerDay)}
        caption={`${stats.totalPees} total recorded`}
      />

      <KpiCard
        icon={<span className="text-xs">💩</span>}
        label="Avg Poops / Day"
        value={String(stats.avgPoopsPerDay)}
        caption={`${stats.totalPoops} total recorded`}
      />

      <KpiCard
        icon={<Clock className="w-3.5 h-3.5 text-emerald-600" />}
        label="Avg Hold Time"
        value={`${stats.avgHoldTimeHours}h`}
        caption={`Target: ${targetIntervalHours}h`}
      />

      <KpiCard
        icon={<ShieldCheck className="w-3.5 h-3.5 text-sky-600" />}
        label="Outdoor Success"
        value={`${stats.outdoorSuccessRate}%`}
        caption={
          stats.totalAccidents > 0 ? `${stats.totalAccidents} indoor accidents` : 'Zero accidents!'
        }
      />
    </div>
  );
};
