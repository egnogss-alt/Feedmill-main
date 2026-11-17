import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import { ReadingWithStatus, Thresholds } from '../../types';
import { TREND_RANGES, TREND_RANGE_ORDER, TrendRange, buildSeries } from '../../utils/history';
import { statusCssVar, statusLabels } from '../../lib/statusStyles';

interface TrendChartProps {
  reading: ReadingWithStatus;
  thresholds: Thresholds;
}

interface ChartTooltipProps {
  unit: string;
  formatTick: (t: number) => string;
  active?: boolean;
  payload?: { value?: number; payload?: { t: number } }[];
}

const ChartTooltip = ({ active, payload, unit, formatTick }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  return (
    <div className="rounded-lg border border-border bg-surface px-2 py-1 text-xs shadow-lg">
      <p className="text-content-muted">{point.payload ? formatTick(point.payload.t) : ''}</p>
      <p className="font-medium text-content tabular-nums">
        {point.value} {unit}
      </p>
    </div>
  );
};

const tickFormatterFor = (range: TrendRange) => (t: number) => {
  const date = new Date(t);
  if (range === '24h') return format(date, 'HH:mm');
  if (range === '7d') return format(date, 'EEE HH:mm');
  return format(date, 'd MMM');
};

/**
 * Reading history over 24h / 7d / 30d from the seeded series generator, with
 * dashed warning and critical lines taken from the live thresholds.
 */
export const TrendChart = ({ reading, thresholds }: TrendChartProps) => {
  const [range, setRange] = useState<TrendRange>('24h');
  // Anchored to mount, then re-anchored whenever the live simulator moves the
  // value, so the newest point always sits at the right edge with a fresh
  // timestamp while history stays put between ticks.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
  }, [reading.value]);

  const series = useMemo(
    () => buildSeries(reading, thresholds, range, now),
    [reading, thresholds, range, now]
  );

  const formatTick = tickFormatterFor(range);
  const axisTick = { fontSize: 11, fill: 'hsl(var(--text-muted))' };
  const warningColor = 'hsl(var(--status-warning))';
  const criticalColor = 'hsl(var(--status-critical))';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex rounded-lg border border-border bg-surface p-0.5"
          role="group"
          aria-label="Trend range"
        >
          {TREND_RANGE_ORDER.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              aria-pressed={range === option}
              className={[
                'min-h-[36px] rounded-md px-3 text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                range === option
                  ? 'bg-primary text-primary-foreground'
                  : 'text-content-muted hover:text-content',
              ].join(' ')}
            >
              {TREND_RANGES[option].label}
            </button>
          ))}
        </div>
        <p className="text-xs text-content-muted">
          <span className="tabular-nums">
            {reading.value} {reading.unit}
          </span>{' '}
          · {statusLabels[reading.status]}
        </p>
      </div>

      <div
        className="h-56 w-full"
        role="img"
        aria-label={`${reading.name} over the last ${TREND_RANGES[range].label}: now ${reading.value} ${reading.unit}, warning from ${thresholds.warning} ${reading.unit}, critical from ${thresholds.critical} ${reading.unit}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="t"
              tickFormatter={formatTick}
              tick={axisTick}
              minTickGap={28}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[thresholds.min, thresholds.max]}
              tick={axisTick}
              width={46}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip unit={reading.unit} formatTick={formatTick} />} />
            <ReferenceLine
              y={thresholds.warning}
              stroke={warningColor}
              strokeDasharray="4 4"
              label={{ value: 'Warning', position: 'insideTopRight', fontSize: 10, fill: warningColor }}
            />
            <ReferenceLine
              y={thresholds.critical}
              stroke={criticalColor}
              strokeDasharray="4 4"
              label={{
                value: 'Critical',
                position: 'insideTopRight',
                fontSize: 10,
                fill: criticalColor,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={statusCssVar[reading.status]}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
