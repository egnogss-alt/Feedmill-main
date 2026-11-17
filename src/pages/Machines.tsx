import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MachineCard } from '../components/machine-card/MachineCard';
import { StatusBadge } from '../components/status-badge/StatusBadge';
import { Machine, Status } from '../types';

type FilterOption = 'all' | Status;

/**
 * Match a machine against a status filter. "Sensor Offline" deliberately also
 * matches on parts: the rolled-up machine status (see utils/status.ts) never
 * reports offline while any part still reports, so a machine with one dropped
 * sensor box - Bucket Elevator / Boot Pulley Bearing - would otherwise never
 * land in this bucket. The other filters keep using the rolled-up status.
 */
const matchesFilter = (machine: Machine, filter: FilterOption): boolean => {
  if (filter === 'all') return true;
  if (filter === 'offline') {
    return machine.status === 'offline' || machine.parts.some((part) => !part.isOnline);
  }
  return machine.status === filter;
};

export const Machines = () => {
  const { sections, machines } = useApp();
  const [statusFilter, setStatusFilter] = useState<FilterOption>('all');

  const filterOptions: { id: FilterOption; label: string }[] = [
    { id: 'all', label: 'All Machines' },
    { id: 'critical', label: 'Critical' },
    { id: 'warning', label: 'Warning' },
    { id: 'offline', label: 'Sensor Offline' },
    { id: 'normal', label: 'Normal' },
  ];

  const getStatusCount = (filter: FilterOption) =>
    machines.filter((m) => matchesFilter(m, filter)).length;

  return (
    <div className="space-y-6">
      {/* Header and status filter pills */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-content-muted sm:text-sm">
            Equipment directory grouped by production section in process flow order
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface p-1">
          {filterOptions.map((option) => {
            const count = getStatusCount(option.id);
            const active = statusFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setStatusFilter(option.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-content-muted hover:text-content hover:bg-surface-hover'
                }`}
              >
                <span>{option.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums ${
                    active
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-surface-muted text-content-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections in Flow Order: each section group (heading plus its machine
          cards) is one cell of a responsive grid - 1 column below 768px, 2
          from 768px, 3 from 1280px - so the flow reads in production order
          while the cards fill the screen instead of stacking one per row. */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map((section) => {
          const sectionMachines = section.machines.filter((m) =>
            matchesFilter(m, statusFilter)
          );

          if (sectionMachines.length === 0) return null;

          return (
            <section key={section.id} className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2.5">
                  <StatusBadge status={section.status} size="sm" />
                  <h2 className="text-base font-semibold text-content">{section.name}</h2>
                  <span className="text-xs text-content-muted">
                    ({sectionMachines.length} {sectionMachines.length === 1 ? 'machine' : 'machines'})
                  </span>
                </div>
                {section.alertCount.unacknowledged > 0 && (
                  <span className="text-xs font-medium text-status-warning">
                    {section.alertCount.unacknowledged} active alert{section.alertCount.unacknowledged !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {sectionMachines.map((machine) => (
                  <MachineCard key={machine.id} machine={machine} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};