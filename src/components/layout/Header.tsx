import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Sun, 
  Moon, 
  Bell, 
  Pause, 
  Play, 
  Search, 
  CheckCheck, 
  ExternalLink,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { Badge } from '../common/Badge';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  openCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen, isCollapsed, openCommandPalette }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    theme, 
    toggleTheme, 
    isLiveFeedPaused, 
    toggleLiveFeed, 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useSecurity();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine title and subtitle based on route
  let title = 'Security Operations Overview';
  let subtitle = 'Live traffic, enforcement and alert triage';

  if (location.pathname === '/alerts') {
    title = 'Alert queue';
    subtitle = 'Triage, escalate and close security alerts';
  } else if (location.pathname.startsWith('/alert/')) {
    title = 'Alert detail';
    subtitle = 'Forensic packet telemetry and analyst triage';
  } else if (location.pathname === '/model') {
    title = 'Model performance';
    subtitle = 'ML classifier quality, explainability and analyst feedback';
  } else if (location.pathname === '/topology') {
    title = 'Network topology';
    subtitle = 'How traffic flows through the four layers';
  } else if (location.pathname === '/settings') {
    title = 'Settings';
    subtitle = 'Thresholds and data source configuration';
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#0b1220]/80 backdrop-blur-md border-b border-slate-200 dark:border-[#1f2b42] px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-[#94a3bb] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111a2b] transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#e6ebf5] tracking-tight">
            {title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-[#94a3bb]">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command Palette Trigger Button */}
        <button
          onClick={openCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42] text-xs text-slate-500 dark:text-[#94a3bb] hover:border-accent-blue hover:text-slate-900 dark:hover:text-white transition-all shadow-xs"
        >
          <Search className="w-3.5 h-3.5 text-accent-blue" />
          <span>Quick search...</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#162238] border border-slate-300 dark:border-[#1f2b42] text-slate-600 dark:text-slate-300">
            Ctrl+K
          </kbd>
        </button>

        {/* Live Feed Toggle Button */}
        <button
          onClick={toggleLiveFeed}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            isLiveFeedPaused
              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
          }`}
          title={isLiveFeedPaused ? 'Click to resume live simulated feed' : 'Click to pause live simulated feed'}
        >
          {isLiveFeedPaused ? (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Resume feed</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Pause className="w-3 h-3 ml-0.5" />
              <span className="hidden sm:inline">Live feed</span>
            </>
          )}
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2 rounded-xl text-slate-500 dark:text-[#94a3bb] hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-red text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {notifDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42] shadow-2xl z-40 overflow-hidden text-xs">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#1f2b42] bg-slate-50 dark:bg-[#0b1220]/60">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-[#e6ebf5]">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-accent-red/20 text-accent-red border border-accent-red/30">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-accent-blue hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1f2b42]/60">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      setNotifDropdownOpen(false);
                      navigate(`/alert/${notif.alert_id}`);
                    }}
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-[#162238] cursor-pointer transition-colors flex items-start gap-3 ${
                      !notif.read ? 'bg-accent-blue/5 dark:bg-[#162238]/40' : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      <span className={`w-2 h-2 rounded-full inline-block ${!notif.read ? 'bg-accent-blue' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-[#e6ebf5] leading-tight">
                          {notif.title}
                        </span>
                        <Badge variant="severity" value={notif.severity} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <span>{notif.alert_id}</span>
                        <span>•</span>
                        <span>{notif.timestamp} UTC</span>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    No new incident notifications
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-slate-200 dark:border-[#1f2b42] text-center bg-slate-50 dark:bg-[#0b1220]/60">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(false);
                    navigate('/alerts');
                  }}
                  className="text-xs text-accent-blue hover:underline font-semibold"
                >
                  View full alert queue →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-[#94a3bb] hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#111a2b] border border-slate-200 dark:border-[#1f2b42] transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-accent-amber" />
          ) : (
            <Moon className="w-4 h-4 text-accent-blue" />
          )}
        </button>
      </div>
    </header>
  );
};
