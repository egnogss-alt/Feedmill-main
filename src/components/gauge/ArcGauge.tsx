import { ReadingWithStatus, Thresholds } from '../../types';
import { arcPath, gaugeBands, polar, toFraction } from '../../utils/gaugeGeometry';
import {
  statusCssVar,
  statusLabels,
  statusStrokeClass,
  statusTextClass,
  trendIcons,
  trendLabels,
} from '../../lib/statusStyles';

interface ArcGaugeProps {
  reading: ReadingWithStatus;
  thresholds: Thresholds;
  /** Width in px. The arc is a half circle, so the height is about half this. */
  size?: number;
}

/**
 * Semi-circular gauge: green/yellow/red bands come from the LIVE thresholds, a
 * needle marks the current value, and the status is always written out as text
 * as well as coloured.
 */
export const ArcGauge = ({ reading, thresholds, size = 180 }: ArcGaugeProps) => {
  const { name, value, unit, status, trend } = reading;
  const { min, max, warning, critical } = thresholds;

  const valueFraction = toFraction(value, min, max);
  const pad = 12;
  const radius = size / 2 - pad;
  const cx = size / 2;
  const cy = radius + pad;
  const height = cy + 34;

  // Same band geometry the Threshold Configuration live preview renders while
  // thresholds are edited.
  const bands = gaugeBands(thresholds);

  const needleStart = polar(cx, cy, radius * 0.22, valueFraction);
  const needleEnd = polar(cx, cy, radius - 14, valueFraction);
  const TrendIcon = trendIcons[trend];

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={height}
        viewBox={`0 0 ${size} ${height}`}
        role="img"
        aria-label={`${name}: ${value} ${unit}. ${statusLabels[status]}. Warning from ${warning} ${unit}, critical from ${critical} ${unit}. Trend ${trendLabels[
          trend
        ].toLowerCase()}.`}
      >
        {bands.map((band) => (
          <path
            key={band.status}
            d={arcPath(cx, cy, radius, band.from, band.to)}
            fill="none"
            strokeWidth={12}
            strokeLinecap="butt"
            className={statusStrokeClass[band.status]}
            aria-hidden="true"
          />
        ))}

        {/* Current value: a needle and hub in the live status colour. */}
        <line
          x1={needleStart.x}
          y1={needleStart.y}
          x2={needleEnd.x}
          y2={needleEnd.y}
          strokeWidth={3}
          strokeLinecap="round"
          style={{ stroke: statusCssVar[status] }}
          aria-hidden="true"
        />
        <circle
          cx={cx}
          cy={cy}
          r={6}
          strokeWidth={2}
          style={{ stroke: statusCssVar[status], fill: 'hsl(var(--surface))' }}
          aria-hidden="true"
        />

        {/* Scale ends. */}
        <text x={cx - radius} y={cy + 14} textAnchor="start" className="fill-content-muted text-[10px]">
          {min}
        </text>
        <text x={cx + radius} y={cy + 14} textAnchor="end" className="fill-content-muted text-[10px]">
          {max}
        </text>

        {/* Value and unit. */}
        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          className="fill-content text-[22px] font-semibold tabular-nums"
        >
          {value}
          <tspan dx="3" className="fill-content-muted text-[12px]">
            {unit}
          </tspan>
        </text>
      </svg>

      <div className="mt-1 text-center">
        <p className="text-sm font-medium text-content">{name}</p>
        <p
          className={`mt-0.5 inline-flex items-center gap-1 text-xs font-medium ${statusTextClass[status]}`}
        >
          <TrendIcon aria-hidden="true" className="h-3.5 w-3.5" />
          <span>{statusLabels[status]}</span>
          <span className="font-normal text-content-muted">· {trendLabels[trend]}</span>
        </p>
        <p className="mt-1 text-[11px] text-content-muted tabular-nums">
          Warning ≥ {warning} · Critical ≥ {critical} {unit}
        </p>
      </div>
    </div>
  );
};
