import { PawPrint } from 'lucide-react';

export function StartupLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100/70 text-slate-900">
      <div className="flex size-16 animate-pulse items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/30">
        <PawPrint className="size-8" />
      </div>
      <p className="text-sm font-semibold text-slate-600">Loading the potty record…</p>
    </div>
  );
}
