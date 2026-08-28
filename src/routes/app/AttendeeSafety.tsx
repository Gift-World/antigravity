// src/routes/app/AttendeeSafety.tsx
import React, { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Compass,
  AlertTriangle,
  ArrowUp,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';

export const AttendeeSafety: React.FC = () => {
  const { densityReadings, events, activeEventId, triggerGuardianSOS } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  // Attendee in Main Floor North
  const currentZoneReading =
    densityReadings.find((r) => r.zone_id === 'c6666666-6666-6666-6666-666666666666') ||
    densityReadings[0];

  const [sosProgress, setSosProgress] = useState(0);
  const [isSosTriggered, setIsSosTriggered] = useState(false);
  const pressTimerRef = useRef<any>(null);

  const isDanger = currentZoneReading.density_per_sqm >= 5.5;
  const isCaution = currentZoneReading.density_per_sqm >= 4.5 && !isDanger;
  const isSafe = !isDanger && !isCaution;

  const handleMouseDown = () => {
    setSosProgress(0);
    const startTime = Date.now();
    const duration = 2000;

    pressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setSosProgress(progress);

      if (progress >= 100) {
        clearInterval(pressTimerRef.current);
        setIsSosTriggered(true);
        triggerGuardianSOS('Attendee Help Button Pressed');
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
    <div className="space-y-5 font-sans">
      {/* Big Area Status Card with Colored Circle */}
      <Card
        className={`p-6 text-center space-y-4 border-2 transition-all ${
          isDanger
            ? 'border-ag-red bg-ag-red-dim/20'
            : isCaution
            ? 'border-ag-yellow bg-ag-yellow-dim/20'
            : 'border-ag-green bg-ag-green-dim/10'
        }`}
      >
        <div className="text-xs font-semibold text-ag-text-secondary uppercase tracking-wider">
          Your Current Area Status
        </div>

        {/* Big Colored Circle */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl border-4 ${
              isDanger
                ? 'bg-ag-red border-white animate-pulse text-white'
                : isCaution
                ? 'bg-ag-yellow border-white text-black'
                : 'bg-ag-green border-white text-black'
            }`}
          >
            <span className="font-display font-bold text-2xl uppercase tracking-wider">
              {isDanger ? 'DANGER' : isCaution ? 'CAUTION' : 'SAFE'}
            </span>
          </div>

          <div className="font-display font-bold text-lg text-white">Main Floor (Front Area)</div>
          <p className="text-xs text-ag-text-secondary max-w-xs mx-auto">
            {isDanger
              ? 'High crowd pressure detected. Please follow exit signs to ease flow.'
              : isCaution
              ? 'Crowd is building up. Keep exit pathways clear.'
              : 'Crowd movement is smooth and comfortable.'}
          </p>
        </div>
      </Card>

      {/* Nearest Exit Card */}
      <Card className="p-5 flex items-center justify-between border-ag-border bg-ag-surface">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-ag-green uppercase flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            <span>Nearest Exit</span>
          </div>
          <div className="font-bold text-white text-base">Exit 1 & 2 (North Gates)</div>
          <div className="text-xs text-ag-text-muted">Approx. 45 meters ahead on your left</div>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-ag-green/20 border border-ag-green flex items-center justify-center text-ag-green shrink-0">
          <ArrowUp className="w-6 h-6 animate-bounce" />
        </div>
      </Card>

      {/* 2-Second Long-Press Help Button */}
      <div className="space-y-2 text-center pt-2">
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className={`w-full py-4 rounded-2xl border-2 font-display font-bold text-base transition-all relative overflow-hidden select-none active:scale-[0.98] ${
            isSosTriggered
              ? 'bg-ag-green border-ag-green text-black'
              : 'bg-ag-red/20 border-ag-red text-ag-red hover:bg-ag-red/30'
          }`}
        >
          {/* Progress Bar Fill */}
          <div
            className="absolute inset-0 bg-ag-red text-white transition-all pointer-events-none"
            style={{ width: `${sosProgress}%`, opacity: 0.8 }}
          />

          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSosTriggered ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Help Request Sent to Security</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-5 h-5" />
                <span>Hold for 2s to Request Help</span>
              </>
            )}
          </span>
        </button>

        <p className="text-[11px] text-ag-text-muted">
          Only hold in an emergency. Dispatches nearby stadium security to your location.
        </p>
      </div>
    </div>
  );
};
