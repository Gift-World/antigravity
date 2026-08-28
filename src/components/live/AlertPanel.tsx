// src/components/live/AlertPanel.tsx
import React from 'react';
import { useAppStore } from '@/lib/store';
import { Alert } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Bell } from 'lucide-react';

export const AlertPanel: React.FC = () => {
  const { alerts, acknowledgeAlert } = useAppStore();

  return (
    <div className="h-full flex flex-col space-y-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-ag-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-ag-red animate-pulse" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-white">
            Live Alerts
          </h4>
        </div>
        <span className="text-xs text-ag-text-secondary">
          {alerts.filter((a) => !a.acknowledged_at).length} Active
        </span>
      </div>

      {/* Alerts Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {alerts.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-ag-text-muted text-xs">
            <CheckCircle2 className="w-8 h-8 text-ag-green mb-2 opacity-60" />
            <span>All zones safe. No active alerts.</span>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';
            const isAcknowledged = Boolean(alert.acknowledged_at);

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  isCritical
                    ? 'bg-ag-red-dim/20 border-ag-red/50 border-l-4 border-l-ag-red'
                    : isWarning
                    ? 'bg-ag-yellow-dim/20 border-ag-yellow/40 border-l-4 border-l-ag-yellow'
                    : 'bg-ag-black/50 border-ag-border border-l-4 border-l-ag-blue'
                } ${isAcknowledged ? 'opacity-60' : ''}`}
              >
                {/* Top status line */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <Badge
                    variant={isCritical ? 'red' : isWarning ? 'yellow' : 'blue'}
                    pulse={!isAcknowledged && (isCritical || isWarning)}
                    size="sm"
                  >
                    {alert.alert_type.replace('_', ' ').toUpperCase()}
                  </Badge>

                  <span className="text-[11px] text-ag-text-muted">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Body */}
                <p className="text-white text-xs leading-relaxed mb-2.5">{alert.message}</p>

                {/* Bottom Actions */}
                {!isAcknowledged ? (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-ag-border/50">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-xs h-8 px-3"
                    >
                      Got it
                    </Button>
                  </div>
                ) : (
                  <div className="text-[10px] text-ag-green font-medium flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Seen
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
