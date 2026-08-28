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
  Activity,
  Ticket as TicketIcon,
  Shield,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  DollarSign,
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
  const { events, tickets, incidents, alerts, updateEventStatus, activeEventId, setActiveEventId } =
    useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'incidents' | 'analytics'>('overview');
  const [ticketSearch, setTicketSearch] = useState('');

  const event = events.find((e) => e.id === (id || activeEventId)) || events[0];
  const eventTickets = tickets.filter((t) => t.event_id === event?.id || true);
  const eventIncidents = incidents.filter((i) => i.event_id === event?.id || true);

  const filteredTickets = eventTickets.filter((t) => {
    return (
      t.tier.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      (t.mpesa_transaction_id && t.mpesa_transaction_id.toLowerCase().includes(ticketSearch.toLowerCase()))
    );
  });

  const isLive = event.status === 'live';
  const totalRevenue = event.ticket_tiers.reduce((sum, t) => sum + t.price * t.sold, 0);

  const salesChartData = [
    { time: '12:00', attendance: 1200 },
    { time: '14:00', attendance: 3400 },
    { time: '16:00', attendance: 6800 },
    { time: '18:00', attendance: 9400 },
    { time: '20:00', attendance: 11900 },
    { time: 'NOW', attendance: event.current_attendance || 12847 },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/events')}
            className="p-2 rounded-lg bg-ag-surface hover:bg-ag-surface-hover border border-ag-border text-ag-text-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-2xl text-white">{event.title}</h2>
              <Badge variant={isLive ? 'green' : 'neutral'} pulse={isLive} size="sm">
                {event.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-ag-text-secondary mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-ag-blue" />
                {new Date(event.event_date).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-ag-text-muted" />
                {event.venue?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Live View Button */}
        <Button
          size="lg"
          variant="primary"
          onClick={() => {
            setActiveEventId(event.id);
            navigate(`/dashboard/events/${event.id}/live`);
          }}
          className="bg-ag-green hover:bg-ag-green/90 text-black font-bold h-11 px-6 shadow-lg shadow-ag-green/20"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {isLive ? 'OPEN LIVE VIEW' : 'GO LIVE'}
        </Button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-ag-border pb-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'tickets', label: `Tickets (${eventTickets.length})` },
          { id: 'incidents', label: `Incidents (${eventIncidents.length})` },
          { id: 'analytics', label: 'Safety & Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-ag-surface-hover text-white border-b-2 border-ag-blue'
                : 'text-ag-text-secondary hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="text-xs font-semibold text-ag-text-secondary uppercase">Attendance</div>
              <div className="text-2xl font-bold text-white mt-1">
                {formatNumber(event.current_attendance)} / {formatNumber(event.max_capacity)}
              </div>
              <div className="text-xs text-ag-green mt-1">
                {Math.round((event.current_attendance / event.max_capacity) * 100)}% Capacity Inside
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-xs font-semibold text-ag-text-secondary uppercase">Ticket Revenue</div>
              <div className="text-2xl font-bold text-ag-purple mt-1">
                {formatCurrencyKES(totalRevenue)}
              </div>
              <div className="text-xs text-ag-text-muted mt-1">M-Pesa STK push direct</div>
            </Card>

            <Card className="p-5">
              <div className="text-xs font-semibold text-ag-text-secondary uppercase">Venue Layout</div>
              <div className="text-2xl font-bold text-white mt-1">
                {event.venue?.zones?.length || 13} Zones
              </div>
              <div className="text-xs text-ag-text-muted mt-1">Nyayo National Stadium</div>
            </Card>
          </div>

          {/* Ticket Tiers */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Ticket Tiers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {event.ticket_tiers.map((tier, i) => (
                <div key={i} className="p-4 rounded-xl bg-ag-black border border-ag-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{tier.name}</span>
                    <span className="text-ag-green font-mono font-bold text-sm">
                      {formatCurrencyKES(tier.price)}
                    </span>
                  </div>
                  <div className="text-xs text-ag-text-muted">
                    Sold: {formatNumber(tier.sold)} / {formatNumber(tier.quantity)}
                  </div>
                  <div className="w-full bg-ag-surface h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-ag-blue h-full rounded-full"
                      style={{ width: `${Math.min(100, (tier.sold / tier.quantity) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="w-full max-w-sm">
              <Input
                placeholder="Search ticket ID or M-Pesa code..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-ag-text-muted" />}
              />
            </div>
            <span className="text-xs text-ag-text-muted font-mono">{filteredTickets.length} tickets</span>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ag-surface text-ag-text-muted uppercase tracking-wider font-mono border-b border-ag-border">
                  <tr>
                    <th className="p-3.5">Ticket ID</th>
                    <th className="p-3.5">Tier</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">M-Pesa Reference</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ag-border">
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-ag-surface-hover/30">
                      <td className="p-3.5 font-mono text-white font-medium">{t.id}</td>
                      <td className="p-3.5 text-white">{t.tier}</td>
                      <td className="p-3.5 font-mono text-ag-green">{formatCurrencyKES(t.price)}</td>
                      <td className="p-3.5 font-mono text-ag-text-secondary">{t.mpesa_transaction_id || 'M-PESA-STK'}</td>
                      <td className="p-3.5">
                        <Badge variant={t.status === 'valid' ? 'green' : 'neutral'} size="sm">
                          {t.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: INCIDENTS */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Event Incidents & Log</h3>
            <span className="text-xs text-ag-text-muted">{eventIncidents.length} recorded</span>
          </div>

          <div className="space-y-3">
            {eventIncidents.map((inc) => (
              <Card key={inc.id} className="p-4 flex items-start justify-between gap-4 border-ag-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={inc.severity === 'high' ? 'red' : 'yellow'} size="sm">
                      {inc.severity.toUpperCase()}
                    </Badge>
                    <span className="font-bold text-white text-sm">{inc.title}</span>
                  </div>
                  <p className="text-xs text-ag-text-secondary leading-relaxed">{inc.description}</p>
                </div>
                <Badge variant={inc.status === 'resolved' ? 'green' : 'yellow'} size="sm">
                  {inc.status.toUpperCase()}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS & REPORTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Live Attendance Curve</h3>
              <span className="text-xs text-ag-text-muted">Updated in real-time</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData}>
                  <defs>
                    <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#71717A" fontSize={12} />
                  <YAxis stroke="#71717A" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#12121A', borderColor: '#2A2A35', borderRadius: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="#22C55E"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#attGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Post-Event Safety Certification</h3>
              <p className="text-xs text-ag-text-secondary mt-0.5">
                Download the official attendance and incident safety report PDF.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => window.print()}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Report
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
