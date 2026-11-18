export type MetricTab = 'all' | 'pee' | 'poop' | 'meal';

export const METRIC_TABS: { id: MetricTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pee', label: 'Pee' },
  { id: 'poop', label: 'Poop' },
  { id: 'meal', label: 'Meal' },
];
