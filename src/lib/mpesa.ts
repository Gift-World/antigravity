// src/lib/mpesa.ts
// Safaricom Daraja STK Push (Lipa Na M-Pesa Online) Integration & Simulation

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface MpesaTransactionResult {
  success: boolean;
  receiptNumber: string;
  amount: number;
  phoneNumber: string;
  timestamp: string;
  errorMessage?: string;
}

export function formatKenyanPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+254')) {
    return cleaned;
  }
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('07') || cleaned.startsWith('01')) {
    return `+254${cleaned.substring(1)}`;
  }
  if (cleaned.length === 9) {
    return `+254${cleaned}`;
  }
  return cleaned;
}

export function isValidKenyanPhone(phone: string): boolean {
  const formatted = formatKenyanPhone(phone);
  return /^\+254[71]\d{8}$/.test(formatted);
}

export function generateMpesaReceipt(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let receipt = 'QK';
  for (let i = 0; i < 8; i++) {
    receipt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return receipt;
}

/**
 * Initiates an M-Pesa STK Push and resolves with full callback status after simulated PIN entry
 */
export async function triggerMpesaSTKPush(
  request: STKPushRequest,
  onPromptSent?: (checkoutId: string) => void
): Promise<MpesaTransactionResult> {
  const formattedPhone = formatKenyanPhone(request.phoneNumber);
  const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  if (onPromptSent) {
    onPromptSent(checkoutRequestId);
  }

  // Simulate Safaricom Daraja STK Push dispatch & user entering M-Pesa PIN on mobile device
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 98% simulated success rate
      const isSuccess = Math.random() < 0.98;

      if (isSuccess) {
        resolve({
          success: true,
          receiptNumber: generateMpesaReceipt(),
          amount: request.amount,
          phoneNumber: formattedPhone,
          timestamp: new Date().toISOString(),
        });
      } else {
        reject(new Error('M-Pesa STK Push: User cancelled transaction or PIN timeout.'));
      }
    }, 3000);
  });
}
