import type { PottyLocation, PottyRecord } from '../types';

export function generateSampleRecords(dogId: string = 'dog-1'): PottyRecord[] {
  const records: PottyRecord[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

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

      if (entryDate.getTime() > now) continue;

      const isIndoorsAccident = daysAgo === 4 && slot.hour === 15;
      const actualLocation: PottyLocation = isIndoorsAccident ? 'Indoors' : slot.location;

      records.push({
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

  return records.sort((firstRecord, secondRecord) => secondRecord.timestamp - firstRecord.timestamp);
}
