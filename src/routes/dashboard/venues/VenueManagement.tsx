// src/routes/dashboard/venues/VenueManagement.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Venue, VenueZone, ZoneType } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  MapPin,
  Plus,
  Building,
  Layers,
  Users,
  Compass,
  ArrowRight,
  Shield,
  Edit2,
  Trash2,
} from 'lucide-react';

export const VenueManagement: React.FC = () => {
  const { venues, addVenue, addVenueZone } = useAppStore();
  const [selectedVenueId, setSelectedVenueId] = useState<string>(venues[0]?.id || '');
  const [isAddVenueModalOpen, setIsAddVenueModalOpen] = useState(false);
  const [isAddZoneModalOpen, setIsAddZoneModalOpen] = useState(false);

  // New venue state
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueCity, setNewVenueCity] = useState('Nairobi');
  const [newVenueAddress, setNewVenueAddress] = useState('');
  const [newVenueCapacity, setNewVenueCapacity] = useState(15000);

  // New zone state
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState<ZoneType>('floor_section');
  const [newZoneCapacity, setNewZoneCapacity] = useState(2500);

  const selectedVenue = venues.find((v) => v.id === selectedVenueId) || venues[0];
  const zones = selectedVenue?.zones || [];

  const handleCreateVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim()) return;

    const v = addVenue({
      name: newVenueName,
      city: newVenueCity,
      address: newVenueAddress,
      total_capacity: Number(newVenueCapacity),
    });

    setSelectedVenueId(v.id);
    setNewVenueName('');
    setIsAddVenueModalOpen(false);
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    addVenueZone(selectedVenue.id, {
      name: newZoneName,
      zone_type: newZoneType,
      capacity: Number(newZoneCapacity),
    });

    setNewZoneName('');
    setIsAddZoneModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Venues & Sector Topography</h2>
          <p className="text-xs text-ag-text-secondary font-mono">
            Configure stadium sectors, turnstiles, medical triage points, and spatial capacity boundaries
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => setIsAddVenueModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          Add Venue Template
        </Button>
      </div>

      {/* Venues Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {venues.map((venue) => {
          const isSelected = venue.id === selectedVenue.id;
          return (
            <Card
              key={venue.id}
              hover
              onClick={() => setSelectedVenueId(venue.id)}
              className={`space-y-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-ag-blue/80 bg-ag-surface-hover shadow-lg shadow-ag-blue/10'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ag-text-muted">
                  {venue.city}
                </span>
                {isSelected && <Badge variant="blue" size="sm">ACTIVE</Badge>}
              </div>
              <h4 className="font-display font-bold text-sm text-white truncate">{venue.name}</h4>
              <div className="text-xs font-mono text-ag-text-secondary">
                Cap: {venue.total_capacity.toLocaleString()} • {venue.zones?.length || 0} Sectors
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Venue Deep Dive & Zone Topography */}
      <Card className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ag-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-ag-blue" />
              <h3 className="font-display font-bold text-lg text-white">{selectedVenue.name}</h3>
            </div>
            <p className="text-xs font-mono text-ag-text-secondary mt-0.5">
              {selectedVenue.address || 'Aerodrome Rd, Nairobi'} • Total Stadium Rating:{' '}
              <strong className="text-white">{selectedVenue.total_capacity.toLocaleString()}</strong>
            </p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsAddZoneModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Add Spatial Sector
          </Button>
        </div>

        {/* Sectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="p-3.5 bg-ag-black/40 border border-ag-border rounded-[8px] space-y-2 hover:border-ag-border/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    zone.zone_type === 'entry_gate' || zone.zone_type === 'exit_gate'
                      ? 'blue'
                      : zone.zone_type === 'medical_post'
                      ? 'red'
                      : zone.zone_type === 'vip'
                      ? 'purple'
                      : 'green'
                  }
                  size="sm"
                >
                  {zone.zone_type.replace('_', ' ')}
                </Badge>
                <span className="text-xs font-mono text-ag-text-muted">
                  Cap: {zone.capacity.toLocaleString()}
                </span>
              </div>
              <h5 className="font-display font-bold text-sm text-white">{zone.name}</h5>
              <div className="text-[11px] font-mono text-ag-text-secondary flex items-center justify-between pt-1 border-t border-ag-border/40">
                <span>BLE Mesh Sector</span>
                <span className="text-ag-green">✓ Monitored</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Venue Modal */}
      <Modal
        isOpen={isAddVenueModalOpen}
        onClose={() => setIsAddVenueModalOpen(false)}
        title="Add Stadium / Arena Venue Template"
        description="Register a new event grounds with spatial parameters"
      >
        <form onSubmit={handleCreateVenue} className="space-y-4">
          <Input
            label="Venue Name"
            placeholder="e.g. Kasarani Main Stadium"
            value={newVenueName}
            onChange={(e) => setNewVenueName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={newVenueCity}
              onChange={(e) => setNewVenueCity(e.target.value)}
              required
            />
            <Input
              label="Total Capacity"
              type="number"
              value={newVenueCapacity}
              onChange={(e) => setNewVenueCapacity(Number(e.target.value))}
              required
            />
          </div>
          <Input
            label="Street Address / Location"
            placeholder="e.g. Thika Superhighway, Nairobi"
            value={newVenueAddress}
            onChange={(e) => setNewVenueAddress(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddVenueModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Venue
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Sector Modal */}
      <Modal
        isOpen={isAddZoneModalOpen}
        onClose={() => setIsAddZoneModalOpen(false)}
        title={`Add Sector to ${selectedVenue.name}`}
      >
        <form onSubmit={handleCreateZone} className="space-y-4">
          <Input
            label="Sector Name"
            placeholder="e.g. North Bleachers Section 4"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
                Sector Type
              </label>
              <select
                value={newZoneType}
                onChange={(e) => setNewZoneType(e.target.value as ZoneType)}
                className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue"
              >
                <option value="entry_gate">Entry Turnstile Gate</option>
                <option value="exit_gate">Emergency Exit Gate</option>
                <option value="floor_section">General Pitch / Floor</option>
                <option value="vip">VIP Lounge / Skybox</option>
                <option value="stage">Stage Pit / Barrier</option>
                <option value="medical_post">Red Cross Medical Post</option>
                <option value="vendor_area">Cashless Food / Bar Court</option>
              </select>
            </div>
            <Input
              label="Zone Capacity"
              type="number"
              value={newZoneCapacity}
              onChange={(e) => setNewZoneCapacity(Number(e.target.value))}
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddZoneModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Sector
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
