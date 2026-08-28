// src/components/layout/DashboardSidebar.tsx
import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Ticket,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Settings,
  Radio,
  ExternalLink,
  Plus,
} from 'lucide-react';

export const DashboardSidebar: React.FC = () => {
  const { activeEventId, events } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const links = [
    { to: '/dashboard', label: 'Operations Hub', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { to: '/dashboard/events', label: 'Events & Gates', icon: <Calendar className="w-4 h-4" /> },
    { to: '/dashboard/venues', label: 'Venues & Topography', icon: <Building2 className="w-4 h-4" /> },
    { to: '/dashboard/tickets', label: 'Ticket Vault & QR', icon: <Ticket className="w-4 h-4" /> },
    { to: '/dashboard/incidents', label: 'Incidents & Triage', icon: <AlertTriangle className="w-4 h-4" /> },
    { to: '/dashboard/analytics', label: 'Safety Compliance', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { to: '/dashboard/team', label: 'Responders & Roster', icon: <Users className="w-4 h-4" /> },
    { to: '/dashboard/settings', label: 'Settings & Integrations', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-ag-surface border-r border-ag-border flex flex-col justify-between select-none shrink-0 font-sans">
      {/* Top Navigation Links */}
      <div className="p-3 space-y-4">
        {/* Live Command Center Launch Button */}
        {activeEvent && (
          <NavLink
            to={`/dashboard/events/${activeEvent.id}/live`}
            className="flex items-center justify-between p-3 rounded-[8px] bg-gradient-to-r from-ag-red-dim/40 to-ag-surface border border-ag-red/50 text-white hover:border-ag-red transition-all shadow-lg group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-ag-red animate-ping" />
              <div className="text-left">
                <div className="font-display font-bold text-xs uppercase tracking-wider text-white">
                  Live Command Center
                </div>
                <div className="text-[10px] font-mono text-ag-red">
                  {activeEvent.title.substring(0, 18)}...
                </div>
              </div>
            </div>
            <Radio className="w-4 h-4 text-ag-red group-hover:scale-110 transition-transform" />
          </NavLink>
        )}

        {/* Links Menu */}
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-ag-surface-hover text-white border-l-2 border-ag-blue font-bold shadow-sm'
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

      {/* Footer Support Info */}
      <div className="p-3 border-t border-ag-border text-[11px] font-mono text-ag-text-muted space-y-1">
        <div className="flex items-center justify-between">
          <span>ANTIGRAVITY OS</span>
          <span className="text-ag-green font-bold">v1.0.0</span>
        </div>
        <div className="text-[10px] text-ag-text-muted">
          Nyayo Stadium Telemetry Active
        </div>
      </div>
    </aside>
  );
};
