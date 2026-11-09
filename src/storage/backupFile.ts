import type { DogProfile, PottyRecord } from '../types';
import { normalizeStoredProfile, normalizeStoredRecords } from './legacyNormalization';

export const CURRENT_BACKUP_SCHEMA_VERSION = 1;

export interface BackupFile {
  schemaVersion: number;
  exportedAt: string;
  profile: DogProfile;
  logs: PottyRecord[];
}

export interface ParsedBackupFile {
  profile: DogProfile | null;
  logs: PottyRecord[];
}

export class BackupFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupFileError';
  }
}

export function createBackupFile(profile: DogProfile, logs: PottyRecord[]): BackupFile {
  return {
    schemaVersion: CURRENT_BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    logs,
  };
}

export function serializeBackupFile(backupFile: BackupFile): string {
  return JSON.stringify(backupFile, null, 2);
}

export function parseBackupFile(rawFileText: string): ParsedBackupFile {
  const decodedFileContents = decodeJsonFileText(rawFileText);

  if (Array.isArray(decodedFileContents)) {
    return { profile: null, logs: parseRecordLogs(decodedFileContents) };
  }

  if (!isPlainObject(decodedFileContents)) {
    throw new BackupFileError('This file is neither a Paws & Pots backup nor an exported record list.');
  }

  return parseVersionedBackup(decodedFileContents);
}

function decodeJsonFileText(rawFileText: string): unknown {
  try {
    return JSON.parse(rawFileText);
  } catch {
    throw new BackupFileError('This file is not valid JSON.');
  }
}

function parseVersionedBackup(decodedBackupFile: Record<string, unknown>): ParsedBackupFile {
  const schemaVersion = decodedBackupFile.schemaVersion;

  if (typeof schemaVersion !== 'number' || !Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new BackupFileError('This file has no usable backup version.');
  }

  if (schemaVersion > CURRENT_BACKUP_SCHEMA_VERSION) {
    throw new BackupFileError('This backup was created by a newer version of Paws & Pots.');
  }

  if (!isPlainObject(decodedBackupFile.profile)) {
    throw new BackupFileError('This backup is missing the dog profile.');
  }

  return {
    profile: normalizeStoredProfile(decodedBackupFile.profile),
    logs: parseRecordLogs(decodedBackupFile.logs),
  };
}

function parseRecordLogs(decodedLogs: unknown): PottyRecord[] {
  if (!Array.isArray(decodedLogs)) {
    throw new BackupFileError('This backup is missing its record list.');
  }

  const hasUnrestorableRecord = decodedLogs.some((recordCandidate) => !isPottyRecordCandidate(recordCandidate));

  if (hasUnrestorableRecord) {
    throw new BackupFileError('This backup contains a record that cannot be restored.');
  }

  return normalizeStoredRecords(decodedLogs).sort(
    (laterRecord, earlierRecord) => earlierRecord.timestamp - laterRecord.timestamp
  );
}

function isPottyRecordCandidate(recordCandidate: unknown): boolean {
  if (!isPlainObject(recordCandidate)) return false;

  const { id, timestamp, type } = recordCandidate;
  const isKnownPottyType = type === 'pee' || type === 'poop' || type === 'both' || type === 'meal';

  return (
    typeof id === 'string' &&
    id.length > 0 &&
    typeof timestamp === 'number' &&
    Number.isFinite(timestamp) &&
    isKnownPottyType
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
