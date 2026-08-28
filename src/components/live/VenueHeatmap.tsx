// src/components/live/VenueHeatmap.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getDensityColor } from '@/lib/density';
import { VenueZone, ZoneDensityReading } from '@/types/database';
import { AlertTriangle, ShieldAlert, HeartPulse, Smartphone } from 'lucide-react';
import { ZoneDetailModal } from './ZoneDetailModal';
import { formatNumber } from '@/lib/utils';

import { NYAYO_ZONES } from '@/lib/seedData';

export const VenueHeatmap: React.FC = () => {
  const {
    events,
    venues,
    activeEventId,
    densityReadings,
    incidents,
    selectedZoneId,
    setSelectedZoneId,
  } = useAppStore();

  const [inspectZone, setInspectZone] = useState<{ zone: VenueZone; reading: ZoneDensityReading } | null>(null);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const venueObj = activeEvent?.venue || venues.find((v) => v.id === activeEvent?.venue_id);
  const zones = venueObj?.zones && venueObj.zones.length > 0 ? venueObj.zones : NYAYO_ZONES;

  // SVG Zone polygon definitions (Layout mapped for Nyayo National Stadium)
  const zoneSVGMappings: Record<
    string,
    {
      d: string;
      labelPos: { x: number; y: number };
      displayName: string;
      capacity: number;
    }
  > = {
    // Gate A (Main North)
    'c1111111-1111-1111-1111-111111111111': {
      d: 'M 180,30 L 320,30 L 300,75 L 200,75 Z',
      labelPos: { x: 250, y: 55 },
      displayName: 'Gate A',
      capacity: 2500,
    },
    // Gate B (East Public)
    'c2222222-2222-2222-2222-222222222222': {
      d: 'M 720,160 L 780,180 L 780,300 L 720,280 Z',
      labelPos: { x: 750, y: 240 },
      displayName: 'Gate B',
      capacity: 2500,
    },
    // Gate C (South Express)
    'c3333333-3333-3333-3333-333333333333': {
      d: 'M 720,320 L 780,340 L 780,440 L 720,420 Z',
      labelPos: { x: 750, y: 380 },
      displayName: 'Gate C',
      capacity: 2000,
    },
    // Gate D (VIP / Artist Fast Track)
    'c4444444-4444-4444-4444-444444444444': {
      d: 'M 20,180 L 80,160 L 80,260 L 20,280 Z',
      labelPos: { x: 50, y: 220 },
      displayName: 'Gate D (VIP)',
      capacity: 1000,
    },
    // Stage & Front Barrier
    'c5555555-5555-5555-5555-555555555555': {
      d: 'M 310,85 L 490,85 L 470,145 L 330,145 Z',
      labelPos: { x: 400, y: 115 },
      displayName: 'Stage Area',
      capacity: 1500,
    },
    // Main Floor North (Front Pit)
    'c6666666-6666-6666-6666-666666666666': {
      d: 'M 230,155 L 570,155 L 560,280 L 240,280 Z',
      labelPos: { x: 400, y: 215 },
      displayName: 'Main Floor (Front)',
      capacity: 3500,
    },
    // Main Floor South (General Pitch)
    'c7777777-7777-7777-7777-777777777777': {
      d: 'M 235,290 L 565,290 L 550,425 L 250,425 Z',
      labelPos: { x: 400, y: 355 },
      displayName: 'Main Floor (Back)',
      capacity: 4500,
    },
    // VIP Lounge East
    'c8888888-8888-8888-8888-888888888888': {
      d: 'M 580,155 L 700,165 L 690,280 L 570,280 Z',
      labelPos: { x: 635, y: 220 },
      displayName: 'VIP Lounge East',
      capacity: 1200,
    },
    // VIP Lounge West & Skybox
    'c9999999-9999-9999-9999-999999999999': {
      d: 'M 100,165 L 220,155 L 230,280 L 110,280 Z',
      labelPos: { x: 165, y: 220 },
      displayName: 'VIP Lounge West',
      capacity: 1200,
    },
    // Medical Post Alpha
    'caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa': {
      d: 'M 100,300 L 210,300 L 205,375 L 95,375 Z',
      labelPos: { x: 150, y: 338 },
      displayName: 'Medical Tent 1',
      capacity: 100,
    },
    // Medical Post Bravo
    'cbbbbbb0-bbbb-bbbb-bbbb-bbbbbbbbbbbb': {
      d: 'M 590,300 L 700,300 L 705,375 L 595,375 Z',
      labelPos: { x: 650, y: 338 },
      displayName: 'Medical Tent 2',
      capacity: 100,
    },
    // Food & Bar Court
    'ccccccc0-cccc-cccc-cccc-cccccccccccc': {
      d: 'M 240,435 L 560,435 L 540,490 L 260,490 Z',
      labelPos: { x: 400, y: 462 },
      displayName: 'Food & Drinks Court',
      capacity: 1800,
    },
    // Emergency Exits
    'cdddddd0-dddd-dddd-dddd-dddddddddddd': {
      d: 'M 480,30 L 620,30 L 600,75 L 500,75 Z',
      labelPos: { x: 550, y: 55 },
      displayName: 'Emergency Exits',
      capacity: 4000,
    },
  };

  const getReadingForZone = (zoneId: string): ZoneDensityReading => {
    return (
      densityReadings.find((r) => r.zone_id === zoneId) || {
        id: `dr_${zoneId}`,
        event_id: activeEventId,
        zone_id: zoneId,
        timestamp: new Date().toISOString(),
        estimated_count: 500,
        density_per_sqm: 1.8,
        risk_level: 'safe',
        source: 'scan_count',
      }
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-ag-surface/40 border border-ag-border rounded-2xl overflow-hidden select-none font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-ag-surface/90 border-b border-ag-border backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-ag-green animate-pulse" />
          <span className="font-bold text-sm text-white">Crowd Density Map</span>
          <span className="text-xs text-ag-text-secondary ml-1">• Tap any zone for details</span>
        </div>

        {/* Friendly Legend */}
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-ag-green font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-ag-green" /> Safe (&lt;70%)
          </span>
          <span className="flex items-center gap-1.5 text-ag-yellow font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-ag-yellow" /> Caution (70-90%)
          </span>
          <span className="flex items-center gap-1.5 text-ag-red font-bold animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-ag-red" /> Danger (&gt;90%)
          </span>
        </div>
      </div>

      {/* SVG Interactive Venue Map */}
      <div className="flex-1 relative flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-radial-dark">
        <svg
          viewBox="0 0 800 520"
          className="w-full h-full max-h-[580px] drop-shadow-2xl transition-all duration-300"
        >
          <defs>
            <radialGradient id="stadiumTrack" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#12121A" stopOpacity="0.8" />
              <stop offset="95%" stopColor="#1A1A25" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2A2A35" stopOpacity="1" />
            </radialGradient>

            <filter id="criticalGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Stadium Boundary */}
          <ellipse
            cx="400"
            cy="260"
            rx="390"
            ry="245"
            fill="url(#stadiumTrack)"
            stroke="#2A2A35"
            strokeWidth="2.5"
            strokeDasharray="6 6"
          />

          {/* Inner Pitch Oval */}
          <ellipse
            cx="400"
            cy="260"
            rx="340"
            ry="205"
            fill="#0A0A0F"
            stroke="#448AFF"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />

          {/* Zones */}
          {zones.map((zone) => {
            const svgData = zoneSVGMappings[zone.id];
            if (!svgData) return null;

            const reading = getReadingForZone(zone.id);
            const color = getDensityColor(reading.density_per_sqm);
            const isSelected = selectedZoneId === zone.id;
            const isCritical = reading.density_per_sqm >= 5.5;

            // Calculate percentage capacity
            const cap = svgData.capacity || 2000;
            const count = reading.estimated_count;
            const percentFull = Math.min(100, Math.round((count / cap) * 100));

            // Check if there are active incidents in this zone
            const zoneIncidents = incidents.filter(
              (i) => i.zone_id === zone.id && i.status !== 'resolved'
            );

            return (
              <g
                key={zone.id}
                onClick={() => {
                  setSelectedZoneId(zone.id);
                  setInspectZone({ zone, reading });
                }}
                className="cursor-pointer transition-all duration-300 group"
              >
                {/* Zone Polygon */}
                <path
                  d={svgData.d}
                  fill={color.fill}
                  stroke={isSelected ? '#FFFFFF' : color.stroke}
                  strokeWidth={isSelected ? 3.5 : isCritical ? 3 : 1.5}
                  filter={isCritical ? 'url(#criticalGlow)' : undefined}
                  className={`transition-all duration-300 ${
                    isCritical ? 'animate-pulse' : 'hover:brightness-125'
                  }`}
                />

                {/* Zone Label & Simple People Count */}
                <text
                  x={svgData.labelPos.x}
                  y={svgData.labelPos.y - 5}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="700"
                  className="pointer-events-none drop-shadow-md select-none font-sans"
                >
                  {svgData.displayName}
                </text>

                {/* Percentage & Count (Friendly) */}
                <text
                  x={svgData.labelPos.x}
                  y={svgData.labelPos.y + 12}
                  textAnchor="middle"
                  fill={color.text}
                  fontSize="11"
                  fontWeight="700"
                  className="pointer-events-none drop-shadow-md select-none font-mono"
                >
                  {percentFull}% full ({formatNumber(count)})
                </text>

                {/* Incident Markers */}
                {zoneIncidents.map((inc, idx) => (
                  <g
                    key={inc.id}
                    transform={`translate(${svgData.labelPos.x - 12 + idx * 16}, ${
                      svgData.labelPos.y - 28
                    })`}
                    className="animate-bounce"
                  >
                    <circle cx="10" cy="10" r="10" fill="#FF1744" stroke="#FFFFFF" strokeWidth="1.5" />
                    {inc.incident_type === 'phone_theft' ? (
                      <Smartphone className="w-3 h-3 text-white translate-x-[4px] translate-y-[4px]" />
                    ) : inc.incident_type === 'medical' ? (
                      <HeartPulse className="w-3 h-3 text-white translate-x-[4px] translate-y-[4px]" />
                    ) : (
                      <ShieldAlert className="w-3 h-3 text-white translate-x-[4px] translate-y-[4px]" />
                    )}
                  </g>
                ))}
              </g>
            );
          })}
        </svg>

        {/* Modal on zone click */}
        {inspectZone && (
          <ZoneDetailModal
            zone={inspectZone.zone}
            reading={inspectZone.reading}
            onClose={() => setInspectZone(null)}
          />
        )}
      </div>
    </div>
  );
};
