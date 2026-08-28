// src/routes/app/AttendeeTicket.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket as TicketIcon,
  RefreshCw,
  Lock,
} from 'lucide-react';

export const AttendeeTicket: React.FC = () => {
  const { tickets, events, activeEventId, currentUser } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const userTicket =
    tickets.find((t) => t.attendee_id === currentUser.id) || tickets[0];

  const [isWatermarkHovered, setIsWatermarkHovered] = useState(false);

  const qrPayload = JSON.stringify({
    t: userTicket.id,
    h: userTicket.qr_code_hash,
    d: userTicket.device_fingerprint,
    e: userTicket.event_id,
  });

  return (
    <div className="space-y-4">
      {/* Smart Pass Container Card */}
      <Card className="p-5 bg-gradient-to-b from-ag-surface to-ag-black border-2 border-ag-border/80 shadow-2xl relative overflow-hidden text-center space-y-4">
        {/* Holographic Security Top Ribbon */}
        <div className="flex items-center justify-between pb-3 border-b border-ag-border text-xs font-mono">
          <div className="flex items-center gap-1.5 text-ag-green font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>DEVICE-BOUND PASS</span>
          </div>
          <Badge variant="blue" size="sm">
            {userTicket.tier} TIER
          </Badge>
        </div>

        {/* Event Header & Attendee Details Above QR */}
        <div className="space-y-1">
          <h3 className="font-display font-bold text-xl text-white tracking-wide">
            {activeEvent.title}
          </h3>
          <div className="text-xs text-ag-text-secondary font-mono flex items-center justify-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-ag-blue" />
            <span>{new Date(activeEvent.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>•</span>
            <MapPin className="w-3.5 h-3.5 text-ag-green" />
            <span>{activeEvent.venue?.name || 'Nyayo Stadium'}</span>
          </div>
          <div className="pt-2 text-sm font-semibold text-white font-mono">
            Attendee: <strong className="text-ag-blue">{currentUser.full_name}</strong>
          </div>
        </div>

        {/* Large Centered QR Code with Subtle ANTIGRAVITY Watermark */}
        <div className="relative py-4 flex items-center justify-center">
          <div className="p-4 bg-white rounded-[16px] shadow-2xl relative group inline-block border-4 border-ag-blue/30">
            <QRCodeSVG
              value={qrPayload}
              size={210}
              level="H"
              includeMargin={false}
            />

            {/* Subtle Center ANTIGRAVITY Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-ag-black border-2 border-ag-green flex items-center justify-center shadow-2xl opacity-95">
                <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
                  <path
                    d="M50 16 L20 84 L36 84 L44 64 L56 64 L64 84 L80 84 Z"
                    stroke="#00E676"
                    strokeWidth="8"
                    strokeLinejoin="round"
                  />
                  <path d="M50 34 L50 64" stroke="#00E676" strokeWidth="7" strokeLinecap="round" />
                  <path
                    d="M40 45 L50 34 L60 45"
                    stroke="#00E676"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic Hash & Security Bar */}
        <div className="p-2.5 rounded bg-ag-black/70 border border-ag-border text-center space-y-1">
          <div className="text-[10px] font-mono text-ag-text-muted uppercase">
            SHA-256 Pass Hash
          </div>
          <div className="text-[11px] font-mono text-ag-green truncate px-2 font-bold">
            {userTicket.qr_code_hash}
          </div>
        </div>

        {/* Dynamic Holographic Watermark Bar */}
        <div className="flex items-center justify-between text-[11px] font-mono text-ag-text-secondary pt-2 border-t border-ag-border">
          <span>Pass ID: #{userTicket.id.substring(0, 8)}</span>
          <span className="text-ag-blue flex items-center gap-1">
            <Lock className="w-3 h-3" /> Turnstile Auto-Sync
          </span>
        </div>
      </Card>
    </div>
  );
};
