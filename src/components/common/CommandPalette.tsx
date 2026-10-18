import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  AlertTriangle, 
  Cpu, 
  Network, 
  Settings as SettingsIcon, 
  ArrowRight, 
  ShieldAlert,
  Server,
  Command,
  X
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { Badge } from './Badge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { alerts } = useSecurity();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const navCommands = [
    { id: 'nav-overview', label: 'Overview', desc: 'Security Operations Overview & KPIs', icon: LayoutDashboard, path: '/' },
    { id: 'nav-alerts', label: 'Alert Queue', desc: 'Triage, escalate and close security alerts', icon: AlertTriangle, path: '/alerts' },
    { id: 'nav-model', label: 'Model Performance', desc: 'ML metrics, confusion matrix & feature weights', icon: Cpu, path: '/model' },
    { id: 'nav-topology', label: 'Network Topology', desc: 'Four-layer architecture & OVS bridge zones', icon: Network, path: '/topology' },
    { id: 'nav-settings', label: 'Settings', desc: 'Detection thresholds & data source setup', icon: SettingsIcon, path: '/settings' },
  ];

  const filteredNav = navCommands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    cmd.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAlerts = alerts.filter(a => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      a.alert_id.toLowerCase().includes(q) ||
      a.alert_name.toLowerCase().includes(q) ||
      a.src_ip.toLowerCase().includes(q) ||
      a.dest_host.toLowerCase().includes(q) ||
      a.attack_type.toLowerCase().includes(q)
    );
  }).slice(0, 6);

  const allItems = [
    ...filteredNav.map(n => ({ type: 'nav' as const, item: n })),
    ...filteredAlerts.map(a => ({ type: 'alert' as const, item: a }))
  ];

  // Handle arrow keys and enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(allItems.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allItems.length) % Math.max(allItems.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allItems[selectedIndex];
        if (selected) {
          if (selected.type === 'nav') {
            navigate(selected.item.path);
          } else {
            navigate(`/alert/${selected.item.alert_id}`);
          }
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allItems, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42] shadow-2xl overflow-hidden z-10 animate-fade-in">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-[#1f2b42]">
          <Search className="w-5 h-5 text-accent-blue shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search alert ID, IP, host, attack..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-[#e6ebf5] placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-[#1f2b42]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {/* Navigation Section */}
          {filteredNav.length > 0 && (
            <div className="mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94a3bb] px-3 py-1 block">
                Navigation
              </span>
              {filteredNav.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = selectedIndex === idx;

                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      navigate(cmd.path);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-accent-blue/15 text-slate-900 dark:text-white border border-accent-blue/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#162238] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-accent-blue text-white' : 'bg-slate-100 dark:bg-[#162238] text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold block">{cmd.label}</span>
                        <span className="text-[11px] text-slate-400">{cmd.desc}</span>
                      </div>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-accent-blue' : 'text-slate-400 opacity-0'}`} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Matching Alerts Section */}
          {filteredAlerts.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94a3bb] px-3 py-1 block">
                Matching Security Alerts ({filteredAlerts.length})
              </span>
              {filteredAlerts.map((alert, idx) => {
                const itemIndex = filteredNav.length + idx;
                const isSelected = selectedIndex === itemIndex;

                return (
                  <button
                    key={alert.alert_id}
                    onClick={() => {
                      navigate(`/alert/${alert.alert_id}`);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-accent-blue/15 text-slate-900 dark:text-white border border-accent-blue/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#162238] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-[#162238] text-accent-red'}`}>
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-accent-blue">{alert.alert_id}</span>
                          <span className="font-semibold">{alert.alert_name}</span>
                          <Badge variant="severity" value={alert.severity} size="sm" />
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>Src: {alert.src_ip}</span>
                          <span>•</span>
                          <span>Dest: {alert.dest_host}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-accent-blue' : 'text-slate-400 opacity-0'}`} />
                  </button>
                );
              })}
            </div>
          )}

          {allItems.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands or security alerts found.
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0b1220] border-t border-slate-200 dark:border-[#1f2b42] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-mono text-accent-blue">SDN Security Core</span>
        </div>
      </div>
    </div>
  );
};
