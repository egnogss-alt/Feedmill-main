import { Part, ReadingWithStatus } from '../types';
import { statusRank } from '../utils/status';

/**
 * The reading that best explains a part's status (the worst one), used by the
 * compact gauges in machine and part cards.
 */
export const worstReading = (part: Part): ReadingWithStatus | undefined => {
  if (part.readings.length === 0) return undefined;
  return [...part.readings].sort((a, b) => statusRank(b.status) - statusRank(a.status))[0];
};
