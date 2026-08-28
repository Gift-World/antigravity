// src/routes/app/AttendeeGuardian.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { soundManager } from '@/lib/audio';
import {
  ShieldCheck,
  ShieldAlert,
  Bluetooth,
  Wifi,
  AlertOctagon,
  Volume2,
  Lock,
  Radio,
  CheckCircle2,
  Smartphone,
  Zap,
} from 'lucide-react';

export const AttendeeGuardian: React.FC = () => {
  const {
    guardianDevice,
    toggleGuardianMode,
    triggerGuardianSOS,
    currentUser,
  } = useAppStore();

  const [isLockedScreen, setIsLockedScreen] = useState(false);
  const [bleSignalStrength, setBleSignalStrength] = useState(-55); // dBm
  const [pairedDeviceName, setPairedDeviceName] = useState('Antigravity Smart Tether Wristband #0921');
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);

  const isActive = guardianDevice?.guardian_mode_active || false;

  // Signal fluctuation effect when active
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setBleSignalStrength(Math.floor(Math.random() * 20) - 65);
    }, 2000);
    return () => clearInterval(interval);
  }, [isActive]);

  const handleToggle = () => {
    const next = !isActive;
    toggleGuardianMode(next, pairedDeviceName);
    if (!next) {
      soundManager.stopGuardianSiren();
      setIsLockedScreen(false);
    }
  };

  const handleSimulateTheftDisconnect = () => {
    soundManager.startGuardianSiren();
    setIsLockedScreen(true);
    triggerGuardianSOS('BLE Tether Disconnected (Simulated Theft Breach)');
  };

  const handleDisarmAlarm = () => {
    soundManager.stopGuardianSiren();
    setIsLockedScreen(false);
  };

  // Manual SOS 3-tap panic button
  const handlePanicButton = () => {
    triggerGuardianSOS('Manual Attendee Emergency Distress SOS');
    setIsLockedScreen(true);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Full-Screen Anti-Theft Lock Mode */}
      {isLockedScreen && (
        <div className="fixed inset-0 z-50 bg-[#FF1744] text-white flex flex-col items-center justify-between p-6 animate-flash-critical">
          <div className="w-full flex justify-between items-center text-xs font-mono">
            <span>GUARDIAN LOCK ACTIVE</span>
            <span>GPS: -1.30392, 36.82310</span>
          </div>

          <div className="text-center space-y-4 max-w-sm">
            <div className="w-20 h-20 rounded-full bg-white text-[#FF1744] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
              <ShieldAlert className="w-12 h-12" />
            </div>

            <h2 className="font-display font-bold text-2xl tracking-wide uppercase">
              THIS DEVICE IS PROTECTED BY ANTIGRAVITY
            </h2>

            <p className="text-sm font-mono bg-black/40 p-4 rounded-xl border border-white/40 leading-relaxed">
              Anti-Theft Mesh Alarm Engaged. Real-time GPS location and BLE suspect triangulation are actively broadcasting to stadium security.
            </p>
          </div>

          <div className="w-full space-y-2">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleDisarmAlarm}
              className="w-full bg-white text-[#FF1744] font-bold text-base shadow-xl"
            >
              Disarm Security Siren (Enter PIN)
            </Button>
            <p className="text-[10px] text-center text-white/80 font-mono">
              Armed to {currentUser.full_name} • Phone: {currentUser.phone || '+254 722 998 877'}
            </p>
          </div>
        </div>
      )}

      {/* Hero Guardian Header */}
      <div
        className={`rounded-[16px] p-5 text-white shadow-lg transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-br from-[#00A859] to-[#0A5C36]'
            : 'bg-gradient-to-br from-[#12121A] to-[#252538]'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              {isActive ? <ShieldCheck className="w-5 h-5 text-white" /> : <ShieldAlert className="w-5 h-5 text-gray-400" />}
            </div>
            <div>
              <div className="font-display font-bold text-base">Guardian Anti-Theft</div>
              <div className="text-[10px] font-mono opacity-80">BLE Mesh Tethering</div>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggle}
            className={`w-14 h-8 rounded-full transition-colors relative p-1 ${
              isActive ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full transition-transform transform ${
                isActive ? 'translate-x-6 bg-[#00A859]' : 'translate-x-0 bg-white'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-white/80 leading-relaxed">
          {isActive
            ? 'Guardian mode is ARMED. Your phone is securely tethered to your paired BLE device. If severed, an alarm triggers and stadium security is alerted.'
            : 'Turn on Guardian Mode while inside the stadium to protect your phone from pickpocketing, crowd bumping, and snatch-and-grab theft.'}
        </p>
      </div>

      {/* Paired Device & Signal Monitor */}
      <div className="bg-white rounded-[14px] border border-[#E2E4EB] p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-[#12121A]">
          <span className="flex items-center gap-2">
            <Bluetooth className={`w-4 h-4 ${isActive ? 'text-[#00A859]' : 'text-gray-400'}`} />
            <span>Paired Hardware Tether</span>
          </span>
          <span className="text-[10px] font-mono text-[#717182]">
            {isActive ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        <div className="p-3 bg-[#F8F9FC] border border-[#E2E4EB] rounded-[10px] space-y-2">
          <div className="text-xs font-bold text-[#12121A]">{pairedDeviceName}</div>
          {isActive && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#717182]">
                <span>Tether Signal (RSSI):</span>
                <span className="text-[#00A859] font-bold">{bleSignalStrength} dBm (Strong)</span>
              </div>
              <div className="w-full bg-[#E2E4EB] h-2 rounded-full overflow-hidden">
                <div className="bg-[#00A859] h-full w-[85%] rounded-full animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Test Disconnect Alarm Trigger */}
        {isActive && (
          <div className="pt-2">
            <Button
              size="sm"
              variant="danger"
              onClick={handleSimulateTheftDisconnect}
              className="w-full text-xs font-bold bg-[#FF1744] hover:bg-[#d60f38] text-white"
              leftIcon={<Zap className="w-3.5 h-3.5" />}
            >
              Simulate BLE Tether Loss (Test Siren)
            </Button>
          </div>
        )}
      </div>

      {/* Rapid SOS Emergency Panic Trigger */}
      <div className="bg-white rounded-[14px] border border-[#FF1744]/30 p-4 space-y-3 shadow-sm bg-gradient-to-b from-white to-[#FF1744]/5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#FF1744]">
          <AlertOctagon className="w-4 h-4 animate-pulse" />
          <span>EMERGENCY SOS PANIC BUTTON</span>
        </div>
        <p className="text-xs text-[#55556A]">
          In an emergency (medical distress, violence, crush surge), tap below to silently alert stadium security and medical posts with your exact GPS location.
        </p>
        <Button
          size="lg"
          variant="danger"
          onClick={handlePanicButton}
          className="w-full text-sm font-bold bg-[#FF1744] hover:bg-[#d60f38] shadow-lg shadow-[#FF1744]/20 text-white"
          leftIcon={<Radio className="w-4 h-4" />}
        >
          BROADCAST EMERGENCY SOS
        </Button>
      </div>
    </div>
  );
};
