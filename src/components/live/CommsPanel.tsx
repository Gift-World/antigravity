// src/components/live/CommsPanel.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { TargetAudience, AlertSeverity } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Radio, Send, Users, Shield, Stethoscope, Smartphone, Check } from 'lucide-react';

export const CommsPanel: React.FC = () => {
  const { activeEventId, triggerAlert, events } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const zones = activeEvent.venue?.zones || [];

  const [target, setTarget] = useState<TargetAudience>('all');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');
  const [severity, setSeverity] = useState<AlertSeverity>('warning');
  const [customMessage, setCustomMessage] = useState('');
  const [lastDispatched, setLastDispatched] = useState<string | null>(null);

  const broadcastTemplates = [
    {
      label: 'Calm Egress Directive',
      message: 'SAFETY NOTICE: Please move calmly towards Gate C & East Exits. All corridors clear.',
      severity: 'info' as AlertSeverity,
      target: 'all' as TargetAudience,
    },
    {
      label: 'Stage Barrier Step-Back',
      message: 'CROWD ADVISORY: Main Floor attendees, please take 2 paces back from the stage barrier.',
      severity: 'warning' as AlertSeverity,
      target: 'attendees_zone' as TargetAudience,
    },
    {
      label: 'Medical Trauma Unit Callout',
      message: 'PARAMEDIC DISPATCH: Rapid medical support required at Stage Pit North.',
      severity: 'critical' as AlertSeverity,
      target: 'medical' as TargetAudience,
    },
    {
      label: 'Gate Traffic Re-route',
      message: 'ENTRY NOTICE: Gate B is currently congested. Direct all incoming general attendees to Gate C.',
      severity: 'info' as AlertSeverity,
      target: 'security' as TargetAudience,
    },
  ];

  const handleBroadcast = (msg: string, sev: AlertSeverity, tgt: TargetAudience) => {
    if (!msg.trim()) return;

    triggerAlert({
      event_id: activeEventId,
      zone_id: tgt === 'attendees_zone' ? selectedZoneId : null,
      alert_type: 'custom',
      message: msg,
      severity: sev,
      target_audience: tgt,
      auto_generated: false,
      acknowledged_by: null,
      acknowledged_at: null,
    });

    setLastDispatched(msg);
    setCustomMessage('');
    setTimeout(() => setLastDispatched(null), 4000);
  };

  return (
    <div className="h-full flex flex-col p-4 bg-ag-surface rounded-[8px] border border-ag-border text-ag-text-primary">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ag-border mb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-ag-blue animate-pulse" />
          <h4 className="font-display font-bold text-sm text-ag-text-primary">
            TACTICAL COMMS BROADCASTER
          </h4>
        </div>
        <span className="text-[11px] font-mono text-ag-text-secondary">
          BLE Mesh + In-App Push + Radio Relay
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Rapid Templates */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ag-text-muted mb-2">
            One-Tap Emergency Broadcast Templates
          </label>
          <div className="grid grid-cols-1 gap-2">
            {broadcastTemplates.map((template, idx) => (
              <button
                key={idx}
                onClick={() => handleBroadcast(template.message, template.severity, template.target)}
                className="w-full text-left p-2.5 bg-ag-black/40 hover:bg-ag-surface-hover border border-ag-border hover:border-ag-blue/40 rounded-[6px] transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-ag-text-primary group-hover:text-ag-blue transition-colors">
                    {template.label}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border bg-ag-surface border-ag-border text-ag-text-secondary">
                    Target: {template.target.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-ag-text-secondary leading-snug line-clamp-1">
                  {template.message}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Broadcast Form */}
        <div className="p-3 bg-ag-black/50 rounded-[6px] border border-ag-border space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ag-text-primary">
            Send Custom Transmission
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Target Selector */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-ag-text-muted mb-1">
                Audience
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as TargetAudience)}
                className="w-full bg-ag-surface border border-ag-border text-ag-text-primary text-xs rounded px-2 py-1.5 focus:outline-none focus:border-ag-blue"
              >
                <option value="all">All Stadium (Everyone)</option>
                <option value="security">Security Patrols</option>
                <option value="medical">Medical Responders</option>
                <option value="attendees_zone">Zone Attendees Only</option>
                <option value="attendees_all">All Attendees</option>
              </select>
            </div>

            {/* Severity Selector */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-ag-text-muted mb-1">
                Priority
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                className="w-full bg-ag-surface border border-ag-border text-ag-text-primary text-xs rounded px-2 py-1.5 focus:outline-none focus:border-ag-blue"
              >
                <option value="critical">Critical (Flash Audio Siren)</option>
                <option value="warning">Warning (High Tone)</option>
                <option value="info">Informational Notice</option>
              </select>
            </div>
          </div>

          {target === 'attendees_zone' && (
            <div>
              <label className="block text-[10px] font-mono uppercase text-ag-text-muted mb-1">
                Select Sector
              </label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full bg-ag-surface border border-ag-border text-ag-text-primary text-xs rounded px-2 py-1.5 focus:outline-none focus:border-ag-blue"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <textarea
              rows={2}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type urgent directive to push over stadium network..."
              className="w-full bg-ag-surface border border-ag-border text-ag-text-primary text-xs rounded p-2 focus:outline-none focus:border-ag-blue placeholder:text-ag-text-muted"
            />
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => handleBroadcast(customMessage, severity, target)}
            disabled={!customMessage.trim()}
            className="w-full text-xs"
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Transmit Directive
          </Button>

          {lastDispatched && (
            <div className="p-2 rounded bg-ag-green-dim border border-ag-green/40 text-ag-green text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Broadcast dispatched to target units successfully.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
