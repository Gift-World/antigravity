// src/components/layout/DashboardSidebar.tsx
import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Ticket,
  AlertTriangle,
  BarChart3,
  Users,
  Settings,
  QrCode,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const DashboardSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { events, activeEventId, incidents, alerts } = useAppStore();

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const openIncidentsCount = incidents.filter((i) => i.status !== 'resolved').length;

  const mainNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Events', path: '/dashboard/events', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Venues', path: '/dashboard/venues', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Tickets', path: '/dashboard/tickets', icon: <Ticket className="w-4 h-4" /> },
    {
      label: 'Incidents',
      path: '/dashboard/incidents',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: openIncidentsCount > 0 ? openIncidentsCount : undefined,
    },
    { label: 'Analytics', path: '/dashboard/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Team', path: '/dashboard/team', icon: <Users className="w-4 h-4" /> },
    { label: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-ag-surface border-r border-ag-border flex flex-col justify-between transition-all duration-300 z-40 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Logo Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-ag-border">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden group">
            {/* Stylized Antigravity A logo */}
            <div className="w-8 h-8 rounded-lg bg-ag-black border border-ag-blue/40 flex items-center justify-center shrink-0 shadow-md group-hover:border-ag-green transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none">
                <defs>
                  <linearGradient id="sideLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#448AFF" />
                    <stop offset="100%" stopColor="#00E676" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 18 L24 82 L38 82 L44 68 L56 68 L62 82 L76 82 Z"
                  stroke="url(#sideLogoGrad)"
                  strokeWidth="6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <path d="M50 38 L50 68" stroke="url(#sideLogoGrad)" strokeWidth="6" strokeLinecap="round" />
                <path
                  d="M42 48 L50 38 L58 48"
                  stroke="url(#sideLogoGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm tracking-wider text-ag-text-primary group-hover:text-white transition-colors">
                  ANTIGRAVITY
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-ag-green">
                  MISSION CONTROL
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-ag-text-muted hover:text-ag-text-primary hover:bg-ag-surface-hover transition-colors hidden sm:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Command Center Hero Link */}
        {activeEvent?.status === 'live' && (
          <div className="p-3">
            <Link
              to={`/dashboard/events/${activeEvent.id}/live`}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-[6px] bg-ag-red-dim border border-ag-red/40 text-ag-red hover:bg-ag-red/20 transition-all ${
                collapsed ? 'justify-center' : ''
              }`}
              title="Launch Live Command Center"
            >
              <Radio className="w-4 h-4 animate-pulse shrink-0 text-ag-red" />
              {!collapsed && (
                <div className="text-left flex-1 min-w-0">
                  <div className="text-[11px] font-bold tracking-wider font-display uppercase leading-tight">
                    COMMAND CENTER
                  </div>
                  <div className="text-[10px] font-mono text-ag-red/80 truncate">
                    {activeEvent.title}
                  </div>
                </div>
              )}
            </Link>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="p-2 space-y-1">
          {mainNavItems.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-[6px] text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-ag-surface-hover text-white border-l-2 border-ag-blue font-semibold shadow-sm'
                    : 'text-ag-text-secondary hover:text-ag-text-primary hover:bg-ag-surface-hover/50'
                } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-ag-blue' : 'text-ag-text-muted shrink-0'}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="flex-1 flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-ag-red text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom PWA & Mobile View Launchers */}
      <div className="p-3 border-t border-ag-border bg-ag-black/30 space-y-1.5">
        {!collapsed && (
          <div className="text-[10px] font-mono text-ag-text-muted uppercase tracking-wider px-2 mb-1">
            Mobile Apps
          </div>
        )}

        {/* Gate Scanner Link */}
        <Link
          to="/scanner"
          target="_blank"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium text-ag-text-secondary hover:text-ag-green hover:bg-ag-surface-hover border border-transparent hover:border-ag-green/20 transition-all ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title="Open Gate Scanner Mobile PWA"
        >
          <QrCode className="w-4 h-4 text-ag-green shrink-0" />
          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <span>Gate Scanner PWA</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
          )}
        </Link>

        {/* Attendee App Link */}
        <Link
          to="/app"
          target="_blank"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium text-ag-text-secondary hover:text-ag-blue hover:bg-ag-surface-hover border border-transparent hover:border-ag-blue/20 transition-all ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title="Open Attendee Mobile App"
        >
          <Smartphone className="w-4 h-4 text-ag-blue shrink-0" />
          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <span>Attendee App</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
};
