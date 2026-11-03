import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { DogProfile, PottyRecord } from '../types';
import { getPottyTrackerStore } from '../storage';
import { DEFAULT_PROFILE } from '../storage/defaults';
import { generateSampleRecords } from '../storage/sampleRecords';
import { haptics } from '../utils/haptics';

export type PottyTrackerStartupState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'failed'; failureMessage: string };

export interface PottyTrackerData {
  startupState: PottyTrackerStartupState;
  dog: DogProfile;
  records: PottyRecord[];
  addRecord: (newRecordData: Omit<PottyRecord, 'id'>) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  clearRecords: () => Promise<void>;
  loadSampleRecords: () => Promise<void>;
  importRecords: (importedRecords: PottyRecord[]) => Promise<boolean>;
  saveProfile: (updatedProfile: DogProfile) => Promise<void>;
}

function describeStartupFailure(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'An unexpected error stopped the app from loading your data.';
}

function createRecordIdentifier(): string {
  return `record-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}

export function usePottyTrackerData(): PottyTrackerData {
  const [store] = useState(getPottyTrackerStore);
  const [startupState, setStartupState] = useState<PottyTrackerStartupState>({ status: 'loading' });
  const [dog, setDog] = useState<DogProfile>(DEFAULT_PROFILE);
  const [records, setRecords] = useState<PottyRecord[]>([]);

  useEffect(() => {
    let isComponentUnmounted = false;

    const openPottyTrackerStore = async () => {
      try {
        await store.initialize();
        const [storedProfile, storedRecords] = await Promise.all([store.loadProfile(), store.loadRecords()]);
        if (isComponentUnmounted) return;

        setDog(storedProfile);
        setRecords(storedRecords);
        setStartupState({ status: 'ready' });
      } catch (error) {
        if (isComponentUnmounted) return;
        setStartupState({ status: 'failed', failureMessage: describeStartupFailure(error) });
      }
    };

    void openPottyTrackerStore();

    return () => {
      isComponentUnmounted = true;
    };
  }, [store]);

  const storeRecord = async (record: PottyRecord): Promise<boolean> => {
    try {
      await store.upsertRecord(record);
    } catch {
      toast.error('Could not save this record to this device.');
      return false;
    }
    setRecords((previousRecords) => [record, ...previousRecords.filter((existingRecord) => existingRecord.id !== record.id)]);
    return true;
  };

  const removeRecord = async (recordId: string): Promise<boolean> => {
    try {
      await store.deleteRecord(recordId);
    } catch {
      toast.error('Could not delete this record from this device.');
      return false;
    }
    setRecords((previousRecords) => previousRecords.filter((existingRecord) => existingRecord.id !== recordId));
    return true;
  };

  const addRecord = async (newRecordData: Omit<PottyRecord, 'id'>) => {
    const newRecord: PottyRecord = {
      ...newRecordData,
      id: createRecordIdentifier(),
    };

    const isSaved = await storeRecord(newRecord);
    if (!isSaved) return;

    const actionLabel =
      newRecord.type === 'meal'
        ? 'Meal / Feeding'
        : newRecord.type === 'both'
        ? 'Pee & Poop'
        : newRecord.type === 'pee'
        ? 'Pee'
        : 'Poop';
    const accidentNote = newRecord.isAccident ? ' (Accident)' : '';

    toast(`Recorded ${actionLabel}${accidentNote}`, {
      description: `Recorded for ${dog.name}`,
      action: {
        label: 'Undo',
        onClick: () => {
          haptics.triggerUndo();
          void removeRecord(newRecord.id);
        },
      },
    });
  };

  const deleteRecord = async (recordId: string) => {
    const target = records.find((existingRecord) => existingRecord.id === recordId);
    const isDeleted = await removeRecord(recordId);
    if (!isDeleted || !target) return;

    toast('Record deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          haptics.triggerUndo();
          void storeRecord(target);
        },
      },
    });
  };

  const clearRecords = async () => {
    try {
      await store.replaceRecords([]);
    } catch {
      toast.error('Could not clear the records on this device.');
      return;
    }
    setRecords([]);
    toast('All records cleared');
  };

  const loadSampleRecords = async () => {
    const sampleRecords = generateSampleRecords(dog.id);
    try {
      await store.replaceRecords(sampleRecords);
    } catch {
      toast.error('Could not save the sample data on this device.');
      return;
    }

    setRecords(sampleRecords);
    haptics.triggerBothFeedback();
    toast.success('Sample data loaded', {
      description: `${sampleRecords.length} realistic events generated`,
    });
  };

  const importRecords = async (importedRecords: PottyRecord[]): Promise<boolean> => {
    try {
      await store.replaceRecords(importedRecords);
    } catch {
      toast.error('Could not save the imported records on this device.');
      return false;
    }

    setRecords(importedRecords);
    return true;
  };

  const saveProfile = async (updatedProfile: DogProfile) => {
    try {
      await store.saveProfile(updatedProfile);
    } catch {
      toast.error('Could not save the profile on this device.');
      return;
    }
    setDog(updatedProfile);
  };

  return {
    startupState,
    dog,
    records,
    addRecord,
    deleteRecord,
    clearRecords,
    loadSampleRecords,
    importRecords,
    saveProfile,
  };
}
