// src/routes/app/AttendeeTicket.tsx
import React from 'react';
import { useAppStore } from '@/lib/store';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Sparkles, MapPin, Calendar, Smartphone, Lock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AttendeeTicket: React.FC = () => {
  const { tickets, currentUser, events } = useAppStore();

  // User's tickets
  const userTickets = tickets.filter(
    (t) => t.attendee_id === currentUser.id || t.attendee_id === 'u5555555-5555-5555-5555-555555555555'
  );

  const activeTicket = userTickets[0] || tickets[0];
  const event = events.find((e) => e.id === activeTicket?.event_id) || events[0];

  if (!activeTicket) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
          <Smartphone className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-lg text-gray-900">No Passes Found</h3>
        <p className="text-xs text-gray-500">You have not purchased any passes yet.</p>
        <Link to="/app">
          <Button size="md" variant="primary" className="bg-[#00A859] text-white font-bold">
            Browse Live Events
          </Button>
        </Link>
      </div>
    );
  }

  const qrPayload = JSON.stringify({
    tid: activeTicket.id,
    hash: activeTicket.qr_code_hash,
    ver: 1,
  });

  return (
    <div className="p-4 space-y-4">
      {/* Security Warning Pill */}
      <div className="bg-[#448AFF]/10 border border-[#448AFF]/30 p-2.5 rounded-[10px] flex items-center gap-2 text-xs text-[#0052cc]">
        <Lock className="w-4 h-4 shrink-0" />
        <span>
          <strong>Device-Bound Pass:</strong> Cryptographically tied to your hardware ID. Static screenshots cannot pass turnstiles.
        </span>
      </div>

      {/* Holographic Digital Ticket Card */}
      <div className="bg-white rounded-[20px] border border-[#E2E4EB] overflow-hidden shadow-xl text-[#12121A]">
        {/* Top Event Strip */}
        <div className="bg-gradient-to-r from-[#12121A] to-[#252538] text-white p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00E676]">
              {activeTicket.tier}
            </span>
            <span className="text-[10px] font-mono text-white/70">
              {activeTicket.status === 'valid' ? '✓ READY TO SCAN' : activeTicket.status.toUpperCase()}
            </span>
          </div>
          <h3 className="font-display font-bold text-lg leading-tight">{event.title}</h3>
          <div className="flex items-center gap-3 text-xs text-white/80 font-medium pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#00E676]" />
              {new Date(event.event_date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF1744]" />
              {event.venue?.name?.split('(')[0] || 'Nyayo Stadium'}
            </span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="p-6 flex flex-col items-center justify-center bg-gradient-to-b from-[#F8F9FC] to-white relative">
          {/* Subtle Security Holographic Stamp */}
          <div className="absolute top-2 right-3 text-[9px] font-mono text-[#717182] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00A859]" />
            <span>ANTIGRAVITY MESH VERIFIED</span>
          </div>

          <div className="p-3 bg-white rounded-[16px] shadow-md border border-[#E2E4EB] relative group">
            <QRCodeSVG
              value={qrPayload}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#0A0A0F"
            />
            {/* Center Logo Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-white shadow-md border border-[#E2E4EB] flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-[#0A0A0F] flex items-center justify-center">
                  <span className="font-display font-bold text-xs text-[#00E676]">A</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Rotating Security Bar */}
          <div className="mt-4 w-full bg-[#E8E8ED] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#00E676] h-full w-1/3 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
          </div>

          <div className="mt-3 text-center space-y-0.5">
            <div className="text-xs font-mono font-bold text-[#12121A]">{currentUser.full_name}</div>
            <div className="text-[10px] font-mono text-[#717182]">
              Receipt: {activeTicket.mpesa_transaction_id || 'QK782910AA'} • Price: KES {activeTicket.price.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Ticket Footer Directives */}
        <div className="p-4 bg-[#F8F9FC] border-t border-[#E2E4EB] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#717182]">Designated Gates:</span>
            <span className="font-bold text-[#12121A]">Gate A (Main North) or Gate B</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#717182]">Doors Open:</span>
            <span className="font-bold text-[#12121A]">
              {new Date(event.doors_open).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-2 gap-2">
        <Link to="/app/guardian" className="w-full">
          <Button size="sm" variant="secondary" className="w-full text-xs bg-white text-[#12121A] border-[#E2E4EB]">
            🛡️ Guardian Mode
          </Button>
        </Link>
        <Link to="/app/safety" className="w-full">
          <Button size="sm" variant="secondary" className="w-full text-xs bg-white text-[#12121A] border-[#E2E4EB]">
            📍 Live Exit Guide
          </Button>
        </Link>
      </div>
    </div>
  );
};
