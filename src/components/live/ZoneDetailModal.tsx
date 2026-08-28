// src/components/live/ZoneDetailModal.tsx
import React from 'react';
import { VenueZone, ZoneDensityReading } from '@/types/database';
import { getDensityColor, getRiskLabel } from '@/lib/density';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { X, TrendingUp, Users, Shield, Send, Radio, AlertTriangle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface ZoneDetailModalProps {
  zone: VenueZone;
  reading: ZoneDensityReading;
  onClose: () => void;
}

export const ZoneDetailModal: React.FC<ZoneDetailModalProps> = ({ zone, reading, onClose }) => {
  const { activeEventId, triggerAlert, createIncident, currentUser } = useAppStore();
  const color = getDensityColor(reading.density_per_sqm);
  const percentCapacity = Math.min(100, Math.round((reading.estimated_count / zone.capacity) * 100));

  // Generate 30-minute historical telemetry sparkline data
  const chartData = [
    { time: '-25m', density: Math.max(0.8, reading.density_per_sqm - 1.2), count: reading.estimated_count - 400 },
    { time: '-20m', density: Math.max(1.0, reading.density_per_sqm - 0.9), count: reading.estimated_count - 310 },
    { time: '-15m', density: Math.max(1.2, reading.density_per_sqm - 0.6), count: reading.estimated_count - 220 },
    { time: '-10m', density: Math.max(1.4, reading.density_per_sqm - 0.3), count: reading.estimated_count - 110 },
    { time: '-5m', density: Math.max(1.5, reading.density_per_sqm - 0.1), count: reading.estimated_count - 30 },
    { time: 'NOW', density: reading.density_per_sqm, count: reading.estimated_count },
  ];

  const handleOpenAuxiliaryExit = () => {
    triggerAlert({
      event_id: activeEventId,
      alert_type: 'gate_directive',
      zone_id: zone.id,
      message: `DIRECTIVE: Open auxiliary flow barriers at ${zone.name} immediately. Egress designated.`,
      severity: 'warning',
      target_audience: 'security',
      auto_generated: false,
      acknowledged_by: null,
      acknowledged_at: null,
    });
    onClose();
  };

  const handleDispatchSecurity = () => {
    createIncident({
      event_id: activeEventId,
      zone_id: zone.id,
      incident_type: 'crush_risk',
      severity: reading.density_per_sqm >= 4.5 ? 'high' : 'medium',
      title: `Surge Control Dispatched to ${zone.name}`,
      description: `Rapid response squad dispatched to monitor barrier pressure and alleviate bottlenecks.`,
      reported_by: currentUser.id,
      assigned_to: 'u3333333-3333-3333-3333-333333333333',
      status: 'responding',
    });
    onClose();
  };

  return (
    <div className="absolute top-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-ag-surface/95 border border-ag-border backdrop-blur-xl rounded-[8px] shadow-2xl p-4 z-40 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-ag-border pb-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-display font-bold text-base text-ag-text-primary">{zone.name}</h4>
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${color.badgeBg} ${color.badgeBorder} ${color.badgeText}`}
            >
              {getRiskLabel(reading.risk_level)}
            </span>
          </div>
          <p className="text-xs text-ag-text-secondary font-mono mt-0.5">
            Type: {zone.zone_type.replace('_', ' ').toUpperCase()} • Cap: {zone.capacity.toLocaleString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-ag-text-muted hover:text-ag-text-primary p-1 rounded hover:bg-ag-surface-hover"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-ag-black/50 p-2.5 rounded border border-ag-border">
          <div className="text-[10px] uppercase font-mono text-ag-text-muted">Density</div>
          <div className="font-display font-bold text-lg" style={{ color: color.stroke }}>
            {reading.density_per_sqm.toFixed(1)} <span className="text-xs text-ag-text-secondary">/m²</span>
          </div>
        </div>

        <div className="bg-ag-black/50 p-2.5 rounded border border-ag-border">
          <div className="text-[10px] uppercase font-mono text-ag-text-muted">Occupancy</div>
          <div className="font-display font-bold text-lg text-ag-text-primary">
            {reading.estimated_count.toLocaleString()}
          </div>
        </div>

        <div className="bg-ag-black/50 p-2.5 rounded border border-ag-border">
          <div className="text-[10px] uppercase font-mono text-ag-text-muted">Load %</div>
          <div className="font-display font-bold text-lg text-ag-blue">
            {percentCapacity}%
          </div>
        </div>
      </div>

      {/* 30-Minute Density Trend Chart */}
      <div className="mb-3 bg-ag-black/40 p-2 rounded border border-ag-border">
        <div className="flex items-center justify-between text-[10px] font-mono text-ag-text-secondary mb-1">
          <span className="flex items-center gap-1 font-semibold text-ag-text-primary">
            <TrendingUp className="w-3 h-3 text-ag-green" /> 30-Min Density Trend
          </span>
          <span className="text-ag-text-muted">Telemetry: BLE + Gate Ingress</span>
        </div>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="densityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color.stroke} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={color.stroke} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#55556A" fontSize={9} tickLine={false} />
              <YAxis domain={[0, 6]} stroke="#55556A" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#12121A',
                  borderColor: '#2A2A35',
                  borderRadius: '4px',
                  fontSize: '10px',
                }}
              />
              <Area
                type="monotone"
                dataKey="density"
                stroke={color.stroke}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#densityFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emergency Sector Action Directives */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] font-mono uppercase tracking-wider text-ag-text-muted">
          Tactical Directives
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDispatchSecurity}
            className="text-xs"
            leftIcon={<Shield className="w-3.5 h-3.5 text-ag-yellow" />}
          >
            Dispatch Squad
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={handleOpenAuxiliaryExit}
            className="text-xs"
            leftIcon={<Radio className="w-3.5 h-3.5" />}
          >
            Open Exit
          </Button>
        </div>
      </div>
    </div>
  );
};
