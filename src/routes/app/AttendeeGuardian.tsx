// src/routes/app/AttendeeGuardian.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { soundManager } from '@/lib/audio';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  BellRing,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const AttendeeGuardian: React.FC = () => {
  const { guardianDevice, toggleGuardianMode, triggerGuardianSOS } = useAppStore();
  const isActive = Boolean(guardianDevice?.guardian_mode_active);

  const [isAlarmActive, setIsAlarmActive] = useState(false);

  const handleToggle = () => {
    toggleGuardianMode(!isActive);
  };

  const handleTriggerAlarmTest = () => {
    setIsAlarmActive(true);
    triggerGuardianSOS('Attendee tested theft alarm');
  };

  const handleDismissAlarm = () => {
    setIsAlarmActive(false);
    soundManager.stopGuardianSiren();
  };

  return (
    <div className="space-y-5 font-sans">
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
              Your phone location has been flagged to stadium security.
            </p>
          </div>

          <div className="w-full max-w-xs pb-6">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleDismissAlarm}
              className="w-full font-bold text-sm bg-black text-white hover:bg-black/90 h-12 shadow-2xl"
            >
              Turn Off Alarm
            </Button>
          </div>
        </div>
      )}

      {/* Main Switch Card */}
      <Card className="p-6 text-center space-y-6 border-2 border-ag-border bg-ag-surface shadow-xl">
        {/* Animated Shield Icon */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-24 h-24 rounded-3xl flex items-center justify-center border-2 transition-all duration-300 ${
              isActive
                ? 'bg-ag-yellow-dim border-ag-yellow text-ag-yellow shadow-2xl shadow-ag-yellow/20 scale-105'
                : 'bg-ag-black border-ag-border text-ag-text-muted'
            }`}
          >
            {isActive ? <ShieldAlert className="w-12 h-12" /> : <Smartphone className="w-12 h-12" />}
          </div>

          <div className="space-y-1">
            <h2 className="font-display font-bold text-2xl text-white">
              {isActive ? 'Guardian Protection Active' : 'Phone Protection Off'}
            </h2>
            <p className="text-xs text-ag-text-secondary max-w-xs mx-auto">
              {isActive
                ? 'Your phone is linked to your smart wristband.'
                : 'Turn ON to protect your phone in dense crowds.'}
            </p>
          </div>
        </div>

        {/* Big Toggle Switch Button */}
        <Button
          size="lg"
          variant={isActive ? 'danger' : 'primary'}
          onClick={handleToggle}
          className={`w-full py-4 text-base font-bold shadow-2xl h-14 rounded-2xl ${
            isActive ? 'bg-ag-yellow text-black hover:bg-ag-yellow/90' : 'bg-ag-blue text-white'
          }`}
        >
          {isActive ? 'DISARM PHONE PROTECTION' : 'ACTIVATE PHONE PROTECTION'}
        </Button>
      </Card>

      {/* Clear Explanation Card */}
      <Card className="p-5 space-y-3 border-ag-border bg-ag-surface">
        <h3 className="font-bold text-white text-sm">How Phone Protection Works</h3>
        <ul className="space-y-2.5 text-xs text-ag-text-secondary leading-relaxed">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-ag-green shrink-0 mt-0.5" />
            <span>Connects wirelessly to your silicone event wristband.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-ag-green shrink-0 mt-0.5" />
            <span>If detached in a crowd, your phone sounds a 100dB siren and locks immediately.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-ag-green shrink-0 mt-0.5" />
            <span>Notifies nearby stadium security officers with your position.</span>
          </li>
        </ul>
      </Card>

      {/* Test Siren Button */}
      <div className="pt-2 text-center">
        <Button
          size="md"
          variant="outline"
          onClick={handleTriggerAlarmTest}
          className="w-full text-xs font-semibold text-ag-yellow border-ag-yellow/40 hover:bg-ag-yellow/10 h-11 rounded-xl"
        >
          Test Theft Siren Alarm
        </Button>
      </div>
    </div>
  );
};
