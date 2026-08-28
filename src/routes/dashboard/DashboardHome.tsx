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
  Radio,
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  MapPin,
} from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { events, tickets, incidents, alerts, activeEventId } = useAppStore();

  const activeLiveEvent = events.find((e) => e.status === 'live');
  const upcomingEvents = events.filter((e) => e.status === 'published');
  const openIncidents = incidents.filter((i) => i.status !== 'resolved');

  // Calculate high-level financial metrics
  const totalRevenue = events.reduce((sum, ev) => {
    return sum + ev.ticket_tiers.reduce((tSum, tier) => tSum + tier.price * tier.sold, 0);
  }, 0);

  const totalTicketsSold = events.reduce((sum, ev) => {
    return sum + ev.ticket_tiers.reduce((tSum, tier) => tSum + tier.sold, 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner if Live Event is Active */}
      {activeLiveEvent && (
        <div className="bg-gradient-to-r from-ag-red/20 via-ag-surface to-ag-surface border border-ag-red/50 rounded-[12px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-ag-red/20 border border-ag-red flex items-center justify-center text-ag-red shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="red" pulse size="sm">
                  LIVE EVENT COMMAND ACTIVE
                </Badge>
                <span className="text-xs font-mono text-ag-text-secondary">
                  {activeLiveEvent.venue?.name}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">{activeLiveEvent.title}</h3>
              <p className="text-xs text-ag-text-secondary mt-0.5">
                Current Attendance: <strong className="text-white font-mono">{formatNumber(activeLiveEvent.current_attendance)}</strong> / {formatNumber(activeLiveEvent.max_capacity)} ({( (activeLiveEvent.current_attendance / activeLiveEvent.max_capacity) * 100).toFixed(1)}%)
              </p>
            </div>
          </div>

          <Button
            size="md"
            variant="danger"
            onClick={() => navigate(`/dashboard/events/${activeLiveEvent.id}/live`)}
            className="font-bold shrink-0 shadow-lg shadow-ag-red/20"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Launch Command Center
          </Button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <Card hover onClick={() => navigate('/dashboard/events')}>
          <div className="flex items-center justify-between text-ag-text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Active Events</span>
            <Calendar className="w-4 h-4 text-ag-blue" />
          </div>
          <div className="font-display font-bold text-2xl text-white">{events.length}</div>
          <div className="text-[11px] text-ag-text-muted mt-1 flex items-center gap-1 font-mono">
            <span className="text-ag-green font-semibold">1 Live</span> • {upcomingEvents.length} Scheduled
          </div>
        </Card>

        {/* Total Tickets Sold */}
        <Card hover onClick={() => navigate('/dashboard/tickets')}>
          <div className="flex items-center justify-between text-ag-text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Tickets Sold</span>
            <Ticket className="w-4 h-4 text-ag-green" />
          </div>
          <div className="font-display font-bold text-2xl text-ag-green">
            {formatNumber(totalTicketsSold)}
          </div>
          <div className="text-[11px] text-ag-text-muted mt-1 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3 text-ag-green" />
            <span className="text-ag-green font-semibold">+847</span> in last 3 hours
          </div>
        </Card>

        {/* Total Revenue */}
        <Card hover onClick={() => navigate('/dashboard/analytics')}>
          <div className="flex items-center justify-between text-ag-text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-ag-purple" />
          </div>
          <div className="font-display font-bold text-2xl text-ag-purple">
            {formatCurrencyKES(totalRevenue)}
          </div>
          <div className="text-[11px] text-ag-text-muted mt-1 font-mono">
            M-Pesa STK Verified Native
          </div>
        </Card>

        {/* Active Incidents */}
        <Card hover onClick={() => navigate('/dashboard/incidents')}>
          <div className="flex items-center justify-between text-ag-text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-ag-yellow" />
          </div>
          <div className="font-display font-bold text-2xl text-ag-yellow">
            {openIncidents.length}
          </div>
          <div className="text-[11px] text-ag-text-muted mt-1 font-mono flex items-center gap-1">
            <span className="text-ag-yellow font-semibold">1 High Priority</span> • 2 Under Triage
          </div>
        </Card>
      </div>

      {/* Split Row: Upcoming Events & Real-time Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Events Pipeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">Event Operations Pipeline</h3>
            <Link
              to="/dashboard/events"
              className="text-xs font-mono text-ag-blue hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {events.map((event) => {
              const totalCap = event.max_capacity;
              const currentAtt = event.current_attendance;
              const percent = Math.min(100, Math.round((currentAtt / totalCap) * 100));

              return (
                <Card
                  key={event.id}
                  hover
                  onClick={() => navigate(`/dashboard/events/${event.id}/overview`)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          event.status === 'live'
                            ? 'red'
                            : event.status === 'published'
                            ? 'green'
                            : 'neutral'
                        }
                        pulse={event.status === 'live'}
                        size="sm"
                      >
                        {event.status}
                      </Badge>
                      <span className="text-xs font-mono text-ag-text-muted">
                        {new Date(event.event_date).toLocaleDateString('en-KE', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-white truncate">
                      {event.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-ag-text-secondary font-mono">
                      <MapPin className="w-3.5 h-3.5 text-ag-text-muted" />
                      <span>{event.venue?.name}</span>
                    </div>
                  </div>

                  {/* Progress Bar & Counter */}
                  <div className="w-full sm:w-48 space-y-1.5 shrink-0">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-ag-text-muted">Attendance</span>
                      <span className="font-bold text-white">
                        {formatNumber(currentAtt)} / {formatNumber(totalCap)}
                      </span>
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
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Live Alert Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">Live Telemetry Alerts</h3>
            <span className="text-xs font-mono text-ag-text-muted">{alerts.length} Total</span>
          </div>

          <div className="space-y-2.5">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-[8px] border text-xs ${
                  alert.severity === 'critical'
                    ? 'bg-ag-red-dim border-ag-red/40 text-ag-red'
                    : alert.severity === 'warning'
                    ? 'bg-ag-yellow-dim border-ag-yellow/40 text-ag-yellow'
                    : 'bg-ag-surface border-ag-border text-ag-text-secondary'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold uppercase font-mono text-[10px]">
                    {alert.alert_type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono opacity-70">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-ag-text-primary text-[11px] leading-snug">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
