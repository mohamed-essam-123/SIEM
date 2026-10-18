import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Activity, 
  Layers, 
  Server,
  ExternalLink,
  Printer,
  Calendar,
  Grid
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { useSecurity } from '../context/SecurityContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ProgressRing } from '../components/common/ProgressRing';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { TRAFFIC_TREND_BY_RANGE, HEATMAP_HOURS } from '../data/data';
import { Severity } from '../types/security';

export const OverviewPage: React.FC = () => {
  const {
    alerts,
    totalAlerts,
    awaitingActionCount,
    escalatedL2Count,
    criticalCount,
    blockedOrQuarantinedCount,
    blockedPercentage,
    closedCount,
    falsePositiveCount,
    falsePositiveRate,
    topAttackerIps,
    attackTypeDistribution,
    detectionModeDistribution,
    enforcementCounts,
    recentEnforcementAlerts,
    theme
  } = useSecurity();

  const isDark = theme === 'dark';
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('6h');

  // Traffic data according to selected time range
  const trafficData = TRAFFIC_TREND_BY_RANGE[timeRange];

  // Severity by hour heatmap computation
  const heatmapData = useMemo(() => {
    const severities: Severity[] = ['Critical', 'High', 'Medium', 'Low'];
    const matrix: Record<Severity, Record<string, number>> = {
      'Critical': {},
      'High': {},
      'Medium': {},
      'Low': {}
    };

    // Initialize with 0
    severities.forEach(sev => {
      HEATMAP_HOURS.forEach(hr => {
        matrix[sev][hr] = 0;
      });
    });

    // Populate from alerts
    alerts.forEach(a => {
      const timePart = a.timestamp.split(' ')[1] || '12:00';
      const hourOnly = timePart.substring(0, 2);
      // Map to nearest heatmap hour bucket
      let matchedHour = '12:00';
      const parsedH = parseInt(hourOnly, 10);
      if (parsedH <= 7) matchedHour = '06:00';
      else if (parsedH <= 9) matchedHour = '08:00';
      else if (parsedH === 10) matchedHour = '10:00';
      else if (parsedH === 11) matchedHour = '11:00';
      else if (parsedH === 12) matchedHour = '12:00';
      else if (parsedH === 13) matchedHour = '13:00';
      else if (parsedH === 14) matchedHour = '14:00';
      else if (parsedH <= 17) matchedHour = '16:00';
      else if (parsedH <= 19) matchedHour = '18:00';
      else matchedHour = '20:00';

      if (matrix[a.severity]) {
        matrix[a.severity][matchedHour] = (matrix[a.severity][matchedHour] || 0) + 1;
      }
    });

    return matrix;
  }, [alerts]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar with Print/PDF Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 print:hidden">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#94a3bb]">
          <Calendar className="w-4 h-4 text-accent-blue" />
          <span>Security Operations Report Period: 2026-09-29 Live Telemetry</span>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111a2b] dark:hover:bg-[#162238] border border-slate-300 dark:border-[#1f2b42] text-slate-700 dark:text-[#e6ebf5] transition-colors self-start sm:self-auto shadow-xs"
        >
          <Printer className="w-3.5 h-3.5 text-accent-blue" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Row 1: 6 KPI Cards with Animated Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Total Alerts */}
        <Card className="p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#94a3bb] mb-2">
            <span className="text-xs font-medium">Total alerts</span>
            <AlertTriangle className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#e6ebf5]">
            <AnimatedCounter value={totalAlerts} />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#94a3bb] mt-1 flex items-center gap-1">
            <span>Live monitored queue</span>
          </div>
        </Card>

        {/* KPI 2: Awaiting Action */}
        <Card className="p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#94a3bb] mb-2">
            <span className="text-xs font-medium">Awaiting action</span>
            <Clock className="w-4 h-4 text-accent-amber" />
          </div>
          <div className="text-2xl font-bold font-mono text-accent-amber">
            <AnimatedCounter value={awaitingActionCount} />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#94a3bb] mt-1">
            <span>Requires triage</span>
          </div>
        </Card>

        {/* KPI 3: Escalated to L2 */}
        <Card className="p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#94a3bb] mb-2">
            <span className="text-xs font-medium">Escalated to L2</span>
            <ArrowUpRight className="w-4 h-4 text-accent-purple" />
          </div>
          <div className="text-2xl font-bold font-mono text-accent-purple">
            <AnimatedCounter value={escalatedL2Count} />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#94a3bb] mt-1">
            <span>Assigned to Tier-2</span>
          </div>
        </Card>

        {/* KPI 4: Critical */}
        <Card glow={criticalCount > 0 ? 'red' : 'none'} className="p-4 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#94a3bb] mb-2">
            <span className="text-xs font-medium">Critical</span>
            <ShieldAlert className="w-4 h-4 text-accent-red" />
          </div>
          <div className="text-2xl font-bold font-mono text-accent-red">
            <AnimatedCounter value={criticalCount} />
          </div>
          <div className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
            <span>Immediate threat</span>
          </div>
        </Card>

        {/* KPI 5: Blocked / Quarantined */}
        <Card className="p-4 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-[#94a3bb] mb-2">
              Blocked / quarantined
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#e6ebf5]">
              <AnimatedCounter value={blockedOrQuarantinedCount} />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-[#94a3bb] mt-1 font-mono">
              {blockedPercentage}% of alerts
            </div>
          </div>
          <ProgressRing progress={blockedPercentage} color="#ff6b6b" />
        </Card>

        {/* KPI 6: False Positive Rate */}
        <Card className="p-4 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-[#94a3bb] mb-2">
              False positive rate
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#e6ebf5]">
              {falsePositiveRate}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-[#94a3bb] mt-1 font-mono">
              {falsePositiveCount} of {closedCount} closed
            </div>
          </div>
          <ProgressRing progress={falsePositiveRate} color="#f5a524" />
        </Card>
      </div>

      {/* Row 2: 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Traffic trend with Time Range Selector (1h, 6h, 24h) */}
        <Card className="lg:col-span-5 p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-blue" />
                Traffic trend — allowed vs blocked
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
                Connection flows sampled in {timeRange} window
              </p>
            </div>

            {/* Time-Range Selector Buttons */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42] self-start sm:self-auto">
              {(['1h', '6h', '24h'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    timeRange === r
                      ? 'bg-accent-blue text-white shadow-xs'
                      : 'text-slate-500 dark:text-[#94a3bb] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4cc27a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4cc27a" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2b42' : '#e2e8f0'} />
                <XAxis 
                  dataKey="time" 
                  stroke={isDark ? '#94a3bb' : '#64748b'} 
                  fontSize={11} 
                  tickLine={false}
                  fontFamily="JetBrains Mono"
                />
                <YAxis 
                  stroke={isDark ? '#94a3bb' : '#64748b'} 
                  fontSize={11} 
                  tickLine={false} 
                  fontFamily="JetBrains Mono"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111a2b' : '#ffffff',
                    borderColor: isDark ? '#1f2b42' : '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: isDark ? '#e6ebf5' : '#0f172a'
                  }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="allowed" 
                  name="Allowed" 
                  stroke="#4cc27a" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAllowed)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="blocked" 
                  name="Blocked" 
                  stroke="#ff6b6b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorBlocked)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-accent-green inline-block" />
              <span className="text-slate-600 dark:text-[#94a3bb]">Allowed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-accent-red inline-block" />
              <span className="text-slate-600 dark:text-[#94a3bb]">Blocked</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Top attacker source IPs */}
        <Card className="lg:col-span-3 p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
              <Server className="w-4 h-4 text-accent-blue" />
              Top attacker source IPs
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
              Top 5 recurring single sources
            </p>
          </div>

          <div className="space-y-3.5 my-auto">
            {topAttackerIps.map((item) => {
              const maxVal = Math.max(...topAttackerIps.map(i => i.count), 1);
              const percentage = Math.round((item.count / maxVal) * 100);

              return (
                <div key={item.ip} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                      {item.ip}
                    </span>
                    <span className="font-mono font-bold text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded text-[11px]">
                      {item.count} {item.count === 1 ? 'alert' : 'alerts'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-accent-blue rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {topAttackerIps.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No single source attacks recorded
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Attack types donut chart */}
        <Card className="lg:col-span-4 p-5 flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-blue" />
              Attack types
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
              Taxonomy distribution across queue
            </p>
          </div>

          <div className="relative h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attackTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {attackTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#111a2b' : '#ffffff'} strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111a2b' : '#ffffff',
                    borderColor: isDark ? '#1f2b42' : '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Donut Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-[#e6ebf5]">
                <AnimatedCounter value={totalAlerts} />
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94a3bb]">
                Total
              </span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-[#1f2b42]/60">
            {attackTypeDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-600 dark:text-[#94a3bb]">{entry.name}</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Severity-by-Hour Heatmap Card */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
              <Grid className="w-4 h-4 text-accent-purple" />
              Incident Severity Density (Hourly Heatmap)
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
              Temporal distribution of attack detections mapped across severity levels
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400">
            UTC Timeline
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="py-2 pr-4 text-left font-semibold text-slate-500 dark:text-[#94a3bb] w-24">
                  Severity
                </th>
                {HEATMAP_HOURS.map((hr) => (
                  <th key={hr} className="py-2 px-1 text-center font-mono font-medium text-slate-400 text-[11px]">
                    {hr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="space-y-1">
              {(['Critical', 'High', 'Medium', 'Low'] as Severity[]).map((sev) => {
                let badgeClass = 'text-red-400';
                if (sev === 'High') badgeClass = 'text-amber-400';
                if (sev === 'Medium') badgeClass = 'text-blue-400';
                if (sev === 'Low') badgeClass = 'text-emerald-400';

                return (
                  <tr key={sev} className="border-t border-slate-100 dark:border-[#1f2b42]/40">
                    <td className={`py-2 pr-4 font-semibold ${badgeClass}`}>
                      {sev}
                    </td>
                    {HEATMAP_HOURS.map((hr) => {
                      const count = heatmapData[sev]?.[hr] || 0;
                      let bgIntensity = 'bg-slate-100/50 dark:bg-[#111a2b] text-slate-400';
                      if (count > 0) {
                        if (sev === 'Critical') bgIntensity = 'bg-red-500/30 text-red-300 font-bold border border-red-500/40 shadow-xs';
                        else if (sev === 'High') bgIntensity = 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 shadow-xs';
                        else if (sev === 'Medium') bgIntensity = 'bg-blue-500/25 text-blue-300 font-bold border border-blue-500/40';
                        else bgIntensity = 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/40';
                      }

                      return (
                        <td key={hr} className="py-1 px-1">
                          <div 
                            className={`h-8 rounded-lg flex items-center justify-center font-mono text-xs transition-transform hover:scale-105 cursor-default ${bgIntensity}`}
                            title={`${sev} at ${hr}: ${count} alert(s)`}
                          >
                            {count > 0 ? count : '·'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Row 4: 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Recent enforcement actions (Table) */}
        <Card className="lg:col-span-5 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-green" />
                Recent enforcement actions
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
                Latest 6 alerts with active mitigations applied
              </p>
            </div>
            <Link
              to="/alerts"
              className="text-xs text-accent-blue hover:underline inline-flex items-center gap-1 font-medium"
            >
              View all <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#1f2b42] text-slate-500 dark:text-[#94a3bb] font-semibold">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 px-3">Source IP</th>
                  <th className="py-2 pl-3">Actions badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1f2b42]/50">
                {recentEnforcementAlerts.map((alert) => {
                  const timeFormatted = alert.timestamp.split(' ')[1] || alert.timestamp;
                  return (
                    <tr 
                      key={alert.alert_id} 
                      className="hover:bg-slate-50 dark:hover:bg-[#162238]/60 transition-colors"
                    >
                      <td className="py-2.5 pr-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {timeFormatted}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900 dark:text-[#e6ebf5] max-w-[150px] truncate" title={alert.src_ip}>
                        {alert.src_ip}
                      </td>
                      <td className="py-2.5 pl-3">
                        <div className="flex flex-wrap gap-1">
                          {alert.enforcement.map((enf) => (
                            <Badge key={enf} variant="enforcement" value={enf} size="sm" />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Card 2: Detection mode split */}
        <Card className="lg:col-span-4 p-5 flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-blue" />
              Detection mode split
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
              Trigger classification telemetry
            </p>
          </div>

          <div className="relative h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={detectionModeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {detectionModeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#111a2b' : '#ffffff'} strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111a2b' : '#ffffff',
                    borderColor: isDark ? '#1f2b42' : '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend + counts */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-[#1f2b42]/60">
            {detectionModeDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-slate-50 dark:bg-[#0b1220]/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-600 dark:text-[#94a3bb]">{entry.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Card 3: Enforcement breakdown */}
        <Card className="lg:col-span-3 p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accent-purple" />
              Enforcement breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94a3bb]">
              Mitigation primitives triggered
            </p>
          </div>

          <div className="space-y-4 my-auto">
            {/* OVS drop */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent-red" />
                  OVS drop
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {enforcementCounts.ovsDrop}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-accent-red rounded-full"
                  style={{ width: `${totalAlerts > 0 ? (enforcementCounts.ovsDrop / totalAlerts) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* iptables */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent-amber" />
                  iptables
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {enforcementCounts.iptablesDrop}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-accent-amber rounded-full"
                  style={{ width: `${totalAlerts > 0 ? (enforcementCounts.iptablesDrop / totalAlerts) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Quarantine VLAN */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent-purple" />
                  Quarantine VLAN
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {enforcementCounts.quarantineVlan}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-accent-purple rounded-full"
                  style={{ width: `${totalAlerts > 0 ? (enforcementCounts.quarantineVlan / totalAlerts) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
