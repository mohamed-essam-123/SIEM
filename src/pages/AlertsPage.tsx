import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Server,
  Activity,
  User,
  Clock,
  Layers,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  XCircle,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { TriageActions } from '../components/alerts/TriageActions';
import { NewAlertModal } from '../components/alerts/NewAlertModal';
import { ATTACK_DESCRIPTIONS, DETECTION_MODE_EXPLANATIONS } from '../data/data';
import { Severity, Status } from '../types/security';
import { exportAlertsToExcel, exportAlertsToCsv } from '../lib/exportUtils';

type SortField = 'timestamp' | 'alert_name' | 'severity' | 'status' | 'verdict' | 'risk_score';

export const AlertsPage: React.FC = () => {
  const { alerts, bulkEscalate, bulkClose } = useSecurity();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state (10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Row selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Status chip options
  const statusChips = [
    { label: 'All', count: alerts.length },
    { label: 'Awaiting action', count: alerts.filter(a => a.status === 'Awaiting action').length },
    { label: 'In progress', count: alerts.filter(a => a.status === 'In progress').length },
    { label: 'Escalated to L2', count: alerts.filter(a => a.status === 'Escalated to L2').length },
    { label: 'Closed', count: alerts.filter(a => a.status === 'Closed').length },
  ];

  const severityRank: Record<Severity, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  // Filtering and sorting
  const filteredAlerts = useMemo(() => {
    return alerts
      .filter((alert) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            alert.alert_name.toLowerCase().includes(q) ||
            alert.src_ip.toLowerCase().includes(q) ||
            alert.dest_host.toLowerCase().includes(q) ||
            alert.alert_id.toLowerCase().includes(q) ||
            alert.assignee.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Severity filter
        if (severityFilter !== 'All' && alert.severity !== severityFilter) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'All' && alert.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'timestamp') {
          comp = a.timestamp.localeCompare(b.timestamp);
        } else if (sortField === 'alert_name') {
          comp = a.alert_name.localeCompare(b.alert_name);
        } else if (sortField === 'severity') {
          comp = (severityRank[a.severity] || 0) - (severityRank[b.severity] || 0);
        } else if (sortField === 'status') {
          comp = a.status.localeCompare(b.status);
        } else if (sortField === 'verdict') {
          comp = a.verdict.localeCompare(b.verdict);
        } else if (sortField === 'risk_score') {
          const numA = typeof a.risk_score === 'number' ? a.risk_score : 0;
          const numB = typeof b.risk_score === 'number' ? b.risk_score : 0;
          comp = numA - numB;
        }

        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [alerts, searchQuery, severityFilter, statusFilter, sortField, sortDirection]);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, severityFilter, statusFilter]);

  // Paginated alerts
  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / itemsPerPage));
  const paginatedAlerts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAlerts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAlerts, currentPage, itemsPerPage]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedAlerts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedAlerts.map(a => a.alert_id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkEscalate = () => {
    bulkEscalate(selectedIds);
    setToastMessage(`Escalated ${selectedIds.length} alerts to L2`);
    setSelectedIds([]);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBulkClose = (verdict: 'True Positive' | 'False Positive') => {
    bulkClose(selectedIds, verdict);
    setToastMessage(`Closed ${selectedIds.length} alerts as ${verdict}`);
    setSelectedIds([]);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      setExportDropdownOpen(false);
      await exportAlertsToExcel(filteredAlerts);
      setToastMessage(`Exported ${filteredAlerts.length} alerts to Excel`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Excel export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = () => {
    setExportDropdownOpen(false);
    exportAlertsToCsv(filteredAlerts);
    setToastMessage(`Exported ${filteredAlerts.length} alerts to CSV`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-40 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-accent-blue ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-accent-blue ml-1 inline" />
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#1f2b42]">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#e6ebf5] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-accent-blue" />
              Alert queue
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94a3bb] mt-0.5">
              Live operational triage queue — {filteredAlerts.length} of {alerts.length} alerts matching filters
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Export Excel / CSV Dropdown */}
            <div className="relative inline-flex items-center rounded-lg shadow-sm" ref={dropdownRef}>
              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-l-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                title="Export filtered alerts to styled Excel (.xlsx)"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                )}
                Export Excel
              </button>
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="p-2 text-xs rounded-r-lg bg-emerald-700 hover:bg-emerald-800 text-white border-l border-emerald-600/60 transition-colors"
                aria-label="Export options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Dropdown Options */}
              {exportDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42] shadow-2xl z-30 py-1 text-xs overflow-hidden">
                  <button
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-slate-700 dark:text-[#e6ebf5] hover:bg-slate-100 dark:hover:bg-[#162238] transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    <div>
                      <span className="font-semibold block">Export Excel (.xlsx)</span>
                      <span className="text-[10px] text-slate-400">Multi-sheet styled .xlsx</span>
                    </div>
                  </button>
                  <button
                    onClick={handleExportCsv}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-slate-700 dark:text-[#e6ebf5] hover:bg-slate-100 dark:hover:bg-[#162238] transition-colors border-t border-slate-100 dark:border-[#1f2b42]/60"
                  >
                    <Download className="w-4 h-4 text-accent-blue" />
                    <div>
                      <span className="font-semibold block">Export CSV (.csv)</span>
                      <span className="text-[10px] text-slate-400">UTF-8 BOM, quoted format</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* + New alert Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-accent-blue hover:bg-blue-600 text-white shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              + New alert
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="py-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94a3bb]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, IP, host, ID or assignee"
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-[#e6ebf5] placeholder:text-slate-400 focus:border-accent-blue transition-colors"
              />
            </div>

            {/* Severity Select */}
            <div className="w-full md:w-48 shrink-0">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-300 dark:border-[#1f2b42] text-slate-900 dark:text-[#e6ebf5] focus:border-accent-blue transition-colors"
              >
                <option value="All">All severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-slate-500 dark:text-[#94a3bb] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {statusChips.map((chip) => {
              const active = statusFilter === chip.label;
              return (
                <button
                  key={chip.label}
                  onClick={() => setStatusFilter(chip.label)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    active
                      ? 'bg-accent-blue text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-[#94a3bb] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1f2b42]'
                  }`}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-[#1f2b42] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bulk Actions Floating Bar */}
        {selectedIds.length > 0 && (
          <div className="mb-3 p-3 rounded-xl bg-accent-blue/10 border border-accent-blue/30 flex flex-wrap items-center justify-between gap-3 animate-fade-in text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full font-mono font-bold bg-accent-blue text-white text-[11px]">
                {selectedIds.length}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                alerts selected across current page
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkEscalate}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-blue text-white font-medium hover:bg-blue-600 transition-colors shadow-xs"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Escalate selected to L2
              </button>
              <button
                onClick={() => handleBulkClose('True Positive')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Close as TP
              </button>
              <button
                onClick={() => handleBulkClose('False Positive')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                Close as FP
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Alerts Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#1f2b42]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-[#162238] sticky top-0 z-10 border-b border-slate-200 dark:border-[#1f2b42]">
              <tr className="text-slate-600 dark:text-[#94a3bb] font-semibold">
                {/* Row selection master checkbox */}
                <th className="py-3 px-3 w-8">
                  <button
                    onClick={handleSelectAll}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    aria-label="Select all on this page"
                  >
                    {selectedIds.length > 0 && selectedIds.length === paginatedAlerts.length ? (
                      <CheckSquare className="w-4 h-4 text-accent-blue" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-2 w-8"></th>
                <th 
                  onClick={() => toggleSort('timestamp')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none whitespace-nowrap"
                >
                  Time {renderSortIndicator('timestamp')}
                </th>
                <th 
                  onClick={() => toggleSort('alert_name')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                >
                  Alert Name & ID {renderSortIndicator('alert_name')}
                </th>
                <th 
                  onClick={() => toggleSort('severity')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                >
                  Severity {renderSortIndicator('severity')}
                </th>
                <th 
                  onClick={() => toggleSort('status')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                >
                  Status {renderSortIndicator('status')}
                </th>
                <th 
                  onClick={() => toggleSort('verdict')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                >
                  Verdict {renderSortIndicator('verdict')}
                </th>
                <th 
                  onClick={() => toggleSort('risk_score')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                >
                  Risk Score {renderSortIndicator('risk_score')}
                </th>
                <th className="py-3 px-3">Assignee</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1f2b42]/60">
              {paginatedAlerts.map((alert) => {
                const isExpanded = expandedId === alert.alert_id;
                const isSelected = selectedIds.includes(alert.alert_id);

                // Format timestamp MM-DD HH:MM
                const dateParts = alert.timestamp.split(' ');
                const mmDd = dateParts[0] ? dateParts[0].substring(5) : '09-29';
                const timeStr = `${mmDd} ${dateParts[1] || ''}`;

                // Risk score bar color
                const riskVal = typeof alert.risk_score === 'number' ? alert.risk_score : 0;
                let riskBarColor = 'bg-accent-green';
                if (riskVal >= 85) riskBarColor = 'bg-accent-red';
                else if (riskVal >= 70) riskBarColor = 'bg-accent-amber';
                else if (riskVal >= 50) riskBarColor = 'bg-accent-blue';

                return (
                  <React.Fragment key={alert.alert_id}>
                    <tr
                      onClick={() => toggleExpand(alert.alert_id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-accent-blue/10 dark:bg-accent-blue/15'
                          : isExpanded
                          ? 'bg-accent-blue/5 dark:bg-[#162238]/80'
                          : 'hover:bg-slate-50/80 dark:hover:bg-[#162238]/40'
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleSelectRow(alert.alert_id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-accent-blue" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Expand Chevron */}
                      <td className="py-3 px-2 text-slate-400">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(alert.alert_id);
                          }}
                          className="p-1 hover:text-slate-700 dark:hover:text-white"
                          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-accent-blue" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-[#94a3bb] whitespace-nowrap">
                        {timeStr}
                      </td>

                      {/* Name & ID */}
                      <td className="py-3 px-3 font-medium text-slate-900 dark:text-[#e6ebf5]">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/alert/${alert.alert_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold text-accent-blue hover:underline inline-flex items-center gap-1 group"
                          >
                            <span>{alert.alert_name}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <span className="font-mono text-[11px] text-slate-400 dark:text-[#94a3bb]">
                            {alert.alert_id}
                          </span>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-3">
                        <Badge variant="severity" value={alert.severity} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <Badge variant="status" value={alert.status} size="sm" />
                      </td>

                      {/* Verdict */}
                      <td className="py-3 px-3">
                        <Badge variant="verdict" value={alert.verdict} size="sm" />
                      </td>

                      {/* Risk Score with visual progress bar */}
                      <td className="py-3 px-3 min-w-[110px]">
                        {alert.risk_score !== '-' ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                              <span>{alert.risk_score}</span>
                              <span className="text-[10px] text-slate-400 font-normal">/100</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full ${riskBarColor} rounded-full`}
                                style={{ width: `${Math.min(100, riskVal)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {alert.assignee || 'Unassigned'}
                      </td>

                      {/* Details Link */}
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/alert/${alert.alert_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-accent-blue hover:underline font-medium inline-flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>

                    {/* Expandable Details Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 dark:bg-[#0b1220]/60">
                        <td colSpan={10} className="p-4 sm:p-5 border-t border-b border-slate-200 dark:border-[#1f2b42]">
                          <div className="space-y-4 max-w-5xl">
                            {/* Attack Description */}
                            <div className="p-3.5 rounded-lg bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42] text-xs space-y-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                Attack Summary ({alert.attack_type}):
                              </span>
                              <p className="text-slate-600 dark:text-[#94a3bb] leading-relaxed">
                                {ATTACK_DESCRIPTIONS[alert.attack_type] || 'No summary available.'}
                              </p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              {/* Source IP */}
                              <div className="p-3 rounded-lg bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42]">
                                <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] block mb-1">
                                  Source IP
                                </span>
                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                  {alert.src_ip}
                                </span>
                              </div>

                              {/* Target Host:Port */}
                              <div className="p-3 rounded-lg bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42]">
                                <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] block mb-1">
                                  Target Host : Port
                                </span>
                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                  {alert.dest_host}:{alert.dest_port}
                                </span>
                              </div>

                              {/* Risk / Confidence */}
                              <div className="p-3 rounded-lg bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42]">
                                <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] block mb-1">
                                  Risk / Confidence
                                </span>
                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                  {alert.risk_score} / {alert.confidence_score}
                                </span>
                              </div>

                              {/* Action Taken */}
                              <div className="p-3 rounded-lg bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42]">
                                <span className="text-[11px] text-slate-500 dark:text-[#94a3bb] block mb-1">
                                  Action Taken
                                </span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {alert.action_taken}
                                </span>
                              </div>
                            </div>

                            {/* Detection & Enforcement */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="p-3 rounded-lg bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42] space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">Detection Mode:</span>
                                  <Badge variant="detection" value={alert.detection} size="sm" />
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-[#94a3bb] leading-relaxed">
                                  {DETECTION_MODE_EXPLANATIONS[alert.detection]}
                                </p>
                              </div>

                              <div className="p-3 rounded-lg bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42] space-y-1.5">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                  Enforcement Mitigation:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {alert.enforcement && alert.enforcement.length > 0 ? (
                                    alert.enforcement.map((enf) => (
                                      <Badge key={enf} variant="enforcement" value={enf} size="sm" />
                                    ))
                                  ) : (
                                    <Badge variant="enforcement" value="NONE" size="sm" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Comment */}
                            {alert.comment && (
                              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
                                <span className="font-semibold text-amber-500 dark:text-amber-400 block mb-0.5">
                                  Analyst Note:
                                </span>
                                <p className="text-slate-700 dark:text-slate-300 italic">
                                  "{alert.comment}"
                                </p>
                              </div>
                            )}

                            {/* Live Triage Action Buttons */}
                            <div className="flex items-center justify-between pt-2">
                              <TriageActions alert={alert} />

                              <Link
                                to={`/alert/${alert.alert_id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-colors"
                              >
                                Full Telemetry & Flow Logs →
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-[#94a3bb]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-semibold text-sm">No security alerts found</p>
                      <p className="text-xs">Try adjusting your search terms or clearing the filter chips.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSeverityFilter('All');
                          setStatusFilter('All');
                        }}
                        className="mt-2 px-3 py-1 text-xs font-semibold rounded bg-accent-blue/15 text-accent-blue hover:bg-accent-blue/25 transition-colors"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {filteredAlerts.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-[#1f2b42] text-xs">
            <span className="text-slate-500 dark:text-[#94a3bb]">
              Showing <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, filteredAlerts.length)}</span> of{' '}
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{filteredAlerts.length}</span> alerts
            </span>

            <div className="flex items-center gap-1 self-center">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1f2b42] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#162238] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-mono text-xs font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-accent-blue text-white shadow-xs'
                        : 'text-slate-600 dark:text-[#94a3bb] hover:bg-slate-100 dark:hover:bg-[#162238] border border-transparent'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1f2b42] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#162238] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* New Alert Modal */}
      <NewAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Export Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-[#162238] dark:text-[#e6ebf5] border border-slate-700 dark:border-[#1f2b42] shadow-2xl backdrop-blur-md text-xs font-semibold animate-fade-in transition-all">
          <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
