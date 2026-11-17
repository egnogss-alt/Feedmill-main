import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight, Radio, RefreshCw, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FlowStrip } from '../components/flow-strip/FlowStrip';
import { MachineCard } from '../components/machine-card/MachineCard';
import { StatusBadge } from '../components/status-badge/StatusBadge';
import { SimulateButtons } from '../components/simulate/SimulateButtons';
import { AlertCard } from '../components/alert-card/AlertCard';

export const Home = () => {
  const { facility, sections, machines, alerts } = useApp();
  const [activeSection, setActiveSection] = useState<string | undefined>(undefined);
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  const displayedSections = activeSection
    ? sections.filter((s) => s.id === activeSection)
    : sections;

  return (
    <div className="space-y-6">
      {/* 1. Facility Status Banner & Live Summary Strip */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-content">{facility.name}</h2>
            <p className="text-xs text-content-muted">Production Plant Status & Condition Summary</p>
          </div>
          <StatusBadge status={facility.status} size="lg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted p-3">
                      <Radio className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-[11px] font-medium text-content-muted">Simulated Sensor Boxes</p>
                        <p className="text-base font-semibold tabular-nums text-content">
                          {facility.sensorBoxesOnline.online} / {facility.sensorBoxesOnline.total}
                        </p>
                      </div>
                    </div>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted p-3">
            <RefreshCw className="h-5 w-5 text-content-muted shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-content-muted">Last System Sync</p>
              <p className="text-base font-semibold tabular-nums text-content">
                {facility.lastSync}s ago
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted p-3">
            <Bell className="h-5 w-5 text-status-warning shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-content-muted">Active Alerts</p>
              <p className="text-base font-semibold tabular-nums text-content">
                {facility.alertCount.unacknowledged} unacknowledged
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 2. Active Alert Banner with link to /alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <section className="rounded-xl border border-status-warning/30 bg-status-warning/10 p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-status-warning shrink-0" />
              <h3 className="text-sm font-semibold text-content">
                Active Alerts ({unacknowledgedAlerts.length})
              </h3>
            </div>
            <Link
              to="/alerts"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View all alerts
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {unacknowledgedAlerts.slice(0, 3).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Production Flow Strip */}
      <section className="rounded-xl border border-border bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-content">Production Flow</h3>
          {activeSection && (
            <button
              type="button"
              onClick={() => setActiveSection(undefined)}
              className="text-xs text-primary hover:underline font-medium"
            >
              Clear filter
            </button>
          )}
        </div>
        <FlowStrip
          sections={sections}
          onSectionClick={setActiveSection}
          activeSectionId={activeSection}
        />
      </section>

      {/* 4. Machine Cards grouped by Section in flow order: section groups are
          the cells of a responsive grid - 1 column below 768px, 2 from 768px,
          3 from 1280px - reading in production-flow order. */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayedSections.map((section) => {
          const sectionMachines = machines.filter((m) => m.sectionId === section.id);
          return (
            <div key={section.id} className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={section.status} size="sm" />
                  <h3 className="text-base font-semibold text-content">{section.name}</h3>
                  <span className="text-xs text-content-muted">
                    ({sectionMachines.length} {sectionMachines.length === 1 ? 'machine' : 'machines'})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {sectionMachines.map((machine) => (
                  <MachineCard key={machine.id} machine={machine} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* 5. Simulation Controls */}
      <SimulateButtons />
    </div>
  );
};