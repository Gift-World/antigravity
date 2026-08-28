// src/routes/dashboard/events/EventList.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { EventStatus } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatNumber, formatCurrencyKES } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Radio,
  MapPin,
  Users,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const EventList: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((e) => {
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.venue?.name && e.venue.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Events</h2>
          <p className="text-xs text-ag-text-secondary">
            Manage your live and scheduled events across Kenya
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => navigate('/dashboard/events/create')}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          Create New Event
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-ag-surface p-3 rounded-[8px] border border-ag-border">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ag-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search events by title or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ag-black border border-ag-border text-ag-text-primary text-xs rounded px-3 py-2 pl-9 focus:outline-none focus:border-ag-blue"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'live', 'published', 'draft', 'ended'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-mono uppercase tracking-wider transition-colors ${
                filterStatus === status
                  ? 'bg-ag-blue-dim text-ag-blue border border-ag-blue/40 font-bold'
                  : 'text-ag-text-secondary hover:text-white hover:bg-ag-surface-hover'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.length === 0 ? (
          <Card className="col-span-full p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-ag-surface border border-ag-border flex items-center justify-center mx-auto text-ag-text-muted">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">No Events Found</h3>
              <p className="text-xs text-ag-text-secondary max-w-sm mx-auto">
                {events.length === 0
                  ? 'No events in the database yet. Create your first event to get started.'
                  : 'No events match your current search and filter.'}
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/dashboard/events/create')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Event
            </Button>
          </Card>
        ) : (
          filteredEvents.map((event) => {
            const isLive = event.status === 'live';
            const totalRevenue = event.ticket_tiers.reduce(
              (acc, t) => acc + t.price * t.sold,
              0
            );
            const percent = Math.min(
              100,
              Math.round((event.current_attendance / event.max_capacity) * 100)
            );

            return (
              <Card key={event.id} className="space-y-4 relative overflow-hidden flex flex-col justify-between">
              <div>
                {/* Status & Date Top Row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isLive ? 'red' : event.status === 'published' ? 'green' : 'neutral'}
                      pulse={isLive}
                      size="sm"
                    >
                      {event.status}
                    </Badge>
                    <span className="text-xs font-mono text-ag-text-secondary flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(event.event_date).toLocaleDateString('en-KE', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {isLive && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => navigate(`/dashboard/events/${event.id}/live`)}
                      className="text-[11px] h-7 px-2.5 shadow-md shadow-ag-red/20 font-bold"
                      leftIcon={<Radio className="w-3 h-3" />}
                    >
                      Command Center
                    </Button>
                  )}
                </div>

                <h3 className="font-display font-bold text-base text-white hover:text-ag-blue transition-colors">
                  <Link to={`/dashboard/events/${event.id}/overview`}>{event.title}</Link>
                </h3>

                <div className="flex items-center gap-2 text-xs text-ag-text-secondary font-mono mt-1">
                  <MapPin className="w-3.5 h-3.5 text-ag-text-muted" />
                  <span>{event.venue?.name || 'Nyayo Stadium'}</span>
                </div>
              </div>

              {/* Attendance & Financial Snapshot */}
              <div className="space-y-3 pt-3 border-t border-ag-border">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-ag-black/50 p-2 rounded border border-ag-border">
                    <div className="text-[10px] text-ag-text-muted uppercase">Attendance</div>
                    <div className="font-display font-bold text-sm text-white">
                      {formatNumber(event.current_attendance)} / {formatNumber(event.max_capacity)}
                    </div>
                  </div>

                  <div className="bg-ag-black/50 p-2 rounded border border-ag-border">
                    <div className="text-[10px] text-ag-text-muted uppercase">Ticket Sales</div>
                    <div className="font-display font-bold text-sm text-ag-purple">
                      {formatCurrencyKES(totalRevenue)}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-ag-text-secondary">
                    <span>Capacity Load</span>
                    <span className={percent > 90 ? 'text-ag-red font-bold' : 'text-ag-green'}>
                      {percent}%
                    </span>
                  </div>
                  <div className="w-full bg-ag-black h-1.5 rounded-full overflow-hidden border border-ag-border">
                    <div
                      className={`h-full rounded-full ${
                        percent > 90 ? 'bg-ag-red' : percent > 75 ? 'bg-ag-yellow' : 'bg-ag-green'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Action Links */}
                <div className="flex items-center justify-between pt-1">
                  <Link
                    to={`/dashboard/events/${event.id}/overview`}
                    className="text-xs text-ag-blue hover:underline font-mono flex items-center gap-1"
                  >
                    <span>Manage Gates & Safety</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <Link
                    to="/app"
                    target="_blank"
                    className="text-xs text-ag-text-muted hover:text-ag-text-primary flex items-center gap-1"
                  >
                    <span>Public View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </Card>
          );
        }))}
      </div>
    </div>
  );
};
