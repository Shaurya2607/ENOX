import React from 'react';
import { Badge } from './Badge';

export const AgentStatusBadge = ({ status, className }) => {
  switch (status) {
    case 'RUNNING':
      return (
        <Badge variant="info" dot className={className}>
          <span className="font-mono font-bold tracking-wider">RUNNING</span>
        </Badge>
      );
    case 'COMPLETE':
      return (
        <Badge variant="success" dot className={className}>
          <span className="font-mono font-bold tracking-wider">COMPLETE</span>
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge variant="danger" dot className={className}>
          <span className="font-mono font-bold tracking-wider">FAILED</span>
        </Badge>
      );
    case 'IDLE':
    default:
      return (
        <Badge variant="outline" className={className}>
          <span className="font-mono text-slate-500">IDLE</span>
        </Badge>
      );
  }
};
