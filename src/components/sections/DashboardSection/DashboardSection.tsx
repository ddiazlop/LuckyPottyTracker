import React, { useState } from 'react';
import { DogProfile, PottyLocation, PottyRecord } from '@/types';
import { calculateStatistics, getDailyTrendsLast7Days } from '@/utils/stats';
import { MetricTab } from './constants';
import { FeedingPottyCorrelationCard } from './subsections/FeedingPottyCorrelationCard';
import { LocationDistributionCard } from './subsections/LocationDistributionCard';
import { PottyKpiGrid } from './subsections/PottyKpiGrid';
import { TimeOfDayDistributionCard } from './subsections/TimeOfDayDistributionCard';
import { WeeklyActivityChartCard } from './subsections/WeeklyActivityChartCard';

interface DashboardSectionProps {
  dog: DogProfile;
  records: PottyRecord[];
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ dog, records }) => {
  const [selectedMetricTab, setSelectedMetricTab] = useState<MetricTab>('all');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const stats = calculateStatistics(records, dog.targetIntervalHours);
  const dailyTrends = getDailyTrendsLast7Days(records);

  const locationCounts: Record<PottyLocation, number> = {
    Walk: records.filter((record) => record.location === 'Walk').length,
    Terrace: records.filter((record) => record.location === 'Terrace').length,
    Park: records.filter((record) => record.location === 'Park').length,
    Indoors: records.filter((record) => record.location === 'Indoors' || record.isAccident).length,
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 flex flex-col gap-4">
      <FeedingPottyCorrelationCard dogName={dog.name} stats={stats} />

      <WeeklyActivityChartCard dailyTrends={dailyTrends} />

      <PottyKpiGrid stats={stats} targetIntervalHours={dog.targetIntervalHours} />

      <TimeOfDayDistributionCard
        stats={stats}
        selectedMetricTab={selectedMetricTab}
        onSelectMetricTab={setSelectedMetricTab}
        selectedHour={selectedHour}
        onSelectHour={setSelectedHour}
      />

      <LocationDistributionCard
        dogName={dog.name}
        recordedEventsCount={records.length}
        locationCounts={locationCounts}
      />
    </div>
  );
};
