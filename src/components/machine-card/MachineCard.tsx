import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, ChevronRight, WifiOff } from 'lucide-react';
import { Machine } from '../../types';
import { useApp } from '../../context/AppContext';
import { worstReading } from '../../lib/readings';
import { MiniGauge } from '../gauge/MiniGauge';
import { StatusBadge } from '../status-badge/StatusBadge';

interface MachineCardProps {
  machine: Machine;
}

/**
 * Machine summary card: one status badge, counts, and a compact gauge per part.
 * The whole card is the tap target, so it behaves the same on Home and Machines.
 */
export const MachineCard = ({ machine }: MachineCardProps) => {
  const { thresholds } = useApp();
  const offlineParts = machine.parts.filter((part) => !part.isOnline).length;
  const onlineParts = machine.parts.length - offlineParts;
  const unacknowledged = machine.alertCount.unacknowledged;

  return (
    <Link
      to={`/equipment/${machine.id}`}
      className="flex flex-col rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-content">{machine.name}</h3>
          <p className="truncate text-xs text-content-muted">{machine.section}</p>
        </div>
        <StatusBadge status={machine.status} size="sm" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-content-muted">
        <span className="tabular-nums">
          {onlineParts}/{machine.parts.length} parts online
        </span>
        {offlineParts > 0 ? (
          <span className="inline-flex items-center gap-1 text-status-offline">
            <WifiOff aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="tabular-nums">{offlineParts} offline</span>
          </span>
        ) : null}
        {unacknowledged > 0 ? (
          <span className="inline-flex items-center gap-1 text-status-warning">
            <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="tabular-nums">
              {unacknowledged} unacknowledged alert{unacknowledged === 1 ? '' : 's'}
            </span>
          </span>
        ) : null}
      </div>

      <div className="mt-3 space-y-2 border-t border-border pt-3">
        {machine.parts.map((part) => {
          const reading = worstReading(part);
          const offline = !part.isOnline;

          return (
            <div key={part.id} className="flex items-center gap-2">
              <span className="max-w-[45%] shrink-0 break-words text-xs leading-tight text-content-muted">
                {part.name}
              </span>
              {offline || !reading ? (
                <span className="inline-flex min-w-0 flex-1 items-center gap-1 text-xs text-status-offline">
                  <WifiOff aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    Offline · last seen {formatDistanceToNow(new Date(part.lastSeen), { addSuffix: true })}
                  </span>
                </span>
              ) : (
                <MiniGauge reading={reading} thresholds={thresholds[reading.kind]} showName={false} />
              )}
            </div>
          );
        })}
      </div>

      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
        View equipment
        <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
};
