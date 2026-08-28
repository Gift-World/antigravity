// src/routes/app/AttendeeGuardian.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { soundManager } from '@/lib/audio';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  BellRing,
  CheckCircle2,
  Lock,
  Radio,
  Wifi,
  Volume2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const AttendeeGuardian: React.FC = () => {
  const { guardianDevice, toggleGuardianMode, triggerGuardianSOS, activeEventId } = useAppStore();
  const [localActive, setLocalActive] = useState(Boolean(guardianDevice?.guardian_mode_active));
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [showArmingToast, setShowArmingToast] = useState(false);

  const isActive = localActive || Boolean(guardianDevice?.guardian_mode_active);

  const handleToggle = () => {
    const nextState = !isActive;
    setLocalActive(nextState);
    toggleGuardianMode(nextState);

    if (nextState) {
      soundManager.playScanSuccess();
      setShowArmingToast(true);
      setTimeout(() => setShowArmingToast(false), 3000);
    } else {
      soundManager.stopGuardianSiren();
    }
  };

  const handleTriggerAlarmTest = (reason?: string) => {
    setIsAlarmActive(true);
    triggerGuardianSOS(reason || 'Attendee tested theft siren alarm');
  };

  const handleDismissAlarm = () => {
    setIsAlarmActive(false);
    soundManager.stopGuardianSiren();
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Toast Notification for Arming */}
      {showArmingToast && (
        <div className="bg-ag-green text-black text-xs font-bold px-4 py-3 rounded-xl flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-black shrink-0" />
            <span>Phone Protection is ARMED & LINKED to Wristband</span>
          </div>
          <span className="text-[10px] font-mono bg-black/10 px-2 py-0.5 rounded">100dB SIREN READY</span>
        </div>
      )}

      {/* FULL-SCREEN THEFT ALARM TEST OVERLAY */}
      {isAlarmActive && (
        <div className="fixed inset-0 z-50 bg-ag-red flex flex-col items-center justify-between p-6 text-white text-center animate-flash-critical">
          <div className="pt-8 space-y-2">
            <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center mx-auto animate-bounce shadow-2xl">
              <BellRing className="w-12 h-12 text-white animate-spin" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-black bg-white px-3 py-1 rounded-full inline-block">
              THEFT ALARM TRIGGERED
            </div>
          </div>

          <div className="space-y-3 max-w-xs">
            <h1 className="font-display font-bold text-3xl tracking-tight leading-tight text-white drop-shadow-lg">
              DEVICE PROTECTED BY ANTIGRAVITY
            </h1>
            <p className="text-xs text-white/90">
              High-decibel alarm sounding. Your location has been broadcast to stadium security.
            </p>
          </div>

          <div className="w-full max-w-xs pb-6">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleDismissAlarm}
              className="w-full font-bold text-sm bg-black text-white hover:bg-black/90 h-14 shadow-2xl rounded-2xl"
            >
              Turn Off Siren Alarm
            </Button>
          </div>
        </div>
      )}

      {/* Main Switch Card */}
      <Card className={`p-6 text-center space-y-6 border-2 transition-all duration-300 shadow-xl ${
        isActive
          ? 'bg-gradient-to-b from-ag-yellow-dim/30 via-ag-surface to-ag-surface border-ag-yellow/60'
          : 'bg-ag-surface border-ag-border'
      }`}>
        {/* Animated Shield Icon */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-24 h-24 rounded-3xl flex items-center justify-center border-2 transition-all duration-300 ${
              isActive
                ? 'bg-ag-yellow/20 border-ag-yellow text-ag-yellow shadow-2xl shadow-ag-yellow/30 scale-105 animate-pulse'
                : 'bg-ag-black border-ag-border text-ag-text-muted'
            }`}
          >
            {isActive ? <ShieldAlert className="w-12 h-12 text-ag-yellow" /> : <Smartphone className="w-12 h-12" />}
          </div>

          <div className="space-y-1">
            <h2 className="font-display font-bold text-2xl text-white">
              {isActive ? 'Guardian Protection Active' : 'Phone Protection Off'}
            </h2>
            <p className="text-xs text-ag-text-secondary max-w-xs mx-auto">
              {isActive
                ? 'Your phone is paired wirelessly with your silicone event wristband.'
                : 'Turn ON to protect your phone in dense crowds and front pits.'}
            </p>
          </div>
        </div>

        {/* Big Toggle Switch Button */}
        <Button
          size="lg"
          onClick={handleToggle}
          className={`w-full py-4 text-sm font-bold shadow-2xl h-14 rounded-2xl transition-all cursor-pointer ${
            isActive
              ? 'bg-ag-yellow text-black hover:bg-ag-yellow/90 shadow-ag-yellow/20'
              : 'bg-ag-blue text-white hover:bg-ag-blue/90 shadow-ag-blue/20'
          }`}
        >
          {isActive ? 'DISARM PHONE PROTECTION' : 'ACTIVATE PHONE PROTECTION'}
        </Button>
      </Card>

      {/* Real-time Status Card (Visible when Armed) */}
      {isActive && (
        <Card className="p-4 border-ag-yellow/40 bg-ag-surface space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs border-b border-ag-border pb-2.5">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-ag-green animate-pulse" /> Live Telemetry
            </span>
            <Badge variant="yellow" size="sm">
              ARMED
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-ag-black/50 p-2.5 rounded-lg border border-ag-border space-y-0.5">
              <div className="text-[10px] text-ag-text-muted font-medium">Wristband Link</div>
              <div className="text-ag-green font-bold flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Paired (98%)
              </div>
            </div>
            <div className="bg-ag-black/50 p-2.5 rounded-lg border border-ag-border space-y-0.5">
              <div className="text-[10px] text-ag-text-muted font-medium">Auto Siren</div>
              <div className="text-ag-yellow font-bold flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> 100dB Standby
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="danger"
            onClick={() => handleTriggerAlarmTest('Simulated Wristband Disconnect / Snatch')}
            className="w-full text-xs font-bold h-10 bg-ag-red/20 text-ag-red border border-ag-red/40 hover:bg-ag-red hover:text-white"
            leftIcon={<Zap className="w-3.5 h-3.5" />}
          >
            Simulate Wristband Snatch
          </Button>
        </Card>
      )}

      {/* Clear Explanation Card */}
      <Card className="p-5 space-y-3 border-ag-border bg-ag-surface">
        <h3 className="font-bold text-white text-sm">How Phone Protection Works</h3>
        <ul className="space-y-2.5 text-xs text-ag-text-secondary leading-relaxed">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-ag-green shrink-0 mt-0.5" />
            <span>Connects wirelessly via low-energy radio to your silicone event wristband.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-ag-green shrink-0 mt-0.5" />
            <span>If detached in a crowd, your phone sounds a 100dB siren and locks immediately.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-ag-green shrink-0 mt-0.5" />
            <span>Transmits your live GPS coordinate to nearby stadium security officers instantly.</span>
          </li>
        </ul>
      </Card>

      {/* Test Siren Button */}
      <div className="pt-1 text-center">
        <Button
          size="md"
          variant="outline"
          onClick={() => handleTriggerAlarmTest('Manual theft siren test')}
          className="w-full text-xs font-semibold text-ag-yellow border-ag-yellow/40 hover:bg-ag-yellow/10 h-11 rounded-xl"
        >
          Test Theft Siren Alarm
        </Button>
      </div>
    </div>
  );
};
