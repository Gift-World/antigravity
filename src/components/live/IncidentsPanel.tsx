// src/components/live/IncidentsPanel.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Incident, IncidentSeverity, IncidentType } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  AlertTriangle,
  Plus,
  Shield,
  HeartPulse,
  Smartphone,
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

  return (
    <div className="h-full flex flex-col space-y-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-ag-border">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-ag-yellow" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-white">
            Incidents Log
          </h4>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsCreateModalOpen(true)}
          className="text-xs h-8 px-3"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Report Incident
        </Button>
      </div>

      {/* Incidents List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {incidents.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-ag-text-muted text-xs">
            <CheckCircle2 className="w-8 h-8 text-ag-green mb-2 opacity-60" />
            <span>No incidents reported. All clear!</span>
          </div>
        ) : (
          incidents.map((inc) => {
            const isResolved = inc.status === 'resolved';

            return (
              <div
                key={inc.id}
                className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                  isResolved
                    ? 'bg-ag-surface/40 border-ag-border opacity-70'
                    : 'bg-ag-black border-ag-border hover:border-ag-border-focus'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={inc.severity === 'high' ? 'red' : 'yellow'} size="sm">
                      {inc.severity.toUpperCase()}
                    </Badge>
                    <span className="font-bold text-white text-xs">{inc.title}</span>
                  </div>

                  <span className="text-[10px] text-ag-text-muted">
                    {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-ag-text-secondary leading-relaxed">{inc.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-ag-border/50">
                  <span className="text-[11px] text-ag-text-muted">
                    Status: <strong className="text-white uppercase">{inc.status}</strong>
                  </span>

                  {!isResolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateIncidentStatus(inc.id, 'resolved')}
                      className="text-xs h-7 px-2.5 text-ag-green hover:bg-ag-green/10 border-ag-green/30"
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Report Incident Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Report New Incident"
      >
        <form onSubmit={handleCreateIncident} className="space-y-4 font-sans">
          <Input
            label="Incident Title"
            placeholder="e.g. Broken gate latch, Attendee feeling dizzy"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ag-text-secondary">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as IncidentType)}
                className="w-full bg-ag-black border border-ag-border focus:border-ag-blue rounded-lg p-2.5 text-xs text-white"
              >
                <option value="crush_risk">Crowd Pressure</option>
                <option value="medical">Medical / First Aid</option>
                <option value="phone_theft">Phone Theft</option>
                <option value="gate_breach">Gate Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ag-text-secondary">Severity</label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as IncidentSeverity)}
                className="w-full bg-ag-black border border-ag-border focus:border-ag-blue rounded-lg p-2.5 text-xs text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ag-text-secondary">Zone / Location</label>
            <select
              value={newZoneId}
              onChange={(e) => setNewZoneId(e.target.value)}
              className="w-full bg-ag-black border border-ag-border focus:border-ag-blue rounded-lg p-2.5 text-xs text-white"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ag-text-secondary">Details</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe the situation..."
              rows={3}
              className="w-full bg-ag-black border border-ag-border focus:border-ag-blue rounded-lg p-3 text-xs text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-ag-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="h-10"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="h-10 px-6 font-bold">
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
