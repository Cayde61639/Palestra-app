import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface StyledSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  compact?: boolean;
}

export const StyledSelect = React.forwardRef<HTMLSelectElement, StyledSelectProps>(
  ({ className = '', compact = false, children, ...props }, ref) => {
    const isFullWidth = className.includes('w-full');

    return (
      <div className={`relative ${isFullWidth ? 'w-full' : 'inline-block'}`}>
        <select
          ref={ref}
          className={`appearance-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-slate-100 ${className} ${
            compact ? '!pr-6' : '!pr-8'
          }`}
          {...props}
        >
          {children}
        </select>
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 flex items-center ${
            compact ? 'pr-1.5' : 'pr-2.5'
          } text-sky-400`}
        >
          <ChevronDown
            className={
              compact
                ? 'w-3 h-3 stroke-[2.5]'
                : 'w-3.5 h-3.5 stroke-[2.5]'
            }
          />
        </div>
      </div>
    );
  }
);

StyledSelect.displayName = 'StyledSelect';
