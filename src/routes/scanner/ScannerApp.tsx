// src/routes/scanner/ScannerApp.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { soundManager } from '@/lib/audio';
import { parseQRPayload } from '@/lib/qr';
import { Ticket } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AntigravityLogo } from '@/components/ui/AntigravityLogo';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Camera,
  Layers,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';

export const ScannerApp: React.FC = () => {
  const {
    tickets,
    activeEventId,
    events,
    currentUser,
    processGateScan,
    gateScans,
  } = useAppStore();

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  // Gates: Gate A, Gate B, Gate C, Gate D
  const gates = [
    { id: 'c1111111-1111-1111-1111-111111111111', name: 'Gate A (North Turnstiles)' },
    { id: 'c2222222-2222-2222-2222-222222222222', name: 'Gate B (East Main Entrance)' },
    { id: 'c3333333-3333-3333-3333-333333333333', name: 'Gate C (South General)' },
    { id: 'c4444444-4444-4444-4444-444444444444', name: 'Gate D (VIP & Media Express)' },
  ];

  const [selectedGate, setSelectedGate] = useState(gates[0].id);
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'error';
    ticket?: Ticket;
    holderName?: string;
    reason?: string;
    message?: string;
  }>({ status: 'idle' });

  const [isScanning, setIsScanning] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Gate Scan counts
  const thisGateScans = gateScans.filter((s) => s.gate_id === selectedGate).length + 3840;
  const totalScansToday = activeEvent.current_attendance;

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleScanData = async (decodedText: string) => {
    if (scanResult.status !== 'idle') return; // Debounce while displaying result

    try {
      const parsed = parseQRPayload(decodedText);
      if (!parsed) {
        soundManager.playScanError();
        setScanResult({
          status: 'error',
          reason: 'Malformed QR',
          message: 'Non-Antigravity or corrupted barcode format.',
        });
        setTimeout(() => setScanResult({ status: 'idle' }), 1800);
        return;
      }

      const res = await processGateScan({
        ticketId: parsed.tid,
        gateId: selectedGate,
        qrHash: parsed.hash,
        staffId: currentUser.id,
        direction: 'in',
      });

      if (res.success) {
        setScanResult({
          status: 'success',
          ticket: res.ticket,
          holderName: res.ticket?.attendee_id === currentUser.id ? currentUser.full_name : 'Attendee Guest',
          message: res.message,
        });
      } else {
        setScanResult({
          status: 'error',
          ticket: res.ticket,
          reason: res.reason || 'Invalid',
          message: res.message,
        });
      }
    } catch (err) {
      soundManager.playScanError();
      setScanResult({
        status: 'error',
        reason: 'Malformed QR',
        message: 'Non-Antigravity or corrupted barcode format.',
      });
    }

    // Auto reset flash state after short pause
    setTimeout(() => {
      setScanResult({ status: 'idle' });
    }, 1800);
  };

  // Test buttons for immediate mock demo
  const handleTestScan = (type: 'valid' | 'duplicate' | 'invalid') => {
    if (type === 'valid') {
      const validTicket = tickets.find((t) => t.status === 'valid') || tickets[0];
      handleScanData(
        JSON.stringify({
          t: validTicket.id,
          h: validTicket.qr_code_hash,
          d: validTicket.device_fingerprint,
          e: validTicket.event_id,
        })
      );
    } else if (type === 'duplicate') {
      const scannedTicket = tickets.find((t) => t.status === 'scanned') || {
        ...tickets[0],
        status: 'scanned' as const,
        scanned_at: new Date(Date.now() - 3600000).toISOString(),
      };
      // Force scanned check
      handleScanData(
        JSON.stringify({
          t: scannedTicket.id,
          h: scannedTicket.qr_code_hash,
          d: scannedTicket.device_fingerprint,
          e: scannedTicket.event_id,
        })
      );
    } else {
      handleScanData(
        JSON.stringify({
          t: 'fake_ticket_counterfeit_88',
          h: 'bad_hash_counterfeit_screenshot',
          d: 'fp_unknown',
          e: activeEventId,
        })
      );
    }
  };

  const startCamera = async () => {
    try {
      const qrScanner = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleScanData(decodedText),
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      console.warn('Camera not accessible or permission denied, using interactive test buttons.', err);
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-ag-black text-ag-text-primary flex flex-col items-center justify-between p-4 selection:bg-ag-blue/30 selection:text-ag-green font-sans relative overflow-hidden">
      {/* SUCCESS FLASH OVERLAY (0.5s Green Flash) */}
      {scanResult.status === 'success' && (
        <div className="fixed inset-0 z-50 bg-ag-green flex flex-col items-center justify-center p-6 text-black animate-flash-success">
          <CheckCircle2 className="w-24 h-24 mb-4 text-black animate-bounce" />
          <h2 className="font-display font-bold text-4xl uppercase tracking-wider text-black">
            ENTRY GRANTED
          </h2>
          <div className="mt-4 p-4 bg-black/10 rounded-[12px] border border-black/20 text-center w-full max-w-xs">
            <div className="text-2xl font-bold font-display uppercase text-black">
              {scanResult.ticket?.tier || 'VIP ACCESS'}
            </div>
            <div className="text-sm font-mono text-black font-semibold mt-1">
              Pass ID: #{scanResult.ticket?.id.substring(0, 8)}
            </div>
          </div>
        </div>
      )}

      {/* ERROR FLASH OVERLAY (Red Flash) */}
      {scanResult.status === 'error' && (
        <div className="fixed inset-0 z-50 bg-ag-red flex flex-col items-center justify-center p-6 text-white animate-flash-critical">
          <XCircle className="w-24 h-24 mb-4 text-white animate-pulse" />
          <h2 className="font-display font-bold text-4xl uppercase tracking-wider text-white">
            ACCESS DENIED
          </h2>
          <div className="mt-4 p-4 bg-black/30 rounded-[12px] border border-white/30 text-center w-full max-w-xs">
            <div className="text-xl font-bold font-display uppercase text-white">
              {scanResult.reason?.replace('_', ' ').toUpperCase()}
            </div>
            <div className="text-xs font-mono text-white/90 mt-1">
              {scanResult.message}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE CONTAINER (Max 480px Centered) */}
      <div className="w-full max-w-[480px] flex-1 flex flex-col justify-between space-y-4">
        {/* Top Header & Gate Selector */}
        <div className="space-y-3 bg-ag-surface p-4 rounded-[12px] border border-ag-border shadow-lg">
          <div className="flex items-center justify-between">
            <AntigravityLogo size="sm" />
            <div className="flex items-center gap-1.5 text-xs font-mono text-ag-green">
              <span className="w-2 h-2 rounded-full bg-ag-green animate-ping" />
              <span>TURNSTILE READY</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-ag-text-muted mb-1 font-mono">
              Current Gate Checkpoint
            </label>
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="w-full bg-ag-black/80 border border-ag-border text-ag-text-primary rounded-[6px] px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-ag-blue"
            >
              {gates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Viewfinder Camera Scanner Area */}
        <div className="relative aspect-square w-full bg-ag-black rounded-[16px] border-2 border-ag-border overflow-hidden flex flex-col items-center justify-center p-4 shadow-2xl">
          <div id="qr-reader" className="w-full h-full object-cover" />

          {/* Holographic Target Box */}
          <div className="absolute inset-8 pointer-events-none border-2 border-dashed border-ag-blue/60 rounded-[12px] flex items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-ag-green to-transparent animate-pulse absolute" />
            <div className="text-center space-y-2 bg-ag-black/80 p-3 rounded border border-ag-border">
              <Camera className="w-6 h-6 text-ag-blue mx-auto animate-pulse" />
              <div className="text-xs font-mono text-ag-text-secondary">
                Align Pass QR inside frame
              </div>
            </div>
          </div>

          {!isScanning && (
            <button
              onClick={startCamera}
              className="absolute bottom-4 z-10 bg-ag-surface/90 hover:bg-ag-surface border border-ag-blue/50 text-ag-blue text-xs font-mono px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg"
            >
              Activate Camera Feed
            </button>
          )}
        </div>

        {/* 3 Interactive Test Simulator Buttons */}
        <div className="space-y-2 bg-ag-surface p-4 rounded-[12px] border border-ag-border">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ag-text-muted text-center">
            Demo Simulator Buttons
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleTestScan('valid')}
              className="py-2.5 px-2 bg-ag-green-dim hover:bg-ag-green/20 border border-ag-green/40 text-ag-green rounded-[6px] text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
            >
              ✓ Test Valid
            </button>
            <button
              onClick={() => handleTestScan('duplicate')}
              className="py-2.5 px-2 bg-ag-yellow-dim hover:bg-ag-yellow/20 border border-ag-yellow/40 text-ag-yellow rounded-[6px] text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
            >
              ⚠ Duplicate
            </button>
            <button
              onClick={() => handleTestScan('invalid')}
              className="py-2.5 px-2 bg-ag-red-dim hover:bg-ag-red/20 border border-ag-red/40 text-ag-red rounded-[6px] text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
            >
              ✕ Invalid / Fake
            </button>
          </div>
        </div>

        {/* Bottom Turnstile Statistics Counter */}
        <div className="bg-ag-surface p-3.5 rounded-[12px] border border-ag-border text-xs font-mono flex items-center justify-between text-ag-text-secondary">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-ag-blue" />
            <span>
              Scanned today: <strong className="text-white">{totalScansToday.toLocaleString()}</strong>
            </span>
          </div>
          <div className="border-l border-ag-border pl-3 text-ag-green">
            This gate: <strong className="text-white">{thisGateScans.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
