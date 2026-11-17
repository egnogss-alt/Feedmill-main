import { AlertSeverity, PartSeed, Reading, ThresholdMap, Thresholds } from '../types';
import { sampleParts } from '../data/sample-data';
import { deriveReadingStatus } from './status';
import { hashSeed, makeRandom } from './history';

/** How often AppContext drives the live simulation, in seconds. */
export const SIM_TICK_SECONDS = 3;

/** Per-tick jitter: share of the full scale one reading may move by. */
const JITTER_FRACTION = 0.015;
/** Per-tick bias for readings flagged with an up/down trend - the "slight drift". */
const TREND_FRACTION = 0.002;
/** Pull per tick back towards the seeded opening value, so drift never runs away. */
const MEAN_REVERSION = 0.1;
/** Keep jittered values this far (share of the band) below the next limit. */
const BAND_MARGIN = 0.01;

/**
 * Opening values per reading id, used as the anchor for mean reversion. The
 * demo therefore hovers around its scripted scenario instead of wandering off
 * over a long session, and Reset Demo starts the exact same sequence again.
 */
const openingValues: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (const seed of sampleParts) {
    for (const reading of seed.readings) map[reading.id] = reading.value;
  }
  return map;
})();

/**
 * One reading for one tick: bounded jitter plus trend bias plus a gentle pull
 * back to the opening value, then clamped INSIDE the band the value is already
 * in. A healthy reading can therefore never creep into the warning band and a
 * warning can never creep into critical - only an explicit demo scenario or a
 * threshold edit may ever cross a limit (see AppContext.applyScenario).
 */
const jitterReading = (reading: Reading, thresholds: ThresholdMap, tick: number): Reading => {
  const limits: Thresholds = thresholds[reading.kind];
  const status = deriveReadingStatus(reading.value, reading.kind, thresholds);
  const scale = limits.max - limits.min;

  let low: number;
  let high: number;
  if (status === 'critical') {
    low = limits.critical;
    high = limits.max;
  } else if (status === 'warning') {
    low = limits.warning;
    high = limits.critical - Math.max((limits.critical - limits.warning) * BAND_MARGIN, 0);
  } else {
    low = limits.min;
    high = limits.warning - Math.max((limits.warning - limits.min) * BAND_MARGIN, 0);
  }
  if (!(high > low)) return reading; // Degenerate band: leave the value alone.

  const anchor = openingValues[reading.id] ?? reading.value;
  const random = makeRandom(hashSeed(`${reading.id}:${tick}`));
  const jitter = (random() - 0.5) * 2 * scale * JITTER_FRACTION;
  const drift =
    reading.trend === 'up' ? scale * TREND_FRACTION : reading.trend === 'down' ? -scale * TREND_FRACTION : 0;
  const reversion = (anchor - reading.value) * MEAN_REVERSION;
  const next = Math.min(Math.max(reading.value + jitter + drift + reversion, low), high);

  let value = Number(next.toFixed(2));
  // Rounding to 2 decimals must never tip a value across a limit either.
  const limit = status === 'normal' ? limits.warning : status === 'warning' ? limits.critical : null;
  if (limit !== null && value >= limit) value = Math.max(low, Number((limit - 0.01).toFixed(2)));
  return { ...reading, value };
};

/**
 * One simulation tick over every sensor box:
 * - offline boxes report nothing, so values AND lastSeen stay frozen;
 * - parts pinned by an explicit demo scenario keep their scripted values;
 * - every other online reading jitters inside its current band and its
 *   lastSeen refreshes, which is what makes the gauges and trend charts live.
 *
 * Deterministic per (reading, tick): same seed data and tick count always
 * produce the same values - no Math.random anywhere in the demo.
 */
export const runSimulationTick = (
  seeds: PartSeed[],
  thresholds: ThresholdMap,
  scenarioOverrides: Record<string, AlertSeverity>,
  tick: number
): PartSeed[] => {
  const now = new Date().toISOString();
  return seeds.map((seed) => {
    // Offline boxes report nothing: values AND lastSeen stay frozen.
    if (!seed.isOnline) return seed;
    return {
      ...seed,
      // Pinned parts keep reporting (lastSeen refreshes) but their values stay
      // exactly where the demo scenario put them.
      lastSeen: now,
      readings: scenarioOverrides[seed.id]
        ? seed.readings
        : seed.readings.map((reading) => jitterReading(reading, thresholds, tick)),
    };
  });
};