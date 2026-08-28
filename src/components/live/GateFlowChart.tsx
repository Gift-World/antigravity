// src/components/live/GateFlowChart.tsx
import React from 'react';
import { useAppStore } from '@/lib/store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ArrowDownRight, ArrowUpRight, AlertOctagon } from 'lucide-react';

export const GateFlowChart: React.FC = () => {
  const { scansPerMinuteByGate, events, activeEventId } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const zones = activeEvent.venue?.zones || [];

  const gateZones = zones.filter((z) => z.zone_type === 'entry_gate' || z.zone_type === 'exit_gate');

  const chartData = gateZones.map((gate) => {
    const rates = scansPerMinuteByGate[gate.id] || { in: 24, out: 3 };
    const isBottleneck = rates.in > 50;

    return {
      name: gate.name.split('(')[0].trim(),
      inFlow: rates.in,
      outFlow: rates.out,
      capacityRate: 60, // Max safe turnstile throughput per gate
      isBottleneck,
    };
  });

  const totalInPerMin = chartData.reduce((acc, curr) => acc + curr.inFlow, 0);
  const totalOutPerMin = chartData.reduce((acc, curr) => acc + curr.outFlow, 0);

  return (
    <div className="h-full flex flex-col p-4 bg-ag-surface rounded-[8px] border border-ag-border text-ag-text-primary">
      {/* Header Summary */}
      <div className="flex items-center justify-between pb-3 border-b border-ag-border mb-3">
        <div>
          <h4 className="font-display font-bold text-sm text-ag-text-primary flex items-center gap-2">
            GATE FLOW RATE & BOTTLENECK RADAR
          </h4>
          <p className="text-xs text-ag-text-secondary font-mono">
            Scans per minute across active stadium turnstiles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-ag-text-muted">Total Net Flow</span>
            <div className="font-display font-bold text-sm text-ag-green flex items-center justify-end gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> +{totalInPerMin - totalOutPerMin} /min
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex-1 min-h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <XAxis dataKey="name" stroke="#55556A" fontSize={10} tickLine={false} />
            <YAxis stroke="#55556A" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#12121A',
                borderColor: '#2A2A35',
                borderRadius: '6px',
                fontSize: '11px',
              }}
              formatter={(value: any, name: string) => [
                `${value} scans/min`,
                name === 'inFlow' ? 'Ingress (In)' : 'Egress (Out)',
              ]}
            />
            <Legend
              verticalAlign="top"
              height={30}
              formatter={(value) => (value === 'inFlow' ? 'Ingress (In/min)' : 'Egress (Out/min)')}
            />
            <ReferenceLine y={60} stroke="#FF9100" strokeDasharray="3 3" label={{ value: 'Capacity Limit', fill: '#FF9100', fontSize: 9 }} />
            <Bar dataKey="inFlow" fill="#00E676" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="outFlow" fill="#448AFF" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottleneck Warning Flag */}
      {chartData.some((c) => c.isBottleneck) && (
        <div className="mt-2 p-2.5 rounded bg-ag-orange-dim border border-ag-orange/40 flex items-center gap-2.5 text-xs text-ag-orange">
          <AlertOctagon className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            <strong>Bottleneck Alert:</strong> High surge detected at Gate B (&gt;50 scans/min). Consider directing attendees to Gate C.
          </span>
        </div>
      )}
    </div>
  );
};
