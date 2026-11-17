import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Bell, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AlertCard } from '../components/alert-card/AlertCard';
import { AlertDetail } from '../components/alert-detail/AlertDetail';

type SeverityFilter = 'all' | 'critical' | 'warning' | 'unacknowledged';

export const Alerts = () => {
  const { alertId } = useParams<{ alertId?: string }>();
  const { alerts, facility } = useApp();

  const [activeFilter, setActiveFilter] = useState<SeverityFilter>('all');

  // If alertId is present in URL, display AlertDetail
  const currentAlert = useMemo(() => {
    if (!alertId) return null;
    return alerts.find((a) => a.id === alertId) ?? null;
  }, [alertId, alerts]);

  // Filtered alert list
  const filteredAlerts = useMemo(() => {
    let list = [...alerts];
    if (activeFilter === 'critical') {
      list = list.filter((a) => a.type === 'critical');
    } else if (activeFilter === 'warning') {
      list = list.filter((a) => a.type === 'warning');
    } else if (activeFilter === 'unacknowledged') {
      list = list.filter((a) => !a.acknowledged);
    }
    // Severity-sorted: unacknowledged first, then critical over warning, then newest
    return list.sort((a, b) => {
      if (a.acknowledged !== b.acknowledged) {
        return a.acknowledged ? 1 : -1;
      }
      if (a.type !== b.type) {
        return a.type === 'critical' ? -1 : 1;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [alerts, activeFilter]);

  const counts = useMemo(() => {
    return {
      all: alerts.length,
      critical: alerts.filter((a) => a.type === 'critical').length,
      warning: alerts.filter((a) => a.type === 'warning').length,
      unacknowledged: alerts.filter((a) => !a.acknowledged).length,
    };
  }, [alerts]);

  // Render Alert Detail view if alertId matches
  if (currentAlert) {
    return <AlertDetail alert={currentAlert} />;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-surface p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-base font-semibold text-content">
              <Bell className="h-5 w-5 text-content-muted" />
              Active Alert Center
            </h1>
            <p className="mt-1 text-xs text-content-muted">
              Live anomaly notifications and unacknowledged sensor alarms across {facility.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-surface-muted px-3 py-1.5 text-center">
              <span className="block text-xs text-content-muted">Unacknowledged</span>
              <span className="text-sm font-bold tabular-nums text-status-critical">
                {counts.unacknowledged}
              </span>
            </div>
            <div className="rounded-lg bg-surface-muted px-3 py-1.5 text-center">
              <span className="block text-xs text-content-muted">Total in Log</span>
              <span className="text-sm font-bold tabular-nums text-content">{counts.all}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="text-xs font-semibold text-content-muted mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter:
          </span>

          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'border border-border bg-surface text-content hover:bg-surface-hover'
            }`}
          >
            All Alerts ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('unacknowledged')}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'unacknowledged'
                ? 'bg-status-critical text-white shadow-xs'
                : 'border border-border bg-surface text-content hover:bg-surface-hover'
            }`}
          >
            Unacknowledged ({counts.unacknowledged})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('critical')}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'critical'
                ? 'bg-status-critical text-white shadow-xs'
                : 'border border-border bg-surface text-content hover:bg-surface-hover'
            }`}
          >
            Critical ({counts.critical})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('warning')}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'warning'
                ? 'bg-status-warning text-white shadow-xs'
                : 'border border-border bg-surface text-content hover:bg-surface-hover'
            }`}
          >
            Warning ({counts.warning})
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-status-normal" />
            <p className="mt-2 text-sm font-semibold text-content">No matching alerts</p>
            <p className="mt-1 text-xs text-content-muted">
              All sensors matching the selected filter criteria are reporting within normal limits.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};