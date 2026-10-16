import { DogProfile, PottyLog, PottyLocation } from '../types';

export const DEFAULT_AVATAR = '/src/assets/images/dog_mascot_avatar_1792141800760.jpg';

export const DEFAULT_PROFILE: DogProfile = {
  id: 'dog-1',
  name: 'Lucky',
  breed: 'Golden Retriever',
  isPuppy: false,
  avatarUrl: DEFAULT_AVATAR,
  targetIntervalHours: 4,
};

const LOGS_STORAGE_KEY = 'pawspot_logs_v2';
const PROFILE_STORAGE_KEY = 'pawspot_profile_v2';

export function getStoredProfile(): DogProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    if (parsed.name === 'Buster') {
      parsed.name = 'Lucky';
      saveProfile(parsed);
    }
    return parsed;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: DogProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

// Generate realistic historical sample data for the past 5 days with Lucky's exact locations
export function generateSampleLogs(dogId: string = 'dog-1'): PottyLog[] {
  const logs: PottyLog[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Daily routine schedule for Lucky:
  // 07:00 AM - Breakfast Meal
  // 07:35 AM - Morning Walk (Pee + Poop - ~35 min post-meal)
  // 11:30 AM - Midday Terrace (Pee)
  // 15:30 PM - Afternoon Park Outing (Pee)
  // 18:00 PM - Dinner Meal
  // 18:45 PM - Evening Walk (Pee + Poop - ~45 min post-meal)
  // 22:30 PM - Bedtime Terrace (Pee)
  const schedule: { hour: number; minute: number; type: 'pee' | 'poop' | 'both' | 'meal'; location: PottyLocation }[] = [
    { hour: 7, minute: 0, type: 'meal', location: 'Indoors' },
    { hour: 7, minute: 35, type: 'both', location: 'Walk' },
    { hour: 11, minute: 40, type: 'pee', location: 'Terrace' },
    { hour: 15, minute: 20, type: 'pee', location: 'Park' },
    { hour: 18, minute: 0, type: 'meal', location: 'Indoors' },
    { hour: 18, minute: 45, type: 'both', location: 'Walk' },
    { hour: 22, minute: 15, type: 'pee', location: 'Terrace' },
  ];

  for (let daysAgo = 5; daysAgo >= 0; daysAgo--) {
    const targetDate = new Date(now - daysAgo * dayMs);

    for (const slot of schedule) {
      const entryDate = new Date(targetDate);
      entryDate.setHours(slot.hour, slot.minute + Math.floor(Math.random() * 25 - 12), 0, 0);

      // Don't add future logs for today
      if (entryDate.getTime() > now) continue;

      // Occasional minor accident indoors on day 4
      const isIndoorsAccident = daysAgo === 4 && slot.hour === 15;
      const actualLocation: PottyLocation = isIndoorsAccident ? 'Indoors' : slot.location;

      logs.push({
        id: `sample-${daysAgo}-${slot.hour}-${Math.random().toString(36).substring(2, 7)}`,
        dogId,
        type: slot.type,
        timestamp: entryDate.getTime(),
        isAccident: slot.type !== 'meal' && actualLocation === 'Indoors',
        location: actualLocation,
        notes: isIndoorsAccident ? 'Indoors accident while excited by doorbell' : slot.type === 'meal' ? (slot.hour < 12 ? 'Morning kibble' : 'Evening dinner') : undefined,
      });
    }
  }

  // Sort newest first
  return logs.sort((a, b) => b.timestamp - a.timestamp);
}

export function getStoredLogs(): PottyLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) {
      const initial = generateSampleLogs();
      saveLogs(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Ensure backwards compatibility and mapping of location names
    return parsed.map((item: any) => ({
      ...item,
      location: (item.location === 'walk' ? 'Walk' : item.location === 'park' ? 'Park' : item.location === 'indoors' || item.isAccident ? 'Indoors' : item.location || 'Walk') as PottyLocation,
      isAccident: item.type !== 'meal' && (item.location === 'indoors' || item.location === 'Indoors' || item.isAccident),
    }));
  } catch {
    return [];
  }
}

export function saveLogs(logs: PottyLog[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
}
