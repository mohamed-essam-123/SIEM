import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewPage } from './pages/OverviewPage';
import { AlertsPage } from './pages/AlertsPage';
import { AlertDetailPage } from './pages/AlertDetailPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { NetworkTopologyPage } from './pages/NetworkTopologyPage';
import { SettingsPage } from './pages/SettingsPage';
import { CommandPalette } from './components/common/CommandPalette';
import { Modal } from './components/common/Modal';
import { useSecurity } from './context/SecurityContext';
import { ShieldAlert, X, Keyboard, Radio } from 'lucide-react';
import { Badge } from './components/common/Badge';

export const App: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { liveToast, dismissLiveToast } = useSecurity();
  const navigate = useNavigate();

  // Skeleton loading simulation on mount (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut listener (Ctrl+K, Cmd+K, and ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      } else if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShortcutsOpen(prev => !prev);
      } else if (e.key === '1') {
        navigate('/');
      } else if (e.key === '2') {
        navigate('/alerts');
      } else if (e.key === '3') {
        navigate('/model');
      } else if (e.key === '4') {
        navigate('/topology');
      } else if (e.key === '5') {
        navigate('/settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] text-slate-900 dark:text-[#e6ebf5] transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col
          ${isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[230px]'}
        `}
      >
        {/* Top Header */}
        <Header
          isCollapsed={isCollapsed}
          setMobileOpen={setMobileOpen}
          openCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:max-w-none">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-slate-200 dark:bg-[#111a2b] border border-slate-300 dark:border-[#1f2b42]" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-72 rounded-xl bg-slate-200 dark:bg-[#111a2b] border border-slate-300 dark:border-[#1f2b42]" />
                ))}
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/alert/:id" element={<AlertDetailPage />} />
              <Route path="/model" element={<ModelPerformancePage />} />
              <Route path="/topology" element={<NetworkTopologyPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Live Simulation Alert Toast Notification */}
      {liveToast && (
        <div
          onClick={() => {
            navigate(`/alert/${liveToast.alertId}`);
            dismissLiveToast();
          }}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-3 p-3.5 pr-4 rounded-2xl bg-white dark:bg-[#111a2b] border border-red-500/40 shadow-2xl shadow-red-500/10 cursor-pointer hover:border-red-500 transition-all max-w-sm animate-bounce-short"
        >
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-accent-red shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-accent-blue">{liveToast.alertId}</span>
              <Badge variant="severity" value={liveToast.severity} size="sm" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-[#e6ebf5] truncate mt-0.5">
              {liveToast.title}
            </p>
            <span className="text-[10px] text-slate-400">Click to investigate incident →</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissLiveToast();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Keyboard Shortcuts Hint Modal */}
      <Modal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        title="Keyboard Shortcuts"
        subtitle="Quick access key bindings across the SIEM console"
        maxWidth="max-w-md"
      >
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
            <span className="text-slate-600 dark:text-slate-300">Command Palette</span>
            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-[#162238] font-mono font-bold text-slate-800 dark:text-slate-200">
              Ctrl+K / ⌘K
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
            <span className="text-slate-600 dark:text-slate-300">Go to Overview</span>
            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-[#162238] font-mono font-bold text-slate-800 dark:text-slate-200">
              1
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
            <span className="text-slate-600 dark:text-slate-300">Go to Alert Queue</span>
            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-[#162238] font-mono font-bold text-slate-800 dark:text-slate-200">
              2
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
            <span className="text-slate-600 dark:text-slate-300">Go to Model Performance</span>
            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-[#162238] font-mono font-bold text-slate-800 dark:text-slate-200">
              3
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
            <span className="text-slate-600 dark:text-slate-300">Go to Network Topology</span>
            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-[#162238] font-mono font-bold text-slate-800 dark:text-slate-200">
              4
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
            <span className="text-slate-600 dark:text-slate-300">Go to Settings</span>
            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-[#162238] font-mono font-bold text-slate-800 dark:text-slate-200">
              5
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b1220] border border-slate-200 dark:border-[#1f2b42]">
            <span className="text-slate-600 dark:text-slate-300">Open this help dialog</span>
            <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-[#162238] font-mono font-bold text-slate-800 dark:text-slate-200">
              ?
            </kbd>
          </div>
        </div>
      </Modal>
    </div>
  );
};
