import React from 'react';
import { Alert } from '../../types/security';
import { useSecurity } from '../../context/SecurityContext';
import { ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

interface TriageActionsProps {
  alert: Alert;
  className?: string;
}

export const TriageActions: React.FC<TriageActionsProps> = ({ alert, className = '' }) => {
  const { escalateAlert, closeAlert } = useSecurity();

  if (alert.status === 'Closed') {
    return (
      <div className={`flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic ${className}`}>
        <span>Alert is closed ({alert.verdict})</span>
      </div>
    );
  }

  const isEscalated = alert.status === 'Escalated to L2';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Escalate to L2: Primary, hidden if already escalated */}
      {!isEscalated && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            escalateAlert(alert.alert_id);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent-blue text-white hover:bg-blue-600 shadow-sm transition-all active:scale-95"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Escalate to L2
        </button>
      )}

      {/* Close as true positive */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeAlert(alert.alert_id, 'True Positive');
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all active:scale-95"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Close as true positive
      </button>

      {/* Close as false positive */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeAlert(alert.alert_id, 'False Positive');
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all active:scale-95"
      >
        <XCircle className="w-3.5 h-3.5" />
        Close as false positive
      </button>
    </div>
  );
};
