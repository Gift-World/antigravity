// src/components/live/AlertPanel.tsx
import React from 'react';
import { useAppStore } from '@/lib/store';
import { Alert } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  AlertTriangle,
  CheckCircle2,
  Bell,
  Shield,
  Stethoscope,
  Radio,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const AlertPanel: React.FC = () => {
  const { alerts, acknowledgeAlert, triggerAlert, activeEventId } = useAppStore();

  const handleQuickAction = (alert: Alert, actionType: string) => {
    acknowledgeAlert(alert.id);

    if (actionType === 'open_gate') {
      triggerAlert({
        event_id: activeEventId,
        alert_type: 'gate_directive',
        zone_id: alert.zone_id,
        message: `TACTICAL DIRECTIVE: Open relief holding gate at ${alert.zone_id ? 'sector' : 'all perimeters'} immediately.`,
        severity: 'warning',
        target_audience: 'security',
        auto_generated: false,
        acknowledged_by: null,
        acknowledged_at: null,
      });
    } else if (actionType === 'medical') {
      triggerAlert({
        event_id: activeEventId,
        alert_type: 'custom',
        zone_id: alert.zone_id,
        message: `MEDICAL DISPATCH: Red Cross trauma unit responding.`,
        severity: 'warning',
        target_audience: 'medical',
        auto_generated: false,
        acknowledged_by: null,
        acknowledged_at: null,
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-3.5 bg-ag-surface rounded-[8px] border border-ag-border text-ag-text-primary">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-ag-border mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-ag-red animate-pulse" />
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-ag-text-primary">
            LIVE TACTICAL ALERT STREAM
          </h4>
        </div>
        <span className="text-[11px] font-mono text-ag-text-secondary">
          {alerts.filter((a) => !a.acknowledged_at).length} Unacknowledged
        </span>
      </div>

      {/* Alerts Feed */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {alerts.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-ag-text-muted text-xs">
            <CheckCircle2 className="w-8 h-8 text-ag-green mb-2 opacity-60" />
            <span>All zones nominal. Zero safety breaches.</span>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';
            const isAcknowledged = Boolean(alert.acknowledged_at);

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-[6px] border transition-all duration-200 ${
                  isCritical
                    ? 'bg-ag-red-dim/20 border-ag-red/50 border-l-4 border-l-ag-red shadow-lg shadow-ag-red/10 animate-in zoom-in-95'
                    : isWarning
                    ? 'bg-ag-yellow-dim/20 border-ag-yellow/40 border-l-4 border-l-ag-yellow'
                    : 'bg-ag-black/50 border-ag-border border-l-4 border-l-ag-blue'
                } ${isAcknowledged ? 'opacity-60' : ''}`}
              >
                {/* Top status line */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={isCritical ? 'red' : isWarning ? 'yellow' : 'blue'}
                      pulse={!isAcknowledged && (isCritical || isWarning)}
                      size="sm"
                    >
                      {alert.alert_type.replace('_', ' ')}
                    </Badge>
                    {alert.auto_generated && (
                      <span className="text-[9px] font-mono text-ag-text-muted border border-ag-border px-1 py-0.2 rounded bg-ag-black">
                        AUTO-RADAR
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-ag-text-muted shrink-0">
                    {new Date(alert.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>

                {/* Message Body */}
                <p className="text-xs font-medium text-ag-text-primary leading-relaxed mb-2.5">
                  {alert.message}
                </p>

                {/* Tactical Actions & Acknowledge */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-ag-border/50">
                  <div className="flex items-center gap-1.5">
                    {alert.alert_type.includes('density') || alert.alert_type.includes('capacity') ? (
                      <button
                        onClick={() => handleQuickAction(alert, 'open_gate')}
                        className="text-[11px] font-semibold text-ag-orange hover:text-white bg-ag-orange-dim hover:bg-ag-orange/30 border border-ag-orange/30 px-2 py-1 rounded transition-colors"
                      >
                        ⚡ Open Relief Gate
                      </button>
                    ) : alert.alert_type.includes('theft') ? (
                      <button
                        onClick={() => handleQuickAction(alert, 'security')}
                        className="text-[11px] font-semibold text-ag-yellow hover:text-white bg-ag-yellow-dim hover:bg-ag-yellow/30 border border-ag-yellow/30 px-2 py-1 rounded transition-colors"
                      >
                        🛡️ Dispatch Security
                      </button>
                    ) : (
                      <button
                        onClick={() => handleQuickAction(alert, 'medical')}
                        className="text-[11px] font-semibold text-ag-blue hover:text-white bg-ag-blue-dim hover:bg-ag-blue/30 border border-ag-blue/30 px-2 py-1 rounded transition-colors"
                      >
                        📢 Push Directive
                      </button>
                    )}
                  </div>

                  {!isAcknowledged ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-[11px] h-7 px-2.5 bg-ag-surface border-ag-border hover:bg-ag-surface-hover"
                    >
                      Acknowledge
                    </Button>
                  ) : (
                    <span className="text-[10px] font-mono text-ag-green flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ack by Lead
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
