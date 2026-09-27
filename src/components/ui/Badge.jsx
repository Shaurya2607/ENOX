import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    danger: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
    info: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
    purple: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
    outline: 'bg-transparent text-slate-400 border-slate-700',
  };

  const dotColors = {
    default: 'bg-slate-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-blue-400',
    purple: 'bg-indigo-400',
    outline: 'bg-slate-400',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2 py-0.5 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};
