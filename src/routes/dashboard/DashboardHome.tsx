// src/routes/dashboard/DashboardHome.tsx
import React from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrencyKES, formatNumber } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Ticket,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Activity,
  Plus,
  Radio,
} from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { events, tickets, alerts, activeEventId } = useAppStore();

  const activeLiveEvent = events.find((e) => e.status === 'live');
  const upcomingEvents = events.filter((e) => e.status !== 'live');

  // Revenue & Tickets
  const totalRevenue = events.reduce((sum, ev) => {
    return sum + ev.ticket_tiers.reduce((tSum, tier) => tSum + tier.price * tier.sold, 0);
  }, 0);

  const totalTicketsSold = events.reduce((sum, ev) => {
    return sum + ev.ticket_tiers.reduce((tSum, tier) => tSum + tier.sold, 0);
  }, 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner for Active Live Event */}
      {activeLiveEvent && (
        <div className="bg-gradient-to-r from-ag-green-dim/40 via-ag-surface to-ag-surface border border-ag-green/50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-ag-green/20 border border-ag-green flex items-center justify-center text-ag-green shrink-0">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="green" pulse size="sm">
                  LIVE NOW
                </Badge>
                <span className="text-xs text-ag-text-secondary">
                  {activeLiveEvent.venue?.name}
                </span>
              </div>
              <h3 className="font-display font-bold text-xl text-white">{activeLiveEvent.title}</h3>
              <p className="text-sm text-ag-text-secondary mt-1">
                Current Attendance: <strong className="text-white font-mono">{formatNumber(activeLiveEvent.current_attendance)}</strong> / {formatNumber(activeLiveEvent.max_capacity)} people inside
              </p>
            </div>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate(`/dashboard/events/${activeLiveEvent.id}/live`)}
            className="font-bold shrink-0 bg-ag-green hover:bg-ag-green/90 text-black shadow-lg shadow-ag-green/20 h-12 px-6"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Open Live View
          </Button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Events */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-ag-text-secondary mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Events</span>
            <Calendar className="w-4 h-4 text-ag-blue" />
          </div>
          <div className="font-display font-bold text-3xl text-white">{events.length}</div>
          <div className="text-xs text-ag-text-muted mt-1">
            {activeLiveEvent ? '1 event live now' : 'All scheduled'}
          </div>
        </Card>

        {/* Tickets Sold */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-ag-text-secondary mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Tickets Sold</span>
            <Ticket className="w-4 h-4 text-ag-green" />
          </div>
          <div className="font-display font-bold text-3xl text-ag-green">
            {formatNumber(totalTicketsSold)}
          </div>
          <div className="text-xs text-ag-green mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>M-Pesa Verified</span>
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-ag-text-secondary mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-ag-purple" />
          </div>
          <div className="font-display font-bold text-3xl text-ag-purple">
            {formatCurrencyKES(totalRevenue)}
          </div>
          <div className="text-xs text-ag-text-muted mt-1">
            Direct to organizer till / paybill
          </div>
        </Card>
      </div>

      {/* Events & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Events Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white">Your Events</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/dashboard/events/create')}
              className="text-xs"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Event
            </Button>
          </div>

          <div className="space-y-4">
            {events.length === 0 ? (
              <Card className="p-8 text-center space-y-3 border-ag-border bg-ag-surface">
                <Calendar className="w-8 h-8 text-ag-text-muted mx-auto" />
                <h4 className="font-bold text-white text-base">No Events in Database</h4>
                <p className="text-xs text-ag-text-secondary max-w-xs mx-auto">
                  Create your first event to start monitoring live crowd density and selling tickets.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/dashboard/events/create')}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create Event
                </Button>
              </Card>
            ) : (
              events.map((event) => {
              const totalCap = event.max_capacity;
              const currentAtt = event.current_attendance;
              const percent = Math.min(100, Math.round((currentAtt / totalCap) * 100));

              return (
                <Card
                  key={event.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-ag-border hover:border-ag-blue/40 transition-colors"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          event.status === 'live'
                            ? 'green'
                            : event.status === 'published'
                            ? 'blue'
                            : 'neutral'
                        }
                        pulse={event.status === 'live'}
                        size="sm"
                      >
                        {event.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-ag-text-muted">
                        {new Date(event.event_date).toLocaleDateString('en-KE', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-base text-white truncate">
                      {event.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-ag-text-secondary">
                      <MapPin className="w-3.5 h-3.5 text-ag-text-muted" />
                      <span>{event.venue?.name}</span>
                    </div>
                  </div>

                  {/* Actions & Progress */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-32 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ag-text-muted">{percent}% full</span>
                        <span className="font-bold text-white">{formatNumber(currentAtt)}</span>
                      </div>
                      <div className="w-full bg-ag-black h-2 rounded-full overflow-hidden border border-ag-border">
                        <div
                          className={`h-full rounded-full ${
                            percent > 90 ? 'bg-ag-red' : percent > 75 ? 'bg-ag-yellow' : 'bg-ag-green'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {event.status === 'live' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/dashboard/events/${event.id}/live`)}
                        className="bg-ag-green hover:bg-ag-green/90 text-black font-bold h-10 px-4"
                      >
                        GO LIVE
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/dashboard/events/${event.id}/overview`)}
                        className="h-10 px-4"
                      >
                        View Event
                      </Button>
                    )}
                  </div>
                </Card>
              );
            }))}
          </div>
        </div>

        {/* Recent Alerts (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white">Recent Alerts</h3>
            <span className="text-xs text-ag-text-muted">{alerts.length} total</span>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                  alert.severity === 'critical'
                    ? 'bg-ag-red-dim border-ag-red/40 text-ag-red'
                    : alert.severity === 'warning'
                    ? 'bg-ag-yellow-dim border-ag-yellow/40 text-ag-yellow'
                    : 'bg-ag-surface border-ag-border text-ag-text-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10px]">
                    {alert.alert_type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-white text-xs leading-relaxed">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
