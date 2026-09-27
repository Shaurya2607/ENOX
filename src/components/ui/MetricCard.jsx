import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  status = 'normal',
  loading = false,
  onClick,
}) => {
  const [displayValue, setDisplayValue] = useState(
    typeof value === 'number' ? 0 : value
  );

  useEffect(() => {
    if (typeof value === 'number') {
      let start = 0;
      const end = value;
      const duration = 600;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(end);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="flex justify-between items-start">
          <div className="h-3 bg-slate-800 rounded w-24 mb-3" />
          <div className="w-8 h-8 bg-slate-800 rounded-lg" />
        </div>
        <div className="h-7 bg-slate-800 rounded w-16 mb-2" />
        <div className="h-3 bg-slate-800 rounded w-32" />
      </Card>
    );
  }

  const statusBorder = {
    normal: 'border-enox-border',
    success: 'border-emerald-900/60',
    warning: 'border-amber-900/60',
    critical: 'border-rose-900/60',
  };

  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={cn('relative overflow-hidden', statusBorder[status])}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        {icon && (
          <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">
          {displayValue}
        </span>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-medium',
              trend.positive ? 'text-emerald-400' : 'text-rose-400'
            )}
          >
            {trend.positive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </Card>
  );
};
