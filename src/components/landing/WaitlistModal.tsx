// src/components/landing/WaitlistModal.tsx
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/lib/store';
import { CheckCircle2, Shield, Sparkles } from 'lucide-react';

export interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const { joinWaitlist } = useAppStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [eventSize, setEventSize] = useState('5,000 - 20,000 attendees');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    joinWaitlist({
      full_name: fullName,
      email,
      company,
      event_size: eventSize,
      message,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Early Access & Deployment"
      description="Join leading African promoters and stadium authorities deploying Antigravity."
      maxWidth="md"
    >
      {isSubmitted ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-ag-green-dim text-ag-green border border-ag-green flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-display font-bold text-lg text-white">Priority Access Reserved</h4>
          <p className="text-xs text-ag-text-secondary max-w-xs">
            Our Nairobi deployment engineering team will reach out to schedule an on-site stadium telemetry walkthrough.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Amani Mwangi"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Corporate / Official Email"
            type="email"
            placeholder="amani@pulseevents.co.ke"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Organization / Company"
              placeholder="e.g. Pulse Events Kenya"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
                Expected Event Size
              </label>
              <select
                value={eventSize}
                onChange={(e) => setEventSize(e.target.value)}
                className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue"
              >
                <option value="1,000 - 5,000 attendees">1,000 - 5,000 attendees</option>
                <option value="5,000 - 20,000 attendees">5,000 - 20,000 attendees</option>
                <option value="20,000+ stadium scale">20,000+ stadium scale</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
              Event Details / Specific Safety Needs
            </label>
            <textarea
              rows={2}
              placeholder="Tell us about your upcoming concerts, stadiums, or safety priorities..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue placeholder:text-ag-text-muted"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Submit Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
