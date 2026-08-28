// src/components/live/LiveCommandCenter.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { AntigravityLogo } from '@/components/ui/AntigravityLogo';
import { Button } from '@/components/ui/Button';
import { VenueHeatmap } from '@/components/live/VenueHeatmap';
import { AlertPanel } from '@/components/live/AlertPanel';
import { IncidentsPanel } from '@/components/live/IncidentsPanel';
import { CommsPanel } from '@/components/live/CommsPanel';
import { formatTimeElapsed, formatNumber } from '@/lib/utils';
import { useSimulationEngine } from '@/lib/simulation';
import {
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  AlertTriangle,
  ArrowLeft,
  Clock,
  MessageSquare,
  Activity,
  Shield,
  Send,
  DoorOpen,
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
    isAudioMuted,
    toggleAudioMute,
    updateEventStatus,
    criticalFlashAlert,
    dismissCriticalFlash,
    scansPerMinuteByGate,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'alerts' | 'incidents' | 'comms'>('alerts');
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

  // Peak spatial density
  const peakDensity = Math.max(...densityReadings.map((r) => r.density_per_sqm), 0);
  const isDanger = peakDensity >= 5.5;
  const isCaution = peakDensity >= 4.5 && !isDanger;

  const handleEndEvent = () => {
    if (confirm('Are you sure you want to end this live event?')) {
      updateEventStatus(event.id, 'ended');
      navigate('/dashboard');
    }
  };

  return (
    <div className="h-screen w-screen bg-ag-black text-ag-text-primary flex flex-col overflow-hidden select-none font-sans fixed inset-0 z-50">
      {/* Alert Overlay Banner */}
      {criticalFlashAlert && (
        <div className="fixed inset-0 z-[100] bg-ag-red/90 backdrop-blur-md flex items-center justify-center p-6 text-white animate-flash-critical">
          <div className="max-w-lg w-full bg-ag-black/95 border-2 border-white rounded-2xl p-8 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-ag-red flex items-center justify-center mx-auto animate-bounce shadow-2xl">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-white">
              CROWD SURGE ALERT
            </h2>
            <p className="text-base text-ag-text-primary leading-relaxed">{criticalFlashAlert.message}</p>
            <div className="pt-4 flex items-center justify-center gap-4">
              <Button
                size="lg"
                variant="primary"
                onClick={dismissCriticalFlash}
                className="bg-white text-black hover:bg-white/90 font-bold px-8 h-12"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <header className="h-16 px-4 sm:px-6 bg-ag-surface border-b border-ag-border flex items-center justify-between z-20 shrink-0">
        {/* Left: Back + Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg bg-ag-black/50 hover:bg-ag-surface-hover text-ag-text-secondary hover:text-white border border-ag-border transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <AntigravityLogo size="sm" />
          </Link>
        </div>

        {/* Center: BIG Attendance Counter & Status */}
        <div className="flex items-center gap-6">
          {/* Giant Attendance Counter */}
          <div className="flex items-center gap-3 px-5 py-1.5 rounded-xl bg-ag-black border border-ag-border shadow-inner">
            <div className="text-left">
              <span className="text-xs text-ag-text-muted font-medium block">Inside Venue</span>
              <div className="font-bold text-lg sm:text-xl text-white font-mono">
                {formatNumber(event.current_attendance)} <span className="text-ag-text-muted text-sm font-normal">/ {formatNumber(event.max_capacity)}</span>
              </div>
            </div>

            {/* Status Word */}
            <div className="pl-4 border-l border-ag-border">
              {isDanger ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-ag-red animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-ag-red animate-ping" />
                  <span>DANGER</span>
                </div>
              ) : isCaution ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-ag-yellow">
                  <span className="w-2.5 h-2.5 rounded-full bg-ag-yellow" />
                  <span>CAUTION</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-ag-green">
                  <span className="w-2.5 h-2.5 rounded-full bg-ag-green" />
                  <span>SAFE</span>
                </div>
              )}
            </div>
          </div>

          {/* Gate Throughput Row */}
          <div className="hidden xl:flex items-center gap-3 text-xs bg-ag-surface-hover/60 px-4 py-2 rounded-xl border border-ag-border">
            <DoorOpen className="w-4 h-4 text-ag-blue" />
            <span className="text-ag-text-muted">Gates:</span>
            {Object.entries(scansPerMinuteByGate).map(([gateId, stats], idx) => {
              const gateLabel =
                gateId === 'c1111111-1111-1111-1111-111111111111'
                  ? 'A'
                  : gateId === 'c2222222-2222-2222-2222-222222222222'
                  ? 'B'
                  : gateId === 'c3333333-3333-3333-3333-333333333333'
                  ? 'C'
                  : gateId === 'c4444444-4444-4444-4444-444444444444'
                  ? 'D'
                  : String.fromCharCode(65 + idx);

              return (
                <span key={gateId} className="text-white font-mono">
                  <strong>{gateLabel}:</strong> {stats.in}/min
                </span>
              );
            })}
          </div>
        </div>

        {/* Right: Controls & End Event */}
        <div className="flex items-center gap-3">
          {/* Audio Mute */}
          <button
            onClick={toggleAudioMute}
            className="p-2 text-ag-text-secondary hover:text-white bg-ag-black/50 hover:bg-ag-surface-hover border border-ag-border rounded-lg transition-colors"
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-ag-red" /> : <Volume2 className="w-4 h-4 text-ag-green" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-ag-text-secondary hover:text-white bg-ag-black/50 hover:bg-ag-surface-hover border border-ag-border rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* END EVENT BUTTON */}
          <Button
            size="sm"
            variant="danger"
            onClick={handleEndEvent}
            className="text-xs font-bold bg-ag-red hover:bg-ag-red/90 px-4 h-9 uppercase"
          >
            End Event
          </Button>
        </div>
      </header>

      {/* MAIN VIEW (60% Heatmap / 40% Tabbed Panels) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden p-4 gap-4">
        {/* LEFT 60%: VENUE MAP */}
        <div className="w-full lg:w-[60%] h-[55%] lg:h-full flex flex-col min-h-0">
          <VenueHeatmap />
        </div>

        {/* RIGHT 40%: 3-TAB PANEL */}
        <div className="w-full lg:w-[40%] h-[45%] lg:h-full flex flex-col min-h-0 bg-ag-surface border border-ag-border rounded-2xl overflow-hidden shadow-xl">
          {/* Tab Headers */}
          <div className="flex items-center border-b border-ag-border bg-ag-surface-hover/30 px-3 pt-2 shrink-0">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-t-lg border-b-2 transition-all ${
                activeTab === 'alerts'
                  ? 'border-ag-red text-ag-red bg-ag-surface shadow-sm'
                  : 'border-transparent text-ag-text-secondary hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>ALERTS</span>
            </button>

            <button
              onClick={() => setActiveTab('incidents')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-t-lg border-b-2 transition-all ${
                activeTab === 'incidents'
                  ? 'border-ag-yellow text-ag-yellow bg-ag-surface shadow-sm'
                  : 'border-transparent text-ag-text-secondary hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>INCIDENTS</span>
            </button>

            <button
              onClick={() => setActiveTab('comms')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-t-lg border-b-2 transition-all ${
                activeTab === 'comms'
                  ? 'border-ag-blue text-ag-blue bg-ag-surface shadow-sm'
                  : 'border-transparent text-ag-text-secondary hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>SEND MESSAGE</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            {activeTab === 'alerts' && <AlertPanel />}
            {activeTab === 'incidents' && <IncidentsPanel />}
            {activeTab === 'comms' && <CommsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};
