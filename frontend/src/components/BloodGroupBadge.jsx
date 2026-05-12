import { bgLabel } from '../utils/bloodGroup.js';

export default function BloodGroupBadge({ group, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-2xl',
  };
  return (
    <div
      className={`${sizes[size]} ${className}
        flex items-center justify-center rounded-full font-bold
        bg-gradient-to-br from-brand-50 to-brand-100
        text-brand-700 ring-2 ring-brand-200`}
    >
      {bgLabel(group)}
    </div>
  );
}
