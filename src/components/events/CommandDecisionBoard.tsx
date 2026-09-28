import React, { useMemo, useState } from 'react';
import { CheckCheck, Megaphone, Plus, Radio, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/lib/store';
import { CommandDecisionPriority } from '@/types/database';

const priorityClass: Record<CommandDecisionPriority, string> = {
  routine: 'border-ag-border bg-ag-surface text-ag-text-secondary',
  important: 'border-ag-yellow/35 bg-ag-yellow-dim text-ag-yellow',
  critical: 'border-ag-red/35 bg-ag-red-dim text-ag-red',
};

export const CommandDecisionBoard: React.FC<{ eventId: string }> = ({ eventId }) => {
  const { commandDecisions, createCommandDecision, updateCommandDecision, recordAccessAudit, currentUser } = useAppStore();
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [directive, setDirective] = useState('');
  const [owner, setOwner] = useState('Event control');
  const [audience, setAudience] = useState('Operations + gates');
  const [priority, setPriority] = useState<CommandDecisionPriority>('important');
  const decisions = useMemo(() => commandDecisions.filter((decision) => decision.event_id === eventId), [commandDecisions, eventId]);
  const liveCount = decisions.filter((decision) => decision.status === 'issued').length;

  const issue = () => {
    if (!title.trim() || !directive.trim()) return;
    const decision = createCommandDecision({ event_id: eventId, title: title.trim(), directive: directive.trim(), owner_name: owner.trim() || 'Event control', audience: audience.trim() || 'Event team', priority, status: 'issued', issued_by: currentUser.id, acknowledged_at: null, completed_at: null });
    recordAccessAudit({ event_id: eventId, actor_id: currentUser.id, action: 'command_issued', target_name: decision.title, detail: `Issued to ${decision.audience}` });
    setTitle(''); setDirective(''); setComposerOpen(false);
  };
  const acknowledge = (id: string, completed = false) => updateCommandDecision(id, completed ? { status: 'completed', completed_at: new Date().toISOString() } : { status: 'acknowledged', acknowledged_at: new Date().toISOString() });

  return <div className="space-y-5">
    <Card className="border-ag-blue/25 bg-gradient-to-br from-ag-blue-dim/15 via-ag-surface to-ag-black p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ag-blue"><Radio className="h-4 w-4" />Live command log</div><h2 className="mt-2 text-xl font-bold text-white">Decide once. Everyone sees it.</h2><p className="mt-1 max-w-xl text-sm text-ag-text-secondary">Turn the decision made in the command post into a timed directive, owner and acknowledgement trail.</p></div><div className="flex items-center gap-3"><div className="rounded-xl border border-ag-border bg-ag-black/30 px-3 py-2 text-center"><p className="text-lg font-bold text-white">{liveCount}</p><p className="text-[10px] font-bold uppercase tracking-wider text-ag-text-muted">awaiting action</p></div><Button size="sm" variant="primary" onClick={() => setComposerOpen((open) => !open)} leftIcon={<Megaphone className="h-3.5 w-3.5" />}>Issue directive</Button></div></div>
      {isComposerOpen && <div className="mt-5 grid gap-2 rounded-xl border border-ag-blue/35 bg-ag-black/40 p-3 md:grid-cols-2"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Decision title — e.g. Hold Gate B entry" className="rounded-lg border border-ag-border bg-ag-black px-3 py-2 text-sm text-white outline-none focus:border-ag-blue" /><select value={priority} onChange={(event) => setPriority(event.target.value as CommandDecisionPriority)} className="rounded-lg border border-ag-border bg-ag-black px-3 py-2 text-sm text-white outline-none focus:border-ag-blue"><option value="routine">Routine</option><option value="important">Important</option><option value="critical">Critical</option></select><textarea value={directive} onChange={(event) => setDirective(event.target.value)} placeholder="Exact instruction: what should happen now?" className="min-h-20 rounded-lg border border-ag-border bg-ag-black px-3 py-2 text-sm text-white outline-none focus:border-ag-blue md:col-span-2" /><input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Accountable owner" className="rounded-lg border border-ag-border bg-ag-black px-3 py-2 text-sm text-white outline-none focus:border-ag-blue" /><input value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="Audience" className="rounded-lg border border-ag-border bg-ag-black px-3 py-2 text-sm text-white outline-none focus:border-ag-blue" /><div className="flex justify-end gap-2 md:col-span-2"><button onClick={() => setComposerOpen(false)} className="rounded-lg px-3 py-2 text-xs font-bold text-ag-text-secondary">Cancel</button><Button size="sm" variant="primary" onClick={issue}>Issue to team</Button></div></div>}
    </Card>
    <Card className="overflow-hidden p-0"><div className="flex items-center justify-between border-b border-ag-border p-5"><div><p className="text-xs font-bold uppercase tracking-wider text-ag-text-muted">Decision timeline</p><p className="mt-1 text-sm text-ag-text-secondary">Every command is visible to the owner after the event.</p></div><ShieldAlert className="h-5 w-5 text-ag-text-muted" /></div><div className="divide-y divide-ag-border">{decisions.map((decision) => <div key={decision.id} className="p-4 sm:px-5"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-white">{decision.title}</p><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${priorityClass[decision.priority]}`}>{decision.priority}</span><span className="text-[10px] font-bold uppercase tracking-wider text-ag-text-muted">{decision.status}</span></div><p className="mt-2 text-sm leading-relaxed text-ag-text-secondary">{decision.directive}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-ag-text-muted">{decision.audience} · Owner: {decision.owner_name}</p><div className="flex gap-2">{decision.status === 'issued' && <button onClick={() => acknowledge(decision.id)} className="flex items-center gap-1 rounded-lg bg-ag-blue-dim px-2.5 py-1.5 text-[11px] font-bold text-ag-blue"><CheckCheck className="h-3.5 w-3.5" />Acknowledge</button>}{decision.status === 'acknowledged' && <button onClick={() => acknowledge(decision.id, true)} className="rounded-lg bg-ag-green-dim px-2.5 py-1.5 text-[11px] font-bold text-ag-green">Complete</button>}</div></div></div>)}{decisions.length === 0 && <div className="p-8 text-center"><Plus className="mx-auto h-6 w-6 text-ag-text-muted" /><p className="mt-2 text-sm font-bold text-white">No decisions issued yet</p><p className="mt-1 text-xs text-ag-text-secondary">Use this when the operation needs a clear decision—not another chat message.</p></div>}</div></Card>
  </div>;
};
