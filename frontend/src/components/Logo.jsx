import { Droplet } from 'lucide-react';

export default function Logo({ className = '', textClass = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-brand-600 rounded-lg blur-md opacity-30" />
        <div className="relative bg-gradient-to-br from-brand-500 to-brand-700 p-2 rounded-lg shadow-sm">
          <Droplet className="h-5 w-5 text-white" fill="white" />
        </div>
      </div>
      <span className={`font-extrabold tracking-tight text-ink-900 ${textClass}`}>
        JEEVANLINK
      </span>
    </div>
  );
}
