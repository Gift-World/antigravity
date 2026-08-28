// src/components/layout/TopBar.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserRole } from '@/types/database';
import {
  Bell,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Radio,
  ExternalLink,
  ChevronDown,
  Shield,
  Stethoscope,
  UserCheck,
  Smartphone,
  Flame,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    currentOrg,
    events,
    activeEventId,
    setUserRole,
    isSimulationActive,
    toggleSimulation,
    isAudioMuted,
    toggleAudioMute,
    alerts,
  } = useAppStore();

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const unreadAlerts = alerts.filter((a) => !a.acknowledged_at);

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    super_admin: { label: 'Super Admin', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-ag-purple' },
    org_admin: { label: 'Org Admin', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-ag-blue' },
    event_manager: { label: 'Event Manager', icon: <UserCheck className="w-3.5 h-3.5" />, color: 'text-ag-green' },
    security: { label: 'Security Lead', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-ag-yellow' },
    medical: { label: 'Chief Medical', icon: <Stethoscope className="w-3.5 h-3.5" />, color: 'text-ag-red' },
    vendor: { label: 'Vendor Pos', icon: <Smartphone className="w-3.5 h-3.5" />, color: 'text-ag-orange' },
    attendee: { label: 'Attendee View', icon: <Smartphone className="w-3.5 h-3.5" />, color: 'text-ag-text-secondary' },
  };

  return (
    <header className="h-16 border-b border-ag-border bg-ag-surface/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Organization & Active Event Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-ag-border bg-ag-black/50 shrink-0">
            <img src={currentOrg.logo_url} alt={currentOrg.name} className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-ag-text-primary leading-tight">{currentOrg.name}</div>
            <div className="text-[10px] text-ag-text-secondary font-mono">Nairobi Ops Center</div>
          </div>
        </div>

        <div className="h-4 w-px bg-ag-border hidden md:block" />

        {/* Live Event Tag */}
        {activeEvent && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-ag-text-muted">Event:</span>
            <Link
              to={`/dashboard/events/${activeEvent.id}/overview`}
              className="text-xs font-medium text-ag-text-primary hover:text-ag-blue flex items-center gap-1.5 transition-colors"
            >
              <span className="truncate max-w-[180px]">{activeEvent.title}</span>
              {activeEvent.status === 'live' && (
                <Badge variant="red" pulse size="sm">
                  LIVE
                </Badge>
              )}
            </Link>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Command Center Launch Button */}
        {activeEvent?.status === 'live' && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => navigate(`/dashboard/events/${activeEvent.id}/live`)}
            className="animate-pulse-slow shadow-ag-red/30 shadow-lg text-xs"
            leftIcon={<Radio className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">LAUNCH</span> COMMAND CENTER
          </Button>
        )}

        {/* Simulation Mode Toggle */}
        <button
          onClick={toggleSimulation}
          title={isSimulationActive ? 'Pause Demo Telemetry Simulation' : 'Resume Demo Telemetry Simulation'}
          className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-[6px] border transition-all ${
            isSimulationActive
              ? 'bg-ag-green-dim border-ag-green/40 text-ag-green'
              : 'bg-ag-surface-hover border-ag-border text-ag-text-muted'
          }`}
        >
          {isSimulationActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-ag-green animate-ping" />
              <span className="hidden sm:inline font-semibold">SIMULATION ON</span>
              <Pause className="w-3 h-3 ml-1" />
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-ag-text-muted" />
              <span className="hidden sm:inline">SIMULATION OFF</span>
              <Play className="w-3 h-3 ml-1" />
            </>
          )}
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleAudioMute}
          title={isAudioMuted ? 'Unmute alert sirens & chimes' : 'Mute audio'}
          className="p-2 text-ag-text-secondary hover:text-ag-text-primary bg-ag-black/40 hover:bg-ag-surface-hover border border-ag-border rounded-[6px] transition-colors"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-ag-red" /> : <Volume2 className="w-4 h-4 text-ag-green" />}
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="p-2 relative text-ag-text-secondary hover:text-ag-text-primary bg-ag-black/40 hover:bg-ag-surface-hover border border-ag-border rounded-[6px] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-ag-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-ag-surface border border-ag-border rounded-[8px] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-ag-border mb-2">
                <span className="font-display text-xs font-bold text-ag-text-primary">LIVE SAFETY ALERTS</span>
                <span className="text-[10px] font-mono text-ag-text-muted">{unreadAlerts.length} Active</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {alerts.length === 0 ? (
                  <p className="text-xs text-ag-text-muted text-center py-4">No active alerts</p>
                ) : (
                  alerts.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className={`p-2.5 rounded border text-xs ${
                        a.severity === 'critical'
                          ? 'bg-ag-red-dim border-ag-red/40 text-ag-red'
                          : a.severity === 'warning'
                          ? 'bg-ag-yellow-dim border-ag-yellow/40 text-ag-yellow'
                          : 'bg-ag-surface-hover border-ag-border text-ag-text-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold uppercase tracking-wider text-[10px]">{a.alert_type}</span>
                        <span className="text-[10px] font-mono opacity-80">
                          {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-snug text-ag-text-primary text-[11px]">{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-ag-black/40 hover:bg-ag-surface-hover border border-ag-border rounded-[6px] transition-colors"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-ag-border">
              <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-full h-full object-cover" />
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-semibold text-ag-text-primary leading-tight truncate max-w-[100px]">
                {currentUser.full_name.split(' ')[0]}
              </div>
              <div className={`text-[10px] font-mono ${roleLabels[currentUser.role]?.color || 'text-ag-blue'}`}>
                {roleLabels[currentUser.role]?.label || currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-ag-text-muted" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-ag-surface border border-ag-border rounded-[8px] shadow-2xl p-1.5 z-50">
              <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase text-ag-text-muted border-b border-ag-border mb-1">
                Switch Perspective (Demo)
              </div>
              {(Object.keys(roleLabels) as UserRole[]).map((role) => {
                const item = roleLabels[role];
                const isSelected = currentUser.role === role;
                return (
                  <button
                    key={role}
                    onClick={() => {
                      setUserRole(role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors ${
                      isSelected ? 'bg-ag-blue-dim text-ag-blue font-semibold' : 'text-ag-text-secondary hover:bg-ag-surface-hover hover:text-ag-text-primary'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={item.color}>{item.icon}</span>
                      {item.label}
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-ag-blue" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
