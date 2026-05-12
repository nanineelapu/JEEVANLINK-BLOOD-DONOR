import { Droplet } from 'lucide-react';
import { bgLabel, BLOOD_GROUPS } from '../utils/bloodGroup.js';

function colorFor(units) {
  if (units === 0) return { ring: 'ring-brand-300', text: 'text-brand-700', bg: 'bg-brand-50', label: 'Empty' };
  if (units < 5) return { ring: 'ring-warn-500/40', text: 'text-warn-600', bg: 'bg-amber-50', label: 'Low' };
  return { ring: 'ring-success-500/40', text: 'text-success-700', bg: 'bg-green-50', label: 'Good' };
}

export default function InventoryGrid({ inventory = [], onClickItem }) {
  const map = Object.fromEntries(inventory.map((i) => [i.bloodGroup, i]));
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {BLOOD_GROUPS.map((bg) => {
        const item = map[bg.value] || { unitsAvailable: 0, bloodGroup: bg.value };
        const c = colorFor(item.unitsAvailable);
        return (
          <button
            key={bg.value}
            type="button"
            onClick={() => onClickItem && onClickItem(item)}
            className={`card p-5 text-left hover:shadow-elev transition-shadow ring-1 ${c.ring} group`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`chip ${c.bg} ${c.text}`}>
                <Droplet className="h-3 w-3" fill="currentColor" />
                {c.label}
              </span>
              <span className="text-xs font-semibold text-ink-400">{bgLabel(bg.value)}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-extrabold ${c.text}`}>{item.unitsAvailable}</span>
              <span className="text-xs font-medium text-ink-500">units</span>
            </div>
            <p className="mt-1 text-xs text-ink-500">Blood group {bgLabel(bg.value)}</p>
          </button>
        );
      })}
    </div>
  );
}
