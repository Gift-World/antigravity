// src/components/attendee/MpesaModal.tsx
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Smartphone, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { isValidKenyanPhone, formatKenyanPhone } from '@/lib/mpesa';

export interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  title?: string;
  description?: string;
  onSuccess: (phone: string) => Promise<void>;
}

export const MpesaModal: React.FC<MpesaModalProps> = ({
  isOpen,
  onClose,
  amount,
  title = 'Lipa na M-Pesa Online',
  description = 'An STK push PIN prompt will be sent directly to your phone.',
  onSuccess,
}) => {
  const [phone, setPhone] = useState('0722998877');
  const [step, setStep] = useState<'input' | 'prompting' | 'processing' | 'success'>('input');
  const [error, setError] = useState('');

  const handleTriggerSTK = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || !isValidKenyanPhone(phone)) {
      setError('Please enter a valid Kenyan phone number (e.g. 0722123456).');
      return;
    }

    try {
      setStep('prompting');

      // Simulate sending STK prompt to device
      setTimeout(() => {
        setStep('processing');
      }, 1200);

      // Execute caller success handler (which simulates 3s Daraja callback)
      await onSuccess(phone);

      setStep('success');
      setTimeout(() => {
        onClose();
        setStep('input');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Payment failed or cancelled.');
      setStep('input');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="text-ag-text-primary">
        {step === 'input' && (
          <form onSubmit={handleTriggerSTK} className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-ag-green-dim border border-ag-green/30 rounded-[8px]">
              <div className="w-10 h-10 rounded-full bg-[#00A859] text-white flex items-center justify-center font-bold text-sm shrink-0">
                M-PESA
              </div>
              <div>
                <div className="text-xs text-ag-text-secondary">Amount Payable:</div>
                <div className="font-display font-bold text-lg text-ag-green">
                  KES {amount.toLocaleString()}
                </div>
              </div>
            </div>

            <Input
              label="M-Pesa Mobile Number"
              placeholder="e.g. 0722 998 877"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={error}
              leftIcon={<Smartphone className="w-4 h-4" />}
              helperText="Enter the Safaricom number to receive the PIN prompt"
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="success"
                className="w-full text-sm font-bold bg-[#00A859] hover:bg-[#00924d] text-white"
              >
                Send STK Push Prompt
              </Button>
            </div>
          </form>
        )}

        {(step === 'prompting' || step === 'processing') && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#00A859]/20 border-2 border-[#00A859] flex items-center justify-center animate-pulse">
                <Smartphone className="w-8 h-8 text-[#00A859]" />
              </div>
              <Loader2 className="w-6 h-6 text-white absolute -bottom-1 -right-1 animate-spin" />
            </div>

            <div className="space-y-1">
              <h4 className="font-display font-bold text-base text-ag-text-primary">
                {step === 'prompting' ? 'Sending M-Pesa STK Prompt...' : 'Check Your Phone'}
              </h4>
              <p className="text-xs text-ag-text-secondary max-w-xs">
                A Safaricom prompt has been sent to{' '}
                <strong className="text-ag-text-primary font-mono">{formatKenyanPhone(phone)}</strong>. Enter your
                secret PIN to authorize payment.
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-ag-green text-ag-black flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-display font-bold text-lg text-ag-green">Payment Confirmed!</h4>
            <p className="text-xs text-ag-text-secondary font-mono">
              Transaction verified by Safaricom Daraja. Pass minted.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
