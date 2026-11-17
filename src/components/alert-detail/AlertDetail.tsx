import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, WifiOff, CheckCircle2, Clock, Send, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Alert } from '../../types';
import { formatDistanceToNow, format } from 'date-fns';
import { statusCssVar, statusIcons, statusLabels, statusTextClass } from '../../lib/statusStyles';

interface AlertDetailProps {
  alert: Alert;
}

export const AlertDetail = ({ alert }: AlertDetailProps) => {
  const { acknowledgeAlert, updateActionTaken, operators } = useApp();
  const [actionInput, setActionInput] = useState(alert.actionTaken ?? '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isConnectivity = alert.source === 'connectivity';
  const Icon = isConnectivity ? WifiOff : statusIcons[alert.type];
  const severityLabel = statusLabels[alert.type];
  const acknowledgedBy = operators.find((op) => op.id === alert.acknowledgedBy);

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    updateActionTaken(alert.id, actionInput.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAcknowledge = () => {
    acknowledgeAlert(alert.id, actionInput.trim() || undefined);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          to="/alerts"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-content-muted transition-colors hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Alert Log
        </Link>
        <span className="text-xs text-content-muted">Alert ID: {alert.id}</span>
      </div>

      <div
        className="rounded-xl border border-border border-l-4 bg-surface p-5 shadow-xs space-y-5"
        style={{ borderLeftColor: statusCssVar[alert.type] }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 rounded-lg p-2 ${
                alert.type === 'critical'
                  ? 'bg-status-critical/15 text-status-critical'
                  : 'bg-status-warning/15 text-status-warning'
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${statusTextClass[alert.type]}`}
                >
                  {severityLabel}
                </span>
                <span className="text-xs text-content-muted">·</span>
                <span className="text-xs font-medium text-content-muted capitalize">
                  {alert.source} Alert
                </span>
                <span className="text-xs text-content-muted">·</span>
                <span className="text-xs text-content-muted">
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })} (
                  {format(new Date(alert.timestamp), 'MMM d, yyyy HH:mm')})
                </span>
              </div>
              <h1 className="mt-1 text-lg font-bold text-content sm:text-xl">
                {alert.path}
              </h1>
              <p className="mt-1 text-sm text-content-muted">{alert.message}</p>
            </div>
          </div>

          <div className="shrink-0">
            {alert.acknowledged ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-status-normal/15 px-3 py-1 text-xs font-semibold text-status-normal">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Acknowledged
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-status-critical/15 px-3 py-1 text-xs font-semibold text-status-critical">
                <Clock className="h-3.5 w-3.5" />
                Unacknowledged
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-muted/50 p-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-content-muted mb-3">
            {isConnectivity ? 'Sensor Connectivity Data' : 'Telemetry vs Configured Thresholds'}
          </h2>
          {isConnectivity ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-surface p-3 border border-border">
                <span className="text-xs text-content-muted block">Connection Status</span>
                <span className="text-base font-bold text-status-offline flex items-center gap-1.5 mt-0.5">
                  <WifiOff className="h-4 w-4" /> Offline (Telemetry dropped)
                </span>
              </div>
              <div className="rounded-lg bg-surface p-3 border border-border">
                <span className="text-xs text-content-muted block">
                  Last-Known Reading ({alert.readingName})
                </span>
                <span className="text-base font-bold tabular-nums text-content mt-0.5 block">
                  {alert.readingValue} {alert.unit}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-surface p-3 border border-border">
                <span className="text-xs text-content-muted block">Recorded Reading</span>
                <span
                  className={`text-lg font-bold tabular-nums mt-0.5 block ${statusTextClass[alert.type]}`}
                >
                  {alert.readingValue} {alert.unit}
                </span>
                <span className="text-[11px] text-content-muted">{alert.readingName}</span>
              </div>
              <div className="rounded-lg bg-surface p-3 border border-border">
                <span className="text-xs text-content-muted block">
                  Trip Limit ({severityLabel})
                </span>
                <span className="text-lg font-bold tabular-nums text-content mt-0.5 block">
                  {alert.threshold} {alert.unit}
                </span>
                <span className="text-[11px] text-content-muted">Defined in system thresholds</span>
              </div>
              <div className="rounded-lg bg-surface p-3 border border-border">
                <span className="text-xs text-content-muted block">Deviation</span>
                <span className="text-lg font-bold tabular-nums text-status-critical mt-0.5 block">
                  +{(alert.readingValue - alert.threshold).toFixed(2)} {alert.unit}
                </span>
                <span className="text-[11px] text-content-muted">Beyond trip threshold</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-primary" />
              Likely Root Cause
            </h3>
            <p className="mt-2 text-sm font-medium text-content leading-relaxed">
              {alert.likelyCause}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Recommended Action
              </h3>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {alert.timeFrame}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-content leading-relaxed">
              {alert.recommendedAction}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface-muted/30 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-semibold text-content">Operator Resolution & Log</h3>
              <p className="text-xs text-content-muted">
                Document maintenance measures taken and acknowledge alert status
              </p>
            </div>

            {!alert.acknowledged && (
              <button
                type="button"
                onClick={handleAcknowledge}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <CheckCircle2 className="h-4 w-4" />
                Acknowledge Alert
              </button>
            )}
          </div>

          {alert.acknowledged && (
            <div className="rounded-lg bg-surface border border-border p-3 text-xs text-content-muted space-y-1">
              <div>
                <span className="font-semibold text-content">Acknowledged by: </span>
                {acknowledgedBy?.name ?? alert.acknowledgedBy ?? 'System Operator'}
              </div>
              {alert.acknowledgedAt && (
                <div>
                  <span className="font-semibold text-content">Acknowledged at: </span>
                  {format(new Date(alert.acknowledgedAt), 'MMM d, yyyy HH:mm:ss')} (
                  {formatDistanceToNow(new Date(alert.acknowledgedAt), { addSuffix: true })}
                  )
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSaveAction} className="space-y-3">
            <label
              htmlFor="action-taken-input"
              className="block text-xs font-semibold text-content"
            >
              Action Taken (Maintenance Note)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="action-taken-input"
                type="text"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="E.g., Re-greased bearing, inspected belt tension, verified vibration reduction..."
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
              />
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-content hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Send className="h-3.5 w-3.5" />
                Save Note
              </button>
            </div>
            {saveSuccess && (
              <p className="text-xs font-semibold text-status-normal">
                Action note successfully saved to alert record.
              </p>
            )}
          </form>
        </div>

        <footer className="rounded-lg border border-border-subtle bg-surface-muted/40 p-3 text-xs text-content-muted flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 text-content-muted mt-0.5" />
          <span>
            <strong>Operational Advisory:</strong> Threshold alerts reflect live mechanical and
            thermal sensor monitoring. Acknowledging alerts records audit metadata but does not
            substitute for physical inspection and preventive equipment maintenance.
          </span>
        </footer>
      </div>
    </div>
  );
};