import React, { useState } from 'react';
import { DogProfile, PottyRecord } from '@/types';
import { formatDateLabel } from '@/utils/stats';
import { haptics } from '@/utils/haptics';
import { FilterType } from './constants';
import { DeleteRecordDialog } from './subsections/DeleteRecordDialog';
import { EmptyTimelineState } from './subsections/EmptyTimelineState';
import { HistoryFilterChips } from './subsections/HistoryFilterChips';
import { TimelineDateGroups } from './subsections/TimelineDateGroups';
import { TimelineHeader } from './subsections/TimelineHeader';

interface HistorySectionProps {
  dog: DogProfile;
  records: PottyRecord[];
  onDeleteRecord: (id: string) => void;
  onOpenRetroModal: () => void;
}

const filterRecordsByType = (records: PottyRecord[], filterType: FilterType): PottyRecord[] => {
  if (filterType === 'pee') return records.filter((record) => record.type === 'pee' || record.type === 'both');
  if (filterType === 'poop') return records.filter((record) => record.type === 'poop' || record.type === 'both');
  if (filterType === 'meal') return records.filter((record) => record.type === 'meal');
  if (filterType === 'accident') return records.filter((record) => record.isAccident);
  return records;
};

const groupRecordsByDateLabel = (records: PottyRecord[]) => {
  const recordsByDateLabel = records.reduce<Record<string, PottyRecord[]>>((groups, record) => {
    const dateLabel = formatDateLabel(record.timestamp);
    groups[dateLabel] = groups[dateLabel] ? [...groups[dateLabel], record] : [record];
    return groups;
  }, {});

  return Object.entries(recordsByDateLabel).map(([dateLabel, groupedRecords]) => ({
    dateLabel,
    records: groupedRecords,
  }));
};

export const HistorySection: React.FC<HistorySectionProps> = ({
  dog,
  records,
  onDeleteRecord,
  onOpenRetroModal,
}) => {
  const [selectedFilterType, setSelectedFilterType] = useState<FilterType>('all');
  const [pendingDeleteRecord, setPendingDeleteRecord] = useState<PottyRecord | null>(null);

  const filteredRecords = filterRecordsByType(records, selectedFilterType);
  const dateGroups = groupRecordsByDateLabel(filteredRecords);

  const handleRequestManualRecord = () => {
    haptics.triggerTick();
    onOpenRetroModal();
  };

  const handleSelectFilterType = (filterType: FilterType) => {
    haptics.triggerTick();
    setSelectedFilterType(filterType);
  };

  const handleRequestDeleteRecord = (record: PottyRecord) => {
    haptics.triggerTick();
    setPendingDeleteRecord(record);
  };

  const handleConfirmDeleteRecord = (record: PottyRecord) => {
    haptics.triggerTick();
    onDeleteRecord(record.id);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 flex flex-col gap-4">
      <TimelineHeader
        recordedEventsCount={filteredRecords.length}
        onRequestManualRecord={handleRequestManualRecord}
      />

      <HistoryFilterChips
        selectedFilterType={selectedFilterType}
        onSelectFilterType={handleSelectFilterType}
      />

      {dateGroups.length === 0 && (
        <EmptyTimelineState
          selectedFilterType={selectedFilterType}
          onRequestManualRecord={handleRequestManualRecord}
        />
      )}

      <TimelineDateGroups
        dateGroups={dateGroups}
        onRequestDeleteRecord={handleRequestDeleteRecord}
      />

      <DeleteRecordDialog
        pendingDeleteRecord={pendingDeleteRecord}
        onConfirmDelete={handleConfirmDeleteRecord}
        onDismiss={() => setPendingDeleteRecord(null)}
      />
    </div>
  );
};
