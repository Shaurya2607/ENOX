import React from 'react';
import { Card } from './Card';
import { AgentStatusBadge } from './AgentStatusBadge';
import { cn } from '../../utils/cn';
import { Bug, ShieldCheck, CheckSquare, GitPullRequest, Rocket, Loader2 } from 'lucide-react';

export const AgentExecutionCard = ({
  id,
  name,
  role,
  status,
  progress,
  message,
  details,
  className,
}) => {
  const iconMap = {
    debugger: <Bug className="w-5 h-5 text-amber-400" />,
    tester: <CheckSquare className="w-5 h-5 text-cyan-400" />,
    security: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    review: <GitPullRequest className="w-5 h-5 text-indigo-400" />,
    deployment: <Rocket className="w-5 h-5 text-violet-400" />,
  };

  const isRunning = status === 'RUNNING';
  const isComplete = status === 'COMPLETE';

  return (
    <Card
      className={cn(
        'p-4 transition-all duration-200 border',
        isRunning && 'border-cyan-500/60 ring-1 ring-cyan-500/30 bg-slate-900/90',
        isComplete && 'border-emerald-800/60 bg-emerald-950/20',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shrink-0">
            {iconMap[id]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-100">{name}</h4>
              {isRunning && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
            </div>
            <p className="text-xs text-slate-400">{role}</p>
          </div>
        </div>
        <AgentStatusBadge status={status} />
      </div>

      <div className="mt-3.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span className="truncate pr-2">{message}</span>
          <span className="font-semibold text-slate-300">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              isRunning && 'bg-gradient-to-r from-cyan-500 to-indigo-500 animate-pulse',
              isComplete && 'bg-emerald-500',
              status === 'FAILED' && 'bg-rose-500',
              status === 'IDLE' && 'bg-slate-700'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {details && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
          {details}
        </div>
      )}
    </Card>
  );
};
