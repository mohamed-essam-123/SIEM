import React from 'react';
import { Severity, Status, Verdict, DetectionMode, EnforcementAction } from '../../types/security';

interface BadgeProps {
  variant?: 'severity' | 'status' | 'verdict' | 'detection' | 'enforcement' | 'custom';
  value: string;
  dot?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'custom',
  value,
  dot = true,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  let dotColor = 'bg-slate-400';
  let label = value;

  if (variant === 'severity') {
    switch (value as Severity) {
      case 'Critical':
        colorClasses = 'bg-red-500/10 text-red-400 border-red-500/30';
        dotColor = 'bg-accent-red animate-pulse';
        break;
      case 'High':
        colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        dotColor = 'bg-accent-amber';
        break;
      case 'Medium':
        colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        dotColor = 'bg-accent-blue';
        break;
      case 'Low':
        colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        dotColor = 'bg-accent-green';
        break;
    }
  } else if (variant === 'status') {
    switch (value as Status) {
      case 'Awaiting action':
        colorClasses = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
        dotColor = 'bg-amber-400';
        break;
      case 'In progress':
        colorClasses = 'bg-blue-500/10 text-blue-300 border-blue-500/30';
        dotColor = 'bg-blue-400';
        break;
      case 'Escalated to L2':
        colorClasses = 'bg-purple-500/10 text-purple-300 border-purple-500/30';
        dotColor = 'bg-accent-purple';
        break;
      case 'Closed':
        colorClasses = 'bg-slate-500/10 text-slate-400 border-slate-600/30';
        dotColor = 'bg-slate-400';
        break;
    }
  } else if (variant === 'verdict') {
    switch (value as Verdict) {
      case 'True Positive':
        colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        dotColor = 'bg-accent-green';
        break;
      case 'False Positive':
        colorClasses = 'bg-red-500/10 text-red-400 border-red-500/30';
        dotColor = 'bg-accent-red';
        break;
      case 'None':
      default:
        colorClasses = 'bg-slate-500/10 text-slate-400 border-slate-600/30';
        dotColor = 'bg-slate-400';
        label = 'None';
        break;
    }
  } else if (variant === 'detection') {
    switch (value as DetectionMode) {
      case 'ML':
        colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        dotColor = 'bg-accent-green';
        break;
      case 'Signature':
        colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        dotColor = 'bg-accent-blue';
        break;
      case 'Anomaly':
        colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        dotColor = 'bg-accent-amber';
        break;
      case 'Both':
        colorClasses = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
        dotColor = 'bg-accent-purple';
        break;
    }
  } else if (variant === 'enforcement') {
    switch (value as EnforcementAction | 'NONE') {
      case 'OVS_DROP':
        label = 'OVS drop';
        colorClasses = 'bg-red-500/10 text-red-400 border-red-500/30';
        dotColor = 'bg-accent-red';
        break;
      case 'IPTABLES_DROP':
        label = 'iptables';
        colorClasses = 'bg-red-500/10 text-red-400 border-red-500/30';
        dotColor = 'bg-accent-red';
        break;
      case 'QUARANTINE_VLAN':
        label = 'Quarantine VLAN';
        colorClasses = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
        dotColor = 'bg-accent-purple';
        break;
      default:
        label = 'No action — allowed';
        colorClasses = 'bg-slate-500/10 text-slate-400 border-slate-600/30';
        dotColor = 'bg-slate-400';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border tracking-wide whitespace-nowrap transition-colors ${sizeClasses} ${colorClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span>{label}</span>
    </span>
  );
};
