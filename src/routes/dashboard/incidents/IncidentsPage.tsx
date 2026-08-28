// src/routes/dashboard/incidents/IncidentsPage.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { IncidentStatus, IncidentType, IncidentSeverity } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  AlertTriangle,
  Plus,
  Clock,
  MapPin,
  Shield,
  HeartPulse,
  Smartphone,
  UserCheck,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const { incidents, users, events, activeEventId, updateIncidentStatus, createIncident } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const zones = activeEvent?.venue?.zones || [];

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<IncidentType>('crush_risk');
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('high');
  const [newZoneId, setNewZoneId] = useState(zones[0]?.id || '');
  const [newDescription, setNewDescription] = useState('');

  const filteredIncidents = incidents.filter((i) => {
    const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
    const matchesSearch =
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createIncident({
      event_id: activeEvent?.id || 'e1111111-1111-1111-1111-111111111111',
      zone_id: newZoneId || zones[0]?.id,
      incident_type: newType,
      severity: newSeverity,
      title: newTitle,
      description: newDescription,
      status: 'open',
      assigned_to: users.find((u) => u.role === 'security')?.id,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Incidents Log</h2>
          <p className="text-xs text-ag-text-secondary">
            Live incident log, responder dispatch, and resolution tracking
          </p>
        </div>

        <Button
          size="md"
          variant="danger"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          Report Incident
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-ag-surface p-3 rounded-[8px] border border-ag-border">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ag-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search incidents by keyword or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ag-black border border-ag-border text-ag-text-primary text-xs rounded px-3 py-2 pl-9 focus:outline-none focus:border-ag-blue"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'open', 'responding', 'resolved'].map((status) => (
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

      {/* Incidents List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncidents.map((incident) => {
          const zone = zones.find((z) => z.id === incident.zone_id);
          const assignee = users.find((u) => u.id === incident.assigned_to);

          return (
            <Card key={incident.id} className="space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityBadgeVariant(incident.severity)} size="sm">
                      {incident.severity}
                    </Badge>
                    <span className="text-xs font-mono uppercase text-ag-text-secondary">
                      {incident.incident_type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-ag-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h4 className="font-display font-bold text-sm text-white mb-1">{incident.title}</h4>
                <p className="text-xs text-ag-text-secondary leading-relaxed">{incident.description}</p>
              </div>

              <div className="pt-3 border-t border-ag-border space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-ag-text-muted">
                    <MapPin className="w-3.5 h-3.5 text-ag-red" />
                    <span>{zone?.name || 'Main Stadium Grounds'}</span>
                  </div>
                  <span className="text-ag-blue">
                    Responder: {assignee ? assignee.full_name.split(' ')[0] : 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] font-mono uppercase text-ag-text-muted">Status:</span>
                  <select
                    value={incident.status}
                    onChange={(e) => updateIncidentStatus(incident.id, e.target.value as IncidentStatus)}
                    className="bg-ag-black border border-ag-border text-white text-xs rounded px-2 py-1 font-mono focus:outline-none focus:border-ag-blue"
                  >
                    <option value="open">Open</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="responding">Responding</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Incident Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Report Tactical Incident"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Crowd surging at Stage Barrier"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
                Type
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
                <option value="fight">Altercation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
                Severity
              </label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as IncidentSeverity)}
                className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
              Sector
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
            <textarea
              rows={3}
              placeholder="Incident details..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Dispatch Incident
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
