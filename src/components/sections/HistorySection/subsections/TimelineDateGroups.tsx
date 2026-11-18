import React from 'react';
import { Trash2 } from 'lucide-react';
import { PottyRecord } from '@/types';
import { formatClockTime } from '@/utils/stats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TimelineRecordRowProps {
  record: PottyRecord;
  onRequestDeleteRecord: (record: PottyRecord) => void;
}

const readRecordIcon = (record: PottyRecord): string => {
  if (record.isAccident) return '⚠️';
  if (record.type === 'both') return '💧💩';
  if (record.type === 'pee') return '💧';
  if (record.type === 'meal') return '🥣';
  return '💩';
};

const readRecordIconClassName = (record: PottyRecord): string => {
  if (record.isAccident) return 'bg-rose-100 text-rose-700';
  if (record.type === 'both') return 'bg-amber-100 text-amber-800';
  if (record.type === 'pee') return 'bg-amber-50 text-amber-600';
  if (record.type === 'meal') return 'bg-emerald-50 text-emerald-700';
  return 'bg-stone-100 text-stone-800';
};

const readRecordLabel = (record: PottyRecord): string => {
  if (record.type === 'both') return 'Pee & Poop';
  if (record.type === 'meal') return 'Meal / Fed';
  return record.type;
};

const TimelineRecordRow: React.FC<TimelineRecordRowProps> = ({
  record,
  onRequestDeleteRecord,
}) => {
  return (
    <div className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 whitespace-nowrap text-sm ${readRecordIconClassName(
            record
          )}`}
        >
          {readRecordIcon(record)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {record.isAccident && (
              <Badge variant="rose" className="px-1.5 py-0 text-[10px]">
                Accident
              </Badge>
            )}
            <span className="text-xs font-bold text-slate-900 capitalize">
              {readRecordLabel(record)}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
              {formatClockTime(record.timestamp)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 flex-wrap">
            <span
              className={`font-semibold ${
                record.location === 'Indoors' ? 'text-rose-600' : 'text-slate-600'
              }`}
            >
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

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onRequestDeleteRecord(record)}
        className="shrink-0 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
        title="Delete record"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

interface TimelineDateGroup {
  dateLabel: string;
  records: PottyRecord[];
}

interface TimelineDateGroupsProps {
  dateGroups: TimelineDateGroup[];
  onRequestDeleteRecord: (record: PottyRecord) => void;
}

export const TimelineDateGroups: React.FC<TimelineDateGroupsProps> = ({
  dateGroups,
  onRequestDeleteRecord,
}) => {
  return (
    <div className="space-y-4">
      {dateGroups.map(({ dateLabel, records }) => (
        <div key={dateLabel} className="space-y-2">
          <div className="flex items-center gap-2 px-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <span>{dateLabel}</span>
            <span className="text-slate-300">·</span>
            <span className="font-normal normal-case text-slate-600">
              {records.length} event{records.length > 1 ? 's' : ''}
            </span>
          </div>

          <Card className="gap-0 divide-y divide-slate-100 overflow-hidden rounded-3xl p-0 shadow-2xs">
            {records.map((record) => (
              <TimelineRecordRow
                key={record.id}
                record={record}
                onRequestDeleteRecord={onRequestDeleteRecord}
              />
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
};
