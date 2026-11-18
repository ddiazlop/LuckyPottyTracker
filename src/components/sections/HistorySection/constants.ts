export type FilterType = 'all' | 'pee' | 'poop' | 'meal' | 'accident';

export const HISTORY_FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Entries' },
  { id: 'pee', label: '💧 Pees' },
  { id: 'poop', label: '💩 Poops' },
  { id: 'meal', label: '🥣 Meals' },
  { id: 'accident', label: '⚠️ Accidents' },
];
