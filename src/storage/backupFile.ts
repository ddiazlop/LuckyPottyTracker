import type { DogProfile, PottyRecord } from '../types';

export const CURRENT_BACKUP_SCHEMA_VERSION = 1;

export interface BackupFile {
  schemaVersion: number;
  exportedAt: string;
  profile: DogProfile;
  logs: PottyRecord[];
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
