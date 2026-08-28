// src/lib/qr.ts
// Cryptographic device-bound QR ticket generator & validator

const SECRET_SALT = 'antigravity_nairobi_ke_secure_salt_2026';

export async function generateSHA256Hash(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple hash for non-crypto contexts
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server_default_fp';
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const lang = navigator.language;
  const platform = navigator.platform || 'unknown';
  return `fp_${btoa(`${ua}|${screen}|${lang}|${platform}`).substring(0, 32)}`;
}

export interface QRPayload {
  tid: string;
  hash: string;
  ver: number;
}

export async function createTicketQRPayload(ticketId: string, deviceFingerprint?: string): Promise<{ payloadString: string; hash: string }> {
  const fp = deviceFingerprint || getDeviceFingerprint();
  const rawString = `${ticketId}:${fp}:${SECRET_SALT}`;
  const hash = await generateSHA256Hash(rawString);
  
  const payload: QRPayload = {
    tid: ticketId,
    hash: hash,
    ver: 1,
  };

  return {
    payloadString: JSON.stringify(payload),
    hash,
  };
}

export function parseQRPayload(rawText: string): QRPayload | null {
  try {
    const parsed = JSON.parse(rawText);
    const tid = parsed.tid || parsed.ticketId || parsed.t;
    const hash = parsed.hash || parsed.h || parsed.qr_code_hash;
    if (tid && hash) {
      return {
        tid: String(tid),
        hash: String(hash),
        ver: parsed.ver || parsed.v || 1,
      };
    }
    return null;
  } catch (e) {
    // If raw ticket ID was scanned
    if (typeof rawText === 'string' && rawText.length > 3) {
      return {
        tid: rawText,
        hash: 'direct_scanned_id',
        ver: 1,
      };
    }
    return null;
  }
}

export async function verifyTicketHash(ticketId: string, deviceFingerprint: string, expectedHash: string): Promise<boolean> {
  const rawString = `${ticketId}:${deviceFingerprint}:${SECRET_SALT}`;
  const computedHash = await generateSHA256Hash(rawString);
  return computedHash === expectedHash;
}
