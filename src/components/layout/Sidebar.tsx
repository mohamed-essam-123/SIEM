import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  AlertTriangle, 
  Cpu, 
  Network, 
  Settings as SettingsIcon,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Radio
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { theme, toggleTheme, awaitingActionCount } = useSecurity();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/alerts', label: 'Alerts', icon: AlertTriangle, badge: awaitingActionCount > 0 ? awaitingActionCount : undefined },
    { to: '/model', label: 'Model performance', icon: Cpu },
    { to: '/topology', label: 'Network topology', icon: Network },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0b1220] border-r border-[#1f2b42] text-[#e6ebf5] transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-[72px]' : 'w-[230px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1f2b42] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center shrink-0 shadow-glow-blue">
              <Shield className="w-5 h-5 text-accent-blue" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                  🛡️ SIEM
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent-blue/20 text-accent-blue border border-accent-blue/40">
                    NDR
                  </span>
                </span>
                <span className="text-[11px] text-[#94a3bb] truncate">SDN Guard Core</span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-[#94a3bb] hover:text-white hover:bg-[#111a2b] transition-colors border border-transparent hover:border-[#1f2b42]"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 group
                  ${isActive
                    ? 'bg-accent-blue/15 text-white border border-accent-blue/30 shadow-sm'
                    : 'text-[#94a3bb] hover:text-[#e6ebf5] hover:bg-[#111a2b] border border-transparent'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-accent-blue' : 'text-[#94a3bb] group-hover:text-white'}`} />
                    {!isCollapsed && (
                      <span className="truncate flex-1 tracking-wide">{item.label}</span>
                    )}
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${isCollapsed ? 'absolute top-1 right-1' : ''} bg-accent-amber/20 text-accent-amber border border-accent-amber/40`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent-blue rounded-r" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer: System Status & Theme Toggle */}
        <div className="p-3 border-t border-[#1f2b42] shrink-0 bg-[#0b1220]/80 space-y-2">
          {/* System Status */}
          <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#111a2b]/70 border border-[#1f2b42]/60 ${isCollapsed ? 'justify-center' : ''}`}>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
            </span>
            {!isCollapsed && (
              <span className="text-[11px] text-[#94a3bb] font-medium truncate">
                All systems operational
              </span>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#94a3bb] hover:text-[#e6ebf5] hover:bg-[#111a2b] transition-colors border border-transparent hover:border-[#1f2b42] ${isCollapsed ? 'justify-center' : ''}`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-accent-amber shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-accent-blue shrink-0" />
            )}
            {!isCollapsed && (
              <span className="truncate">
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
