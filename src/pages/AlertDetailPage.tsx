import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Info, 
  Clock, 
  Save, 
  Check, 
  Server, 
  Activity, 
  Cpu, 
  Terminal,
  ShieldCheck,
  AlertTriangle,
  GitCommit,
  User,
  CheckCircle2,
  ExternalLink,
  Target
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { TriageActions } from '../components/alerts/TriageActions';
import { 
  ATTACK_DESCRIPTIONS, 
  DETECTION_MODE_EXPLANATIONS, 
  MITRE_MAPPINGS,
  generateConnectionsForAlert 
} from '../data/data';

export const AlertDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { alerts, updateComment } = useSecurity();

  const alert = alerts.find(a => a.alert_id === id);

  const [commentText, setCommentText] = useState(alert?.comment || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (alert) {
      setCommentText(alert.comment || '');
    }
  }, [alert]);

  if (!alert) {
    return (
      <div className="space-y-6">
        <Link
          to="/alerts"
          className="inline-flex items-center gap-2 text-xs font-semibold text-accent-blue hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          ← Back to alerts
        </Link>
        <Card className="p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-accent-amber mx-auto" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Alert Not Found
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The security alert <span className="font-mono">{id}</span> does not exist or has been purged.
          </p>
          <button
            onClick={() => navigate('/alerts')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent-blue text-white"
          >
            Return to queue
          </button>
        </Card>
      </div>
    );
  }

  const handleSaveComment = () => {
    updateComment(alert.alert_id, commentText);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Generate connection telemetry
  const { totalCount, connections } = generateConnectionsForAlert(alert);
  const displayedConnections = connections.slice(0, 10);

  // MITRE ATT&CK Info
  const mitreInfo = MITRE_MAPPINGS[alert.attack_type] || MITRE_MAPPINGS['Other'];

  // Construct Activity Timeline Events
  const [datePart, timePart] = alert.timestamp.split(' ');
  const [hh, mm] = (timePart || '12:00').split(':');
  const baseMinutes = parseInt(mm, 10);

  const timelineEvents = [
    {
      id: 'evt-1',
      title: 'Packet Ingestion & Flow Mirroring',
      time: `${datePart} ${hh}:${String(Math.max(0, baseMinutes - 2)).padStart(2, '0')} UTC`,
      desc: `Raw packets captured via Zeek port-mirror interface on Open vSwitch tap from source ${alert.src_ip}.`,
      icon: Terminal,
      color: 'bg-blue-500/10 text-accent-blue border-blue-500/30'
    },
    {
      id: 'evt-2',
      title: `Detected by ${alert.detection === 'ML' ? 'Zeek ML Classifier' : alert.detection === 'Both' ? 'Signature & Anomaly Correlator' : `${alert.detection} Engine`}`,
      time: `${alert.timestamp} UTC`,
      desc: DETECTION_MODE_EXPLANATIONS[alert.detection],
      icon: Cpu,
      color: 'bg-amber-500/10 text-accent-amber border-amber-500/30'
    }
  ];

  if (alert.enforcement && alert.enforcement.length > 0) {
    timelineEvents.push({
      id: 'evt-3',
      title: 'Automated Enforcement Triggered',
      time: `${alert.timestamp}:04 UTC`,
      desc: `ai_ips.py applied mitigations: ${alert.enforcement.join(', ')} preventing further movement to ${alert.dest_host}.`,
      icon: ShieldCheck,
      color: 'bg-red-500/10 text-accent-red border-red-500/30'
    });
  }

  if (alert.status === 'Escalated to L2') {
    timelineEvents.push({
      id: 'evt-4',
      title: 'Incident Escalated to Tier-2',
      time: `${datePart} ${hh}:${String(Math.min(59, baseMinutes + 3)).padStart(2, '0')} UTC`,
      desc: `Assigned to ${alert.assignee} for deep packet analysis and host validation.`,
      icon: User,
      color: 'bg-purple-500/10 text-accent-purple border-purple-500/30'
    });
  }

  if (alert.comment) {
    timelineEvents.push({
      id: 'evt-5',
      title: 'Analyst Findings Recorded',
      time: `${datePart} ${hh}:${String(Math.min(59, baseMinutes + 5)).padStart(2, '0')} UTC`,
      desc: `"${alert.comment}"`,
      icon: Activity,
      color: 'bg-blue-500/10 text-accent-blue border-blue-500/30'
    });
  }

  if (alert.status === 'Closed') {
    timelineEvents.push({
      id: 'evt-6',
      title: `Incident Resolved (${alert.verdict})`,
      time: `${datePart} ${hh}:${String(Math.min(59, baseMinutes + 8)).padStart(2, '0')} UTC`,
      desc: `Closed by ${alert.assignee}. Verdict logged into ML active learning retraining set.`,
      icon: CheckCircle2,
      color: alert.verdict === 'True Positive' ? 'bg-emerald-500/10 text-accent-green border-emerald-500/30' : 'bg-red-500/10 text-accent-red border-red-500/30'
    });
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/alerts"
        className="inline-flex items-center gap-2 text-xs font-semibold text-accent-blue hover:underline group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        ← Back to alerts
      </Link>

      {/* Header Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#1f2b42]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="severity" value={alert.severity} size="md" />
              <Badge variant="status" value={alert.status} size="md" />
              <Badge variant="verdict" value={alert.verdict} size="md" />
              <Badge variant="detection" value={alert.detection} size="md" />
              
              {/* MITRE ATT&CK Tag */}
              {mitreInfo && (
                <a
                  href={mitreInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                  title={`${mitreInfo.tactic}: ${mitreInfo.technique}`}
                >
                  <Target className="w-3.5 h-3.5 text-accent-red" />
                  <span>MITRE {mitreInfo.id}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#e6ebf5] tracking-tight">
              {alert.alert_name}
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-[#94a3bb]">
              <span className="font-bold text-accent-blue">{alert.alert_id}</span>
              <span>·</span>
              <span>{alert.timestamp} UTC</span>
            </div>
          </div>

          {/* Quick Triage Buttons */}
          <div className="shrink-0 flex items-center">
            <TriageActions alert={alert} />
          </div>
        </div>

        {/* Detail Grid */}
        <div className="pt-6 space-y-6">
          {/* Attack Summary & MITRE Mapping Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42] text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-accent-blue" />
                Attack Pattern Description
              </span>
              {mitreInfo && (
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Tactic: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{mitreInfo.tactic}</strong> | Technique: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{mitreInfo.technique}</strong>
                </span>
              )}
            </div>
            <p className="text-slate-600 dark:text-[#94a3bb] leading-relaxed">
              {ATTACK_DESCRIPTIONS[alert.attack_type] || 'Standard baseline deviation detected.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Attack Type */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
              <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] block mb-1">
                Attack Type
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {alert.attack_type}
              </span>
            </div>

            {/* Source IP */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
              <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] block mb-1">
                Source IP
              </span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {alert.src_ip}
              </span>
            </div>

            {/* Target Host:Port */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
              <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] block mb-1">
                Target Host:Port
              </span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {alert.dest_host}:{alert.dest_port}
              </span>
            </div>

            {/* Assignee */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
              <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] block mb-1">
                Assignee
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {alert.assignee || 'Unassigned'}
              </span>
            </div>

            {/* Risk Score with Detection Explanation Tooltip */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42] relative group">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#94a3bb] mb-1">
                <span>Risk score</span>
                <Info className="w-3.5 h-3.5 text-accent-blue cursor-help" />
              </div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                <span>{alert.risk_score}</span>
                <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2.5 rounded-lg bg-slate-900 text-white text-[11px] shadow-xl z-20 border border-slate-700 pointer-events-none">
                <p className="font-semibold text-accent-blue mb-1">Detection Logic</p>
                <p>{DETECTION_MODE_EXPLANATIONS[alert.detection]}</p>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
              <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] block mb-1">
                Confidence
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                {alert.confidence_score}
              </span>
            </div>

            {/* Detection Mode & Explanation */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42] space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Detection Mode:</span>
                <Badge variant="detection" value={alert.detection} size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#94a3bb]">
                {DETECTION_MODE_EXPLANATIONS[alert.detection]}
              </p>
            </div>
          </div>

          {/* Enforcement Mitigations */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42] flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-green" />
              Enforcement Actions Applied:
            </span>
            <div className="flex flex-wrap gap-2">
              {alert.enforcement && alert.enforcement.length > 0 ? (
                alert.enforcement.map((enf) => (
                  <Badge key={enf} variant="enforcement" value={enf} size="md" />
                ))
              ) : (
                <Badge variant="enforcement" value="NONE" size="md" />
              )}
            </div>
          </div>

          {/* Comment & Analyst Notes Section */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Analyst Investigation Notes & Comments
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Document your forensic hypothesis, root cause, or triage instructions..."
                className="w-full p-3 text-xs rounded-xl bg-white dark:bg-[#0b1220] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-[#e6ebf5] placeholder:text-slate-400 focus:border-accent-blue transition-colors resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                {saveSuccess && (
                  <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
                    <Check className="w-4 h-4" /> Comment updated successfully
                  </span>
                )}
              </div>
              <button
                onClick={handleSaveComment}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-all shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Save comment
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Timeline Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1f2b42] mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-accent-blue" />
              Activity & Triage Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94a3bb] mt-0.5">
              Chronological forensic event trace from packet tap to mitigation & analyst verdict
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-[#1f2b42] text-slate-600 dark:text-slate-300">
            {timelineEvents.length} Events Logged
          </span>
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-[#1f2b42]">
          {timelineEvents.map((evt) => {
            const Icon = evt.icon;
            return (
              <div key={evt.id} className="relative flex items-start gap-4 group">
                {/* Node icon dot */}
                <div className={`absolute -left-6 top-1 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${evt.color}`}>
                  <Icon className="w-3 h-3" />
                </div>

                {/* Content block */}
                <div className="flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42] text-xs space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {evt.title}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {evt.time}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-[#94a3bb] leading-relaxed">
                    {evt.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Card 3: Connections Behind This Alert */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1f2b42] mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent-blue" />
              Connections behind this alert
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94a3bb] mt-0.5">
              Flow telemetry sampled from Zeek connection analyzer (Zeek `conn.log`)
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-[#1f2b42] text-slate-700 dark:text-[#94a3bb]">
            Showing {displayedConnections.length} of {totalCount}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#1f2b42]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#162238] border-b border-slate-200 dark:border-[#1f2b42] text-slate-600 dark:text-[#94a3bb] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Connection ID</th>
                <th className="py-2.5 px-3">Time (UTC)</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Destination IP</th>
                <th className="py-2.5 px-3">Port</th>
                <th className="py-2.5 px-3 text-right">Duration (s)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1f2b42]/60 font-mono">
              {displayedConnections.map((conn) => (
                <tr key={conn.id} className="hover:bg-slate-50/80 dark:hover:bg-[#162238]/40 transition-colors">
                  <td className="py-2.5 px-3 text-accent-blue font-semibold">
                    {conn.id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                    {conn.time}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 dark:text-[#e6ebf5]">
                    {conn.src_ip}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 dark:text-[#e6ebf5]">
                    {conn.dest_ip}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    {conn.port}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                    {conn.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-[#94a3bb]">
          <span>Note: Showing {displayedConnections.length} of {totalCount} connections sampled during attack window.</span>
          <span className="font-mono text-[11px]">Capture: Zeek Bro/Core 5.0</span>
        </div>
      </Card>
    </div>
  );
};
