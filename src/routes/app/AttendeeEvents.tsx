// src/routes/app/AttendeeEvents.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Event, TicketTier } from '@/types/database';
import { Button } from '@/components/ui/Button';
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
    <div className="p-4 space-y-5">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-[#12121A] to-[#1E1E2D] rounded-[16px] p-5 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#00E676]/20 text-[#00E676] px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PROTECTED BY ANTIGRAVITY</span>
          </div>
          <h2 className="font-display font-bold text-xl leading-tight">
            Discover Live Events with Zero Safety Compromise
          </h2>
          <p className="text-xs text-white/70">
            Real-time crush prevention, unforgeable device-bound tickets, and built-in anti-theft Guardian Mode.
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-base text-[#12121A]">Featured Live Events</h3>

        {publishedEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-[14px] border border-[#E2E4EB] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Event Cover Photo */}
            <div className="h-40 relative bg-gray-200">
              <img
                src={event.cover_image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                {event.status === 'live' && (
                  <span className="bg-[#FF1744] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
                    LIVE NOW
                  </span>
                )}
                <h4 className="font-display font-bold text-lg leading-tight">{event.title}</h4>
              </div>
            </div>

            {/* Event Details */}
            <div className="p-4 space-y-3">
              <div className="space-y-1.5 text-xs text-[#55556A] font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#448AFF]" />
                  <span>{new Date(event.event_date).toLocaleDateString('en-KE', { dateStyle: 'full' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF1744]" />
                  <span>{event.venue?.name || 'Nyayo Stadium, Nairobi'}</span>
                </div>
              </div>

              {/* Ticket Tiers Selection */}
              <div className="pt-2 border-t border-[#E2E4EB] space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#717182]">
                  Available Ticket Tiers
                </span>
                <div className="space-y-2">
                  {event.ticket_tiers.map((tier) => (
                    <div
                      key={tier.name}
                      className="p-3 bg-[#F8F9FC] border border-[#E2E4EB] rounded-[10px] flex items-center justify-between hover:border-[#00A859] transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#12121A]">{tier.name}</div>
                        <div className="text-xs font-mono font-bold text-[#00A859]">
                          KES {tier.price.toLocaleString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleStartPurchase(event, tier)}
                        className="text-xs bg-[#00A859] hover:bg-[#00924d] text-white font-bold"
                      >
                        Buy M-Pesa
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
