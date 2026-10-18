import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Severity, Status, AttackType } from '../../types/security';
import { useSecurity } from '../../context/SecurityContext';
import { PlusCircle, AlertCircle } from 'lucide-react';

interface NewAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewAlertModal: React.FC<NewAlertModalProps> = ({ isOpen, onClose }) => {
  const { createAlert } = useSecurity();

  const [alertName, setAlertName] = useState('');
  const [severity, setSeverity] = useState<Severity>('High');
  const [status, setStatus] = useState<Status>('Awaiting action');
  const [attackType, setAttackType] = useState<AttackType>('Brute Force');
  const [assignee, setAssignee] = useState('S.Nour (L2)');
  const [srcIp, setSrcIp] = useState('');
  const [destHost, setDestHost] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertName.trim()) {
      setError('Alert name is required');
      return;
    }
    if (!comment.trim()) {
      setError('Description for L2 is required');
      return;
    }

    createAlert({
      alert_name: alertName.trim(),
      severity,
      status,
      attack_type: attackType,
      assignee,
      src_ip: srcIp.trim() || '172.16.131.50',
      dest_host: destHost.trim() || 'WIN-VICTIM-01',
      comment: comment.trim()
    });

    // Reset form
    setAlertName('');
    setSeverity('High');
    setStatus('Awaiting action');
    setAttackType('Brute Force');
    setAssignee('S.Nour (L2)');
    setSrcIp('');
    setDestHost('');
    setComment('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Security Alert"
      subtitle="Dispatch a newly detected incident into the analyst triage queue"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Alert Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Alert Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={alertName}
            onChange={(e) => setAlertName(e.target.value)}
            placeholder="e.g. Suspicious Kerberoasting Activity"
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-[#e6ebf5] placeholder:text-slate-400 focus:border-accent-blue transition-colors"
          />
        </div>

        {/* Row 1: Severity & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-[#e6ebf5] focus:border-accent-blue transition-colors"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-[#e6ebf5] focus:border-accent-blue transition-colors"
            >
              <option value="Awaiting action">Awaiting action</option>
              <option value="In progress">In progress</option>
              <option value="Escalated to L2">Escalated to L2</option>
            </select>
          </div>
        </div>

        {/* Row 2: Attack Type & Assign to */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Attack Type
            </label>
            <select
              value={attackType}
              onChange={(e) => setAttackType(e.target.value as AttackType)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-[#e6ebf5] focus:border-accent-blue transition-colors"
            >
              <option value="Brute Force">Brute Force</option>
              <option value="Port Scan">Port Scan</option>
              <option value="DoS">DoS</option>
              <option value="DDoS">DDoS</option>
              <option value="Slow Scan">Slow Scan</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assign to
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-[#e6ebf5] focus:border-accent-blue transition-colors"
            >
              <option value="S.Nour (L2)">S.Nour (L2)</option>
              <option value="K.Adel (L2)">K.Adel (L2)</option>
              <option value="R.Fathy (L3)">R.Fathy (L3)</option>
            </select>
          </div>
        </div>

        {/* Row 3: Source IP & Target Host */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Source IP
            </label>
            <input
              type="text"
              value={srcIp}
              onChange={(e) => setSrcIp(e.target.value)}
              placeholder="172.16.131.50"
              className="w-full font-mono px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-[#e6ebf5] placeholder:text-slate-400 focus:border-accent-blue transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Host
            </label>
            <input
              type="text"
              value={destHost}
              onChange={(e) => setDestHost(e.target.value)}
              placeholder="WIN-VICTIM-01"
              className="w-full font-mono px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-[#e6ebf5] placeholder:text-slate-400 focus:border-accent-blue transition-colors"
            />
          </div>
        </div>

        {/* Description for L2 */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Description for L2 <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What happened and what should L2 check?"
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-[#e6ebf5] placeholder:text-slate-400 focus:border-accent-blue transition-colors resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#1f2b42]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-accent-blue text-white hover:bg-blue-600 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Create alert
          </button>
        </div>
      </form>
    </Modal>
  );
};
