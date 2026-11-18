import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FilterType, HISTORY_FILTERS } from '../constants';

interface HistoryFilterChipsProps {
  selectedFilterType: FilterType;
  onSelectFilterType: (filterType: FilterType) => void;
}

export const HistoryFilterChips: React.FC<HistoryFilterChipsProps> = ({
  selectedFilterType,
  onSelectFilterType,
}) => {
  return (
    <ToggleGroup
      type="single"
      value={selectedFilterType}
      onValueChange={(value) => {
        if (value) onSelectFilterType(value as FilterType);
      }}
      className="w-full justify-start gap-1.5 overflow-x-auto pb-1"
    >
      {HISTORY_FILTERS.map((filter) => (
        <ToggleGroupItem
          key={filter.id}
          value={filter.id}
          className="h-auto shrink-0 whitespace-nowrap rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 data-[state=on]:border-transparent data-[state=on]:bg-amber-600 data-[state=on]:text-white data-[state=on]:shadow-xs"
        >
          {filter.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
