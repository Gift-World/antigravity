// src/components/layout/DashboardSidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  Settings,
  Activity,
  ArrowUpRight,
  X,
} from 'lucide-react';

export const DashboardSidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = false, onClose }) => {
  const { activeEventId, events, currentUser } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const isEventManager = currentUser.role === 'event_manager';

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { to: '/dashboard/events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { to: `/dashboard/events/${activeEvent?.id || 'live'}/live`, label: 'Live View', icon: <Activity className="w-4 h-4 text-ag-green" /> },
    ...(!isEventManager
      ? [
          { to: '/dashboard/venues', label: 'Venues', icon: <Building2 className="w-4 h-4" /> },
          { to: '/dashboard/team', label: 'Team', icon: <Users className="w-4 h-4" /> },
        ]
      : []),
    { to: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col justify-between border-r border-ag-border bg-ag-surface font-sans shadow-2xl transition-transform duration-200 md:static md:z-auto md:w-60 md:translate-x-0 md:shadow-none ${isOpen ? 'translate-x-0' : ''}`}>
      {/* Top Navigation Links */}
      <div className="p-3 space-y-4">
        <div className="flex items-center justify-between px-1 md:hidden"><p className="text-xs font-bold uppercase tracking-[.16em] text-ag-text-muted">Navigation</p><button onClick={onClose} className="rounded-lg p-2 text-ag-text-secondary hover:bg-ag-surface-hover hover:text-white" aria-label="Close navigation"><X className="h-4 w-4" /></button></div>
        {/* Live View Quick Card */}
        {activeEvent && (
          <NavLink
            to={`/dashboard/events/${activeEvent.id}/live`}
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-ag-green-dim/30 to-ag-surface border border-ag-green/40 text-white hover:border-ag-green transition-all shadow-md group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-ag-green animate-pulse" />
              <div className="text-left">
                <div className="font-bold text-xs uppercase tracking-wide text-white">
                  Live View
                </div>
                <div className="text-[11px] text-ag-text-secondary truncate max-w-[120px]">
                  {activeEvent.title}
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-ag-green group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </NavLink>
        )}

        {/* Links Menu */}
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-ag-surface-hover text-white border-l-2 border-ag-blue font-semibold shadow-sm'
                    : 'text-ag-text-secondary hover:text-white hover:bg-ag-surface-hover/50'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-ag-border text-xs text-ag-text-muted space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span>ANTIGRAVITY</span>
          <span className="text-ag-green font-bold">Nairobi</span>
        </div>
      </div>
    </aside>
  );
};
