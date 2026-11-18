import React from 'react';
import { TrendingUp } from 'lucide-react';
import { PottyStatistics } from '@/types';
import { haptics } from '@/utils/haptics';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { METRIC_TABS, MetricTab } from '../constants';
import { DayPartBreakdown } from './DayPartBreakdown';
import { HourlyHistogram } from './HourlyHistogram';

interface TimeOfDayDistributionCardProps {
  stats: PottyStatistics;
  selectedMetricTab: MetricTab;
  onSelectMetricTab: (metricTab: MetricTab) => void;
  selectedHour: number | null;
  onSelectHour: (selectedHour: number | null) => void;
}

export const TimeOfDayDistributionCard: React.FC<TimeOfDayDistributionCardProps> = ({
  stats,
  selectedMetricTab,
  onSelectMetricTab,
  selectedHour,
  onSelectHour,
}) => {
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Time of Day Frequency</span>
          </h3>
          <p className="text-[11px] text-slate-500">Compare potty hours with feeding times</p>
        </div>

        <Tabs
          value={selectedMetricTab}
          onValueChange={(value) => onSelectMetricTab(value as MetricTab)}
        >
          <TabsList className="p-0.5">
            {METRIC_TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onClick={() => haptics.triggerTick()}
                className="px-2 py-1"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <HourlyHistogram
        timeOfDayData={stats.timeOfDayData}
        selectedMetricTab={selectedMetricTab}
        selectedHour={selectedHour}
        onSelectHour={onSelectHour}
      />

      <DayPartBreakdown timeOfDayBuckets={stats.timeOfDayBuckets} />
    </Card>
  );
};
