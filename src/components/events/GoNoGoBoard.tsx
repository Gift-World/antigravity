import React, { useMemo } from 'react';
import { CheckCircle2, CircleAlert, Clock3, FileCheck2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/lib/store';
import { EventReadinessCheck } from '@/types/database';

const launchConditions: Omit<EventReadinessCheck, 'id' | 'created_at' | 'updated_at'>[] = [
  { event_id: '', area: 'Approvals', title: 'Venue permit, public liability and event licence verified', owner_name: 'Event owner', status: 'ready', evidence_note: 'Documents checked' },
  { event_id: '', area: 'Safety', title: 'Medical provider, evacuation route and command post confirmed', owner_name: 'Safety lead', status: 'pending', evidence_note: null },
  { event_id: '', area: 'Production', title: 'Stage, power, sound and backup power signed off', owner_name: 'Production lead', status: 'blocked', evidence_note: 'Generator test outstanding' },
  { event_id: '', area: 'Entry', title: 'Gates, scanners, holding lanes and entry teams are staffed', owner_name: 'Gate manager', status: 'pending', evidence_note: null },
  { event_id: '', area: 'Talent', title: 'Artist movement, backstage and show-call plan confirmed', owner_name: 'Artist liaison', status: 'ready', evidence_note: 'Confirmed with tour manager' },
  { event_id: '', area: 'Guest comms', title: 'Arrival guide, gate map and attendee safety message issued', owner_name: 'Guest experience', status: 'ready', evidence_note: 'Scheduled for 16:30' },
];

const statusMeta = {
  ready: { label: 'Ready', icon: CheckCircle2, className: 'border-ag-green/35 bg-ag-green-dim text-ag-green' },
  pending: { label: 'Needs confirmation', icon: Clock3, className: 'border-ag-yellow/35 bg-ag-yellow-dim text-ag-yellow' },
  blocked: { label: 'Blocking gates', icon: CircleAlert, className: 'border-ag-red/35 bg-ag-red-dim text-ag-red' },
  not_started: { label: 'Not started', icon: Clock3, className: 'border-ag-border bg-ag-surface text-ag-text-muted' },
};

export const GoNoGoBoard: React.FC<{ eventId: string }> = ({ eventId }) => {
  const { readinessChecks, createReadinessCheck, updateReadinessCheck, recordAccessAudit, currentUser } = useAppStore();
  const checks = useMemo(() => readinessChecks.filter((check) => check.event_id === eventId), [readinessChecks, eventId]);
  const ready = checks.filter((check) => check.status === 'ready').length;
  const blockers = checks.filter((check) => check.status === 'blocked').length;
  const canOpen = checks.length > 0 && blockers === 0 && ready === checks.length;

  const loadLaunchConditions = () => launchConditions.forEach((check) => createReadinessCheck({ ...check, event_id: eventId }));
  const setStatus = (check: EventReadinessCheck, status: EventReadinessCheck['status']) => {
    updateReadinessCheck(check.id, { status, acknowledged_at: status === 'ready' ? new Date().toISOString() : null });
    recordAccessAudit({ event_id: eventId, actor_id: currentUser.id, action: 'readiness_updated', target_name: check.title, detail: `${check.owner_name} marked ${status.replace('_', ' ')}` });
  };

  return <div className="space-y-5">
    <Card className={`overflow-hidden border ${canOpen ? 'border-ag-green/40 bg-gradient-to-r from-ag-green-dim/25 to-ag-surface' : blockers ? 'border-ag-red/35 bg-gradient-to-r from-ag-red-dim/20 to-ag-surface' : 'border-ag-yellow/35 bg-gradient-to-r from-ag-yellow-dim/15 to-ag-surface'} p-5 sm:p-6`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${canOpen ? 'text-ag-green' : blockers ? 'text-ag-red' : 'text-ag-yellow'}`}><ShieldAlert className="h-4 w-4" />Go / no-go authority</div><h2 className="mt-2 text-xl font-bold text-white">{canOpen ? 'Clear to open the gates.' : blockers ? `${blockers} condition${blockers > 1 ? 's' : ''} blocks gates.` : 'Not cleared to open yet.'}</h2><p className="mt-1 text-sm text-ag-text-secondary">This is the organiser’s launch decision—not a checklist buried in a WhatsApp group.</p></div><div className="flex shrink-0 items-center gap-3"><div className="rounded-xl border border-ag-border bg-ag-black/30 px-4 py-2 text-right"><p className="text-lg font-bold text-white">{ready} / {checks.length || '—'}</p><p className="text-[10px] font-bold uppercase tracking-wider text-ag-text-muted">conditions ready</p></div>{checks.length === 0 && <Button size="sm" variant="primary" onClick={loadLaunchConditions} leftIcon={<FileCheck2 className="h-3.5 w-3.5" />}>Load launch checks</Button>}</div></div>
    </Card>
    {checks.length > 0 && <Card className="overflow-hidden p-0"><div className="border-b border-ag-border p-5"><p className="text-xs font-bold uppercase tracking-wider text-ag-text-muted">Evidence-backed launch checklist</p><p className="mt-1 text-sm text-ag-text-secondary">Only the accountable owner can make the opening decision defensible.</p></div><div className="divide-y divide-ag-border">{checks.map((check) => { const meta = statusMeta[check.status]; const Icon = meta.icon; return <div key={check.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${meta.className}`}><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-white">{check.title}</p><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.className}`}>{meta.label}</span></div><p className="mt-1 text-xs text-ag-text-secondary">{check.area} · Accountable: {check.owner_name}{check.evidence_note ? ` · ${check.evidence_note}` : ''}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => setStatus(check, 'pending')} className="rounded-lg border border-ag-border px-2.5 py-1.5 text-[11px] font-bold text-ag-text-secondary hover:text-white">Hold</button><button onClick={() => setStatus(check, 'ready')} className="rounded-lg bg-ag-green-dim px-2.5 py-1.5 text-[11px] font-bold text-ag-green">Confirm</button>{check.status !== 'blocked' && <button onClick={() => setStatus(check, 'blocked')} className="rounded-lg bg-ag-red-dim px-2.5 py-1.5 text-[11px] font-bold text-ag-red">Block</button>}</div></div>; })}</div></Card>}
  </div>;
};
