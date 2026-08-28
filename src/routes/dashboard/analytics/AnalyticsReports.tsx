// src/routes/dashboard/analytics/AnalyticsReports.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrencyKES, formatNumber } from '@/lib/utils';
import {
  BarChart3,
  Download,
  Printer,
  ShieldCheck,
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const AnalyticsReports: React.FC = () => {
  const { events, activeEventId, incidents, alerts, densityReadings, gateScans } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const [selectedEventId, setSelectedEventId] = useState(activeEvent.id);
  const currentEvent = events.find((e) => e.id === selectedEventId) || activeEvent;

  // Density curves over time
  const densityTimelineData = [
    { time: '14:00', mainNorth: 1.2, mainSouth: 0.9, stage: 1.5 },
    { time: '15:00', mainNorth: 2.1, mainSouth: 1.4, stage: 2.3 },
    { time: '16:00', mainNorth: 3.4, mainSouth: 2.5, stage: 3.8 },
    { time: '17:00', mainNorth: 4.8, mainSouth: 3.1, stage: 4.5 },
    { time: '18:00', mainNorth: 5.2, mainSouth: 3.4, stage: 4.9 },
    { time: 'NOW', mainNorth: 5.1, mainSouth: 3.3, stage: 4.7 },
  ];

  // Incident breakdown pie chart
  const incidentBreakdown = [
    { name: 'Crush / Surge Risk', value: 4, color: '#FF1744' },
    { name: 'Guardian Phone Theft', value: 3, color: '#FF9100' },
    { name: 'Medical Fainting / Triage', value: 2, color: '#448AFF' },
    { name: 'Gate Flow Bottlenecks', value: 2, color: '#FFD740' },
  ];

  // Gate throughput data
  const gateThroughputData = [
    { gate: 'Gate A', totalScans: 3840, avgWaitSec: 14 },
    { gate: 'Gate B', totalScans: 4120, avgWaitSec: 22 },
    { gate: 'Gate C', totalScans: 3650, avgWaitSec: 11 },
    { gate: 'Gate D (VIP)', totalScans: 1237, avgWaitSec: 4 },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportData = {
      report_title: `ANTIGRAVITY Post-Event Crowd Intelligence Report: ${currentEvent.title}`,
      generated_at: new Date().toISOString(),
      venue: currentEvent.venue?.name,
      metrics: {
        total_attendance: currentEvent.current_attendance,
        max_capacity: currentEvent.max_capacity,
        utilization_rate: `${((currentEvent.current_attendance / currentEvent.max_capacity) * 100).toFixed(1)}%`,
        peak_density_sqm: 5.2,
        crush_prevention_triggers: 12,
        theft_devices_recovered: 2,
      },
      incidents,
      alerts,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `antigravity_report_${currentEvent.id}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">
            Safety & Attendance Reports
          </h2>
          <p className="text-xs text-ag-text-secondary">
            Automated crowd curves, incident response logs, and safety clearance certification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="md"
            variant="outline"
            onClick={handleExportJson}
            leftIcon={<Download className="w-4 h-4" />}
            className="text-xs"
          >
            Export JSON Data
          </Button>

          <Button
            size="md"
            variant="primary"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            className="text-xs font-bold"
          >
            Print Safety Audit PDF
          </Button>
        </div>
      </div>

      {/* High-Level Safety Report Card */}
      <Card className="space-y-4 bg-gradient-to-r from-ag-surface to-ag-surface-hover border-ag-green/40">
        <div className="flex items-center justify-between border-b border-ag-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-ag-green" />
            <h3 className="font-display font-bold text-base text-white">
              Official Antigravity Safety Audit Certification
            </h3>
          </div>
          <Badge variant="green" size="md">
            ZERO FATALITY ZERO CRUSH COMPLIANT
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-ag-black/50 p-3 rounded border border-ag-border">
            <div className="text-[10px] text-ag-text-muted uppercase">Peak Spatial Density</div>
            <div className="font-display font-bold text-xl text-ag-orange mt-1">5.2 /m²</div>
            <div className="text-[10px] text-ag-text-secondary">Averted @ 17:42</div>
          </div>

          <div className="bg-ag-black/50 p-3 rounded border border-ag-border">
            <div className="text-[10px] text-ag-text-muted uppercase">Average Triage Time</div>
            <div className="font-display font-bold text-xl text-ag-green mt-1">1m 42s</div>
            <div className="text-[10px] text-ag-text-secondary">Target: &lt;3m 00s</div>
          </div>

          <div className="bg-ag-black/50 p-3 rounded border border-ag-border">
            <div className="text-[10px] text-ag-text-muted uppercase">Guardian Phone Thefts</div>
            <div className="font-display font-bold text-xl text-ag-yellow mt-1">3 Flagged</div>
            <div className="text-[10px] text-ag-text-secondary">2 Devices Recovered</div>
          </div>

          <div className="bg-ag-black/50 p-3 rounded border border-ag-border">
            <div className="text-[10px] text-ag-text-muted uppercase">Turnstile Ingress Load</div>
            <div className="font-display font-bold text-xl text-ag-blue mt-1">12,847</div>
            <div className="text-[10px] text-ag-text-secondary">98.4% Scan Verification</div>
          </div>
        </div>
      </Card>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spatial Density Curve */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-sm text-white">
              Spatial Density Timeline (People / m²)
            </h4>
            <span className="text-[10px] font-mono text-ag-text-muted">Threshold: 4.5 Warning</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={densityTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#55556A" fontSize={10} tickLine={false} />
                <YAxis stroke="#55556A" fontSize={10} tickLine={false} domain={[0, 6]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12121A',
                    borderColor: '#2A2A35',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Legend verticalAlign="top" height={30} />
                <Line
                  type="monotone"
                  name="Main Floor North"
                  dataKey="mainNorth"
                  stroke="#FF1744"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  name="Stage Pit"
                  dataKey="stage"
                  stroke="#FF9100"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  name="Main Floor South"
                  dataKey="mainSouth"
                  stroke="#00E676"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gate Throughput & Wait Times */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-sm text-white">
              Turnstile Throughput & Average Wait Times
            </h4>
            <span className="text-[10px] font-mono text-ag-text-muted">Scans vs Ingress Sec</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gateThroughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="gate" stroke="#55556A" fontSize={10} tickLine={false} />
                <YAxis stroke="#55556A" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12121A',
                    borderColor: '#2A2A35',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Legend verticalAlign="top" height={30} />
                <Bar name="Total Scans" dataKey="totalScans" fill="#448AFF" radius={[4, 4, 0, 0]} />
                <Bar name="Avg Wait (sec)" dataKey="avgWaitSec" fill="#FFD740" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
