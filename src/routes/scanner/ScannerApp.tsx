// src/routes/scanner/ScannerApp.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { soundManager } from '@/lib/audio';
import { parseQRPayload } from '@/lib/qr';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Camera,
  RefreshCw,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Shield,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export const ScannerApp: React.FC = () => {
  const {
    events,
    activeEventId,
    currentUser,
    tickets,
    processGateScan,
    gateScans,
    isAudioMuted,
    toggleAudioMute,
  } = useAppStore();

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const gates = activeEvent.venue?.zones?.filter((z) => z.zone_type === 'entry_gate' || z.zone_type === 'exit_gate') || [];

  const [selectedGateId, setSelectedGateId] = useState<string>(gates[0]?.id || '');
  const [direction, setDirection] = useState<'in' | 'out'>('in');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    ticketTier?: string;
    timestamp?: string;
  }>({ status: 'idle', message: 'Ready to scan attendee passes' });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Filter scans at current gate
  const currentGateScans = gateScans.filter((s) => s.gate_id === selectedGateId);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync offline queue
      if (offlineQueue.length > 0) {
        offlineQueue.forEach((scan) => processGateScan(scan));
        setOfflineQueue([]);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue, processGateScan]);

  const handleScanData = async (rawQrString: string) => {
    if (!rawQrString) return;

    const parsed = parseQRPayload(rawQrString);
    if (!parsed) {
      setLastScanResult({
        status: 'error',
        message: 'Invalid QR Format. Unrecognized payload structure.',
      });
      return;
    }

    const payload = {
      ticketId: parsed.tid,
      gateId: selectedGateId,
      qrHash: parsed.hash,
      staffId: currentUser.id,
      direction,
    };

    if (!isOnline) {
      setOfflineQueue((prev) => [...prev, payload]);
      setLastScanResult({
        status: 'success',
        message: 'Stored in Offline Sync Queue (Network Offline).',
        ticketTier: 'QUEUED',
        timestamp: new Date().toLocaleTimeString(),
      });
      soundManager.playScanSuccess();
      return;
    }

    const result = await processGateScan(payload);

    if (result.success) {
      setLastScanResult({
        status: 'success',
        message: result.message,
        ticketTier: result.ticket?.tier,
        timestamp: new Date().toLocaleTimeString(),
      });
    } else {
      setLastScanResult({
        status: 'error',
        message: result.message,
        ticketTier: result.ticket?.tier,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  const startCamera = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }
      setIsScanning(true);
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScanData(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.warn('Camera failed or permission not granted', err);
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      await scannerRef.current.stop().catch(() => {});
      setIsScanning(false);
    }
  };

  // Mock Simulator triggers for rapid testing without physical camera
  const triggerMockScan = (type: 'valid' | 'duplicate' | 'invalid_hash') => {
    if (type === 'valid') {
      const validTicket = tickets.find((t) => t.status === 'valid') || tickets[0];
      handleScanData(
        JSON.stringify({
          tid: validTicket.id,
          hash: validTicket.qr_code_hash,
          ver: 1,
        })
      );
    } else if (type === 'duplicate') {
      const scannedTicket = tickets.find((t) => t.status === 'scanned') || tickets[1] || tickets[0];
      handleScanData(
        JSON.stringify({
          tid: scannedTicket.id,
          hash: scannedTicket.qr_code_hash,
          ver: 1,
        })
      );
    } else {
      handleScanData(
        JSON.stringify({
          tid: 'fake_fraudulent_ticket_id',
          hash: 'fake_counterfeit_hash_0000',
          ver: 1,
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-ag-black text-ag-text-primary flex flex-col max-w-md mx-auto select-none border-x border-ag-border pb-8">
      {/* Mobile Top Header */}
      <header className="h-16 px-4 bg-ag-surface border-b border-ag-border flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-ag-green-dim border border-ag-green/40 flex items-center justify-center text-ag-green font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-bold text-sm tracking-wide text-white">
              GATE SCANNER
            </div>
            <div className="text-[10px] font-mono text-ag-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ag-green animate-ping" />
              <span>STAFF TERMINAL</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Network Status indicator */}
          <div
            className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded border ${
              isOnline
                ? 'bg-ag-green-dim text-ag-green border-ag-green/30'
                : 'bg-ag-red-dim text-ag-red border-ag-red/30'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          <button
            onClick={toggleAudioMute}
            className="p-2 text-ag-text-secondary hover:text-ag-text-primary bg-ag-surface-hover border border-ag-border rounded-[6px]"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-ag-red" /> : <Volume2 className="w-4 h-4 text-ag-green" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 flex-1">
        {/* Gate Selection & In/Out Direction */}
        <div className="p-3 bg-ag-surface rounded-[8px] border border-ag-border space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ag-text-secondary uppercase tracking-wider text-[11px]">
              Assigned Checkpoint
            </span>
            <span className="text-[10px] font-mono text-ag-text-muted">Staff: {currentUser.full_name}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase text-ag-text-muted mb-1">Gate</label>
              <select
                value={selectedGateId}
                onChange={(e) => setSelectedGateId(e.target.value)}
                className="w-full bg-ag-black border border-ag-border text-ag-text-primary text-xs rounded px-2.5 py-2 font-medium focus:outline-none focus:border-ag-blue"
              >
                {gates.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name.split('(')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-ag-text-muted mb-1">Flow</label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setDirection('in')}
                  className={`py-1.5 text-xs font-semibold rounded flex items-center justify-center gap-1 border transition-colors ${
                    direction === 'in'
                      ? 'bg-ag-green text-ag-black border-ag-green font-bold shadow-sm'
                      : 'bg-ag-black text-ag-text-secondary border-ag-border'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" /> IN
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('out')}
                  className={`py-1.5 text-xs font-semibold rounded flex items-center justify-center gap-1 border transition-colors ${
                    direction === 'out'
                      ? 'bg-ag-blue text-white border-ag-blue font-bold shadow-sm'
                      : 'bg-ag-black text-ag-text-secondary border-ag-border'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> OUT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Scan Flash Indicator Box */}
        <div
          className={`p-5 rounded-[12px] border text-center transition-all duration-300 ${
            lastScanResult.status === 'success'
              ? 'bg-ag-green/20 border-ag-green shadow-[0_0_30px_rgba(0,230,118,0.3)] animate-in zoom-in-95'
              : lastScanResult.status === 'error'
              ? 'bg-ag-red/25 border-ag-red shadow-[0_0_30px_rgba(255,23,68,0.3)] animate-in zoom-in-95'
              : 'bg-ag-surface border-ag-border'
          }`}
        >
          {lastScanResult.status === 'success' ? (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-ag-green text-ag-black flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="font-display font-bold text-xl text-ag-green tracking-wide">
                ENTRY AUTHORIZED
              </div>
              <div className="text-sm font-semibold text-white uppercase">{lastScanResult.ticketTier}</div>
              <p className="text-xs text-ag-green/90 font-mono">{lastScanResult.message}</p>
            </div>
          ) : lastScanResult.status === 'error' ? (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-ag-red text-white flex items-center justify-center mx-auto shadow-lg">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="font-display font-bold text-xl text-ag-red tracking-wide">
                ACCESS DENIED
              </div>
              <p className="text-xs font-mono text-ag-red-dim text-white/90 bg-ag-red/30 p-2 rounded">
                {lastScanResult.message}
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-3 text-ag-text-muted">
              <QrCode className="w-10 h-10 mx-auto opacity-40 animate-pulse" />
              <div className="text-xs font-mono">{lastScanResult.message}</div>
            </div>
          )}
        </div>

        {/* Camera Viewport */}
        <div className="bg-ag-black rounded-[8px] border border-ag-border overflow-hidden relative aspect-square flex flex-col items-center justify-center">
          <div id="qr-reader" className="w-full h-full" />

          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-ag-surface/90 p-6 text-center space-y-3">
              <Camera className="w-12 h-12 text-ag-blue opacity-80" />
              <div className="text-sm font-semibold text-ag-text-primary">Camera Scanner Inactive</div>
              <p className="text-xs text-ag-text-secondary max-w-xs">
                Activate camera to scan physical QR passes or phone screens.
              </p>
              <Button size="md" variant="primary" onClick={startCamera} leftIcon={<Camera className="w-4 h-4" />}>
                Start Camera Scanner
              </Button>
            </div>
          )}

          {isScanning && (
            <button
              onClick={stopCamera}
              className="absolute bottom-3 right-3 bg-ag-black/80 border border-ag-border text-xs px-2.5 py-1 rounded text-ag-text-secondary hover:text-white"
            >
              Stop Camera
            </button>
          )}
        </div>

        {/* Fast Mock QR Simulator for Desktop/Demo Testing */}
        <div className="p-3 bg-ag-surface rounded-[8px] border border-ag-border space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ag-text-secondary flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-ag-yellow" />
            <span>Instant Pass Simulator (Test Scenarios)</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="success"
              onClick={() => triggerMockScan('valid')}
              className="text-[11px] h-8"
            >
              ✓ Valid Pass
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => triggerMockScan('duplicate')}
              className="text-[11px] h-8 text-ag-yellow"
            >
              ⚠ Duplicate
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => triggerMockScan('invalid_hash')}
              className="text-[11px] h-8"
            >
              ✕ Fake/Fraud
            </Button>
          </div>
        </div>

        {/* Gate Statistics Banner */}
        <div className="p-3 bg-ag-black/60 rounded-[8px] border border-ag-border flex items-center justify-between text-xs font-mono">
          <span className="text-ag-text-secondary">Checkpoint Total Scans:</span>
          <span className="font-display font-bold text-base text-ag-green">
            {currentGateScans.length.toLocaleString()} Passings
          </span>
        </div>
      </div>
    </div>
  );
};
