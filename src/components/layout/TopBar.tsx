// src/components/layout/TopBar.tsx
import React from 'react';
import { useAppStore } from '@/lib/store';
import { UserRole } from '@/types/database';
import { AntigravityLogo } from '@/components/ui/AntigravityLogo';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Shield,
  Stethoscope,
  Users,
  UserCheck,
  Radio,
  ExternalLink,
  Smartphone,
  QrCode,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TopBar: React.FC = () => {
  const {
    currentUser,
    users,
    setCurrentUser,
    setUserRole,
    isSimulationActive,
    toggleSimulation,
    isAudioMuted,
    toggleAudioMute,
    activeEventId,
  } = useAppStore();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setUserRole(role);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
      case 'org_admin':
        return <Shield className="w-3.5 h-3.5 text-ag-yellow" />;
      case 'security':
        return <Shield className="w-3.5 h-3.5 text-ag-yellow" />;
      case 'medical':
        return <Stethoscope className="w-3.5 h-3.5 text-ag-red" />;
      case 'event_manager':
        return <UserCheck className="w-3.5 h-3.5 text-ag-green" />;
      default:
        return <Users className="w-3.5 h-3.5 text-ag-blue" />;
    }
  };

  return (
    <header className="h-16 bg-ag-surface border-b border-ag-border px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand / Logo */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <AntigravityLogo size="sm" />
        </Link>
      </div>

      {/* Center Actions / Direct App Links */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          to={`/dashboard/events/${activeEventId}/live`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-ag-red-dim hover:bg-ag-red/20 border border-ag-red/40 text-xs font-mono text-ag-red font-bold transition-colors"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Launch Mission Control</span>
        </Link>

        <Link
          to="/scanner"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-ag-black/60 hover:bg-ag-surface-hover border border-ag-border text-xs font-mono text-ag-green transition-colors"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Scanner PWA</span>
        </Link>

        <Link
          to="/app"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-ag-black/60 hover:bg-ag-surface-hover border border-ag-border text-xs font-mono text-ag-blue transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Attendee App</span>
        </Link>
      </div>

      {/* Right Controls: Simulation toggle, Audio, Persona */}
      <div className="flex items-center gap-3">
        {/* Simulation Mode Toggle Button */}
        <button
          onClick={toggleSimulation}
          className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-[6px] border transition-all ${
            isSimulationActive
              ? 'bg-ag-green-dim border-ag-green/40 text-ag-green'
              : 'bg-ag-black/40 border-ag-border text-ag-text-muted'
          }`}
          title="Toggle Simulation Generator"
        >
          {isSimulationActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-ag-green animate-ping" />
              <span className="hidden sm:inline font-semibold">SIMULATION ON</span>
              <Pause className="w-3 h-3 ml-0.5" />
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-ag-text-muted" />
              <span className="hidden sm:inline">SIMULATION PAUSED</span>
              <Play className="w-3 h-3 ml-0.5" />
            </>
          )}
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleAudioMute}
          className="p-2 text-ag-text-secondary hover:text-white bg-ag-black/50 hover:bg-ag-surface-hover border border-ag-border rounded-[6px] transition-colors"
          title={isAudioMuted ? 'Unmute Alarms' : 'Mute Alarms'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-ag-red" /> : <Volume2 className="w-4 h-4 text-ag-green" />}
        </button>

        {/* Role Selector Pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-ag-border">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-ag-border bg-ag-black shrink-0 hidden sm:block">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser.full_name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
              {currentUser.full_name}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {getRoleIcon(currentUser.role)}
              <select
                value={currentUser.role}
                onChange={handleRoleChange}
                aria-label="Select User Role Perspective"
                className="bg-transparent text-[10px] font-mono uppercase tracking-wider text-ag-text-secondary hover:text-white border-none p-0 focus:outline-none cursor-pointer"
              >
                <option value="super_admin" className="bg-ag-surface text-white">
                  Super Admin
                </option>
                <option value="event_manager" className="bg-ag-surface text-white">
                  Event Manager
                </option>
                <option value="security" className="bg-ag-surface text-white">
                  Security Lead
                </option>
                <option value="medical" className="bg-ag-surface text-white">
                  Medical Lead
                </option>
                <option value="attendee" className="bg-ag-surface text-white">
                  Attendee
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
