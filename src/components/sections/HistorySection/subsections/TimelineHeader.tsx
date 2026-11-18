import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineHeaderProps {
  recordedEventsCount: number;
  onRequestManualRecord: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  recordedEventsCount,
  onRequestManualRecord,
}) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <h2 className="text-base font-bold text-slate-900">Potty Timeline</h2>
        <p className="text-xs text-slate-500">{recordedEventsCount} events recorded</p>
      </div>

      <Button
        variant="dark"
        size="sm"
        onClick={onRequestManualRecord}
        className="rounded-xl"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Record Past Potty</span>
      </Button>
    </div>
  );
};
