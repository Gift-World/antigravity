// src/components/landing/WaitlistModal.tsx
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/lib/store';
import { CheckCircle2, Shield, Sparkles, Send } from 'lucide-react';

export interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const { joinWaitlist } = useAppStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [eventSize, setEventSize] = useState('2000-10000');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    const entry = {
      full_name: fullName,
      email,
      company,
      event_size: eventSize,
      message: `Average Event Size: ${eventSize}`,
    };

    // Store in global reactive store
    joinWaitlist(entry);

    // Persist in localStorage for demo mode
    try {
      const existing = JSON.parse(localStorage.getItem('antigravity_waitlist') || '[]');
      existing.push({ ...entry, timestamp: new Date().toISOString() });
      localStorage.setItem('antigravity_waitlist', JSON.stringify(existing));
    } catch (err) {}

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Early Access"
      description="Deploy autonomous crowd safety infrastructure for your upcoming events."
      maxWidth="md"
    >
      {isSubmitted ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-ag-green-dim text-ag-green border border-ag-green/50 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-display font-bold text-lg text-white">Priority Access Reserved</h4>
          <p className="text-xs text-ag-text-secondary max-w-xs font-mono">
            Your organization has been prioritized. Our Nairobi deployment team will contact{' '}
            <strong className="text-white">{email}</strong>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your Name"
            placeholder="e.g. Amani Mwangi"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Work Email"
            type="email"
            placeholder="amani@pulseevents.co.ke"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Company / Promotion Group"
            placeholder="e.g. Pulse Events Kenya"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5 font-mono">
              Average Event Size
            </label>
            <select
              value={eventSize}
              onChange={(e) => setEventSize(e.target.value)}
              className="w-full bg-ag-black/70 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue font-mono"
            >
              <option value="<500">&lt; 500 attendees (Club / Lounge)</option>
              <option value="500-2000">500 – 2,000 attendees (Auditorium / Hall)</option>
              <option value="2000-10000">2,000 – 10,000 attendees (Arena / Grounds)</option>
              <option value="10000+">10,000+ attendees (Stadium Scale)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold" rightIcon={<Send className="w-3.5 h-3.5" />}>
              Submit Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
