import { CircleAlert } from 'lucide-react';

interface StartupFailureNoticeProps {
  failureMessage: string;
}

export function StartupFailureNotice({ failureMessage }: StartupFailureNoticeProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-100/70 px-8 text-center text-slate-900">
      <CircleAlert className="size-10 text-rose-600" />
      <p className="text-base font-bold">Paws &amp; Pots could not open its storage</p>
      <p className="max-w-sm text-sm text-slate-600">{failureMessage}</p>
    </div>
  );
}
