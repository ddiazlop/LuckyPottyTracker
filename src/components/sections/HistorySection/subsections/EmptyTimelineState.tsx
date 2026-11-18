import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FilterType } from '../constants';

interface EmptyTimelineStateProps {
  selectedFilterType: FilterType;
  onRequestManualRecord: () => void;
}

export const EmptyTimelineState: React.FC<EmptyTimelineStateProps> = ({
  selectedFilterType,
  onRequestManualRecord,
}) => {
  return (
    <Card className="my-4 items-center gap-2 rounded-3xl p-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-1">
        <Calendar className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">No records found</h3>
      <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-2">
        {selectedFilterType === 'all'
          ? 'No potty events recorded yet. Press the big button to record the first one!'
          : `No entries match the "${selectedFilterType}" filter.`}
      </p>
      <Button size="sm" onClick={onRequestManualRecord} className="mt-1">
        Add a Record
      </Button>
    </Card>
  );
};
