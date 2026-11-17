import { AlertSeverity, ReadingKind } from '../types';

export interface Recommendation {
  likelyCause: string;
  recommendedAction: string;
  timeFrame: string;
}

/**
 * Short, generic, advisory guidance keyed by reading kind and severity.
 * Deliberately vendor neutral: no schematics and no sensor model names.
 */
export const recommendations: Record<ReadingKind, Record<AlertSeverity, Recommendation>> = {
  temperature: {
    warning: {
      likelyCause: 'Running warmer than usual, often early lubrication breakdown or a heavier load.',
      recommendedAction: 'Check the lubrication level and top up or re-grease if needed.',
      timeFrame: 'Within 24 hours',
    },
    critical: {
      likelyCause: 'Advanced friction in the bearing assembly, lubrication may be lost.',
      recommendedAction: 'Schedule an inspection of the bearing assembly before further operation.',
      timeFrame: 'Within 2 hours',
    },
  },
  vibration: {
    warning: {
      likelyCause: 'Early mechanical wear or a mounting that has started to work loose.',
      recommendedAction: 'Re-torque the mounting bolts, check alignment and re-measure.',
      timeFrame: 'Within 24 hours',
    },
    critical: {
      likelyCause: 'Bearing damage or misalignment that is getting worse.',
      recommendedAction: 'Schedule an inspection of the bearings and the coupling.',
      timeFrame: 'Within 2 hours',
    },
  },
  motorLoad: {
    warning: {
      likelyCause: 'Duty point drifting, worn internals or product build-up in the machine.',
      recommendedAction: 'Check the feed rate, clean the machine and confirm the motor is not strained.',
      timeFrame: 'Within 24 hours',
    },
    critical: {
      likelyCause: 'Mechanical binding or a sustained overload on the motor.',
      recommendedAction: 'Reduce throughput and look for a jam during the next scheduled inspection.',
      timeFrame: 'Immediately',
    },
  },
  acoustic: {
    warning: {
      likelyCause: 'Early bearing noise or product rubbing inside the housing.',
      recommendedAction: 'Listen at the bearing housing and schedule a lubrication check.',
      timeFrame: 'Within 48 hours',
    },
    critical: {
      likelyCause: 'Metal-to-metal contact or a bearing close to failure.',
      recommendedAction: 'Schedule an inspection of bearings and clearances.',
      timeFrame: 'Within 1 hour',
    },
  },
};

/**
 * Connectivity alerts are not about a crossed limit, so they get their own
 * guidance instead of the reading based recommendation above.
 */
export const connectivityRecommendation: Recommendation = {
  likelyCause: 'The sensor box lost power or its connection back to the cabinet dropped.',
  recommendedAction: 'Check the sensor box power supply and the cable run back to the cabinet.',
  timeFrame: 'Within 4 hours',
};

export const getRecommendation = (
  kind: ReadingKind,
  severity: AlertSeverity
): Recommendation => recommendations[kind][severity];