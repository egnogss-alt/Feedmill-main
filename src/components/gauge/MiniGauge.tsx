import { ReadingWithStatus, Thresholds } from '../../types';
import { statusBgClass, statusLabels, statusTextClass } from '../../lib/statusStyles';

interface MiniGaugeProps {
  reading: ReadingWithStatus;
  thresholds: Thresholds;
  /** Hide when the surrounding row already shows the reading name. */
  showName?: boolean;
}

/**
 * Compact gauge for card rows: a proportional green/yellow/red bar built from
 * the live thresholds, with a marker at the current value.
 */
export const MiniGauge = ({ reading, thresholds, showName = true }: MiniGaugeProps) => {
  const { name, value, unit, status } = reading;
  const { min, max, warning, critical } = thresholds;

  const toPercent = (input: number) =>
    Math.min(Math.max(((input - min) / (max - min || 1)) * 100, 0), 100);

  type MiniBand = { status: 'normal' | 'warning' | 'critical'; width: number };

  const allBands: MiniBand[] = [
    { status: 'normal', width: toPercent(warning) - toPercent(min) },
    { status: 'warning', width: toPercent(critical) - toPercent(warning) },
    { status: 'critical', width: toPercent(max) - toPercent(critical) },
  ];
  const bands = allBands.filter((band) => band.width > 0);

  return (
    <div className="flex items-center gap-2">
      {showName ? (
        <span className="w-24 shrink-0 truncate text-xs text-content-muted">{name}</span>
      ) : null}

      <span
        className="relative h-2 min-w-0 flex-1 rounded-full bg-surface-hover"
        role="img"
        aria-label={`${name}: ${value} ${unit}, ${statusLabels[status]}. Warning from ${warning}, critical from ${critical}.`}
      >
        <span className="absolute inset-0 flex overflow-hidden rounded-full" aria-hidden="true">
          {bands.map((band) => (
            <span
              key={band.status}
              className={`h-full shrink-0 ${statusBgClass[band.status]}`}
              style={{ width: `${band.width}%` }}
            />
          ))}
        </span>
        <span
          className={`absolute -top-0.5 h-3 w-[3px] rounded-full ring-2 ring-surface ${statusBgClass[status]}`}
          style={{ left: `calc(${toPercent(value)}% - 1.5px)` }}
          aria-hidden="true"
        />
      </span>

      <span
        className={`w-16 shrink-0 text-right text-xs font-medium tabular-nums ${statusTextClass[status]}`}
      >
        {value} {unit}
      </span>
    </div>
  );
};
