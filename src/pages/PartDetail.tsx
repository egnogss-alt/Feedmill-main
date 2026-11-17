import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, WifiOff, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/status-badge/StatusBadge';
import { ArcGauge } from '../components/gauge/ArcGauge';
import { TrendChart } from '../components/trend-chart/TrendChart';
import { AlertCard } from '../components/alert-card/AlertCard';

export const PartDetail = () => {
  const { partId } = useParams<{ partId: string }>();
  const { parts, machines, sections, alerts, thresholds } = useApp();

  const part = parts.find((p) => p.id === partId);
  const machine = machines.find((m) => m.id === part?.machineId);
  const section = sections.find((s) => s.id === part?.sectionId);

  const [selectedReadingId, setSelectedReadingId] = useState<string | null>(null);

  if (!part) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center">
        <h2 className="text-lg font-semibold text-content">Part not found</h2>
        <p className="mt-1 text-xs text-content-muted">
          The requested part does not exist in the current system configuration.
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

  const activeReading =
    part.readings.find((r) => r.id === selectedReadingId) ?? part.readings[0];
  const partAlerts = alerts.filter((a) => a.partId === partId);
  const formattedLastSeen = new Date(part.lastSeen).toLocaleString();

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumb & Status */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <div className="mb-3">
          <Link
            to={`/equipment/${part.machineId}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {machine?.name ?? 'Machine'}
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-content-muted">
              <span>{section?.name}</span>
              <span aria-hidden="true">&gt;</span>
              <span>{machine?.name}</span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-content sm:text-2xl">
              {part.name}
            </h1>
          </div>
          <StatusBadge status={part.status} size="lg" />
        </div>

        <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-3 text-xs">
          {part.isOnline ? (
            <div className="inline-flex items-center gap-1.5 font-medium text-status-normal">
              <span className="h-2 w-2 rounded-full bg-status-normal" />
              Sensor Box Online · Connected
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 font-medium text-status-offline">
              <WifiOff className="h-4 w-4" />
              Sensor Box Offline · Telemetry Stale
            </div>
          )}

          <div className="flex items-center gap-1 text-content-muted">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {part.isOnline ? 'Last sync: ' : 'Last seen: '}
              <span className="font-medium text-content">{formattedLastSeen}</span>
            </span>
          </div>

          {!part.isOnline && (
            <span className="rounded-md bg-status-offline/10 border border-status-offline/30 px-2 py-0.5 text-[11px] font-medium text-status-offline">
              Showing last-known readings
            </span>
          )}
        </div>
      </section>
      
      {/* 2. Telemetry Gauges Grid */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-semibold text-content">
            {part.isOnline ? 'Live Telemetry Readings' : 'Last-Known Telemetry Readings'}
          </h2>
          <p className="text-xs text-content-muted">
            Click any gauge to inspect historical trend data below
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {part.readings.map((reading) => {
            const isSelected = reading.id === activeReading?.id;
            return (
              <div
                key={reading.id}
                onClick={() => setSelectedReadingId(reading.id)}
                className={`cursor-pointer rounded-xl border p-2 transition-all ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-surface-muted/50'
                    : 'border-border bg-surface hover:border-border-strong'
                }`}
              >
                <ArcGauge
                  reading={reading}
                  thresholds={thresholds[reading.kind]}
                  size={148}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Interactive TrendChart (24h / 7d / 30d) */}
      {activeReading && (
        <section className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-3">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-semibold text-content">
              Trend Analysis: {activeReading.name}
            </h2>
            <p className="text-xs text-content-muted">
              Historical performance curve with live warning and critical limit markers
            </p>
          </div>

          <TrendChart
            reading={activeReading}
            thresholds={thresholds[activeReading.kind]}
          />
        </section>
      )}

      {/* 4. Part Alert History */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-semibold text-content">Alert History</h2>
            <p className="text-xs text-content-muted">
              Past incidents and unacknowledged alerts for {part.name}
            </p>
          </div>
          <span className="text-xs font-semibold tabular-nums text-content-muted">
            {partAlerts.length} total
          </span>
        </div>

        {partAlerts.length > 0 ? (
          <div className="space-y-2">
            {partAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-content-muted">
            No active or historical alerts recorded for this component.
          </div>
        )}
      </section>
    </div>
  );
};