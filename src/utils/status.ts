import { ReadingKind, Status, ThresholdMap, Thresholds } from '../types';

// Severity ranking used by every status roll-up in the app.
// Roll-up rule (worst status wins): critical > warning > normal.
// "offline" is tracked separately and is NEVER ranked worse than a live fault,
// so a single offline sensor box cannot paint a healthy machine as critical.
export const STATUS_ORDER: Record<Status, number> = {
  normal: 0,
  warning: 1,
  critical: 2,
  offline: 3,
};

export const statusRank = (status: Status): number => STATUS_ORDER[status];

export const isWorse = (candidate: Status, current: Status): boolean =>
  statusRank(candidate) > statusRank(current);

/**
 * Worst status of a list of child statuses.
 * Offline children are excluded from the comparison; the parent only reports
 * "offline" when every child is offline. An empty list is "normal".
 */
export const worstStatus = (statuses: Status[]): Status => {
  const live = statuses.filter((status) => status !== 'offline');
  if (live.length === 0) return statuses.length > 0 ? 'offline' : 'normal';
  return live.reduce<Status>(
    (worst, status) => (isWorse(status, worst) ? status : worst),
    'normal'
  );
};

/** Number of children reporting offline, shown separately from the roll-up. */
export const countOffline = (statuses: Status[]): number =>
  statuses.filter((status) => status === 'offline').length;

/**
 * Single source of truth for reading status: a value plus its threshold band.
 * Offline is never a value-based status - it belongs to the part (sensor box).
 */
export const deriveStatus = (value: number, thresholds: Thresholds): Status => {
  if (value >= thresholds.critical) return 'critical';
  if (value >= thresholds.warning) return 'warning';
  return 'normal';
};

/** Convenience wrapper for code that holds the live threshold map. */
export const deriveReadingStatus = (
  value: number,
  kind: ReadingKind,
  thresholds: ThresholdMap
): Status => deriveStatus(value, thresholds[kind]);

/**
 * The limit a value crossed, used to explain an alert
 * ("85 dB against a warning limit of 80 dB").
 */
export const thresholdFor = (status: Status, thresholds: Thresholds): number =>
  status === 'critical' ? thresholds.critical : thresholds.warning;

