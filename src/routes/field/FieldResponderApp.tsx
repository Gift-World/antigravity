// src/routes/field/FieldResponderApp.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { AntigravityLogo } from '@/components/ui/AntigravityLogo';
import { VenueHeatmap } from '@/components/live/VenueHeatmap';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatTimeElapsed, formatNumber } from '@/lib/utils';
import { soundManager } from '@/lib/audio';
import {
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  UserRole,
} from '@/types/database';
import {
  Shield,
  Stethoscope,
  Bell,
  Map as MapIcon,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  Clock,
  Send,
  Volume2,
  VolumeX,
  X,
  Radio,
  HeartPulse,
  Users,
  Activity,
  AlertOctagon,
  PhoneCall,
  Flame,
  DoorClosed,
  Smartphone,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const FieldResponderApp: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    setCurrentUser,
    setUserRole,
    events,
    activeEventId,
    alerts,
    incidents,
    densityReadings,
    acknowledgeAlert,
    createIncident,
    updateIncidentStatus,
    isAudioMuted,
    toggleAudioMute,
    criticalFlashAlert,
    dismissCriticalFlash,
  } = useAppStore();

  const isMedical = currentUser.role === 'medical';
  const roleTitle = isMedical ? 'Medical Responder' : 'Security Patrol';

  const [activeTab, setActiveTab] = useState<'map' | 'alerts' | 'action'>('alerts');
  const [showToast, setShowToast] = useState(true);
  const [lastSeenAlertId, setLastSeenAlertId] = useState<string | null>(null);

  // Active event
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const zones = activeEvent?.venue?.zones || [];

  // Incident form state
  const [incType, setIncType] = useState<IncidentType>(isMedical ? 'medical' : 'crush_risk');
  const [incZone, setIncZone] = useState<string>('');
  const [incSeverity, setIncSeverity] = useState<IncidentSeverity>('high');
  const [incTitle, setIncTitle] = useState('');
  const [incDescription, setIncDescription] = useState('');
  const [isSubmittingInc, setIsSubmittingInc] = useState(false);
  const [incSuccessMsg, setIncSuccessMsg] = useState(false);

  // Filter alerts by role
  const relevantAlerts = alerts.filter((a) => {
    if (isMedical) {
      return (
        a.target_audience === 'medical' ||
        a.target_audience === 'all' ||
        a.alert_type === 'sos'
      );
    }
    return (
      a.target_audience === 'security' ||
      a.target_audience === 'all' ||
      a.alert_type === 'density_warning' ||
      a.alert_type === 'density_critical' ||
      a.alert_type === 'theft_detected'
    );
  });

  // Filter incidents for medical
  const relevantIncidents = isMedical
    ? incidents.filter((i) => i.incident_type === 'medical' || i.title.toLowerCase().includes('medical') || i.title.toLowerCase().includes('sos'))
    : incidents;

  const unacknowledgedCount = relevantAlerts.filter((a) => !a.acknowledged_at).length;
  const activeIncidentsCount = relevantIncidents.filter((i) => i.status !== 'resolved').length;

  // Latest broadcast alert for Toast Notification
  const latestAlert = relevantAlerts[0];

  useEffect(() => {
    if (latestAlert && latestAlert.id !== lastSeenAlertId) {
      setLastSeenAlertId(latestAlert.id);
      setShowToast(true);
    }
  }, [latestAlert, lastSeenAlertId]);

  // Overall density risk status
  const maxDensity = Math.max(...densityReadings.map((r) => r.density_per_sqm), 1.0);
  const statusLabel = maxDensity >= 5.5 ? 'DANGER' : maxDensity >= 4.5 ? 'CAUTION' : 'SAFE';

  // Role switch handler
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    setUserRole(newRole);
    if (newRole === 'super_admin' || newRole === 'org_admin' || newRole === 'event_manager') {
      navigate('/dashboard');
    } else if (newRole === 'attendee') {
      navigate('/app');
    }
  };

  // Submit Incident Report
  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incDescription.trim() && !incTitle.trim()) return;

    setIsSubmittingInc(true);

    const generatedTitle =
      incTitle.trim() ||
      `${incType.replace('_', ' ').toUpperCase()} reported in ${
        zones.find((z) => z.id === incZone)?.name || 'Ground Section'
      }`;

    createIncident({
      event_id: activeEvent?.id || 'e1111111-1111-1111-1111-111111111111',
      zone_id: incZone || zones[0]?.id || undefined,
      incident_type: incType,
      severity: incSeverity,
      title: generatedTitle,
      description: incDescription,
      reported_by: currentUser.id,
      assigned_to: currentUser.id,
      status: 'open',
    });

    setIsSubmittingInc(false);
    setIncSuccessMsg(true);
    setIncTitle('');
    setIncDescription('');

    setTimeout(() => {
      setIncSuccessMsg(false);
      if (isMedical) {
        setActiveTab('action');
      } else {
        setActiveTab('alerts');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-ag-black text-ag-text-primary flex justify-center selection:bg-ag-blue/30 font-sans">
      {/* Mobile Shell Wrapper (Max 480px Centered) */}
      <div className="w-full max-w-md min-h-screen bg-ag-surface flex flex-col border-x border-ag-border shadow-2xl relative">
        
        {/* Top Header */}
        <header className="h-16 px-4 border-b border-ag-border bg-ag-surface/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2">
              <AntigravityLogo size="sm" />
            </Link>
            <Badge
              variant={isMedical ? 'red' : 'yellow'}
              size="sm"
              className="flex items-center gap-1 font-bold uppercase tracking-wider"
            >
              {isMedical ? <Stethoscope className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
              <span>{isMedical ? 'MEDIC' : 'SECURITY'}</span>
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Mute */}
            <button
              onClick={toggleAudioMute}
              className="p-2 text-ag-text-secondary hover:text-white bg-ag-black/50 border border-ag-border rounded-lg"
              title={isAudioMuted ? 'Unmute' : 'Mute'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-ag-red" /> : <Volume2 className="w-4 h-4 text-ag-green" />}
            </button>

            {/* Role Switcher */}
            <div className="flex items-center pl-2 border-l border-ag-border">
              <select
                value={currentUser.role}
                onChange={handleRoleChange}
                aria-label="Switch Role Perspective"
                className="bg-ag-black border border-ag-border rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none focus:border-ag-blue cursor-pointer"
              >
                <option value="super_admin">Admin</option>
                <option value="event_manager">Manager</option>
                <option value="security">Security</option>
                <option value="medical">Medical</option>
                <option value="attendee">Attendee</option>
              </select>
            </div>
          </div>
        </header>

        {/* Live Attendance Counter Ribbon */}
        {activeEvent && (
          <div className="bg-ag-black/80 px-4 py-2 border-b border-ag-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ag-green animate-pulse" />
              <span className="font-semibold text-white truncate max-w-[170px]">
                {activeEvent.title}
              </span>
            </div>
            <div className="font-mono text-ag-text-secondary">
              <strong className="text-white font-bold">{formatNumber(activeEvent.current_attendance)}</strong> / {formatNumber(activeEvent.max_capacity)} inside
            </div>
          </div>
        )}

        {/* Incoming Admin Message Toast Notification */}
        {latestAlert && showToast && (
          <div
            className={`mx-3 mt-3 p-3.5 rounded-xl border shadow-2xl animate-slide-in flex items-start justify-between gap-3 ${
              latestAlert.severity === 'critical'
                ? 'bg-ag-red/20 border-ag-red text-white'
                : 'bg-ag-yellow/20 border-ag-yellow text-white'
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  latestAlert.severity === 'critical' ? 'bg-ag-red text-white' : 'bg-ag-yellow text-black'
                }`}
              >
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40">
                    {latestAlert.severity === 'critical' ? 'ACTION DIRECTIVE' : 'ADMIN BROADCAST'}
                  </span>
                  <span className="text-[10px] text-ag-text-muted">
                    {new Date(latestAlert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs font-semibold mt-1 text-white leading-relaxed">
                  {latestAlert.message}
                </p>
                {!latestAlert.acknowledged_at && (
                  <button
                    onClick={() => {
                      acknowledgeAlert(latestAlert.id, currentUser.id);
                      setShowToast(false);
                    }}
                    className="mt-2 text-xs font-bold px-3 py-1 bg-white text-black rounded-md hover:bg-white/90 transition-colors shadow"
                  >
                    Got it
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowToast(false)}
              className="text-ag-text-muted hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 pb-24 p-4 overflow-y-auto space-y-4">
          
          {/* TAB 1: STATUS & MAP */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              {/* Current Status Pill */}
              <Card
                className={`p-5 text-center space-y-3 border-2 ${
                  statusLabel === 'DANGER'
                    ? 'border-ag-red bg-ag-red/10'
                    : statusLabel === 'CAUTION'
                    ? 'border-ag-yellow bg-ag-yellow/10'
                    : 'border-ag-green bg-ag-green/10'
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-ag-text-secondary">
                  Venue Safety Status
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 ${
                      statusLabel === 'DANGER'
                        ? 'bg-ag-red border-white text-white animate-pulse'
                        : statusLabel === 'CAUTION'
                        ? 'bg-ag-yellow border-white text-black'
                        : 'bg-ag-green border-white text-black'
                    }`}
                  >
                    <span className="font-display font-bold text-xl uppercase tracking-wider">
                      {statusLabel}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-ag-text-secondary">
                    Peak spatial density: <strong className="text-white font-mono">{maxDensity.toFixed(2)} people/m²</strong>
                  </div>
                </div>
              </Card>

              {/* View-Only Stadium Heatmap */}
              <div className="h-[380px] rounded-2xl overflow-hidden border border-ag-border bg-ag-black/50">
                <VenueHeatmap />
              </div>

              <div className="p-3 bg-ag-black/60 border border-ag-border rounded-xl text-xs text-ag-text-secondary flex items-center justify-between">
                <span>{isMedical ? 'Medical Stations: Tents 1 & 2 Active' : 'Gates A, B, C, D Staffed'}</span>
                <span className="text-ag-green font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: MY ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-white">
                  {isMedical ? 'Medical & SOS Alerts' : 'Security Alerts & Directives'}
                </h3>
                <Badge variant={unacknowledgedCount > 0 ? 'yellow' : 'neutral'} size="sm">
                  {unacknowledgedCount} Pending
                </Badge>
              </div>

              {relevantAlerts.length === 0 ? (
                <Card className="p-8 text-center space-y-2 border-ag-border bg-ag-surface">
                  <CheckCircle2 className="w-8 h-8 text-ag-green mx-auto" />
                  <div className="font-bold text-white text-sm">All Clear</div>
                  <p className="text-xs text-ag-text-secondary max-w-xs mx-auto">
                    No active alerts assigned to your unit. New broadcasts will appear here in real-time.
                  </p>
                </Card>
              ) : (
                relevantAlerts.map((alert) => {
                  const isAck = Boolean(alert.acknowledged_at);
                  const isCritical = alert.severity === 'critical';

                  return (
                    <Card
                      key={alert.id}
                      className={`p-4 space-y-3 border-2 transition-all ${
                        isCritical
                          ? 'border-ag-red/60 bg-ag-red/5'
                          : 'border-ag-border bg-ag-surface'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isCritical ? 'red' : 'yellow'}
                            size="sm"
                            pulse={isCritical && !isAck}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-[11px] font-mono text-ag-text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {isAck ? (
                          <span className="text-xs font-semibold text-ag-green flex items-center gap-1 bg-ag-green/10 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Got it
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant={isCritical ? 'danger' : 'primary'}
                            onClick={() => acknowledgeAlert(alert.id, currentUser.id)}
                            className="text-xs font-bold h-7 px-3"
                          >
                            Got it
                          </Button>
                        )}
                      </div>

                      <p className="text-xs text-white leading-relaxed font-medium">
                        {alert.message}
                      </p>

                      {alert.zone_id && (
                        <div className="text-[11px] text-ag-text-secondary flex items-center gap-1 font-mono">
                          <span>Sector:</span>
                          <strong className="text-white">
                            {zones.find((z) => z.id === alert.zone_id)?.name || 'Venue Zone'}
                          </strong>
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: REPORT (Security) or RESPOND (Medical) */}
          {activeTab === 'action' && (
            <div className="space-y-4">
              {/* MEDICAL RESPOND INTERFACE */}
              {isMedical ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-white">
                      Medical Cases & Triage
                    </h3>
                    <Badge variant={activeIncidentsCount > 0 ? 'red' : 'green'} size="sm">
                      {activeIncidentsCount} Open
                    </Badge>
                  </div>

                  {relevantIncidents.length === 0 ? (
                    <Card className="p-8 text-center space-y-2 border-ag-border bg-ag-surface">
                      <HeartPulse className="w-8 h-8 text-ag-green mx-auto" />
                      <div className="font-bold text-white text-sm">No Active Medical Cases</div>
                      <p className="text-xs text-ag-text-secondary max-w-xs mx-auto">
                        All patients triaged and stable. When an attendee requests SOS or security reports medical, it appears here.
                      </p>
                    </Card>
                  ) : (
                    relevantIncidents.map((inc) => (
                      <Card key={inc.id} className="p-4 space-y-3 border-ag-border bg-ag-surface">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  inc.status === 'resolved'
                                    ? 'green'
                                    : inc.status === 'responding'
                                    ? 'blue'
                                    : 'red'
                                }
                                size="sm"
                              >
                                {inc.status === 'responding' ? 'RESPONDING' : inc.status.toUpperCase()}
                              </Badge>
                              <span className="text-[11px] text-ag-text-muted">
                                {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-white mt-1">{inc.title}</h4>
                          </div>
                        </div>

                        <p className="text-xs text-ag-text-secondary">{inc.description}</p>

                        {/* Status Update Quick Actions */}
                        <div className="pt-2 border-t border-ag-border space-y-2">
                          <div className="text-[11px] font-semibold text-ag-text-muted">
                            Update Patient Status:
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              onClick={() => updateIncidentStatus(inc.id, 'responding', currentUser.id)}
                              className={`py-1.5 px-2 rounded text-[11px] font-bold border transition-colors ${
                                inc.status === 'responding'
                                  ? 'bg-ag-blue text-white border-ag-blue'
                                  : 'bg-ag-black border-ag-border text-ag-blue hover:bg-ag-surface-hover'
                              }`}
                            >
                              Responding
                            </button>
                            <button
                              onClick={() => updateIncidentStatus(inc.id, 'acknowledged', currentUser.id)}
                              className={`py-1.5 px-2 rounded text-[11px] font-bold border transition-colors ${
                                inc.status === 'acknowledged'
                                  ? 'bg-ag-yellow text-black border-ag-yellow'
                                  : 'bg-ag-black border-ag-border text-ag-yellow hover:bg-ag-surface-hover'
                              }`}
                            >
                              Patient Stable
                            </button>
                            <button
                              onClick={() => updateIncidentStatus(inc.id, 'resolved', currentUser.id)}
                              className={`py-1.5 px-2 rounded text-[11px] font-bold border transition-colors ${
                                inc.status === 'resolved'
                                  ? 'bg-ag-green text-black border-ag-green'
                                  : 'bg-ag-black border-ag-border text-ag-green hover:bg-ag-surface-hover'
                              }`}
                            >
                              Resolved
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}

                  {/* Add Patient/Medical Incident Form Accordion */}
                  <div className="pt-3">
                    <Card className="p-4 space-y-3 border-ag-red/30 bg-ag-red/5">
                      <div className="flex items-center gap-2 text-ag-red font-bold text-xs uppercase">
                        <PlusCircle className="w-4 h-4" />
                        <span>Log New Medical Case</span>
                      </div>

                      <form onSubmit={handleReportIncident} className="space-y-3">
                        <select
                          value={incZone}
                          onChange={(e) => setIncZone(e.target.value)}
                          className="w-full bg-ag-black border border-ag-border rounded-lg p-2.5 text-xs text-white focus:outline-none"
                          required
                        >
                          <option value="">Select Zone / Location</option>
                          {zones.map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.name}
                            </option>
                          ))}
                        </select>

                        <textarea
                          value={incDescription}
                          onChange={(e) => setIncDescription(e.target.value)}
                          placeholder="Symptoms, patient condition, triage notes..."
                          rows={2}
                          className="w-full bg-ag-black border border-ag-border rounded-lg p-2.5 text-xs text-white focus:outline-none"
                          required
                        />

                        <Button
                          type="submit"
                          variant="danger"
                          size="md"
                          isLoading={isSubmittingInc}
                          className="w-full text-xs font-bold"
                        >
                          {incSuccessMsg ? 'Logged Successfully!' : 'Dispatch Medical Log'}
                        </Button>
                      </form>
                    </Card>
                  </div>
                </div>
              ) : (
                /* SECURITY REPORT INCIDENT FORM */
                <Card className="p-5 space-y-4 border-ag-border bg-ag-surface">
                  <div className="flex items-center gap-2 text-ag-yellow font-bold text-sm uppercase">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Report Ground Incident</span>
                  </div>

                  {incSuccessMsg ? (
                    <div className="p-6 text-center space-y-2 bg-ag-green/10 border border-ag-green/30 rounded-xl">
                      <CheckCircle2 className="w-10 h-10 text-ag-green mx-auto" />
                      <div className="font-bold text-white text-base">Incident Reported</div>
                      <p className="text-xs text-ag-text-secondary">
                        Transmitted to Live Dashboard. Security units notified.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleReportIncident} className="space-y-4">
                      {/* Incident Type Grid */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-ag-text-secondary">
                          Incident Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'fight', label: '🥊 Physical Altercation' },
                            { id: 'gate_breach', label: '🚪 Gate Breach' },
                            { id: 'phone_theft', label: '📱 Phone Theft' },
                            { id: 'crush_risk', label: '👥 Crowd Surge' },
                            { id: 'medical', label: '🏥 Medical Aid' },
                            { id: 'other', label: '⚠️ Other Hazard' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setIncType(t.id as IncidentType)}
                              className={`p-2.5 rounded-lg text-xs font-semibold border text-left transition-colors truncate ${
                                incType === t.id
                                  ? 'bg-ag-yellow text-black border-ag-yellow font-bold'
                                  : 'bg-ag-black border-ag-border text-ag-text-secondary hover:text-white'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Zone Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-ag-text-secondary">
                          Zone / Sector
                        </label>
                        <select
                          value={incZone}
                          onChange={(e) => setIncZone(e.target.value)}
                          className="w-full bg-ag-black border border-ag-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-ag-blue"
                          required
                        >
                          <option value="">Select stadium zone...</option>
                          {zones.map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Severity */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-ag-text-secondary">
                          Urgency Severity
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['medium', 'high', 'critical'] as IncidentSeverity[]).map((sev) => (
                            <button
                              key={sev}
                              type="button"
                              onClick={() => setIncSeverity(sev)}
                              className={`py-2 rounded text-xs font-bold uppercase border transition-colors ${
                                incSeverity === sev
                                  ? sev === 'critical'
                                    ? 'bg-ag-red text-white border-ag-red'
                                    : 'bg-ag-yellow text-black border-ag-yellow'
                                  : 'bg-ag-black border-ag-border text-ag-text-secondary hover:text-white'
                              }`}
                            >
                              {sev}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-ag-text-secondary">
                          Situation Details
                        </label>
                        <textarea
                          value={incDescription}
                          onChange={(e) => setIncDescription(e.target.value)}
                          placeholder="Describe what is happening on the ground..."
                          rows={3}
                          className="w-full bg-ag-black border border-ag-border focus:border-ag-blue rounded-lg p-3 text-xs text-white focus:outline-none"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmittingInc}
                        className="w-full text-sm font-bold shadow-lg shadow-ag-yellow/20"
                      >
                        Transmit Incident Report
                      </Button>
                    </form>
                  )}
                </Card>
              )}
            </div>
          )}
        </main>

        {/* 3 Bottom Navigation Tabs */}
        <nav className="fixed bottom-0 max-w-md w-full h-16 bg-ag-surface/98 border-t border-ag-border backdrop-blur-lg flex items-center justify-around z-40 px-2 py-1 shadow-2xl">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-lg transition-colors relative ${
              activeTab === 'alerts'
                ? isMedical
                  ? 'text-ag-red font-bold'
                  : 'text-ag-yellow font-bold'
                : 'text-ag-text-secondary hover:text-white'
            }`}
          >
            <Bell className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Alerts</span>
            {unacknowledgedCount > 0 && (
              <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-ag-red text-white text-[9px] font-mono font-bold flex items-center justify-center">
                {unacknowledgedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-lg transition-colors ${
              activeTab === 'map'
                ? 'text-ag-green font-bold'
                : 'text-ag-text-secondary hover:text-white'
            }`}
          >
            <MapIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Map</span>
          </button>

          <button
            onClick={() => setActiveTab('action')}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-lg transition-colors relative ${
              activeTab === 'action'
                ? 'text-ag-blue font-bold'
                : 'text-ag-text-secondary hover:text-white'
            }`}
          >
            {isMedical ? (
              <>
                <HeartPulse className="w-5 h-5 mb-0.5" />
                <span className="text-[11px]">Respond</span>
                {activeIncidentsCount > 0 && (
                  <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-ag-red text-white text-[9px] font-mono font-bold flex items-center justify-center">
                    {activeIncidentsCount}
                  </span>
                )}
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 mb-0.5" />
                <span className="text-[11px]">Report</span>
              </>
            )}
          </button>
        </nav>
      </div>
    </div>
  );
};
