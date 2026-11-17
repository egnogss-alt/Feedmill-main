import { Reading, Thresholds, Trend } from '../types';

export type TrendRange = '24h' | '7d' | '30d';

export interface SeriesPoint {
  /** Epoch milliseconds, used as the chart x axis. */
  t: number;
  value: number;
}

/**
 * Windows for the trend chart toggle. Point counts are deliberately low: the
 * demo draws readable sparkline-style charts rather than dense log exports.
 */
export const TREND_RANGES: Record<TrendRange, { label: string; hours: number; points: number }> = {
  '24h': { label: '24h', hours: 24, points: 25 }, // hourly
  '7d': { label: '7d', hours: 24 * 7, points: 29 }, // 6-hourly
  '30d': { label: '30d', hours: 24 * 30, points: 31 }, // daily
};

export const TREND_RANGE_ORDER: TrendRange[] = ['24h', '7d', '30d'];

/** Stable 32-bit string hash (FNV-1a) so each reading gets its own fixed noise. */
export const hashSeed = (text: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

/** mulberry32: tiny deterministic PRNG. This is why there is no Math.random. */
export const makeRandom = (seed: number) => {
  let state = seed || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Ceiling the generated history is allowed to reach. A healthy reading never
 * wanders into the warning band and a warning never wanders into critical: only
 * an explicit demo scenario is ever allowed to cross a threshold.
 */
const historyCeiling = (endValue: number, thresholds: Thresholds): number => {
  const { min, max, warning, critical } = thresholds;
  if (endValue >= critical) return max;
  if (endValue >= warning) return critical - (critical - warning) * 0.05;
  return warning - (warning - min) * 0.02;
};

/** Where the window starts, based on the reading's direction of travel. */
const startValue = (endValue: number, trend: Trend, floor: number): number => {
  const factor = trend === 'up' ? 0.78 : trend === 'down' ? 1.12 : 1;
  return Math.max(endValue * factor, floor);
};

/**
 * Deterministic series for one reading over the requested window, ending on the
 * reading's current value. The same reading and range always produce the same
 * shape, so the demo looks identical on every reload. The Pellet Press main
 * bearing is the part that visibly drifts upward, because its readings are
 * flagged with an "up" trend in the sample data.
 */
export const buildSeries = (
  reading: Reading,
  thresholds: Thresholds,
  range: TrendRange,
  now: number = Date.now()
): SeriesPoint[] => {
  const { hours, points } = TREND_RANGES[range];
  const ceiling = historyCeiling(reading.value, thresholds);
  const start = startValue(reading.value, reading.trend, thresholds.min);
  const amplitude = (ceiling - thresholds.min) * 0.035;
  const random = makeRandom(hashSeed(`${reading.id}:${range}`));
  const step = (hours * 60 * 60 * 1000) / (points - 1);

  return Array.from({ length: points }, (_, index) => {
    const fraction = index / (points - 1);
    const drift = start + (reading.value - start) * fraction;
    const noisy = drift + (random() - 0.5) * 2 * amplitude;
    const clamped = Math.min(Math.max(noisy, thresholds.min), ceiling);
    const isLast = index === points - 1;
    return {
      t: Math.round(now - (points - 1 - index) * step),
      // The window always ends exactly on the current value.
      value: isLast ? reading.value : Number(clamped.toFixed(2)),
    };
  });
};
