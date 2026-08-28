// src/routes/dashboard/events/EventDetail.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrencyKES, formatNumber } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Radio,
  Ticket as TicketIcon,
  Shield,
  Sliders,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  QrCode,
  Lock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, tickets, updateEventStatus, users, activeEventId, setActiveEventId } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'gates' | 'safety'>('overview');
  const [ticketSearch, setTicketSearch] = useState('');

  const event = events.find((e) => e.id === (id || activeEventId)) || events[0];
  const zones = event?.venue?.zones || [];
  const eventTickets = tickets.filter((t) => t.event_id === event?.id || true);

  const filteredTickets = eventTickets.filter((t) => {
    return (
      t.tier.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      (t.mpesa_transaction_id && t.mpesa_transaction_id.toLowerCase().includes(ticketSearch.toLowerCase()))
    );
  });

  const isLive = event.status === 'live';
  const totalRevenue = event.ticket_tiers.reduce((sum, t) => sum + t.price * t.sold, 0);

  // Hourly sales curve chart data
  const salesChartData = [
    { time: '12:00', sales: 1200 },
    { time: '14:00', sales: 3400 },
    { time: '16:00', sales: 6800 },
    { time: '18:00', sales: 9400 },
    { time: '20:00', sales: 11900 },
    { time: 'NOW', sales: event.current_attendance || 12847 },
  ];

  const handleToggleLiveStatus = () => {
    const nextStatus = isLive ? 'ended' : 'live';
    updateEventStatus(event.id, nextStatus);
    if (nextStatus === 'live') {
      setActiveEventId(event.id);
      navigate(`/dashboard/events/${event.id}/live`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/events')}
            className="p-2 rounded bg-ag-surface hover:bg-ag-surface-hover border border-ag-border text-ag-text-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl text-white">{event.title}</h2>
              <Badge variant={isLive ? 'red' : event.status === 'published' ? 'green' : 'neutral'} pulse={isLive} size="sm">
                {event.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-ag-text-secondary font-mono mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-ag-blue" />
                {new Date(event.event_date).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-ag-red" />
                {event.venue?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Live Launch / Status Switcher */}
        <div className="flex items-center gap-2">
          {isLive ? (
            <Button
              size="md"
              variant="danger"
              onClick={() => navigate(`/dashboard/events/${event.id}/live`)}
              className="font-bold shadow-lg shadow-ag-red/20 animate-pulse-slow"
              leftIcon={<Radio className="w-4 h-4" />}
            >
              Enter Live Command Center
            </Button>
          ) : (
            <Button
              size="md"
              variant="primary"
              onClick={handleToggleLiveStatus}
              className="font-bold"
              leftIcon={<Radio className="w-4 h-4" />}
            >
              Go Live
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center border-b border-ag-border bg-ag-surface rounded-t-[8px] px-2 pt-2">
        {[
          { id: 'overview', label: 'Event Overview', icon: <Sliders className="w-4 h-4" /> },
          { id: 'tickets', label: 'Tickets & QR Validation', icon: <TicketIcon className="w-4 h-4" /> },
          { id: 'gates', label: 'Gate Management', icon: <Users className="w-4 h-4" /> },
          { id: 'safety', label: 'Safety & Density Config', icon: <Shield className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-ag-blue text-ag-blue bg-ag-surface-hover font-bold shadow-sm'
                : 'border-transparent text-ag-text-secondary hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="text-xs font-mono uppercase text-ag-text-secondary">Current Attendance</div>
              <div className="font-display font-bold text-2xl text-white mt-1">
                {formatNumber(event.current_attendance)}
              </div>
              <div className="text-[11px] text-ag-text-muted mt-1 font-mono">
                of {formatNumber(event.max_capacity)} capacity ({( (event.current_attendance / event.max_capacity) * 100).toFixed(1)}%)
              </div>
            </Card>

            <Card>
              <div className="text-xs font-mono uppercase text-ag-text-secondary">Total Ticket Sales</div>
              <div className="font-display font-bold text-2xl text-ag-purple mt-1">
                {formatCurrencyKES(totalRevenue)}
              </div>
              <div className="text-[11px] text-ag-text-muted mt-1 font-mono">
                Across {event.ticket_tiers.length} Active Tiers
              </div>
            </Card>

            <Card>
              <div className="text-xs font-mono uppercase text-ag-text-secondary">Autonomous Safety</div>
              <div className="font-display font-bold text-2xl text-ag-green mt-1">
                ACTIVE
              </div>
              <div className="text-[11px] text-ag-text-muted mt-1 font-mono">
                Threshold: {event.safety_config?.density_warning || 4.5}/m² Warning
              </div>
            </Card>
          </div>

          {/* Sales & Attendance Timeline Chart */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-white">
                Live Ingress Rate & Attendance Curve
              </h3>
              <span className="text-xs font-mono text-ag-text-muted">Realtime Radar</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#448AFF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#448AFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#55556A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#55556A" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#12121A',
                      borderColor: '#2A2A35',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#448AFF"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-ag-surface p-3 rounded-[8px] border border-ag-border">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ag-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by ticket ID, attendee or M-Pesa receipt..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="w-full bg-ag-black border border-ag-border text-ag-text-primary text-xs rounded px-3 py-2 pl-9 focus:outline-none focus:border-ag-blue"
              />
            </div>
          </div>

          <div className="bg-ag-surface rounded-[8px] border border-ag-border overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-ag-black/50 border-b border-ag-border text-ag-text-muted uppercase text-[10px]">
                <tr>
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">M-Pesa Receipt</th>
                  <th className="p-3">Device Tether</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ag-border">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-ag-surface-hover/50">
                    <td className="p-3 font-bold text-white">{t.id}</td>
                    <td className="p-3 text-ag-text-primary">{t.tier}</td>
                    <td className="p-3 text-ag-green">KES {t.price.toLocaleString()}</td>
                    <td className="p-3">
                      <Badge
                        variant={t.status === 'valid' ? 'green' : t.status === 'scanned' ? 'blue' : 'red'}
                        size="sm"
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-ag-text-secondary">{t.mpesa_transaction_id || 'QK782910AA'}</td>
                    <td className="p-3 text-ag-text-muted truncate max-w-[120px]">
                      {t.device_fingerprint || 'fp_secure_bound'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GATES */}
      {activeTab === 'gates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zones
            .filter((z) => z.zone_type === 'entry_gate' || z.zone_type === 'exit_gate')
            .map((gate) => (
              <Card key={gate.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-white">{gate.name}</h4>
                  <Badge variant="blue" size="sm">
                    {gate.zone_type.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs font-mono text-ag-text-secondary">
                  Flow Capacity: {gate.capacity.toLocaleString()} persons
                </div>
                <div className="p-2.5 bg-ag-black/40 rounded border border-ag-border text-xs flex items-center justify-between">
                  <span className="text-ag-text-muted">Assigned Security:</span>
                  <span className="font-semibold text-ag-green">Squad Alpha (Capt. Mutua)</span>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* TAB 4: SAFETY CONFIG */}
      {activeTab === 'safety' && (
        <Card className="space-y-4 max-w-2xl">
          <h3 className="font-display font-bold text-base text-white">
            Autonomous Safety Threshold Tuning
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-ag-yellow font-bold uppercase mb-1">
                Density Warning Threshold ({event.safety_config?.density_warning || 4.5} persons/m²)
              </label>
              <input
                type="range"
                min="2.0"
                max="6.0"
                step="0.1"
                defaultValue={event.safety_config?.density_warning || 4.5}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-ag-red font-bold uppercase mb-1">
                Density Critical Threshold ({event.safety_config?.density_critical || 5.5} persons/m²)
              </label>
              <input
                type="range"
                min="4.0"
                max="7.0"
                step="0.1"
                defaultValue={event.safety_config?.density_critical || 5.5}
                className="w-full"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
