import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, ChevronRight, WifiOff } from 'lucide-react';
import { Part } from '../../types';
import { useApp } from '../../context/AppContext';
import { MiniGauge } from '../gauge/MiniGauge';
import { StatusBadge } from '../status-badge/StatusBadge';

interface PartCardProps {
  part: Part;
}

/**
 * Part card with one compact gauge per reading. An offline sensor box shows its
 * last contact instead of gauges, so stale values are never read as live ones.
 */
export const PartCard = ({ part }: PartCardProps) => {
  const { thresholds, machines } = useApp();
  const machine = machines.find((candidate) => candidate.id === part.machineId);
  const unacknowledged = part.alertCount.unacknowledged;

  return (
    <Link
      to={`/part/${part.id}`}
      className="flex flex-col rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-content">{part.name}</h3>
          <p className="truncate text-xs text-content-muted">
            {part.section} › {machine?.name ?? part.machineId}
          </p>
        </div>
        <StatusBadge status={part.status} size="sm" />
      </div>

      <div className="mt-3 border-t border-border pt-3">
        {part.isOnline ? (
          <div className="space-y-2">
            {part.readings.map((reading) => (
              <MiniGauge key={reading.id} reading={reading} thresholds={thresholds[reading.kind]} />
            ))}
          </div>
        ) : (
          <p className="inline-flex items-center gap-2 text-xs text-status-offline">
            <WifiOff aria-hidden="true" className="h-4 w-4 shrink-0" />
            Sensor box offline · last seen{' '}
            {formatDistanceToNow(new Date(part.lastSeen), { addSuffix: true })}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {unacknowledged > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs text-status-warning">
            <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="tabular-nums">
              {unacknowledged} unacknowledged alert{unacknowledged === 1 ? '' : 's'}
            </span>
          </span>
        ) : (
          <span className="text-xs text-content-muted">No open alerts</span>
        )}
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
          Readings and trend
          <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
};
