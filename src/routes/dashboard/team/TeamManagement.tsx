import React, { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { EventMembership, EventWorkspace, User, UserRole } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ArrowRight, BadgeCheck, Building2, CalendarDays, Check, ChevronRight, ClipboardCheck, Eye, Landmark, LockKeyhole, Mail, MapPinned, Plus, Radio, Search, ShieldCheck, Store, UserCheck, Users, Wrench } from 'lucide-react';

type WorkspaceMeta = { label: string; description: string; scope: string; icon: React.ElementType; tone: string; role: UserRole };

const workspaceMeta: Record<EventWorkspace, WorkspaceMeta> = {
  owner: { label: 'Event owner', description: 'Full event oversight and approvals', scope: 'All workspaces', icon: Building2, tone: 'text-ag-purple bg-ag-purple/10 border-ag-purple/25', role: 'org_admin' },
  event_control: { label: 'Event control', description: 'Run sheet, readiness and live decisions', scope: 'Operations + live control', icon: Radio, tone: 'text-ag-blue bg-ag-blue-dim border-ag-blue/30', role: 'event_manager' },
  finance: { label: 'Finance', description: 'Budget, payments and settlement', scope: 'Money workspace only', icon: Landmark, tone: 'text-ag-green bg-ag-green-dim border-ag-green/30', role: 'event_manager' },
  production: { label: 'Production', description: 'Stage, power and technical delivery', scope: 'Production plan only', icon: Wrench, tone: 'text-orange-300 bg-orange-400/10 border-orange-400/25', role: 'event_manager' },
  safety: { label: 'Safety & medical', description: 'Deployment, incidents and response', scope: 'Safety operations only', icon: ShieldCheck, tone: 'text-ag-red bg-ag-red-dim border-ag-red/30', role: 'security' },
  gate_ops: { label: 'Gates & access', description: 'Entry teams, scanners and lanes', scope: 'Gate operations only', icon: MapPinned, tone: 'text-ag-yellow bg-ag-yellow-dim border-ag-yellow/30', role: 'security' },
  supplier: { label: 'Supplier', description: 'Their delivery, documents and arrival', scope: 'Own scope only', icon: Store, tone: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/25', role: 'vendor' },
  guest_experience: { label: 'Guest experience', description: 'Guest comms and arrival guidance', scope: 'Guest communications only', icon: Users, tone: 'text-pink-300 bg-pink-400/10 border-pink-400/25', role: 'event_manager' },
};

const workspaceOrder: EventWorkspace[] = ['owner', 'event_control', 'finance', 'production', 'safety', 'gate_ops', 'supplier', 'guest_experience'];
const workspaceFromRole = (role: UserRole): EventWorkspace => role === 'super_admin' || role === 'org_admin' ? 'owner' : role === 'security' || role === 'medical' ? 'safety' : role === 'vendor' ? 'supplier' : 'event_control';
const initials = (name: string) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

export const TeamManagement: React.FC = () => {
  const { users, events, activeEventId, currentUser, eventMemberships, accessAuditLogs, addUser, assignEventWorkspace, recordAccessAudit } = useAppStore();
  const [eventId, setEventId] = useState(activeEventId || events[0]?.id || '');
  const [search, setSearch] = useState('');
  const [workspaceFilter, setWorkspaceFilter] = useState<EventWorkspace | 'all'>('all');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const selectedEvent = events.find((event) => event.id === eventId) || events[0];
  const membershipByUser = useMemo(() => new Map(eventMemberships.filter((membership) => membership.event_id === selectedEvent?.id).map((membership) => [membership.user_id, membership])), [eventMemberships, selectedEvent?.id]);
  const team = useMemo(() => users.map((user) => {
    const stored = membershipByUser.get(user.id);
    const workspace = workspaceFromRole(user.role);
    const membership: EventMembership = stored || { id: `derived-${user.id}`, event_id: selectedEvent?.id || '', user_id: user.id, workspace, status: 'active', scope_label: workspaceMeta[workspace].scope, created_at: user.created_at, updated_at: user.created_at };
    return { user, membership };
  }), [users, membershipByUser, selectedEvent?.id]);
  const visibleTeam = team.filter(({ user, membership }) => `${user.full_name} ${user.email}`.toLowerCase().includes(search.toLowerCase()) && (workspaceFilter === 'all' || membership.workspace === workspaceFilter));
  const activeCount = team.filter(({ membership }) => membership.status === 'active').length;
  const pendingCount = team.filter(({ membership }) => membership.status === 'invited').length;
  const protectedCount = team.filter(({ membership }) => ['owner', 'finance', 'safety'].includes(membership.workspace)).length;

  const handleInvite = (input: InviteInput) => {
    if (!selectedEvent) return;
    const existing = users.find((user) => user.email.toLowerCase() === input.email.trim().toLowerCase());
    const user = existing || addUser({ organization_id: currentUser.organization_id, full_name: input.name.trim(), email: input.email.trim(), phone: input.phone.trim(), role: workspaceMeta[input.workspace].role, avatar_url: '' });
    const meta = workspaceMeta[input.workspace];
    assignEventWorkspace({ event_id: selectedEvent.id, user_id: user.id, workspace: input.workspace, status: 'invited', scope_label: input.scope || meta.scope, invited_by: currentUser.id, last_active_at: null });
    recordAccessAudit({ event_id: selectedEvent.id, actor_id: currentUser.id, action: 'Access assigned', target_name: user.full_name, detail: `${meta.label} · ${input.scope || meta.scope}` });
    setNotice(`${user.full_name} now has a focused ${meta.label.toLowerCase()} workspace.`);
    setIsInviteOpen(false);
    window.setTimeout(() => setNotice(null), 5000);
  };

  if (!selectedEvent) return <EmptyTeamState />;
  const eventAudit = accessAuditLogs.filter((item) => item.event_id === selectedEvent.id);

  return <div className="mx-auto max-w-7xl space-y-6 font-sans">
    {notice && <div className="flex items-center gap-2 rounded-xl border border-ag-green/30 bg-ag-green-dim/60 px-4 py-3 text-sm text-white"><Check className="h-4 w-4 text-ag-green" />{notice}</div>}
    <header className="overflow-hidden rounded-2xl border border-ag-border bg-gradient-to-br from-ag-surface via-ag-surface to-ag-black">
      <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-2xl"><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-ag-blue"><LockKeyhole className="h-3.5 w-3.5" /> Event access control</div><h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">The right person. The right room.</h1><p className="mt-3 text-sm leading-relaxed text-ag-text-secondary">Give every stakeholder a focused workspace for this event—without exposing the money, safety plan or decisions they do not need.</p></div><Button variant="primary" size="lg" onClick={() => setIsInviteOpen(true)} leftIcon={<Plus className="h-4 w-4" />} className="h-11 shrink-0 whitespace-nowrap bg-ag-green px-5 font-bold text-black hover:bg-ag-green/90">Add event access</Button></div>
      <div className="grid border-t border-ag-border sm:grid-cols-3"><AccessMetric label="Active on this event" value={String(activeCount)} detail="people with a live workspace" icon={Users} /><AccessMetric label="Access awaiting acceptance" value={String(pendingCount)} detail="follow up before event day" icon={Mail} /><AccessMetric label="Sensitive workspaces" value={String(protectedCount)} detail="money, safety and owner oversight" icon={LockKeyhole} /></div>
    </header>
    <section className="grid gap-5 xl:grid-cols-[1.55fr_.9fr]">
      <Card className="p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-ag-text-muted">Event team</p><h2 className="mt-1 text-xl font-bold text-white">{selectedEvent.title}</h2><p className="mt-1 text-sm text-ag-text-secondary">Assign responsibility where the work happens, not across the entire organisation.</p></div><label className="text-xs font-semibold text-ag-text-secondary">Viewing event<select value={selectedEvent.id} onChange={(event) => setEventId(event.target.value)} className="mt-1.5 block w-full rounded-lg border border-ag-border bg-ag-black px-3 py-2 text-sm text-white outline-none focus:border-ag-blue">{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label></div>
        <div className="mt-6 flex flex-col gap-3 border-y border-ag-border py-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ag-text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people" className="w-full rounded-lg border border-ag-border bg-ag-black py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-ag-text-muted focus:border-ag-blue" /></div><div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">{(['all', 'owner', 'event_control', 'finance', 'safety', 'supplier'] as const).map((workspace) => <button key={workspace} onClick={() => setWorkspaceFilter(workspace)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${workspaceFilter === workspace ? 'bg-ag-blue text-white' : 'text-ag-text-secondary hover:bg-ag-surface-hover hover:text-white'}`}>{workspace === 'all' ? 'All people' : workspaceMeta[workspace].label}</button>)}</div></div>
        <div className="mt-3 divide-y divide-ag-border">{visibleTeam.map(({ user, membership }) => <MemberRow key={`${user.id}-${membership.id}`} user={user} membership={membership} />)}{visibleTeam.length === 0 && <div className="py-10 text-center text-sm text-ag-text-secondary">No one matches this view.</div>}</div>
      </Card>
      <div className="space-y-5"><Card className="p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-ag-text-muted">Workspace map</p><h2 className="mt-1 text-lg font-bold text-white">What each person can do</h2></div><Eye className="h-5 w-5 text-ag-blue" /></div><div className="mt-5 space-y-3">{workspaceOrder.slice(0, 5).map((workspace) => { const meta = workspaceMeta[workspace]; const Icon = meta.icon; return <div key={workspace} className="flex gap-3"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${meta.tone}`}><Icon className="h-4 w-4" /></div><div><p className="text-sm font-bold text-white">{meta.label}</p><p className="mt-0.5 text-xs leading-relaxed text-ag-text-secondary">{meta.scope}</p></div></div>; })}</div><button onClick={() => setIsInviteOpen(true)} className="mt-5 flex items-center gap-1 text-xs font-bold text-ag-blue hover:text-white">Set someone’s workspace <ArrowRight className="h-3.5 w-3.5" /></button></Card>
        <Card className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-ag-text-muted">Access history</p><h2 className="mt-1 text-lg font-bold text-white">Owner audit trail</h2></div><ClipboardCheck className="h-5 w-5 text-ag-green" /></div><div className="mt-5 space-y-4">{eventAudit.slice(0, 3).map((log) => <AuditRow key={log.id} log={log} />)}{eventAudit.length === 0 && <div className="rounded-xl border border-dashed border-ag-border bg-ag-black/20 p-4 text-xs leading-relaxed text-ag-text-secondary">Assignments and access changes will appear here so the event owner always knows who was given responsibility.</div>}</div></Card></div>
    </section>
    <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Give someone a focused event workspace"><InviteForm eventTitle={selectedEvent.title} onCancel={() => setIsInviteOpen(false)} onSubmit={handleInvite} /></Modal>
  </div>;
};

type InviteInput = { name: string; email: string; phone: string; workspace: EventWorkspace; scope: string };
const InviteForm: React.FC<{ eventTitle: string; onCancel: () => void; onSubmit: (input: InviteInput) => void }> = ({ eventTitle, onCancel, onSubmit }) => {
  const [input, setInput] = useState<InviteInput>({ name: '', email: '', phone: '', workspace: 'event_control', scope: '' });
  const meta = workspaceMeta[input.workspace];
  const Icon = meta.icon;
  return <form className="space-y-4 font-sans" onSubmit={(event) => { event.preventDefault(); if (input.name.trim() && input.email.trim()) onSubmit(input); }}><div className="rounded-xl border border-ag-blue/25 bg-ag-blue-dim/30 p-3 text-xs leading-relaxed text-ag-text-secondary"><span className="font-bold text-white">{eventTitle}</span><br />This assignment limits the person to the workspace and scope you choose.</div><div className="grid gap-4 sm:grid-cols-2"><Input label="Full name" value={input.name} onChange={(event) => setInput({ ...input, name: event.target.value })} placeholder="e.g. Amina Njoroge" required /><Input label="Email" type="email" value={input.email} onChange={(event) => setInput({ ...input, email: event.target.value })} placeholder="amina@company.co.ke" required /></div><Input label="Phone (optional)" value={input.phone} onChange={(event) => setInput({ ...input, phone: event.target.value })} placeholder="+254 712 345 678" /><div><label className="text-xs font-semibold text-ag-text-secondary">Workspace</label><select value={input.workspace} onChange={(event) => setInput({ ...input, workspace: event.target.value as EventWorkspace, scope: '' })} className="mt-1.5 w-full rounded-lg border border-ag-border bg-ag-black p-2.5 text-sm text-white outline-none focus:border-ag-blue">{workspaceOrder.map((workspace) => <option key={workspace} value={workspace}>{workspaceMeta[workspace].label} — {workspaceMeta[workspace].description}</option>)}</select><div className={`mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${meta.tone}`}><Icon className="h-3.5 w-3.5" />Default access: {meta.scope}</div></div><Input label="Specific scope (optional)" value={input.scope} onChange={(event) => setInput({ ...input, scope: event.target.value })} placeholder={meta.scope} /><div className="flex justify-end gap-2 border-t border-ag-border pt-4"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" variant="primary" leftIcon={<UserCheck className="h-4 w-4" />}>Assign event access</Button></div></form>;
};
const MemberRow: React.FC<{ user: User; membership: EventMembership }> = ({ user, membership }) => { const meta = workspaceMeta[membership.workspace]; const Icon = meta.icon; return <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ag-border bg-ag-black text-xs font-bold text-ag-text-secondary">{initials(user.full_name)}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{user.full_name}</p><p className="truncate text-xs text-ag-text-secondary">{user.email}</p></div></div><div className={`flex w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold ${meta.tone}`}><Icon className="h-3.5 w-3.5" />{meta.label}</div><div className="flex items-center gap-1.5 text-xs text-ag-text-secondary sm:w-28"><span className={`h-2 w-2 rounded-full ${membership.status === 'active' ? 'bg-ag-green' : membership.status === 'invited' ? 'bg-ag-yellow' : 'bg-ag-red'}`} />{membership.status === 'invited' ? 'Invite ready' : membership.status === 'active' ? 'Active' : 'Suspended'}</div><ChevronRight className="hidden h-4 w-4 text-ag-text-muted sm:block" /></div>; };
const AccessMetric: React.FC<{ label: string; value: string; detail: string; icon: React.ElementType }> = ({ label, value, detail, icon: Icon }) => <div className="flex gap-3 border-b border-ag-border p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:p-5"><div className="rounded-lg bg-ag-black/50 p-2 text-ag-blue"><Icon className="h-4 w-4" /></div><div><p className="text-xs text-ag-text-muted">{label}</p><p className="mt-0.5 text-xl font-bold text-white">{value}</p><p className="mt-0.5 text-[11px] text-ag-text-secondary">{detail}</p></div></div>;
const AuditRow: React.FC<{ log: { action: string; target_name?: string | null; detail?: string | null; created_at: string } }> = ({ log }) => <div className="flex gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-ag-green" /><div><p className="text-xs font-bold text-white">{log.action}{log.target_name ? ` · ${log.target_name}` : ''}</p><p className="mt-0.5 text-xs text-ag-text-secondary">{log.detail}</p><p className="mt-1 text-[11px] text-ag-text-muted">{new Date(log.created_at).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}</p></div></div>;
const EmptyTeamState: React.FC = () => <div className="mx-auto max-w-md py-24 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ag-surface text-ag-blue"><CalendarDays className="h-6 w-6" /></div><h1 className="mt-5 text-xl font-bold text-white">Create an event first</h1><p className="mt-2 text-sm text-ag-text-secondary">Event access is designed around a specific show, venue and team.</p></div>;
