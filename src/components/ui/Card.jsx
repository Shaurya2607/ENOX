import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({
  children,
  className,
  hover = false,
  active = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-enox-card border border-enox-border rounded-lg p-5 transition-all duration-150',
        hover && 'hover:border-enox-borderLight hover:bg-enox-cardHover cursor-pointer',
        active && 'border-indigo-500/80 ring-1 ring-indigo-500/40 bg-enox-cardHover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
