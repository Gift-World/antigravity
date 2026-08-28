// src/components/live/CommsPanel.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { TargetAudience } from '@/types/database';
import {
  Send,
  Shield,
  Stethoscope,
  Users,
  CheckCircle2,
  Bell,
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
      label: '🚪 Open Relief Gates',
      text: 'ACTION REQUIRED: Open relief gates at Gate A & B to ease floor pressure.',
      aud: 'security' as TargetAudience,
    },
    {
      label: '🏥 Medical Assistance',
      text: 'FIRST AID NEEDED: Red Cross paramedic unit proceed to Main Floor North.',
      aud: 'medical' as TargetAudience,
    },
    {
      label: '📢 Clear Exit Routes',
      text: 'ATTENDEE NOTICE: Keep all stairs and exit pathways clear for safe movement.',
      aud: 'all' as TargetAudience,
    },
    {
      label: '🛡️ Phone Theft Alert',
      text: 'SECURITY NOTICE: Increased pickpocketing reported in Main Floor front area.',
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
    <div className="h-full flex flex-col justify-between space-y-4 font-sans">
      <form onSubmit={handleSend} className="space-y-4">
        {/* Target Recipient Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-ag-text-secondary">
            Who should receive this message?
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAudience('security')}
              className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors ${
                audience === 'security'
                  ? 'bg-ag-yellow/20 border-ag-yellow text-ag-yellow'
                  : 'bg-ag-black border-ag-border text-ag-text-secondary hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Security</span>
            </button>

            <button
              type="button"
              onClick={() => setAudience('medical')}
              className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors ${
                audience === 'medical'
                  ? 'bg-ag-red/20 border-ag-red text-ag-red'
                  : 'bg-ag-black border-ag-border text-ag-text-secondary hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Medics</span>
            </button>

            <button
              type="button"
              onClick={() => setAudience('all')}
              className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors ${
                audience === 'all'
                  ? 'bg-ag-blue/20 border-ag-blue text-ag-blue'
                  : 'bg-ag-black border-ag-border text-ag-text-secondary hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Everyone</span>
            </button>
          </div>
        </div>

        {/* Quick 1-Tap Message Templates */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-ag-text-secondary">
            Quick Message Templates
          </label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMessage(t.text);
                  setAudience(t.aud);
                }}
                className="p-2 rounded-lg bg-ag-black hover:bg-ag-surface-hover border border-ag-border text-left text-xs text-ag-text-secondary hover:text-white transition-colors truncate"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Message Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-ag-text-secondary">
            Message
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full bg-ag-black border border-ag-border focus:border-ag-blue rounded-lg p-3 text-sm text-white focus:outline-none transition-colors"
          />
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full h-11 font-bold shadow-lg shadow-ag-blue/20"
          rightIcon={<Send className="w-4 h-4" />}
          disabled={!message.trim()}
        >
          {isSent ? 'Message Sent!' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
};
