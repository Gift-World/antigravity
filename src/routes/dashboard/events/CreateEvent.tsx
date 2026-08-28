// src/routes/dashboard/events/CreateEvent.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { TicketTier, SafetyConfig } from '@/types/database';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  DollarSign,
} from 'lucide-react';

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { venues, createEvent } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venueId, setVenueId] = useState(venues[0]?.id || '');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [doorsOpenTime, setDoorsOpenTime] = useState('14:00');
  const [eventStartTime, setEventStartTime] = useState('16:00');
  const [eventEndTime, setEventEndTime] = useState('23:00');
  const [maxCapacity, setMaxCapacity] = useState(18000);
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80'
  );

  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    { name: 'Early Bird', price: 2000, quantity: 5000, sold: 0 },
    { name: 'Regular Pitch', price: 3500, quantity: 10000, sold: 0 },
    { name: 'VIP Golden Circle', price: 8000, quantity: 3000, sold: 0 },
  ]);

  const [safetyConfig, setSafetyConfig] = useState<SafetyConfig>({
    density_warning: 4.5,
    density_critical: 5.5,
    capacity_slow_at: 0.9,
    capacity_stop_at: 0.98,
  });

  const handleAddTier = () => {
    setTicketTiers((prev) => [
      ...prev,
      { name: 'VIP Lounge', price: 12000, quantity: 500, sold: 0 },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    setTicketTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: keyof TicketTier, value: any) => {
    setTicketTiers((prev) =>
      prev.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const doorsOpen = new Date(`${eventDate}T${doorsOpenTime}:00`).toISOString();
    const eventStart = new Date(`${eventDate}T${eventStartTime}:00`).toISOString();
    const eventEnd = new Date(`${eventDate}T${eventEndTime}:00`).toISOString();

    const newEvent = createEvent({
      title,
      description,
      venue_id: venueId,
      event_date: eventDate,
      doors_open: doorsOpen,
      event_start: eventStart,
      event_end: eventEnd,
      max_capacity: Number(maxCapacity),
      cover_image_url: coverImageUrl,
      ticket_tiers: ticketTiers,
      safety_config: safetyConfig,
      status: 'published',
    });

    navigate(`/dashboard/events/${newEvent.id}/overview`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/events')}
          className="p-2 rounded bg-ag-surface hover:bg-ag-surface-hover border border-ag-border text-ag-text-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-display font-bold text-xl text-white">Create New Event</h2>
          <p className="text-xs text-ag-text-secondary font-mono">
            Configure live event telemetry, M-Pesa ticket tiers, and crowd safety thresholds
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Event Info */}
        <Card className="space-y-4">
          <h3 className="font-display font-bold text-base text-white border-b border-ag-border pb-2">
            1. Event Information
          </h3>

          <Input
            label="Event Title"
            placeholder="e.g. Afrobeats Festival Nairobi 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Outline headliners, security instructions, and event details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
                Host Venue
              </label>
              <select
                value={venueId}
                onChange={(e) => {
                  setVenueId(e.target.value);
                  const selectedVenue = venues.find((v) => v.id === e.target.value);
                  if (selectedVenue) setMaxCapacity(selectedVenue.total_capacity);
                }}
                className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.city}) • Cap: {v.total_capacity.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Venue Max Capacity"
              type="number"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              label="Event Date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
            <Input
              label="Doors Open"
              type="time"
              value={doorsOpenTime}
              onChange={(e) => setDoorsOpenTime(e.target.value)}
              required
            />
            <Input
              label="Event Start"
              type="time"
              value={eventStartTime}
              onChange={(e) => setEventStartTime(e.target.value)}
              required
            />
            <Input
              label="Event End"
              type="time"
              value={eventEndTime}
              onChange={(e) => setEventEndTime(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Section 2: Ticket Tiers (M-Pesa Native) */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-ag-border pb-2">
            <h3 className="font-display font-bold text-base text-white">
              2. M-Pesa Native Ticket Tiers
            </h3>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleAddTier}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Add Tier
            </Button>
          </div>

          <div className="space-y-3">
            {ticketTiers.map((tier, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-3 bg-ag-black/50 border border-ag-border rounded-[6px]"
              >
                <div className="md:col-span-2">
                  <Input
                    label="Tier Name"
                    value={tier.name}
                    onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Price (KES)"
                    type="number"
                    value={tier.price}
                    onChange={(e) => handleTierChange(idx, 'price', Number(e.target.value))}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      label="Quantity"
                      type="number"
                      value={tier.quantity}
                      onChange={(e) => handleTierChange(idx, 'quantity', Number(e.target.value))}
                      required
                    />
                  </div>
                  {ticketTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="p-2 text-ag-red hover:bg-ag-red/20 rounded transition-colors mb-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 3: Safety Configuration & Density Thresholds */}
        <Card className="space-y-4">
          <h3 className="font-display font-bold text-base text-white border-b border-ag-border pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-ag-green" />
            <span>3. Autonomous Safety & Crowd Crush Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-ag-black/50 rounded border border-ag-border space-y-2">
              <label className="font-bold text-ag-yellow uppercase font-mono">
                Density Warning Level (people/m²)
              </label>
              <input
                type="number"
                step="0.1"
                value={safetyConfig.density_warning}
                onChange={(e) =>
                  setSafetyConfig({ ...safetyConfig, density_warning: Number(e.target.value) })
                }
                className="w-full bg-ag-surface border border-ag-border text-white text-sm rounded p-2"
              />
              <p className="text-[11px] text-ag-text-muted">
                Triggers yellow warning tone and directs security flow when sector density reaches this point.
              </p>
            </div>

            <div className="p-3 bg-ag-black/50 rounded border border-ag-border space-y-2">
              <label className="font-bold text-ag-red uppercase font-mono">
                Critical Density Surge (people/m²)
              </label>
              <input
                type="number"
                step="0.1"
                value={safetyConfig.density_critical}
                onChange={(e) =>
                  setSafetyConfig({ ...safetyConfig, density_critical: Number(e.target.value) })
                }
                className="w-full bg-ag-surface border border-ag-border text-white text-sm rounded p-2"
              />
              <p className="text-[11px] text-ag-text-muted">
                Triggers critical mission-control siren and commands emergency egress gate release.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/events')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="lg" className="font-bold">
            Publish & Initialize Event Telemetry
          </Button>
        </div>
      </form>
    </div>
  );
};
