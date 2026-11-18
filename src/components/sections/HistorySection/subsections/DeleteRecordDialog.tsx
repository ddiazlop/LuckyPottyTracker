import React from 'react';
import { PottyRecord } from '@/types';
import { formatClockTime, formatDateLabel } from '@/utils/stats';
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

interface DeleteRecordDialogProps {
  pendingDeleteRecord: PottyRecord | null;
  onConfirmDelete: (record: PottyRecord) => void;
  onDismiss: () => void;
}

const readRecordLabel = (record: PottyRecord): string => {
  if (record.type === 'both') return 'Pee & Poop';
  return record.type;
};

export const DeleteRecordDialog: React.FC<DeleteRecordDialogProps> = ({
  pendingDeleteRecord,
  onConfirmDelete,
  onDismiss,
}) => {
  return (
    <AlertDialog
      open={!!pendingDeleteRecord}
      onOpenChange={(isOpen) => {
        if (!isOpen) onDismiss();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this record?</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingDeleteRecord
              ? `${readRecordLabel(pendingDeleteRecord)} recorded at ${formatClockTime(
                  pendingDeleteRecord.timestamp
                )} on ${formatDateLabel(pendingDeleteRecord.timestamp)}.`
              : ''}{' '}
            You can undo this right after deleting.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (pendingDeleteRecord) onConfirmDelete(pendingDeleteRecord);
            }}
          >
            Delete Record
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
