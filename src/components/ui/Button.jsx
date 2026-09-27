import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  iconPosition = 'left',
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-enox-bg disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 shadow-sm focus:ring-indigo-500',
    secondary: 'bg-enox-card hover:bg-enox-cardHover text-slate-200 border border-enox-border hover:border-enox-borderLight focus:ring-slate-400',
    danger: 'bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 border border-rose-700/60 focus:ring-rose-500',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent focus:ring-slate-400',
    outline: 'bg-transparent text-slate-200 border border-slate-700 hover:bg-slate-800/40 hover:border-slate-600 focus:ring-slate-400',
    subtle: 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-transparent focus:ring-slate-500',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs gap-1.5',
    sm: 'px-2.5 py-1.5 text-xs gap-1.5 font-medium',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
};
