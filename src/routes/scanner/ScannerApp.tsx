// src/routes/scanner/ScannerApp.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { soundManager } from '@/lib/audio';
import { parseQRPayload } from '@/lib/qr';
import { Ticket } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AntigravityLogo } from '@/components/ui/AntigravityLogo';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Camera,
  Settings,
  Shield,
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

  const gates = [
    { id: 'c1111111-1111-1111-1111-111111111111', name: 'Gate A (Main North)' },
    { id: 'c2222222-2222-2222-2222-222222222222', name: 'Gate B (East Public)' },
    { id: 'c3333333-3333-3333-3333-333333333333', name: 'Gate C (South Express)' },
    { id: 'c4444444-4444-4444-4444-444444444444', name: 'Gate D (VIP)' },
  ];

  const [selectedGate, setSelectedGate] = useState(gates[0].id);
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'error';
    ticket?: Ticket;
    reason?: string;
    message?: string;
  }>({ status: 'idle' });

  const [isScanning, setIsScanning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Total scanned through this scanner
  const totalScannedCount = 847 + gateScans.length;

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleScanData = async (decodedText: string) => {
    if (scanResult.status !== 'idle') return;

    try {
      const parsed = parseQRPayload(decodedText);
      if (!parsed) {
        soundManager.playScanError();
        setScanResult({
          status: 'error',
          reason: 'Invalid Ticket',
          message: 'Fake or unrecognized barcode format.',
        });
        setTimeout(() => setScanResult({ status: 'idle' }), 2000);
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
          message: res.message,
        });
      } else {
        setScanResult({
          status: 'error',
          ticket: res.ticket,
          reason: res.reason === 'already_scanned' ? 'Already Used' : 'Denied',
          message: res.message,
        });
      }
    } catch (err) {
      soundManager.playScanError();
      setScanResult({
        status: 'error',
        reason: 'Error Reading Ticket',
        message: 'Could not process code.',
      });
    }

    setTimeout(() => {
      setScanResult({ status: 'idle' });
    }, 2000);
  };

  const handleTestScan = (type: 'valid' | 'duplicate' | 'invalid') => {
    setIsSettingsOpen(false);
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
      };
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
          t: 'fake_ticket_99',
          h: 'invalid_hash',
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
        { fps: 10, qrbox: { width: 280, height: 280 } },
        (decodedText) => handleScanData(decodedText),
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      console.warn('Camera fallback triggered.', err);
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-ag-black text-white flex flex-col items-center justify-between p-4 selection:bg-ag-blue/30 font-sans relative overflow-hidden">
      {/* SUCCESS FLASH OVERLAY */}
      {scanResult.status === 'success' && (
        <div className="fixed inset-0 z-50 bg-ag-green flex flex-col items-center justify-center p-6 text-black animate-flash-success">
          <CheckCircle2 className="w-28 h-28 mb-4 text-black animate-bounce" />
          <h1 className="font-display font-bold text-5xl sm:text-6xl uppercase tracking-wider text-black">
            ✅ ENTER
          </h1>
          <div className="mt-4 p-4 bg-black/10 rounded-2xl text-center w-full max-w-xs space-y-1">
            <div className="text-2xl font-bold font-display uppercase text-black">
              {scanResult.ticket?.tier || 'Regular Pitch'}
            </div>
            <div className="text-sm font-semibold text-black/80">Valid Ticket</div>
          </div>
        </div>
      )}

      {/* ERROR FLASH OVERLAY */}
      {scanResult.status === 'error' && (
        <div className="fixed inset-0 z-50 bg-ag-red flex flex-col items-center justify-center p-6 text-white animate-flash-critical">
          <XCircle className="w-28 h-28 mb-4 text-white animate-pulse" />
          <h1 className="font-display font-bold text-5xl sm:text-6xl uppercase tracking-wider text-white">
            ❌ DENIED
          </h1>
          <div className="mt-4 p-4 bg-black/30 rounded-2xl text-center w-full max-w-xs space-y-1 border border-white/20">
            <div className="text-xl font-bold uppercase text-white">
              {scanResult.reason || 'Invalid Ticket'}
            </div>
            <div className="text-xs text-white/90">{scanResult.message}</div>
          </div>
        </div>
      )}

      {/* MOBILE CONTAINER (Max 480px Centered) */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-between space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 bg-ag-surface rounded-2xl border border-ag-border shadow-lg">
          <AntigravityLogo size="sm" />
          <div className="flex items-center gap-2">
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="bg-ag-black border border-ag-border text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {gates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg bg-ag-black hover:bg-ag-surface-hover border border-ag-border text-ag-text-secondary hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HUGE MAIN SCANNER VIEWPORT / BUTTON */}
        <div
          onClick={() => {
            if (!isScanning) {
              startCamera();
            } else {
              handleTestScan('valid');
            }
          }}
          className="flex-1 min-h-[380px] bg-ag-surface/50 border-2 border-dashed border-ag-border hover:border-ag-green rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden group"
        >
          <div id="qr-reader" className="w-full h-full absolute inset-0 z-0" />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            <div className="w-24 h-24 rounded-3xl bg-ag-green/20 border-2 border-ag-green flex items-center justify-center text-ag-green group-hover:scale-110 transition-transform shadow-2xl shadow-ag-green/20">
              <QrCode className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold text-white">
                {isScanning ? 'Aim Camera at Ticket' : 'TAP TO SCAN'}
              </h2>
              <p className="text-xs text-ag-text-secondary">
                Point at attendee screen or wristband QR
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM RUNNING COUNT */}
        <div className="p-4 bg-ag-surface rounded-2xl border border-ag-border text-center">
          <div className="text-xs text-ag-text-secondary uppercase font-semibold">Total Attendees Scanned</div>
          <div className="text-3xl font-display font-bold text-ag-green font-mono mt-0.5">
            Scanned: {totalScannedCount}
          </div>
        </div>
      </div>

      {/* Settings & Test Tools Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Gate Scanner Options & Tests"
      >
        <div className="space-y-4 font-sans text-sm">
          <div>
            <label className="block text-xs font-semibold text-ag-text-secondary mb-1">
              Active Checkpoint
            </label>
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="w-full bg-ag-black border border-ag-border rounded-lg p-2.5 text-white text-xs"
            >
              {gates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-ag-border space-y-2">
            <div className="text-xs font-semibold text-ag-text-muted uppercase">Simulation Test Scans</div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleTestScan('valid')}
                className="bg-ag-green text-black font-bold h-10"
              >
                Test Valid
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestScan('duplicate')}
                className="text-ag-yellow border-ag-yellow/40 h-10"
              >
                Duplicate
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleTestScan('invalid')}
                className="h-10"
              >
                Fake QR
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
