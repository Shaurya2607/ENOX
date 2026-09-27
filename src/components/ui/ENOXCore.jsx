import React from 'react';
import { cn } from '../../utils/cn';
import { Bot, CheckCircle, AlertTriangle, Cpu, Loader2 } from 'lucide-react';

export const ENOXCore = ({
  status = 'idle',
  size = 'md',
  showLabel = true,
  className,
}) => {
  const sizeMap = {
    sm: { container: 'w-7 h-7', icon: 'w-3.5 h-3.5' },
    md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
    lg: { container: 'w-14 h-14', icon: 'w-7 h-7' },
  };

  const statusConfig = {
    idle: {
      color: 'from-indigo-600/30 via-slate-800 to-indigo-900/30 border-indigo-700/50 text-indigo-400',
      ringAnimation: 'animate-pulse-subtle',
      icon: <Bot className={sizeMap[size].icon} />,
      label: 'ENOX Core Ready',
    },
    thinking: {
      color: 'from-cyan-600/40 via-indigo-900/60 to-cyan-800/40 border-cyan-500/70 text-cyan-300',
      ringAnimation: 'animate-spin-slow',
      icon: <Cpu className={cn(sizeMap[size].icon, 'animate-pulse')} />,
      label: 'Thinking & Context Synthesis',
    },
    analyzing: {
      color: 'from-violet-600/40 via-indigo-950 to-cyan-900/40 border-violet-500/80 text-violet-300',
      ringAnimation: 'animate-spin',
      icon: <Loader2 className={cn(sizeMap[size].icon, 'animate-spin')} />,
      label: 'Analyzing Concurrency & AST',
    },
    executing: {
      color: 'from-indigo-500 via-blue-600 to-indigo-700 border-indigo-400 text-white shadow-lg shadow-indigo-500/20',
      ringAnimation: 'animate-pulse',
      icon: <Bot className={cn(sizeMap[size].icon, 'animate-bounce')} />,
      label: 'Parallel Agents Executing',
    },
    waiting: {
      color: 'from-slate-800 via-slate-900 to-slate-800 border-slate-600 text-slate-300',
      ringAnimation: 'animate-pulse-subtle',
      icon: <Bot className={sizeMap[size].icon} />,
      label: 'Awaiting User Confirmation',
    },
    success: {
      color: 'from-emerald-600/40 via-slate-900 to-emerald-800/40 border-emerald-500/80 text-emerald-300',
      ringAnimation: '',
      icon: <CheckCircle className={sizeMap[size].icon} />,
      label: 'Orchestration Complete',
    },
    error: {
      color: 'from-rose-600/40 via-slate-900 to-rose-800/40 border-rose-500/80 text-rose-300',
      ringAnimation: 'animate-pulse',
      icon: <AlertTriangle className={sizeMap[size].icon} />,
      label: 'Exception Detected',
    },
  };

  const current = statusConfig[status] || statusConfig.idle;

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center border bg-gradient-to-tr transition-all duration-300',
          sizeMap[size].container,
          current.color,
          current.ringAnimation
        )}
      >
        {current.icon}
        {status === 'executing' && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        )}
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-200 tracking-wide">
            {current.label}
          </span>
          <span className="text-[10px] text-slate-400 font-mono capitalize">
            Status: {status}
          </span>
        </div>
      )}
    </div>
  );
};
