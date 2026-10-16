import React, { useState } from 'react';
import {
  Droplets,
  Calendar,
  Trash2,
  Filter,
  Plus,
  MapPin,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { DogProfile, PottyLog, PottyType } from '../types';
import { formatClockTime, formatDateLabel } from '../utils/stats';
import { haptics } from '../utils/haptics';

interface HistorySectionProps {
  dog: DogProfile;
  logs: PottyLog[];
  onDeleteLog: (id: string) => void;
  onOpenRetroModal: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  dog,
  logs,
  onDeleteLog,
  onOpenRetroModal,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'pee' | 'poop' | 'meal' | 'accident'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'pee') return log.type === 'pee' || log.type === 'both';
    if (filterType === 'poop') return log.type === 'poop' || log.type === 'both';
    if (filterType === 'meal') return log.type === 'meal';
    if (filterType === 'accident') return log.isAccident;
    return true;
  });

  // Group by calendar date
  const groupedLogs: { [dateLabel: string]: PottyLog[] } = {};
  filteredLogs.forEach((log) => {
    const label = formatDateLabel(log.timestamp);
    if (!groupedLogs[label]) groupedLogs[label] = [];
    groupedLogs[label].push(log);
  });

  const dateGroups = Object.keys(groupedLogs);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 flex flex-col gap-4">
      {/* Top Header with Filters and Manual Log Action */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">Potty Timeline</h2>
          <p className="text-xs text-slate-500">{filteredLogs.length} events logged</p>
        </div>

        <button
          onClick={() => {
            haptics.triggerTick();
            onOpenRetroModal();
          }}
          className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-slate-800 active:scale-95 transition-transform"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Past Potty</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(
          [
            { id: 'all', label: 'All Entries' },
            { id: 'pee', label: '💧 Pees' },
            { id: 'poop', label: '💩 Poops' },
            { id: 'meal', label: '🥣 Meals' },
            { id: 'accident', label: '⚠️ Accidents' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => {
              haptics.triggerTick();
              setFilterType(item.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === item.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {dateGroups.length === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 my-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No logs found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
            {filterType === 'all'
              ? 'No potty events recorded yet. Press the big button to log the first one!'
              : `No entries match the "${filterType}" filter.`}
          </p>
          <button
            onClick={() => {
              haptics.triggerTick();
              onOpenRetroModal();
            }}
            className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl"
          >
            Add a Log
          </button>
        </div>
      )}

      {/* Grouped Logs List */}
      <div className="space-y-4">
        {dateGroups.map((dateLabel) => (
          <div key={dateLabel} className="space-y-2">
            {/* Date Header with zero-pill unboxed typography */}
            <div className="flex items-center gap-2 px-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <span>{dateLabel}</span>
              <span className="text-slate-300">·</span>
              <span className="font-normal normal-case text-slate-600">
                {groupedLogs[dateLabel].length} event{groupedLogs[dateLabel].length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Event Cards */}
            <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
              {groupedLogs[dateLabel].map((log) => {
                const isPee = log.type === 'pee';
                const isPoop = log.type === 'poop';
                const isBoth = log.type === 'both';
                const isMeal = log.type === 'meal';

                return (
                  <div
                    key={log.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-base ${
                          log.isAccident
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
                        {log.isAccident ? '⚠️' : isBoth ? '💧💩' : isPee ? '💧' : isMeal ? '🥣' : '💩'}
                      </div>

                      {/* Content */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 capitalize">
                            {log.isAccident ? 'Accident · ' : ''}
                            {isBoth ? 'Pee & Poop' : isMeal ? 'Meal / Fed' : log.type}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                            {formatClockTime(log.timestamp)}
                          </span>
                        </div>

                        {/* Metadata line per zero-pill discipline */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                          <span className={`font-semibold ${log.location === 'Indoors' ? 'text-rose-600' : 'text-slate-600'}`}>
                            {log.location}
                          </span>
                          {log.notes && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="italic truncate max-w-[160px] text-slate-500">
                                &quot;{log.notes}&quot;
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={() => {
                        haptics.triggerTick();
                        if (window.confirm('Delete this log entry?')) {
                          onDeleteLog(log.id);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors shrink-0"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
