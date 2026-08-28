// src/routes/app/AttendeeSafety.tsx
import React, { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Compass,
  AlertTriangle,
  MapPin,
  ArrowUp,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  BellRing,
} from 'lucide-react';

export const AttendeeSafety: React.FC = () => {
  const { densityReadings, events, activeEventId, triggerGuardianSOS } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  // Attendee assigned to Main Floor North (Sector 6)
  const currentZoneReading =
    densityReadings.find((r) => r.zone_id === 'c6666666-6666-6666-6666-666666666666') ||
    densityReadings[0];

  const [sosProgress, setSosProgress] = useState(0);
  const [isSosTriggered, setIsSosTriggered] = useState(false);
  const pressTimerRef = useRef<any>(null);

  const isCritical = currentZoneReading.density_per_sqm >= 5.5;
  const isWarning = currentZoneReading.density_per_sqm >= 4.5;

  const handleMouseDown = () => {
    setSosProgress(0);
    const startTime = Date.now();
    const duration = 2000; // 2 seconds long press

    pressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setSosProgress(progress);

      if (progress >= 100) {
        clearInterval(pressTimerRef.current);
        setIsSosTriggered(true);
        triggerGuardianSOS('Manual Attendee Long-Press Panic SOS');
      }
    }, 40);
  };

  const handleMouseUp = () => {
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
    }
    if (!isSosTriggered) {
      setSosProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="text-center space-y-1">
        <h2 className="font-display font-bold text-xl text-white">
          Live Event Safety & Exit Radar
        </h2>
        <p className="text-xs text-ag-text-secondary font-mono">
          Spatial crowd density status and smart exit orientation
        </p>
      </div>

      {/* Your Current Zone Status Card */}
      <Card
        className={`p-5 text-center space-y-3 border-2 transition-colors ${
          isCritical
            ? 'border-ag-red bg-ag-red-dim/20'
            : isWarning
            ? 'border-ag-yellow bg-ag-yellow-dim/20'
            : 'border-ag-green bg-ag-green-dim/10'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-ag-text-secondary">Your Current Location</span>
          <Badge
            variant={isCritical ? 'red' : isWarning ? 'yellow' : 'green'}
            pulse={isCritical || isWarning}
            size="sm"
          >
            {isCritical ? 'SURGE HAZARD' : isWarning ? 'ELEVATED FLOW' : 'SAFE FLOW'}
          </Badge>
        </div>

        <div>
          <div className="font-display font-bold text-xl text-white">Main Floor North (Sector 6)</div>
          <div className="text-xs font-mono text-ag-text-secondary mt-1">
            Crowd Density: <strong className="text-white">{currentZoneReading.density_per_sqm} people/m²</strong>
          </div>
        </div>

        {/* Status guidance message */}
        <p className="text-xs font-sans text-ag-text-primary bg-ag-black/50 p-2.5 rounded-[6px] border border-ag-border">
          {isCritical
            ? '⚠️ High density detected. Move steadily toward Emergency Exit 1 on your left.'
            : isWarning
            ? 'Density is elevating. Keep clear of central barriers.'
            : 'All sectors nominal. Proceed freely throughout festival grounds.'}
        </p>
      </Card>

      {/* Nearest Exit Navigation Card */}
      <Card className="p-4 space-y-3 bg-ag-surface border-ag-border">
        <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-ag-border">
          <span className="text-white font-bold flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-ag-blue" />
            <span>NEAREST UNCONGESTED EXIT</span>
          </span>
          <span className="text-ag-green font-bold">45 METERS</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-ag-blue-dim border-2 border-ag-blue flex items-center justify-center text-ag-blue shadow-lg">
            <ArrowUp className="w-8 h-8 -rotate-45 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-display font-bold text-base text-white">Emergency Exit 1 (North-West)</h4>
            <p className="text-xs text-ag-text-secondary font-mono">
              Wide double-leaf perimeter gates open to Nyayo Stadium Ring Road.
            </p>
          </div>
        </div>
      </Card>

      {/* Big Long-Press Red SOS Button */}
      <Card className="p-5 text-center space-y-4 bg-ag-black border-2 border-ag-red/40">
        <div className="space-y-1">
          <h4 className="font-display font-bold text-sm uppercase tracking-wider text-ag-red">
            EMERGENCY PANIC SOS
          </h4>
          <p className="text-xs font-mono text-ag-text-secondary">
            Press and hold for 2 seconds to alert stadium safety dispatchers
          </p>
        </div>

        {/* Interactive Hold Button with Progress Ring */}
        <div className="relative flex justify-center py-2">
          <button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            disabled={isSosTriggered}
            className={`w-32 h-32 rounded-full font-display font-bold text-xl uppercase text-white shadow-2xl transition-transform active:scale-95 flex flex-col items-center justify-center relative overflow-hidden ${
              isSosTriggered
                ? 'bg-ag-green border-4 border-white'
                : 'bg-ag-red border-4 border-white hover:bg-ag-red/90'
            }`}
          >
            {/* Circular Fill Ring */}
            <div
              className="absolute inset-0 bg-black/40 transition-all"
              style={{ height: `${100 - sosProgress}%` }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center">
              {isSosTriggered ? (
                <>
                  <CheckCircle2 className="w-8 h-8 mb-1" />
                  <span className="text-xs">DISPATCHED</span>
                </>
              ) : (
                <>
                  <BellRing className="w-8 h-8 mb-1 animate-bounce" />
                  <span>{sosProgress > 0 ? `${sosProgress}%` : 'HOLD SOS'}</span>
                </>
              )}
            </div>
          </button>
        </div>

        {isSosTriggered ? (
          <div className="text-xs font-mono text-ag-green font-bold animate-pulse">
            ✓ Paramedic & Security units alerted to your GPS coordinates.
          </div>
        ) : (
          <div className="text-[11px] font-mono text-ag-text-muted">
            Emergency Hotlines: Police 999 / Red Cross 1199
          </div>
        )}
      </Card>
    </div>
  );
};
