import { ReadingKind, ThresholdMap } from '../types';

/**
 * Default Green/Yellow/Red bands per reading kind. These are only the
 * DEFAULTS: the live values live in AppContext state so the administrator
 * Threshold Configuration screen can edit them (see updateThreshold).
 *
 * Values are tuned so the opening demo scenario stays exactly as specified:
 * Pellet Press > Main Bearing is a WARNING (65 degC and 85 dB) while every
 * other part sits in the green band.
 */
export const defaultThresholds: ThresholdMap = {
  temperature: { min: 0, max: 100, warning: 60, critical: 72 },
  vibration: { min: 0, max: 1.5, warning: 0.6, critical: 0.9 },
  motorLoad: { min: 0, max: 100, warning: 80, critical: 90 },
  acoustic: { min: 0, max: 110, warning: 80, critical: 90 },
};

/** Human readable names for the threshold configuration screen. */
export const readingKindLabels: Record<ReadingKind, string> = {
  temperature: 'Temperature',
  vibration: 'Vibration',
  motorLoad: 'Motor Load',
  acoustic: 'Acoustic Level',
};

/** Units used when a new threshold kind is configured. */
export const readingKindUnits: Record<ReadingKind, string> = {
  temperature: '°C',
  vibration: 'mm/s',
  motorLoad: '%',
  acoustic: 'dB',
};

export const readingKinds: ReadingKind[] = ['temperature', 'vibration', 'motorLoad', 'acoustic'];

/** Copy of the defaults, used by "Reset Demo" and by the settings screen. */
export const cloneDefaultThresholds = (): ThresholdMap =>
  readingKinds.reduce((accumulator, kind) => {
    accumulator[kind] = { ...defaultThresholds[kind] };
    return accumulator;
  }, {} as ThresholdMap);
