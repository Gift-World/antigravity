// src/routes/dashboard/venues/VenueManagement.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Venue, VenueZone, ZoneType } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatNumber } from '@/lib/utils';
import {
  MapPin,
  Plus,
  Building,
  Users,
  DoorOpen,
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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Venues & Zones</h2>
          <p className="text-xs text-ag-text-secondary">
            Manage your event venues, gate entrances, floor sections, and capacities
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => setIsAddVenueModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          Add Venue
        </Button>
      </div>

      {/* Venues Selector Cards */}
      {venues.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-ag-surface border border-ag-border flex items-center justify-center mx-auto text-ag-text-muted">
            <Building className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">No Venues Found</h3>
            <p className="text-xs text-ag-text-secondary max-w-sm mx-auto">
              There are no venues in the database yet. Add your first venue to set up gates and zones.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddVenueModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Venue
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {venues.map((venue) => {
              const isSelected = venue.id === selectedVenue?.id;
              return (
                <Card
                  key={venue.id}
                  hover
                  onClick={() => setSelectedVenueId(venue.id)}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'border-ag-blue bg-ag-surface-hover shadow-lg shadow-ag-blue/10'
                      : 'border-ag-border bg-ag-surface'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4 text-ag-blue" />
                    <span className="font-bold text-white text-sm truncate">{venue.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ag-text-secondary">
                    <span>{venue.city}</span>
                    <span className="font-mono text-ag-green font-semibold">
                      {formatNumber(venue.total_capacity)} Cap
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {selectedVenue && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-bold text-lg text-white">{selectedVenue.name} Zones</h3>
                  <Badge variant="blue" size="sm">
                    {zones.length} Zones
                  </Badge>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddZoneModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Add Zone
                </Button>
              </div>

              {/* Zones Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map((zone) => (
                  <Card key={zone.id} className="p-4 space-y-2 border-ag-border bg-ag-surface">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{zone.name}</h4>
                        <span className="text-[11px] text-ag-text-muted capitalize">
                          {zone.zone_type.replace('_', ' ')}
                        </span>
                      </div>
                      <Badge variant="neutral" size="sm">
                        {formatNumber(zone.capacity)} MAX
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Venue Modal */}
      <Modal isOpen={isAddVenueModalOpen} onClose={() => setIsAddVenueModalOpen(false)} title="Add New Venue">
        <form onSubmit={handleCreateVenue} className="space-y-4 font-sans">
          <Input
            label="Venue Name"
            placeholder="e.g. Nyayo National Stadium"
            value={newVenueName}
            onChange={(e) => setNewVenueName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              placeholder="Nairobi"
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
            label="Address / Location"
            placeholder="e.g. Aerodrome Rd, Nairobi"
            value={newVenueAddress}
            onChange={(e) => setNewVenueAddress(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-ag-border">
            <Button type="button" variant="outline" onClick={() => setIsAddVenueModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Venue
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Zone Modal */}
      <Modal isOpen={isAddZoneModalOpen} onClose={() => setIsAddZoneModalOpen(false)} title="Add Zone to Venue">
        <form onSubmit={handleCreateZone} className="space-y-4 font-sans">
          <Input
            label="Zone Name"
            placeholder="e.g. Main Pitch, Gate E, VIP Lounge"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ag-text-secondary">Zone Type</label>
              <select
                value={newZoneType}
                onChange={(e) => setNewZoneType(e.target.value as any)}
                className="w-full bg-ag-black border border-ag-border rounded-lg p-2.5 text-xs text-white"
              >
                <option value="floor_section">Floor / Standing</option>
                <option value="entry_gate">Entry Gate</option>
                <option value="exit_gate">Emergency Exit</option>
                <option value="vip">VIP Area</option>
                <option value="stage">Stage Area</option>
                <option value="medical_post">Medical Post</option>
                <option value="vendor_area">Food / Vendor</option>
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
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-ag-border">
            <Button type="button" variant="outline" onClick={() => setIsAddZoneModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Zone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
