// src/routes/app/AttendeeSafety.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import {
  Compass,
  Navigation,
  AlertTriangle,
  Radio,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ArrowUp,
} from 'lucide-react';

export const AttendeeSafety: React.FC = () => {
  const { events, activeEventId, densityReadings, alerts } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  // Attendee assigned zone (e.g. Main Floor North)
  const [currentSector, setCurrentSector] = useState('Main Floor North');

  const mainNorthReading = densityReadings.find(
    (r) => r.zone_id === 'z6666666-6666-6666-6666-666666666666'
  );

  const density = mainNorthReading?.density_per_sqm || 3.4;
  const isCritical = density >= 5.5;
  const isWarning = density >= 4.5;

  return (
    <div className="p-4 space-y-4">
      {/* Live Sector Crowd Status Banner */}
      <div
        className={`rounded-[16px] p-5 text-white shadow-lg transition-all duration-300 ${
          isCritical
            ? 'bg-[#FF1744] animate-pulse'
            : isWarning
            ? 'bg-[#FF9100]'
            : 'bg-[#00A859]'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest bg-black/30 px-2.5 py-0.5 rounded-full">
            YOUR SECTOR: {currentSector.toUpperCase()}
          </span>
          <span className="text-xs font-mono font-bold">
            {density.toFixed(1)} people / m²
          </span>
        </div>

        <h3 className="font-display font-bold text-xl leading-tight">
          {isCritical
            ? '⚠️ CRITICAL CROWD PRESSURE'
            : isWarning
            ? 'CROWD DENSITY ELEVATED'
            : '✓ SAFE CROWD CONDITIONS'}
        </h3>

        <p className="text-xs text-white/90 mt-1">
          {isCritical
            ? 'High surge detected in your sector. Egress gates are open. Follow directional beacon below.'
            : isWarning
            ? 'High concentration of attendees near front pit. Please maintain personal spacing.'
            : 'Movement is flowing freely across all aisles and exits.'}
        </p>
      </div>

      {/* Directional Exit Guidance Compass */}
      <div className="bg-white rounded-[16px] border border-[#E2E4EB] p-5 shadow-sm space-y-4 text-center">
        <div className="flex items-center justify-between text-xs font-semibold text-[#12121A]">
          <span className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#448AFF]" />
            <span>Smart Emergency Egress Beacon</span>
          </span>
          <span className="text-[10px] font-mono text-[#00A859] font-bold">UNCONGESTED</span>
        </div>

        {/* Dynamic Rotating Compass Arrow */}
        <div className="py-2 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-[#F4F5F9] border-2 border-[#448AFF] flex items-center justify-center relative shadow-inner">
            <div className="w-16 h-16 rounded-full bg-[#448AFF] text-white flex items-center justify-center transform -rotate-12 animate-pulse shadow-md">
              <Navigation className="w-8 h-8 transform -rotate-45" />
            </div>
          </div>
          <div className="font-display font-bold text-lg text-[#12121A] mt-3">
            Gate C (South Express Exit)
          </div>
          <div className="text-xs font-mono text-[#717182]">
            Distance: ~45 meters North-East • Flow Rate: 100% Free
          </div>
        </div>

        <div className="p-3 bg-[#F8F9FC] rounded-[10px] border border-[#E2E4EB] text-xs text-[#55556A] text-left">
          <strong>Security Directive:</strong> Keep emergency corridors clear. Paramedics and rapid responders are stationed at Medical Post Alpha (50m west).
        </div>
      </div>

      {/* Safety Advisories Feed */}
      <div className="bg-white rounded-[14px] border border-[#E2E4EB] p-4 space-y-3 shadow-sm">
        <div className="text-xs font-bold text-[#12121A] flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-[#FF1744]" />
          <span>Active Stadium Safety Broadcasts</span>
        </div>

        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-[8px] border text-xs ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-[#F8F9FC] border-[#E2E4EB] text-[#12121A]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono opacity-80 mb-1">
                <span className="font-bold uppercase">{alert.alert_type.replace('_', ' ')}</span>
                <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="font-medium leading-snug">{alert.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
