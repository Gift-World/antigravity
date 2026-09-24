import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OperationsPlan } from '@/components/events/OperationsPlan';
import { FinancialControl } from '@/components/events/FinancialControl';
import { EventDayBoard } from '@/components/events/EventDayBoard';
import { formatCurrencyKES, formatNumber } from '@/lib/utils';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  FileText,
  MapPin,
  Radio,
  ReceiptText,
  ShieldCheck,
  Ticket,
  Users,
  WalletCards,
} from 'lucide-react';

type WorkspaceTab = 'overview' | 'readiness' | 'run-sheet' | 'event-day' | 'tickets' | 'money';
type ReadinessState = 'done' | 'pending' | 'blocked';
type ReadinessItem = { id: string; area: string; task: string; owner: string; state: ReadinessState };

const readinessSeed: ReadinessItem[] = [
  { id: 'permit', area: 'Approvals', task: 'Venue permit and event licence uploaded', owner: 'Event lead', state: 'done' },
  { id: 'security', area: 'Safety', task: 'Security deployment signed off', owner: 'Security lead', state: 'done' },
  { id: 'medics', area: 'Safety', task: 'Medical provider and evacuation plan confirmed', owner: 'Safety lead', state: 'pending' },
  { id: 'gates', area: 'Entry', task: 'Gate teams, scanners and holding lanes assigned', owner: 'Gate manager', state: 'pending' },
  { id: 'production', area: 'Production', task: 'Stage, power and sound check complete', owner: 'Production lead', state: 'blocked' },
  { id: 'talent', area: 'Talent', task: 'Artist arrival and backstage schedule confirmed', owner: 'Artist liaison', state: 'done' },
  { id: 'vendors', area: 'Operations', task: 'Vendor access windows sent and acknowledged', owner: 'Operations lead', state: 'pending' },
  { id: 'comms', area: 'Comms', task: 'Guest arrival guide and gate map scheduled', owner: 'Guest experience', state: 'done' },
];

const runSheet = [
  ['10:00', 'Production access opens', 'Production lead', 'Backstage'],
  ['13:00', 'Vendor load-in closes', 'Operations lead', 'Service gate'],
  ['15:00', 'Security and medic briefing', 'Safety lead', 'Command post'],
  ['16:30', 'Guest arrival message sent', 'Guest experience', 'All guests'],
  ['17:00', 'Gates open', 'Gate manager', 'All public gates'],
  ['19:15', 'Support act on stage', 'Stage manager', 'Main stage'],
  ['21:00', 'Headliner on stage', 'Artist liaison', 'Main stage'],
  ['23:00', 'Managed exit plan begins', 'Operations lead', 'All exits'],
] as const;

