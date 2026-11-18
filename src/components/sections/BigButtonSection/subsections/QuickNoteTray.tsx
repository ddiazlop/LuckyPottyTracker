import React from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { haptics } from '@/utils/haptics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface QuickNoteTrayProps {
  isOpen: boolean;
  noteText: string;
  onOpenChange: (isOpen: boolean) => void;
  onNoteTextChange: (noteText: string) => void;
}

export const QuickNoteTray: React.FC<QuickNoteTrayProps> = ({
  isOpen,
  noteText,
  onOpenChange,
  onNoteTextChange,
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card className="gap-0 overflow-hidden rounded-2xl p-0">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            onClick={() => haptics.triggerTick()}
            className="h-auto w-full justify-between rounded-none px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Add Note {noteText ? `("${noteText}")` : '(Optional)'}</span>
            </span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          <div className="px-4 pb-4 pt-2 border-t border-slate-100">
            <Input
              type="text"
              value={noteText}
              onChange={(event) => onNoteTextChange(event.target.value)}
              placeholder="e.g. right after meal, sudden urge"
              className="text-xs"
            />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
