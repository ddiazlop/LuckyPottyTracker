import { PottyLocation } from '@/types';

interface PottyLocationOption {
  id: PottyLocation;
  label: string;
  icon: string;
}

export const POTTY_LOCATION_OPTIONS: PottyLocationOption[] = [
  { id: 'Walk', label: 'Walk', icon: '🚶' },
  { id: 'Terrace', label: 'Terrace', icon: '🪴' },
  { id: 'Park', label: 'Park', icon: '🌳' },
  { id: 'Indoors', label: 'Indoors', icon: '🏠' },
];

interface TimeOffsetOption {
  label: string;
  offsetMinutes: number;
}

export const TIME_OFFSET_OPTIONS: TimeOffsetOption[] = [
  { label: 'Now', offsetMinutes: 0 },
  { label: '-5m', offsetMinutes: 5 },
  { label: '-15m', offsetMinutes: 15 },
  { label: '-30m', offsetMinutes: 30 },
];
