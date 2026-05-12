import { Loader2 } from 'lucide-react';

export default function Loader({ text = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      <p className="text-sm text-ink-500">{text}</p>
    </div>
  );
}