export const EventHQ: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, tickets, incidents, activeEventId, setActiveEventId } = useAppStore();
  const [tab, setTab] = useState<WorkspaceTab>('overview');
  const [readiness, setReadiness] = useState(() => readinessSeed.map((item) => ({ ...item })));
  const event = events.find((item) => item.id === (id || activeEventId)) || events[0];

  const eventTickets = useMemo(() => tickets.filter((item) => item.event_id === event?.id), [tickets, event?.id]);
  const eventIncidents = useMemo(() => incidents.filter((item) => item.event_id === event?.id), [incidents, event?.id]);

  if (!event) {
    return <div className="py-20 text-center text-ag-text-secondary">No event is selected.</div>;
  }

  const totalRevenue = event.ticket_tiers.reduce((sum, tier) => sum + tier.price * tier.sold, 0);
  const ticketsSold = event.ticket_tiers.reduce((sum, tier) => sum + tier.sold, 0);
  const readinessComplete = readiness.filter((item) => item.state === 'done').length;
  const readinessScore = Math.round((readinessComplete / readiness.length) * 100);
  const openWork = readiness.filter((item) => item.state !== 'done');
  const isLive = event.status === 'live';

  const openLive = () => {
    setActiveEventId(event.id);
    navigate(`/dashboard/events/${event.id}/live`);
  };

  const tabs: { id: WorkspaceTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: ClipboardCheck },
    { id: 'readiness', label: 'Readiness', icon: ShieldCheck },
    { id: 'run-sheet', label: 'Run sheet', icon: Clock3 },
    { id: 'event-day', label: 'Event day', icon: Radio },
    { id: 'tickets', label: 'Tickets & gates', icon: Ticket },
    { id: 'money', label: 'Money & report', icon: WalletCards },
  ];

  return (
    <div className="space-y-6 font-sans">
      <header className="rounded-2xl border border-ag-border bg-gradient-to-br from-ag-surface via-ag-surface to-ag-black p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard/events')} className="mt-0.5 h-9 w-9 rounded-lg border border-ag-border bg-ag-black/50 text-ag-text-secondary transition hover:text-white" aria-label="Back to events"><ArrowLeft className="mx-auto h-4 w-4" /></button>
            <div>
              <div className="flex flex-wrap items-center gap-2"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-ag-text-muted">Concert Event HQ</p><Badge variant={isLive ? 'green' : 'neutral'} pulse={isLive} size="sm">{isLive ? 'LIVE' : event.status.toUpperCase()}</Badge></div>
              <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">{event.title}</h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ag-text-secondary"><span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-ag-blue" />{new Date(event.event_date).toLocaleDateString('en-KE', { dateStyle: 'medium' })}</span><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-ag-blue" />{event.venue?.name || 'Venue to confirm'}</span></div>
            </div>
          </div>
          <Button size="lg" variant="primary" onClick={openLive} rightIcon={<ArrowRight className="h-4 w-4" />} className="h-11 bg-ag-green px-5 font-bold text-black shadow-lg shadow-ag-green/20 hover:bg-ag-green/90">{isLive ? 'Open live operations' : 'Open live control room'}</Button>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-ag-border pb-2" aria-label="Event workspace sections">
        {tabs.map(({ id: tabId, label, icon: Icon }) => <button key={tabId} onClick={() => setTab(tabId)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${tab === tabId ? 'bg-ag-surface-hover text-white' : 'text-ag-text-secondary hover:text-white'}`}><Icon className="h-4 w-4" />{label}{tabId === 'readiness' && openWork.length > 0 && <span className="rounded-full bg-ag-yellow-dim px-1.5 py-0.5 text-[10px] text-ag-yellow">{openWork.length}</span>}</button>)}
      </nav>

      {tab === 'overview' && <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Readiness" value={`${readinessScore}%`} detail={`${openWork.length} items need an owner`} tone={readinessScore >= 75 ? 'green' : 'yellow'} />
          <Metric label="Ticket revenue" value={formatCurrencyKES(totalRevenue)} detail={`${formatNumber(ticketsSold)} paid tickets`} tone="purple" />
          <Metric label="Guests inside" value={`${formatNumber(event.current_attendance)} / ${formatNumber(event.max_capacity)}`} detail={`${Math.round((event.current_attendance / event.max_capacity) * 100)}% current capacity`} tone="blue" />
          <Metric label="Open incidents" value={String(eventIncidents.filter((item) => item.status !== 'resolved').length)} detail={isLive ? 'Live team is monitoring' : 'No live operation yet'} tone={eventIncidents.some((item) => item.status !== 'resolved') ? 'yellow' : 'green'} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-ag-text-muted">What needs attention</p><h2 className="mt-1 text-lg font-bold text-white">Get this concert ready to open</h2></div><button onClick={() => setTab('readiness')} className="text-xs font-bold text-ag-blue hover:text-white">View plan</button></div><div className="mt-5 space-y-3">{openWork.slice(0, 4).map((item) => <button key={item.id} onClick={() => setTab('readiness')} className="flex w-full items-center gap-3 rounded-xl border border-ag-border bg-ag-black/30 p-3 text-left transition hover:border-ag-blue/50"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.state === 'blocked' ? 'bg-ag-red-dim text-ag-red' : 'bg-ag-yellow-dim text-ag-yellow'}`}>{item.state === 'blocked' ? <CircleAlert className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-white">{item.task}</p><p className="mt-0.5 text-xs text-ag-text-secondary">{item.area} · {item.owner}</p></div><ChevronRight className="h-4 w-4 text-ag-text-muted" /></button>)}</div></Card>
          <Card className="p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-wider text-ag-text-muted">Next key moment</p><div className="mt-5 flex items-start gap-3"><div className="rounded-xl bg-ag-blue-dim p-2.5 text-ag-blue"><Clock3 className="h-5 w-5" /></div><div><p className="text-sm font-bold text-white">{runSheet[0][1]}</p><p className="mt-1 text-xs text-ag-text-secondary">{runSheet[0][0]} · {runSheet[0][2]}</p><p className="mt-4 text-xs leading-relaxed text-ag-text-muted">Everyone responsible sees the same run of show, rather than chasing the latest message in WhatsApp.</p></div></div><button onClick={() => setTab('run-sheet')} className="mt-6 flex items-center gap-1 text-xs font-bold text-ag-blue hover:text-white">Open run sheet <ArrowRight className="h-3.5 w-3.5" /></button></Card>
        </div>
      </div>}

      {tab === 'readiness' && <OperationsPlan eventId={event.id} />}

      {tab === 'run-sheet' && <Card className="overflow-hidden p-0"><div className="border-b border-ag-border p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-wider text-ag-text-muted">One source of timing</p><h2 className="mt-1 text-xl font-bold text-white">Concert run sheet</h2><p className="mt-1 text-sm text-ag-text-secondary">The people, place and decision for every important moment.</p></div><div className="divide-y divide-ag-border">{runSheet.map(([time, action, owner, place], index) => <div key={time} className="flex gap-4 p-4 sm:px-6"><div className="w-12 pt-0.5 font-mono text-sm font-bold text-ag-blue">{time}</div><div className="relative flex-1 border-l border-ag-border pl-5 pb-3 last:pb-0"><span className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full ${index === 4 ? 'bg-ag-green ring-4 ring-ag-green-dim' : 'bg-ag-border'}`} /><p className="text-sm font-bold text-white">{action}</p><p className="mt-1 text-xs text-ag-text-secondary">{owner} · {place}</p></div></div>)}</div></Card>}

      {tab === 'event-day' && <EventDayBoard eventId={event.id} onOpenLive={openLive} />}

      {tab === 'tickets' && <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3"><Metric label="Tickets sold" value={formatNumber(ticketsSold)} detail={`of ${formatNumber(event.ticket_tiers.reduce((sum, tier) => sum + tier.quantity, 0))} available`} tone="green" /><Metric label="Checked in" value={formatNumber(eventTickets.filter((item) => item.status === 'scanned').length)} detail="verified at a gate" tone="blue" /><Metric label="Gate readiness" value="3 / 4" detail="one gate team still unconfirmed" tone="yellow" /></div><Card className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-ag-text-muted">Gate operations</p><h2 className="mt-1 text-lg font-bold text-white">Keep arrival flow even</h2></div><Button variant="outline" size="sm" onClick={openLive} rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>Open live view</Button></div><div className="mt-5 grid gap-3 md:grid-cols-3">{event.ticket_tiers.map((tier) => <div key={tier.name} className="rounded-xl border border-ag-border bg-ag-black/30 p-4"><div className="flex items-center justify-between"><p className="text-sm font-bold text-white">{tier.name}</p><p className="text-xs font-mono text-ag-green">{formatCurrencyKES(tier.price)}</p></div><p className="mt-3 text-xs text-ag-text-secondary">{formatNumber(tier.sold)} sold of {formatNumber(tier.quantity)}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ag-surface"><div className="h-full rounded-full bg-ag-blue" style={{ width: `${Math.min(100, (tier.sold / tier.quantity) * 100)}%` }} /></div></div>)}</div></Card></div>}

      {tab === 'money' && <FinancialControl eventId={event.id} ticketRevenue={totalRevenue} />}
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; detail: string; tone: 'green' | 'yellow' | 'blue' | 'purple' }> = ({ label, value, detail, tone }) => {
  const colors = { green: 'text-ag-green', yellow: 'text-ag-yellow', blue: 'text-ag-blue', purple: 'text-ag-purple' };
  return <Card className="p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-ag-text-muted">{label}</p><p className={`mt-2 text-xl font-bold tracking-tight ${colors[tone]}`}>{value}</p><p className="mt-1 text-xs text-ag-text-secondary">{detail}</p></Card>;
};

const MoneyRow: React.FC<{ icon: React.ReactNode; label: string; value: string; detail: string }> = ({ icon, label, value, detail }) => <div className="rounded-xl border border-ag-border bg-ag-black/30 p-4"><div className="flex items-center gap-2 text-ag-blue">{icon}<p className="text-xs font-bold uppercase tracking-wider text-ag-text-muted">{label}</p></div><p className="mt-3 text-lg font-bold text-white">{value}</p><p className="mt-1 text-xs text-ag-text-secondary">{detail}</p></div>;
