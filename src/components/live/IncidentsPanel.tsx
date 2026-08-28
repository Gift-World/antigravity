// src/components/live/IncidentsPanel.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Incident, IncidentSeverity, IncidentStatus, IncidentType } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  AlertTriangle,
  Plus,
  Clock,
  Shield,
  HeartPulse,
  Smartphone,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

export const IncidentsPanel: React.FC = () => {
  const { incidents, users, activeEventId, updateIncidentStatus, createIncident, events } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const zones = activeEvent.venue?.zones || [];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<IncidentType>('crush_risk');
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('medium');
  const [newZoneId, setNewZoneId] = useState(zones[0]?.id || '');
  const [newDescription, setNewDescription] = useState('');

  const responders = users.filter((u) => u.role === 'security' || u.role === 'medical' || u.role === 'event_manager');

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createIncident({
      event_id: activeEventId,
      zone_id: newZoneId,
      incident_type: newType,
      severity: newSeverity,
      title: newTitle,
      description: newDescription,
      status: 'open',
      assigned_to: responders[0]?.id || null,
    });

    setNewTitle('');
    setNewDescription('');
    setIsCreateModalOpen(false);
  };

  const getSeverityBadgeVariant = (sev: IncidentSeverity) => {
    if (sev === 'critical') return 'red';
    if (sev === 'high') return 'orange';
    if (sev === 'medium') return 'yellow';
    return 'neutral';
  };

  return (
    <div className="h-full flex flex-col p-4 bg-ag-surface rounded-[8px] border border-ag-border text-ag-text-primary">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ag-border mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-ag-yellow" />
          <h4 className="font-display font-bold text-sm text-ag-text-primary">
            ACTIVE TACTICAL INCIDENTS
          </h4>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsCreateModalOpen(true)}
          className="text-xs h-7 px-2.5"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          New Incident
        </Button>
      </div>

      {/* Incidents List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {incidents.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-ag-text-muted text-xs">
            <CheckCircle2 className="w-8 h-8 text-ag-green mb-2 opacity-60" />
            <span>No active incidents. Zero crush risk.</span>
          </div>
        ) : (
          incidents.map((incident) => {
            const assignedUser = users.find((u) => u.id === incident.assigned_to);
            const zone = zones.find((z) => z.id === incident.zone_id);

            return (
              <div
                key={incident.id}
                className="p-3 bg-ag-black/40 rounded-[6px] border border-ag-border hover:border-ag-border/80 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityBadgeVariant(incident.severity)} size="sm">
                      {incident.severity}
                    </Badge>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-ag-text-secondary">
                      {incident.incident_type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-ag-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Title & Description */}
                <h5 className="text-xs font-semibold text-ag-text-primary mb-1">{incident.title}</h5>
                {incident.description && (
                  <p className="text-[11px] text-ag-text-secondary leading-snug mb-2.5">
                    {incident.description}
                  </p>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-ag-border/50 text-[11px]">
                  {/* Zone & Assignee */}
                  <div className="flex items-center gap-2 text-ag-text-muted font-mono text-[10px]">
                    <span>📍 {zone?.name.split('(')[0] || 'Stadium'}</span>
                    <span>•</span>
                    <span className="text-ag-blue">
                      👤 {assignedUser ? assignedUser.full_name.split(' ')[0] : 'Unassigned'}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={incident.status}
                    onChange={(e) => updateIncidentStatus(incident.id, e.target.value as IncidentStatus)}
                    className="bg-ag-surface border border-ag-border text-ag-text-primary text-[11px] rounded px-2 py-0.5 focus:outline-none focus:border-ag-blue"
                  >
                    <option value="open">Open</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="responding">Responding</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Incident Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Report New Tactical Incident"
        description="Dispatch response units to crowd surge, phone theft, medical or security incidents"
      >
        <form onSubmit={handleCreateIncident} className="space-y-4">
          <Input
            label="Incident Title"
            placeholder="e.g. Crowd surging towards Gate A barrier"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
                Category
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as IncidentType)}
                className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue"
              >
                <option value="crush_risk">Crush Risk / Surge</option>
                <option value="phone_theft">Phone Theft (Guardian)</option>
                <option value="medical">Medical Emergency</option>
                <option value="gate_breach">Gate Breach</option>
                <option value="fight">Altercation / Fight</option>
                <option value="capacity_exceeded">Capacity Exceeded</option>
                <option value="other">Other Incident</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
                Severity Level
              </label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as IncidentSeverity)}
                className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue"
              >
                <option value="critical">Critical (Immediate Danger)</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
              Venue Zone
            </label>
            <select
              value={newZoneId}
              onChange={(e) => setNewZoneId(e.target.value)}
              className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
              Situation Notes
            </label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe crowd movement, suspect description, or triage notes..."
              className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue placeholder:text-ag-text-muted"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Log & Dispatch Incident
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
