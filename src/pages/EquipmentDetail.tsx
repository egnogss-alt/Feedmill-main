import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PartCard } from '../components/part-card/PartCard';
import { StatusBadge } from '../components/status-badge/StatusBadge';
import { AlertCard } from '../components/alert-card/AlertCard';

export const EquipmentDetail = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const { machines, parts, sections, alerts } = useApp();

  const machine = machines.find((m) => m.id === machineId);
  const section = sections.find((s) => s.id === machine?.sectionId);

  if (!machine) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center">
        <h2 className="text-lg font-semibold text-content">Machine not found</h2>
        <p className="mt-1 text-xs text-content-muted">
          The machine ID does not exist in the current plant configuration.
        </p>
        <Link
          to="/machines"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Machines directory
        </Link>
      </div>
    );
  }

  const machineParts = parts.filter((p) => p.machineId === machineId);
  const machineAlerts = alerts.filter((a) => a.machineId === machineId && !a.acknowledged);

  return (
    <div className="space-y-6">
      {/* Machine Header */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <div className="mb-3">
          <Link
            to="/machines"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Machines
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-content sm:text-2xl">
              {machine.name}
            </h1>
            <p className="mt-0.5 text-xs text-content-muted">
              Section: <span className="font-medium text-content">{section?.name}</span> ·{' '}
              <span className="tabular-nums">{machineParts.length}</span> monitored parts
            </p>
          </div>
          <StatusBadge status={machine.status} size="lg" />
        </div>
      </section>

      {/* Active Alerts for this Machine */}
      {machineAlerts.length > 0 && (
        <section className="rounded-xl border border-status-warning/30 bg-status-warning/10 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-status-warning shrink-0" />
            <h2 className="text-sm font-semibold text-content">
              Active Alerts for this Equipment ({machineAlerts.length})
            </h2>
          </div>
          <div className="space-y-2">
            {machineAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      )}

      {/* Monitored Parts Grid */}
      <section className="space-y-3">
        <div className="border-b border-border pb-2">
          <h2 className="text-base font-semibold text-content">Monitored Parts</h2>
          <p className="text-xs text-content-muted">
            Condition overview and live miniature telemetry gauges for each component
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {machineParts.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      </section>
    </div>
  );
};