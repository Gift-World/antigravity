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
import { ArrowDownLeft, ArrowUpRight, AlertOctagon, Radio } from 'lucide-react';

export const GateFlowChart: React.FC = () => {
  const { scansPerMinuteByGate, events, activeEventId } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  // Specific 4 gates: Gate A, Gate B, Gate C, Gate D
  const gatesConfig = [
    { id: 'z1111111-1111-1111-1111-111111111111', name: 'Gate A (North)' },
    { id: 'z2222222-2222-2222-2222-222222222222', name: 'Gate B (East)' },
    { id: 'z3333333-3333-3333-3333-333333333333', name: 'Gate C (South)' },
    { id: 'z4444444-4444-4444-4444-444444444444', name: 'Gate D (VIP)' },
  ];

  const chartData = gatesConfig.map((gate) => {
    const rates = scansPerMinuteByGate[gate.id] || { in: 38, out: 4 };
    const isBottleneck = rates.in > 55;

    return {
      name: gate.name,
      inFlow: rates.in,
      outFlow: rates.out,
      isBottleneck,
    };
  });

  const totalInPerMin = chartData.reduce((acc, curr) => acc + curr.inFlow, 0);
  const totalOutPerMin = chartData.reduce((acc, curr) => acc + curr.outFlow, 0);

  return (
    <div className="h-full flex flex-col p-3.5 bg-ag-surface rounded-[8px] border border-ag-border text-ag-text-primary">
      {/* Header Summary */}
      <div className="flex items-center justify-between pb-2.5 border-b border-ag-border mb-3">
        <div>
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-ag-text-primary flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-ag-green" />
            <span>GATE FLOW VELOCITY (SCANS / MIN)</span>
          </h4>
          <p className="text-[11px] text-ag-text-secondary font-mono">
            Active Stadium Turnstiles A, B, C, D
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-ag-text-muted uppercase">Total Ingress</span>
            <div className="font-display font-bold text-sm text-ag-green flex items-center justify-end gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5" /> {totalInPerMin} /min
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-ag-text-muted uppercase">Total Egress</span>
            <div className="font-display font-bold text-sm text-ag-blue flex items-center justify-end gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> {totalOutPerMin} /min
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex-1 min-h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <XAxis dataKey="name" stroke="#8888A0" fontSize={10} tickLine={false} />
            <YAxis stroke="#8888A0" fontSize={10} tickLine={false} />
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
              formatter={(value) => (value === 'inFlow' ? 'Ingress (In)' : 'Egress (Out)')}
            />
            <ReferenceLine y={60} stroke="#FF9100" strokeDasharray="3 3" label={{ value: 'Capacity Limit', fill: '#FF9100', fontSize: 9 }} />
            <Bar dataKey="inFlow" fill="#00E676" radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Bar dataKey="outFlow" fill="#448AFF" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottleneck Warning Flag */}
      {chartData.some((c) => c.isBottleneck) && (
        <div className="mt-2 p-2.5 rounded bg-ag-orange-dim border border-ag-orange/40 flex items-center gap-2 text-xs text-ag-orange">
          <AlertOctagon className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            <strong>Bottleneck Alert:</strong> High surge detected (&gt;55 scans/min). Direct incoming crowd to Gate C.
          </span>
        </div>
      )}
    </div>
  );
};
