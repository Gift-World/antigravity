// src/components/live/LiveCommandCenter.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { FlipCounter } from '@/components/ui/FlipCounter';
import { AntigravityLogo } from '@/components/ui/AntigravityLogo';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VenueHeatmap } from '@/components/live/VenueHeatmap';
import { GateFlowChart } from '@/components/live/GateFlowChart';
import { AlertPanel } from '@/components/live/AlertPanel';
import { IncidentsPanel } from '@/components/live/IncidentsPanel';
import { CommsPanel } from '@/components/live/CommsPanel';
import { CommandTicker } from '@/components/live/CommandTicker';
import { formatTimeElapsed } from '@/lib/utils';
import { useSimulationEngine } from '@/lib/simulation';
import { supabaseService } from '@/lib/supabaseService';
import {
  Shield,
  Radio,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Layers,
  MessageSquare,
  Activity,
  Zap,
} from 'lucide-react';

export const LiveCommandCenter: React.FC = () => {
  // Start simulation background tick
  useSimulationEngine();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    events,
    activeEventId,
    setActiveEventId,
    densityReadings,
    isSimulationActive,
    toggleSimulation,
    isAudioMuted,
    toggleAudioMute,
    updateEventStatus,
    criticalFlashAlert,
    dismissCriticalFlash,
    triggerAlert,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'alerts' | 'gates' | 'incidents' | 'comms'>('alerts');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('03:15:42');

  const event = events.find((e) => e.id === (id || activeEventId)) || events[0];

  useEffect(() => {
    if (id && id !== activeEventId) {
      setActiveEventId(id);
    }
  }, [id, activeEventId, setActiveEventId]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (event?.doors_open) {
        setElapsedTime(formatTimeElapsed(event.doors_open));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [event]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Peak spatial density across stadium sectors
  const peakDensity = Math.max(...densityReadings.map((r) => r.density_per_sqm), 0);
  const isCritical = peakDensity >= 5.5;
  const isElevated = peakDensity >= 4.5;

  const handleEndEvent = () => {
    if (confirm('Are you sure you want to end this live event? Safety compliance audit will be generated.')) {
      updateEventStatus(event.id, 'ended');
      navigate('/dashboard/analytics');
    }
  };

  return (
    <div className="h-screen w-screen bg-ag-black text-ag-text-primary flex flex-col overflow-hidden select-none font-sans fixed inset-0 z-50">
      {/* Critical Red Flash Overlay when high priority hazard occurs */}
      {criticalFlashAlert && (
        <div className="fixed inset-0 z-[100] bg-ag-red/90 backdrop-blur-md flex items-center justify-center p-6 text-white animate-flash-critical">
          <div className="max-w-2xl w-full bg-ag-black/95 border-2 border-white rounded-[12px] p-8 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-ag-red flex items-center justify-center mx-auto animate-bounce shadow-2xl">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-display font-bold text-3xl tracking-wider uppercase text-white">
              CRITICAL CROWD SURGE ALERT
            </h2>
            <p className="text-lg font-mono text-ag-text-primary">{criticalFlashAlert.message}</p>
            <div className="pt-4 flex items-center justify-center gap-4">
              <Button size="lg" variant="secondary" onClick={dismissCriticalFlash} className="font-bold">
                Acknowledge Directive (Auto-Closing)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TOP MISSION-CONTROL STRIP */}
      <header className="h-16 px-4 sm:px-6 bg-ag-surface border-b border-ag-border flex items-center justify-between z-20 shrink-0">
        {/* Left: Brand Logo & Back Shortcut */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 rounded-[6px] bg-ag-black/50 hover:bg-ag-surface-hover text-ag-text-secondary hover:text-white border border-ag-border transition-colors"
            title="Return to Standard Operations"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <AntigravityLogo size="sm" />
          </Link>
        </div>

        {/* Center: Event Name, Elapsed Time & Flip Attendance Counter */}
        <div className="flex items-center gap-6">
          {/* Event & Clock */}
          <div className="hidden lg:block text-center">
            <div className="font-display font-bold text-sm tracking-wide uppercase text-white truncate max-w-xs">
              {event.title}
            </div>
            <div className="text-[10px] font-mono text-ag-text-secondary flex items-center justify-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3 text-ag-blue" />
              <span>Elapsed: {elapsedTime}</span>
              <span>•</span>
              <span>{event.venue?.name || 'Nyayo Stadium'}</span>
            </div>
          </div>

          {/* Giant Flip Attendance Counter */}
          <div className="flex items-center gap-4 px-4 py-1 rounded-[8px] bg-ag-black/70 border border-ag-border shadow-inner">
            <FlipCounter
              value={event.current_attendance}
              max={event.max_capacity}
              label="Live Attendance"
              size="md"
            />

            {/* Overall Risk Level Indicator */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-ag-border">
              {isCritical ? (
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-ag-red animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-ag-red animate-ping" />
                  CRITICAL
                </span>
              ) : isElevated ? (
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-ag-yellow">
                  <span className="w-2.5 h-2.5 rounded-full bg-ag-yellow" />
                  ELEVATED
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-ag-green">
                  <span className="w-2.5 h-2.5 rounded-full bg-ag-green" />
                  SAFE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls & END EVENT Red Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Simulation Toggle */}
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-[6px] border transition-all ${
              isSimulationActive
                ? 'bg-ag-green-dim border-ag-green/40 text-ag-green'
                : 'bg-ag-black/50 border-ag-border text-ag-text-muted'
            }`}
            title="Toggle Live Telemetry Simulation"
          >
            {isSimulationActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-ag-green animate-ping" />
                <span className="hidden xl:inline font-semibold">SIMULATION ON</span>
                <Pause className="w-3 h-3 ml-0.5" />
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-ag-text-muted" />
                <span className="hidden xl:inline">SIMULATION OFF</span>
                <Play className="w-3 h-3 ml-0.5" />
              </>
            )}
          </button>

          {/* Audio Mute */}
          <button
            onClick={toggleAudioMute}
            className="p-2 text-ag-text-secondary hover:text-white bg-ag-black/50 hover:bg-ag-surface-hover border border-ag-border rounded-[6px] transition-colors"
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-ag-red" /> : <Volume2 className="w-4 h-4 text-ag-green" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-ag-text-secondary hover:text-white bg-ag-black/50 hover:bg-ag-surface-hover border border-ag-border rounded-[6px] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* END EVENT RED BUTTON */}
          <Button
            size="sm"
            variant="danger"
            onClick={handleEndEvent}
            className="text-xs font-bold bg-ag-red hover:bg-ag-red/90 px-3.5 shadow-lg shadow-ag-red/20 uppercase"
          >
            END EVENT
          </Button>
        </div>
      </header>

      {/* MAIN COCKPIT VIEW (60% Heatmap / 40% Tabbed Command Feed) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden p-3 sm:p-4 gap-3 sm:gap-4">
        {/* LEFT 60%: VENUE SPATIAL HEATMAP */}
        <div className="w-full lg:w-[60%] h-[55%] lg:h-full flex flex-col min-h-0">
          <VenueHeatmap />
        </div>

        {/* RIGHT 40%: TABBED COMMAND PANEL */}
        <div className="w-full lg:w-[40%] h-[45%] lg:h-full flex flex-col min-h-0 bg-ag-surface border border-ag-border rounded-[8px] overflow-hidden">
          {/* Tab Headers */}
          <div className="flex items-center border-b border-ag-border bg-ag-surface-hover/50 px-2 pt-2 shrink-0">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-t border-b-2 transition-all ${
                activeTab === 'alerts'
                  ? 'border-ag-red text-ag-red bg-ag-surface font-bold shadow-sm'
                  : 'border-transparent text-ag-text-secondary hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ALERTS</span>
            </button>

            <button
              onClick={() => setActiveTab('gates')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-t border-b-2 transition-all ${
                activeTab === 'gates'
                  ? 'border-ag-green text-ag-green bg-ag-surface font-bold shadow-sm'
                  : 'border-transparent text-ag-text-secondary hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>GATES</span>
            </button>

            <button
              onClick={() => setActiveTab('incidents')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-t border-b-2 transition-all ${
                activeTab === 'incidents'
                  ? 'border-ag-yellow text-ag-yellow bg-ag-surface font-bold shadow-sm'
                  : 'border-transparent text-ag-text-secondary hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>INCIDENTS</span>
            </button>

            <button
              onClick={() => setActiveTab('comms')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-t border-b-2 transition-all ${
                activeTab === 'comms'
                  ? 'border-ag-blue text-ag-blue bg-ag-surface font-bold shadow-sm'
                  : 'border-transparent text-ag-text-secondary hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>COMMS</span>
            </button>
          </div>

          {/* Active Tab Panel Body */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === 'alerts' && <AlertPanel />}
            {activeTab === 'gates' && <GateFlowChart />}
            {activeTab === 'incidents' && <IncidentsPanel />}
            {activeTab === 'comms' && <CommsPanel />}
          </div>
        </div>
      </div>

      {/* BOTTOM SCROLLING TELEMETRY TICKER */}
      <CommandTicker />
    </div>
  );
};
