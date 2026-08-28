// src/routes/dashboard/events/CreateEvent.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { Calendar, Building, ArrowLeft, ArrowRight, DollarSign, Image } from 'lucide-react';

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { venues, createEvent } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venueId, setVenueId] = useState(venues[0]?.id || 'b1111111-1111-1111-1111-111111111111');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [maxCapacity, setMaxCapacity] = useState(15000);
  const [regularPrice, setRegularPrice] = useState(3000);
  const [vipPrice, setVipPrice] = useState(7500);
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedVenue = venues.find((v) => v.id === venueId) || venues[0];

    const newEvent = createEvent({
      title,
      description,
      venue_id: venueId,
      event_date: eventDate,
      doors_open: `${eventDate}T14:00:00Z`,
      event_start: `${eventDate}T16:00:00Z`,
      event_end: `${eventDate}T23:00:00Z`,
      max_capacity: Number(maxCapacity),
      cover_image_url: coverImageUrl,
      ticket_tiers: [
        { name: 'Regular Pass', price: Number(regularPrice), quantity: Math.round(maxCapacity * 0.8), sold: 0 },
        { name: 'VIP Pass', price: Number(vipPrice), quantity: Math.round(maxCapacity * 0.2), sold: 0 },
      ],
      safety_config: {
        density_warning: 4.5,
        density_critical: 5.5,
        capacity_slow_at: 0.9,
        capacity_stop_at: 0.98,
      },
      status: 'published',
      venue: selectedVenue,
    });

    navigate(`/dashboard/events/${newEvent.id}/overview`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/events')}
          className="p-2 rounded-lg bg-ag-surface hover:bg-ag-surface-hover border border-ag-border text-ag-text-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-display font-bold text-white">Create New Event</h2>
          <p className="text-xs text-ag-text-secondary">Fill in the details below to set up your event</p>
        </div>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Event Name"
            placeholder="e.g. Sauti Sol Farewell Concert"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ag-text-secondary">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell your attendees what to expect..."
              rows={3}
              className="w-full bg-ag-black border border-ag-border focus:border-ag-blue rounded-lg p-3 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ag-text-secondary">Venue</label>
              <div className="relative">
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full bg-ag-black border border-ag-border focus:border-ag-blue rounded-lg p-3 text-sm text-white focus:outline-none transition-colors"
                  required
                >
                  {venues.length === 0 ? (
                    <option value="">No venues available</option>
                  ) : (
                    venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.city})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <Input
              label="Event Date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Expected Capacity"
              type="number"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              required
            />

            <Input
              label="Regular Ticket (KES)"
              type="number"
              value={regularPrice}
              onChange={(e) => setRegularPrice(Number(e.target.value))}
              required
            />

            <Input
              label="VIP Ticket (KES)"
              type="number"
              value={vipPrice}
              onChange={(e) => setVipPrice(Number(e.target.value))}
              required
            />
          </div>

          <Input
            label="Cover Image URL"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..."
            leftIcon={<Image className="w-4 h-4 text-ag-text-muted" />}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-ag-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/events')}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="h-11 px-8 font-bold shadow-lg shadow-ag-blue/20"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Event
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
