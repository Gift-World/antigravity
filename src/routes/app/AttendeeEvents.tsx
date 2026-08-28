// src/routes/app/AttendeeEvents.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Event, TicketTier } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MpesaModal } from '@/components/attendee/MpesaModal';
import { Calendar, MapPin, Ticket, ShieldCheck, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AttendeeEvents: React.FC = () => {
  const navigate = useNavigate();
  const { events, purchaseTicket, currentUser } = useAppStore();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);

  const publishedEvents = events.filter((e) => e.status === 'published' || e.status === 'live');

  const handleStartPurchase = (event: Event, tier: TicketTier) => {
    setSelectedEvent(event);
    setSelectedTier(tier);
    setIsMpesaModalOpen(true);
  };

  const handleMpesaSuccess = async (mpesaPhone: string) => {
    if (!selectedEvent || !selectedTier) return;

    await purchaseTicket({
      eventId: selectedEvent.id,
      tier: selectedTier.name,
      price: selectedTier.price,
      fullName: currentUser.full_name,
      email: currentUser.email,
      phone: currentUser.phone || mpesaPhone,
      mpesaPhone,
    });

    navigate('/app/tickets');
  };

  return (
    <div className="space-y-4">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-ag-surface via-ag-black to-ag-surface rounded-[16px] p-5 text-white shadow-xl border border-ag-border space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-ag-green-dim text-ag-green px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border border-ag-green/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PROTECTED BY ANTIGRAVITY</span>
        </div>
        <h2 className="font-display font-bold text-xl leading-tight">
          Discover Live Events with Zero Safety Compromise
        </h2>
        <p className="text-xs text-ag-text-secondary font-mono">
          Real-time crush prevention, unforgeable device-bound tickets, and built-in anti-theft Guardian Mode.
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-base text-white">Featured Live Events</h3>

        {publishedEvents.map((event) => (
          <Card
            key={event.id}
            className="p-0 overflow-hidden bg-ag-surface border-ag-border shadow-md"
          >
            {/* Event Cover Photo */}
            <div className="h-40 relative bg-ag-black">
              <img
                src={event.cover_image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ag-black via-ag-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                {event.status === 'live' && (
                  <Badge variant="red" size="sm" pulse className="mb-1">
                    LIVE NOW
                  </Badge>
                )}
                <h4 className="font-display font-bold text-lg leading-tight">{event.title}</h4>
              </div>
            </div>

            {/* Event Details */}
            <div className="p-4 space-y-3">
              <div className="space-y-1.5 text-xs text-ag-text-secondary font-medium font-mono">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-ag-blue" />
                  <span>{new Date(event.event_date).toLocaleDateString('en-KE', { dateStyle: 'full' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-ag-red" />
                  <span>{event.venue?.name || 'Nyayo Stadium, Nairobi'}</span>
                </div>
              </div>

              {/* Ticket Tiers Selection */}
              <div className="pt-2 border-t border-ag-border space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ag-text-muted">
                  Available Ticket Tiers
                </span>
                <div className="space-y-2">
                  {event.ticket_tiers.map((tier) => (
                    <div
                      key={tier.name}
                      className="p-3 bg-ag-black/60 border border-ag-border rounded-[10px] flex items-center justify-between hover:border-ag-green/50 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{tier.name}</div>
                        <div className="text-xs font-mono font-bold text-ag-green">
                          KES {tier.price.toLocaleString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleStartPurchase(event, tier)}
                        className="text-xs font-bold"
                      >
                        Buy M-Pesa
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* M-Pesa Payment STK Push Modal */}
      {selectedEvent && selectedTier && (
        <MpesaModal
          isOpen={isMpesaModalOpen}
          onClose={() => setIsMpesaModalOpen(false)}
          amount={selectedTier.price}
          title={`Pay for ${selectedTier.name}`}
          description={`Purchasing pass for ${selectedEvent.title}`}
          onSuccess={handleMpesaSuccess}
        />
      )}
    </div>
  );
};
