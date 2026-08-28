// src/components/live/VenueHeatmap.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getDensityColor, getRiskLevelFromDensity } from '@/lib/density';
import { VenueZone, ZoneDensityReading } from '@/types/database';
import { AlertTriangle, ShieldAlert, HeartPulse, Smartphone, ArrowUpRight, Maximize2 } from 'lucide-react';
import { ZoneDetailModal } from './ZoneDetailModal';

export const VenueHeatmap: React.FC = () => {
  const {
    events,
    activeEventId,
    densityReadings,
    incidents,
    selectedZoneId,
    setSelectedZoneId,
    scansPerMinuteByGate,
  } = useAppStore();

  const [inspectZone, setInspectZone] = useState<{ zone: VenueZone; reading: ZoneDensityReading } | null>(null);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const zones = activeEvent.venue?.zones || [];

  // SVG Zone polygon definitions (Layout mapped for Nyayo National Stadium)
  const zoneSVGMappings: Record<
    string,
    {
      d: string;
      labelPos: { x: number; y: number };
      type: string;
      iconType?: 'gate' | 'medical' | 'stage' | 'vip' | 'food';
    }
  > = {
    // Gate A (Main North)
    'c1111111-1111-1111-1111-111111111111': {
      d: 'M 180,30 L 320,30 L 300,75 L 200,75 Z',
      labelPos: { x: 250, y: 55 },
      type: 'Gate A',
      iconType: 'gate',
    },
    // Gate B (East Public)
    'c2222222-2222-2222-2222-222222222222': {
      d: 'M 720,160 L 780,180 L 780,300 L 720,280 Z',
      labelPos: { x: 750, y: 240 },
      type: 'Gate B',
      iconType: 'gate',
    },
    // Gate C (South Express)
    'c3333333-3333-3333-3333-333333333333': {
      d: 'M 720,320 L 780,340 L 780,440 L 720,420 Z',
      labelPos: { x: 750, y: 380 },
      type: 'Gate C',
      iconType: 'gate',
    },
    // Gate D (VIP / Artist Fast Track)
    'c4444444-4444-4444-4444-444444444444': {
      d: 'M 20,180 L 80,160 L 80,260 L 20,280 Z',
      labelPos: { x: 50, y: 220 },
      type: 'Gate D',
      iconType: 'gate',
    },
    // Stage & Front Barrier
    'c5555555-5555-5555-5555-555555555555': {
      d: 'M 310,85 L 490,85 L 470,145 L 330,145 Z',
      labelPos: { x: 400, y: 115 },
      type: 'Main Stage',
      iconType: 'stage',
    },
    // Main Floor North (Front Pit)
    'c6666666-6666-6666-6666-666666666666': {
      d: 'M 230,155 L 570,155 L 560,280 L 240,280 Z',
      labelPos: { x: 400, y: 215 },
      type: 'Main Floor North',
    },
    // Main Floor South (General Pitch)
    'c7777777-7777-7777-7777-777777777777': {
      d: 'M 235,290 L 565,290 L 550,425 L 250,425 Z',
      labelPos: { x: 400, y: 355 },
      type: 'Main Floor South',
    },
    // VIP Lounge East
    'c8888888-8888-8888-8888-888888888888': {
      d: 'M 580,155 L 700,165 L 690,280 L 570,280 Z',
      labelPos: { x: 635, y: 220 },
      type: 'VIP East',
      iconType: 'vip',
    },
    // VIP Lounge West & Skybox
    'c9999999-9999-9999-9999-999999999999': {
      d: 'M 100,165 L 220,155 L 230,280 L 110,280 Z',
      labelPos: { x: 165, y: 220 },
      type: 'VIP West',
      iconType: 'vip',
    },
    // Medical Post Alpha (Red Cross)
    'caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa': {
      d: 'M 100,300 L 210,300 L 205,375 L 95,375 Z',
      labelPos: { x: 150, y: 338 },
      type: 'Med Post Alpha',
      iconType: 'medical',
    },
    // Medical Post Bravo (Triage)
    'cbbbbbb0-bbbb-bbbb-bbbb-bbbbbbbbbbbb': {
      d: 'M 590,300 L 700,300 L 705,375 L 595,375 Z',
      labelPos: { x: 650, y: 338 },
      type: 'Med Post Bravo',
      iconType: 'medical',
    },
    // Food & Cashless Bar Court
    'ccccccc0-cccc-cccc-cccc-cccccccccccc': {
      d: 'M 240,435 L 560,435 L 540,490 L 260,490 Z',
      labelPos: { x: 400, y: 462 },
      type: 'Cashless Food Court',
      iconType: 'food',
    },
    // Emergency Exit 1 & 2
    'cdddddd0-dddd-dddd-dddd-dddddddddddd': {
      d: 'M 480,30 L 620,30 L 600,75 L 500,75 Z',
      labelPos: { x: 550, y: 55 },
      type: 'Emergency Exits',
      iconType: 'gate',
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
    <div className="relative w-full h-full flex flex-col bg-ag-surface/40 border border-ag-border rounded-[8px] overflow-hidden select-none">
      {/* Heatmap HUD Overlay Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-ag-surface/90 border-b border-ag-border backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-xs uppercase tracking-wider text-ag-text-primary flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-ag-green animate-ping" />
            STADIUM SPATIAL DENSITY RADAR
          </span>
          <span className="text-[11px] font-mono text-ag-text-secondary">
            Nyayo Stadium • 13 Active Mesh Sectors
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-ag-green">
            <span className="w-2 h-2 rounded-full bg-ag-green" /> &lt;3.0/m² SAFE
          </span>
          <span className="flex items-center gap-1 text-ag-yellow">
            <span className="w-2 h-2 rounded-full bg-ag-yellow" /> 3.0-4.5 ELEVATED
          </span>
          <span className="flex items-center gap-1 text-ag-orange">
            <span className="w-2 h-2 rounded-full bg-ag-orange" /> 4.5-5.5 WARNING
          </span>
          <span className="flex items-center gap-1 text-ag-red font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-ag-red" /> &gt;5.5 CRITICAL
          </span>
        </div>
      </div>

      {/* SVG Interactive Venue Map */}
      <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4 overflow-hidden bg-radial-dark">
        <svg
          viewBox="0 0 800 520"
          className="w-full h-full max-h-[580px] drop-shadow-2xl transition-all duration-300"
        >
          <defs>
            {/* Background Stadium Perimeter Ring Gradient */}
            <radialGradient id="stadiumTrack" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#12121A" stopOpacity="0.8" />
              <stop offset="95%" stopColor="#1A1A25" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2A2A35" stopOpacity="1" />
            </radialGradient>

            {/* Glowing filters for critical density surge zones */}
            <filter id="criticalGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Stadium Track Boundary */}
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

          {/* Running Track Oval */}
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

          {/* Sector Polygons */}
          {zones.map((zone) => {
            const svgData = zoneSVGMappings[zone.id];
            if (!svgData) return null;

            const reading = getReadingForZone(zone.id);
            const color = getDensityColor(reading.density_per_sqm);
            const isSelected = selectedZoneId === zone.id;
            const isCritical = reading.density_per_sqm >= 5.5;
            const isWarning = reading.density_per_sqm >= 4.5 && !isCritical;

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
                    isCritical
                      ? 'animate-pulse'
                      : 'hover:brightness-125'
                  }`}
                />

                {/* Zone Label & Density Metric */}
                <text
                  x={svgData.labelPos.x}
                  y={svgData.labelPos.y - 6}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontFamily="'Space Grotesk', sans-serif"
                  fontWeight="700"
                  className="pointer-events-none drop-shadow-md select-none"
                >
                  {svgData.type}
                </text>
                <text
                  x={svgData.labelPos.x}
                  y={svgData.labelPos.y + 11}
                  textAnchor="middle"
                  fill={color.text}
                  fontSize="10"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="700"
                  className="pointer-events-none drop-shadow-md select-none"
                >
                  {reading.density_per_sqm.toFixed(1)}/m² • {reading.estimated_count}
                </text>

                {/* Gate Flow badge for entry gates */}
                {scansPerMinuteByGate[zone.id] && (
                  <g transform={`translate(${svgData.labelPos.x - 28}, ${svgData.labelPos.y + 18})`}>
                    <rect
                      width="56"
                      height="14"
                      rx="3"
                      fill="#0A0A0F"
                      stroke="#448AFF"
                      strokeWidth="0.8"
                    />
                    <text
                      x="28"
                      y="10"
                      textAnchor="middle"
                      fill="#448AFF"
                      fontSize="8"
                      fontFamily="'JetBrains Mono', monospace"
                      fontWeight="600"
                    >
                      {scansPerMinuteByGate[zone.id].in} /min
                    </text>
                  </g>
                )}

                {/* Incident Markers on Zone */}
                {zoneIncidents.map((inc, idx) => (
                  <g
                    key={inc.id}
                    transform={`translate(${svgData.labelPos.x - 12 + idx * 16}, ${
                      svgData.labelPos.y - 26
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

        {/* Floating Quick Action Drawer trigger on zone select */}
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
