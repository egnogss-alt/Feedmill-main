import { Thresholds } from '../types';

/**
 * Statuses a colour band can show. "offline" is a part/sensor state and is
 * never a band on the value scale.
 */
export type BandStatus = 'normal' | 'warning' | 'critical';

/** One colour band of the gauge, as clamped fractions of the scale. */
export interface GaugeBand {
  status: BandStatus;
  /** Band start: 0 = scale min, 1 = scale max. */
  from: number;
  /** Band end: always >= from. */
  to: number;
}

/**
 * Clamp a value onto its 0..1 position on the gauge scale. `max - min || 1`
 * keeps a degenerate scale (min === max) from producing NaN, and the outer
 * clamps pin out-of-range values to the scale ends so the needle never draws
 * past the semicircle.
 */
export const toFraction = (value: number, min: number, max: number): number =>
  Math.min(Math.max((value - min) / (max - min || 1), 0), 1);

/**
 * Point on the semicircle: fraction 0 = left end (min), 1 = right end (max),
 * 0.5 = top dead centre.
 */
export const polar = (cx: number, cy: number, radius: number, fraction: number) => {
  const angle = Math.PI * (1 - fraction);
  return { x: cx + radius * Math.cos(angle), y: cy - radius * Math.sin(angle) };
};

/**
 * SVG arc for a band between two scale fractions.
 *
 * The gauge is a semicircle, so a band can sweep at most 180 degrees (only
 * the full min..max band reaches it). The large-arc-flag must therefore
 * ALWAYS be 0: flag 1 asks the browser for the >180 degree arc on the
 * mirrored circle centre, which rendered wide bands (e.g. the default green
 * band covering 60% of the temperature scale) as broken loops. Exactly 180
 * degrees is the ambiguous midpoint where both candidate centres coincide,
 * so 0 is safe there too.
 */
export const arcPath = (
  cx: number,
  cy: number,
  radius: number,
  from: number,
  to: number
): string => {
  if (to - from <= 0.0005) return '';
  const start = polar(cx, cy, radius, from);
  const end = polar(cx, cy, radius, to);
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
};

/**
 * Green/Yellow/Red bands for a threshold set, as clamped scale fractions.
 * Single source the ArcGauge renders from, and therefore also what the
 * Threshold Configuration live preview draws while thresholds are edited.
 * Zero-width bands (warning = min, critical = max, warning = critical, or
 * thresholds dragged outside the scale) are dropped so no empty arc is drawn.
 */
export const gaugeBands = (thresholds: Thresholds): GaugeBand[] => {
  const { min, max, warning, critical } = thresholds;
  const bands: GaugeBand[] = [
    { status: 'normal', from: toFraction(min, min, max), to: toFraction(warning, min, max) },
    { status: 'warning', from: toFraction(warning, min, max), to: toFraction(critical, min, max) },
    { status: 'critical', from: toFraction(critical, min, max), to: toFraction(max, min, max) },
  ];
  return bands.filter((band) => band.to - band.from > 0.001);
};
