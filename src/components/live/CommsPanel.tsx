// src/components/live/CommsPanel.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { TargetAudience } from '@/types/database';
import {
  Send,
  Radio,
  Shield,
  Stethoscope,
  Users,
  AlertTriangle,
  CheckCircle2,
  Volume2,
} from 'lucide-react';

export const CommsPanel: React.FC = () => {
  const { triggerAlert, activeEventId, events } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const zones = activeEvent.venue?.zones || [];

  const [audience, setAudience] = useState<TargetAudience>('security');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const templates = [
    {
      label: '🚨 Egress Directive',
      text: 'TACTICAL DIRECTIVE: Open relief gates and guide crowd towards Eastern corridor.',
      aud: 'security' as TargetAudience,
    },
    {
      label: '🏥 Medical Dispatch',
      text: 'PARAMEDIC DISPATCH: St. John First Aid unit proceed immediately to Sector 6.',
      aud: 'medical' as TargetAudience,
    },
    {
      label: '⚠️ Weather / Slow Flow',
      text: 'ATTENDEE NOTICE: Keep exits clear and move steadily towards designated exit routes.',
      aud: 'all' as TargetAudience,
    },
    {
      label: '🛡️ Guardian Anti-Theft',
      text: 'SECURITY ALERT: High theft risk in Stage Pit. Deploy plainclothes patrol.',
      aud: 'security' as TargetAudience,
    },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    triggerAlert({
      event_id: activeEventId,
      alert_type: 'custom',
      zone_id: selectedZone || null,
      message,
      severity: audience === 'all' ? 'critical' : 'warning',
      target_audience: audience,
      auto_generated: false,
      acknowledged_by: null,
      acknowledged_at: null,
    });

    setMessage('');
    setIsSent(true);
    setTimeout(() => setIsSent(false), 2500);
  };

  return (
    <div className="h-full flex flex-col p-3.5 bg-ag-surface rounded-[8px] border border-ag-border text-ag-text-primary">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-ag-border mb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-ag-blue animate-pulse" />
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-ag-text-primary">
            TACTICAL COMMS & BROADCASTER
          </h4>
        </div>
        {isSent && (
          <span className="text-xs font-mono text-ag-green flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Broadcast Sent
          </span>
        )}
      </div>

      <form onSubmit={handleSend} className="flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-3">
          {/* Target Audience Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5 font-mono">
              Target Audience
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAudience('security')}
                className={`p-2 rounded text-xs font-mono flex items-center justify-center gap-1.5 border transition-colors ${
                  audience === 'security'
                    ? 'bg-ag-yellow-dim border-ag-yellow text-ag-yellow font-bold'
                    : 'bg-ag-black/50 border-ag-border text-ag-text-secondary hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> All Security
              </button>

              <button
                type="button"
                onClick={() => setAudience('medical')}
                className={`p-2 rounded text-xs font-mono flex items-center justify-center gap-1.5 border transition-colors ${
                  audience === 'medical'
                    ? 'bg-ag-red-dim border-ag-red text-ag-red font-bold'
                    : 'bg-ag-black/50 border-ag-border text-ag-text-secondary hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" /> All Medical
              </button>

              <button
                type="button"
                onClick={() => setAudience('attendees')}
                className={`p-2 rounded text-xs font-mono flex items-center justify-center gap-1.5 border transition-colors ${
                  audience === 'attendees'
                    ? 'bg-ag-blue-dim border-ag-blue text-ag-blue font-bold'
                    : 'bg-ag-black/50 border-ag-border text-ag-text-secondary hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Zone Attendees
              </button>

              <button
                type="button"
                onClick={() => setAudience('all')}
                className={`p-2 rounded text-xs font-mono flex items-center justify-center gap-1.5 border transition-colors ${
                  audience === 'all'
                    ? 'bg-ag-red/30 border-ag-red text-white font-bold'
                    : 'bg-ag-black/50 border-ag-border text-ag-text-secondary hover:text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" /> Everyone (Public)
              </button>
            </div>
          </div>

          {/* Quick Preset Templates */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-ag-text-muted mb-1.5 font-mono">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-1.5">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setMessage(tpl.text);
                    setAudience(tpl.aud);
                  }}
                  className="text-[11px] font-mono px-2 py-1 rounded bg-ag-black/60 hover:bg-ag-surface-hover border border-ag-border text-ag-text-secondary hover:text-white transition-colors"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message input */}
          <div>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type tactical directive or safety message to broadcast..."
              className="w-full bg-ag-black/70 border border-ag-border text-ag-text-primary rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-ag-blue placeholder:text-ag-text-muted font-sans"
              required
            />
          </div>
        </div>

        {/* Big SEND button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full text-sm font-bold uppercase tracking-wider shadow-lg shadow-ag-blue/20"
          rightIcon={<Send className="w-4 h-4" />}
        >
          BROADCAST DIRECTIVE
        </Button>
      </form>
    </div>
  );
};
