// src/components/live/CommandTicker.tsx
import React from 'react';
import { useAppStore } from '@/lib/store';
import { Shield, Radio, Activity, AlertTriangle, Users, Smartphone, HeartPulse } from 'lucide-react';

export const CommandTicker: React.FC = () => {
  const { events, activeEventId, densityReadings, incidents, alerts, scansPerMinuteByGate } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const peakDensity = Math.max(...densityReadings.map((r) => r.density_per_sqm), 0);
  const openIncidents = incidents.filter((i) => i.status !== 'resolved').length;
  const theftIncidents = incidents.filter((i) => i.incident_type === 'phone_theft' && i.status !== 'resolved').length;
  const medIncidents = incidents.filter((i) => i.incident_type === 'medical' && i.status !== 'resolved').length;

  const tickerItems = [
    {
      label: 'OVERALL STATUS',
      value: peakDensity >= 5.5 ? 'CRITICAL SURGE' : peakDensity >= 4.5 ? 'ELEVATED FLOW' : 'NOMINAL SAFE',
      icon: <Activity className="w-3 h-3 text-ag-green" />,
      color: peakDensity >= 5.5 ? 'text-ag-red font-bold' : peakDensity >= 4.5 ? 'text-ag-orange' : 'text-ag-green',
    },
    {
      label: 'GATE A INGRESS',
      value: `${scansPerMinuteByGate['z1111111-1111-1111-1111-111111111111']?.in || 48} /min`,
      icon: <Radio className="w-3 h-3 text-ag-blue" />,
      color: 'text-ag-blue',
    },
    {
      label: 'GATE B INGRESS',
      value: `${scansPerMinuteByGate['z2222222-2222-2222-2222-222222222222']?.in || 62} /min`,
      icon: <Radio className="w-3 h-3 text-ag-blue" />,
      color: 'text-ag-blue',
    },
    {
      label: 'PEAK DENSITY',
      value: `${peakDensity.toFixed(1)} people/m² (Main Floor North)`,
      icon: <Users className="w-3 h-3 text-ag-orange" />,
      color: peakDensity >= 4.5 ? 'text-ag-orange font-bold' : 'text-ag-text-primary',
    },
    {
      label: 'ACTIVE INCIDENTS',
      value: `${openIncidents} Active`,
      icon: <AlertTriangle className="w-3 h-3 text-ag-yellow" />,
      color: openIncidents > 0 ? 'text-ag-yellow' : 'text-ag-text-muted',
    },
    {
      label: 'GUARDIAN PHONE THEFT',
      value: `${theftIncidents} Reported`,
      icon: <Smartphone className="w-3 h-3 text-ag-red" />,
      color: theftIncidents > 0 ? 'text-ag-red' : 'text-ag-text-muted',
    },
    {
      label: 'PARAMEDIC DISPATCHES',
      value: `${medIncidents} Responding`,
      icon: <HeartPulse className="w-3 h-3 text-ag-red" />,
      color: medIncidents > 0 ? 'text-ag-red' : 'text-ag-text-muted',
    },
    {
      label: 'BLE MESH NODES',
      value: '1,420 Active Triangulations',
      icon: <Shield className="w-3 h-3 text-ag-green" />,
      color: 'text-ag-green',
    },
  ];

  return (
    <div className="h-9 bg-ag-black border-t border-ag-border flex items-center overflow-hidden px-4 text-xs font-mono select-none z-20">
      <div className="flex items-center gap-2 pr-4 border-r border-ag-border shrink-0 bg-ag-black z-10">
        <span className="w-2 h-2 rounded-full bg-ag-red animate-ping" />
        <span className="font-bold text-[10px] uppercase tracking-wider text-ag-text-primary">
          LIVE TELEMETRY
        </span>
      </div>

      <div className="flex items-center gap-8 animate-[marquee_25s_linear_infinite] whitespace-nowrap pl-4">
        {tickerItems.concat(tickerItems).map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 shrink-0">
            {item.icon}
            <span className="text-[10px] text-ag-text-secondary uppercase">{item.label}:</span>
            <span className={`text-[11px] font-semibold ${item.color}`}>{item.value}</span>
            <span className="text-ag-border ml-3">/</span>
          </div>
        ))}
      </div>
    </div>
  );
};
