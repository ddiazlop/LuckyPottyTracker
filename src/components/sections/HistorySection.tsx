import React, { useState } from 'react';
import {
  Calendar,
  Trash2,
  Plus,
} from 'lucide-react';
import { DogProfile, PottyRecord } from '../../types';
import { formatClockTime, formatDateLabel } from '../../utils/stats';
import { haptics } from '../../utils/haptics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface HistorySectionProps {
  dog: DogProfile;
  records: PottyRecord[];
  onDeleteRecord: (id: string) => void;
  onOpenRetroModal: () => void;
}

type FilterType = 'all' | 'pee' | 'poop' | 'meal' | 'accident';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Entries' },
  { id: 'pee', label: '💧 Pees' },
  { id: 'poop', label: '💩 Poops' },
  { id: 'meal', label: '🥣 Meals' },
  { id: 'accident', label: '⚠️ Accidents' },
];

export const HistorySection: React.FC<HistorySectionProps> = ({
  dog,
  records,
  onDeleteRecord,
  onOpenRetroModal,
}) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [pendingDelete, setPendingDelete] = useState<PottyRecord | null>(null);

  const filteredRecords = records.filter((record) => {
    if (filterType === 'pee') return record.type === 'pee' || record.type === 'both';
    if (filterType === 'poop') return record.type === 'poop' || record.type === 'both';
    if (filterType === 'meal') return record.type === 'meal';
    if (filterType === 'accident') return record.isAccident;
    return true;
  });

  // Group by calendar date
  const groupedRecords: { [dateLabel: string]: PottyRecord[] } = {};
  filteredRecords.forEach((record) => {
    const label = formatDateLabel(record.timestamp);
    if (!groupedRecords[label]) groupedRecords[label] = [];
    groupedRecords[label].push(record);
  });

  const dateGroups = Object.keys(groupedRecords);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 flex flex-col gap-4">
      {/* Top Header with Filters and Manual Record Action */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">Potty Timeline</h2>
          <p className="text-xs text-slate-500">{filteredRecords.length} events recorded</p>
        </div>

        <Button
          variant="dark"
          size="sm"
          onClick={() => {
            haptics.triggerTick();
            onOpenRetroModal();
          }}
          className="rounded-xl"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Past Potty</span>
        </Button>
      </div>

      {/* Filter Chips */}
      <ToggleGroup
        type="single"
        value={filterType}
        onValueChange={(value) => {
          if (!value) return;
          haptics.triggerTick();
          setFilterType(value as FilterType);
        }}
        className="w-full justify-start gap-1.5 overflow-x-auto pb-1"
      >
        {FILTERS.map((item) => (
          <ToggleGroupItem
            key={item.id}
            value={item.id}
            className="h-auto shrink-0 whitespace-nowrap rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 data-[state=on]:border-transparent data-[state=on]:bg-amber-600 data-[state=on]:text-white data-[state=on]:shadow-xs"
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* Empty State */}
      {dateGroups.length === 0 && (
        <Card className="my-4 items-center gap-2 rounded-3xl p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-1">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No records found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-2">
            {filterType === 'all'
              ? 'No potty events recorded yet. Press the big button to record the first one!'
              : `No entries match the "${filterType}" filter.`}
          </p>
          <Button
            size="sm"
            onClick={() => {
              haptics.triggerTick();
              onOpenRetroModal();
            }}
            className="mt-1"
          >
            Add a Record
          </Button>
        </Card>
      )}

      {/* Grouped Records List */}
      <div className="space-y-4">
        {dateGroups.map((dateLabel) => (
          <div key={dateLabel} className="space-y-2">
            {/* Date Header with zero-pill unboxed typography */}
            <div className="flex items-center gap-2 px-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <span>{dateLabel}</span>
              <span className="text-slate-300">·</span>
              <span className="font-normal normal-case text-slate-600">
                {groupedRecords[dateLabel].length} event{groupedRecords[dateLabel].length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Event Cards */}
            <Card className="gap-0 divide-y divide-slate-100 overflow-hidden rounded-3xl p-0 shadow-2xs">
              {groupedRecords[dateLabel].map((record) => {
                const isPee = record.type === 'pee';
                const isBoth = record.type === 'both';
                const isMeal = record.type === 'meal';

                return (
                  <div
                    key={record.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 whitespace-nowrap text-sm ${
                          record.isAccident
                            ? 'bg-rose-100 text-rose-700'
                            : isBoth
                            ? 'bg-amber-100 text-amber-800'
                            : isPee
                            ? 'bg-amber-50 text-amber-600'
                            : isMeal
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {record.isAccident ? '⚠️' : isBoth ? '💧💩' : isPee ? '💧' : isMeal ? '🥣' : '💩'}
                      </div>

                      {/* Content */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {record.isAccident && (
                            <Badge variant="rose" className="px-1.5 py-0 text-[10px]">
                              Accident
                            </Badge>
                          )}
                          <span className="text-xs font-bold text-slate-900 capitalize">
                            {isBoth ? 'Pee & Poop' : isMeal ? 'Meal / Fed' : record.type}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                            {formatClockTime(record.timestamp)}
                          </span>
                        </div>

                        {/* Metadata line per zero-pill discipline */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                          <span className={`font-semibold ${record.location === 'Indoors' ? 'text-rose-600' : 'text-slate-600'}`}>
                            {record.location}
                          </span>
                          {record.notes && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="italic truncate max-w-[160px] text-slate-500">
                                &quot;{record.notes}&quot;
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete action */}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        haptics.triggerTick();
                        setPendingDelete(record);
                      }}
                      className="shrink-0 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </Card>
          </div>
        ))}
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.type === 'both' ? 'Pee & Poop' : pendingDelete.type} recorded at ${formatClockTime(pendingDelete.timestamp)} on ${formatDateLabel(pendingDelete.timestamp)}.`
                : ''}{' '}
              You can undo this right after deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                haptics.triggerTick();
                if (pendingDelete) onDeleteRecord(pendingDelete.id);
              }}
            >
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
