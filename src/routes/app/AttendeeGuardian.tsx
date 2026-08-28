// src/routes/app/AttendeeGuardian.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { soundManager } from '@/lib/audio';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
  ShieldAlert,
  Smartphone,
  Radio,
  Volume2,
  VolumeX,
  AlertTriangle,
  Lock,
  Sparkles,
  Wifi,
  XCircle,
  BellRing,
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
    triggerGuardianSOS('Physical tether severance simulation');
  };

  const handleDismissAlarm = () => {
    setIsAlarmActive(false);
    soundManager.stopGuardianSiren();
  };

  return (
    <div className="space-y-4">
      {/* THEFT ALARM FULL-SCREEN MODAL */}
      {isAlarmActive && (
        <div className="fixed inset-0 z-50 bg-ag-red flex flex-col items-center justify-between p-6 text-white text-center animate-flash-critical">
          {/* Top warning */}
          <div className="pt-8 space-y-2">
            <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center mx-auto animate-bounce shadow-2xl">
              <BellRing className="w-12 h-12 text-white animate-spin" />
            </div>
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-black bg-white px-3 py-1 rounded-full inline-block">
              THEFT SENSOR TRIGGERED
            </div>
          </div>

          {/* Core Banner Text */}
          <div className="space-y-3 max-w-xs">
            <h1 className="font-display font-black text-3xl tracking-tight leading-tight text-white drop-shadow-lg">
              DEVICE PROTECTED BY ANTIGRAVITY
            </h1>
            <p className="text-xs font-mono text-white/90">
              GPS Coordinates and BLE Hardware ID have been streamed to Nyayo Stadium Security Command.
            </p>
          </div>

          {/* Dismiss button */}
          <div className="w-full max-w-xs pb-6">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleDismissAlarm}
              className="w-full font-bold text-sm bg-black text-white hover:bg-black/90 shadow-2xl"
            >
              DISARM ALARM & RESTORE
            </Button>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="text-center space-y-1">
        <h2 className="font-display font-bold text-xl text-white">
          Guardian Mode Anti-Theft
        </h2>
        <p className="text-xs text-ag-text-secondary font-mono">
          Smart BLE tethering and acoustic crowd distress defense
        </p>
      </div>

      {/* Main Big Toggle Switch Card */}
      <Card className="p-6 bg-gradient-to-b from-ag-surface to-ag-black border-2 border-ag-border text-center space-y-6">
        {/* Animated Shield Status */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-24 h-24 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
              isActive
                ? 'bg-ag-yellow-dim border-ag-yellow text-ag-yellow shadow-2xl shadow-ag-yellow/20 scale-105'
                : 'bg-ag-black border-ag-border text-ag-text-muted'
            }`}
          >
            {isActive ? (
              <Shield className="w-12 h-12 animate-pulse" />
            ) : (
              <ShieldAlert className="w-12 h-12" />
            )}
          </div>

          <div>
            <Badge variant={isActive ? 'yellow' : 'neutral'} size="md" pulse={isActive}>
              {isActive ? 'SHIELD ACTIVE & PROTECTED' : 'GUARDIAN MODE OFF'}
            </Badge>
          </div>
        </div>

        {/* Big Switch Control Button */}
        <button
          onClick={handleToggle}
          className={`w-full py-4 px-6 rounded-[12px] font-display font-bold text-base uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${
            isActive
              ? 'bg-ag-yellow text-black hover:bg-ag-yellow/90 shadow-ag-yellow/20'
              : 'bg-ag-surface-hover border border-ag-border text-white hover:border-ag-yellow/50'
          }`}
        >
          <Wifi className="w-5 h-5" />
          <span>{isActive ? 'DISARM GUARDIAN MODE' : 'ARM GUARDIAN MODE'}</span>
        </button>

        {/* Dynamic Details when ON vs OFF */}
        {isActive ? (
          <div className="p-3.5 rounded-[8px] bg-ag-black/70 border border-ag-border text-left space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-ag-text-secondary">
              <span>Paired Device:</span>
              <span className="text-white font-bold">{guardianDevice?.device_name}</span>
            </div>
            <div className="flex items-center justify-between text-ag-text-secondary">
              <span>BLE Mesh Node:</span>
              <span className="text-ag-yellow font-bold">TETHER_09 (Nyayo Pit)</span>
            </div>
            <div className="flex items-center justify-between text-ag-text-secondary">
              <span>Signal Integrity:</span>
              <span className="text-ag-green font-bold">-48 dBm (Strong)</span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-[8px] bg-ag-black/40 border border-ag-border text-left space-y-1.5 text-xs text-ag-text-secondary">
            <div className="font-semibold text-white">How Guardian Mode Protects You:</div>
            <p className="text-[11px] leading-relaxed">
              When armed, your phone tethers to nearby venue BLE mesh nodes and wristbands. If severed in a crowd, a 100dB siren sounds and security receives your immediate GPS coordinates.
            </p>
          </div>
        )}
      </Card>

      {/* Test Theft Alert Button */}
      <Button
        size="lg"
        variant="danger"
        onClick={handleTriggerAlarmTest}
        className="w-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-ag-red/20 h-12"
        leftIcon={<AlertTriangle className="w-4 h-4" />}
      >
        Test Theft Alert (Simulation)
      </Button>
    </div>
  );
};
