import {
  Alert,
  AlertSeverity,
  FacilitySeed,
  MachineSeed,
  Operator,
  PartSeed,
  SectionSeed,
} from '../types';
import { defaultThresholds } from './thresholds';
import { connectivityRecommendation, getRecommendation } from './recommendations';

// Sample data for the feed mill monitoring app.
////
// Opening scenario (identical on every reload - there is no Math.random anywhere):
// - Intake & Conveying > Bucket Elevator: Boot Pulley Bearing sensor box offline, Head Pulley Bearing in warning band
// - Grinding > Hammer Mill: Motor Bearing in warning band (temp/acoustic elevated)
// - Mixing > Batch Mixer: all GREEN
// - Pelleting > Pellet Press: all GREEN with 0 open alerts
// - Cooling & Finishing > Cooler: all GREEN
// - One unacknowledged warning alert on Intake & Conveying > Bucket Elevator > Head Pulley Bearing
// - 14 earlier alerts spread over the last 30 days, all acknowledged with an action taken
//
// Readings carry a value only: status is always derived from value + thresholds
// at runtime (see deriveStatus in src/utils/status.ts) and never stored, and
// "offline" belongs to the part (sensor box), never to a value.

/** Section lookup, used to build the full "Section > Machine > Part" alert paths. */
const sectionNames: Record<string, string> = {
  'section-1': 'Intake & Conveying',
  'section-2': 'Grinding',
  'section-3': 'Mixing',
  'section-4': 'Pelleting',
  'section-5': 'Cooling & Finishing',
};

export const sampleSections: SectionSeed[] = [
  { id: 'section-1', name: 'Intake & Conveying', order: 1 },
  { id: 'section-2', name: 'Grinding', order: 2 },
  { id: 'section-3', name: 'Mixing', order: 3 },
  { id: 'section-4', name: 'Pelleting', order: 4 },
  { id: 'section-5', name: 'Cooling & Finishing', order: 5 },
];

export const sampleMachines: MachineSeed[] = [
  { id: 'machine-1', name: 'Bucket Elevator', sectionId: 'section-1' },
  { id: 'machine-2', name: 'Hammer Mill', sectionId: 'section-2' },
  { id: 'machine-3', name: 'Batch Mixer', sectionId: 'section-3' },
  { id: 'machine-4', name: 'Pellet Press', sectionId: 'section-4' },
  { id: 'machine-5', name: 'Cooler', sectionId: 'section-5' },
];

/** Online parts report every minute; the offline sensor box last reported 12 h ago. */
const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

export const getInitialParts = (): PartSeed[] => [
  // Intake & Conveying > Bucket Elevator
  // Opening scenario: Head Pulley Bearing in warning band, Boot Pulley Bearing offline
  {
    id: 'part-1-1',
    name: 'Head Pulley Bearing',
    machineId: 'machine-1',
    sectionId: 'section-1',
    readings: [
      { id: 'r-1-1-1', name: 'Temperature', kind: 'temperature', value: 65, unit: '°C', trend: 'up' },
      { id: 'r-1-1-2', name: 'Vibration', kind: 'vibration', value: 0.22, unit: 'mm/s', trend: 'stable' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },
  {
    // Sensor box offline: the part status is "offline" because the box is not
    // reporting, not because of any value. The last known readings are kept so
    // the connectivity alert can show what it was reporting before it dropped out.
    id: 'part-1-2',
    name: 'Boot Pulley Bearing',
    machineId: 'machine-1',
    sectionId: 'section-1',
    readings: [
      { id: 'r-1-2-1', name: 'Temperature', kind: 'temperature', value: 41, unit: '°C', trend: 'stable' },
      { id: 'r-1-2-2', name: 'Vibration', kind: 'vibration', value: 0.22, unit: 'mm/s', trend: 'stable' },
    ],
    lastSeen: minutesAgo(12),
    isOnline: false,
  },
  {
    id: 'part-1-3',
    name: 'Drive Motor',
    machineId: 'machine-1',
    sectionId: 'section-1',
    readings: [
      { id: 'r-1-3-1', name: 'Motor Load', kind: 'motorLoad', value: 75, unit: '%', trend: 'up' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },

  // Grinding > Hammer Mill
  {
    id: 'part-2-1',
    name: 'Motor Bearing',
    machineId: 'machine-2',
    sectionId: 'section-2',
    readings: [
      { id: 'r-2-1-1', name: 'Temperature', kind: 'temperature', value: 42, unit: '°C', trend: 'stable' },
      { id: 'r-2-1-2', name: 'Acoustic Level', kind: 'acoustic', value: 65, unit: 'dB', trend: 'stable' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },
  {
    id: 'part-2-2',
    name: 'Rotor',
    machineId: 'machine-2',
    sectionId: 'section-2',
    readings: [
      { id: 'r-2-2-1', name: 'Vibration', kind: 'vibration', value: 0.3, unit: 'mm/s', trend: 'stable' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },
  {
    id: 'part-2-3',
    name: 'Drive Motor',
    machineId: 'machine-2',
    sectionId: 'section-2',
    readings: [
      { id: 'r-2-3-1', name: 'Motor Load', kind: 'motorLoad', value: 68, unit: '%', trend: 'stable' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },

  // Mixing > Batch Mixer
  {
    id: 'part-3-1',
    name: 'Shaft Bearing',
    machineId: 'machine-3',
    sectionId: 'section-3',
    readings: [
      { id: 'r-3-1-1', name: 'Temperature', kind: 'temperature', value: 38, unit: '°C', trend: 'stable' },
      { id: 'r-3-1-2', name: 'Acoustic Level', kind: 'acoustic', value: 58, unit: 'dB', trend: 'stable' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },
  {
    id: 'part-3-2',
    name: 'Gearbox',
    machineId: 'machine-3',
    sectionId: 'section-3',
    readings: [
      { id: 'r-3-2-1', name: 'Temperature', kind: 'temperature', value: 44, unit: '°C', trend: 'stable' },
      { id: 'r-3-2-2', name: 'Vibration', kind: 'vibration', value: 0.25, unit: 'mm/s', trend: 'stable' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },
  {
    id: 'part-3-3',
    name: 'Drive Motor',
    machineId: 'machine-3',
    sectionId: 'section-3',
    readings: [
      { id: 'r-3-3-1', name: 'Motor Load', kind: 'motorLoad', value: 62, unit: '%', trend: 'stable' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },

  // Pelleting > Pellet Press
  // Opening scenario: all parts are normal with 0 open alerts.
  {
    id: 'part-4-1',
    name: 'Main Bearing',
    machineId: 'machine-4',
    sectionId: 'section-4',
    readings: [
      { id: 'r-4-1-1', name: 'Temperature', kind: 'temperature', value: 55, unit: '°C', trend: 'stable' },
      { id: 'r-4-1-2', name: 'Acoustic Level', kind: 'acoustic', value: 70, unit: 'dB', trend: 'stable' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },
  {
    id: 'part-4-2',
    name: 'Die Chamber',
    machineId: 'machine-4',
    sectionId: 'section-4',
    readings: [
      { id: 'r-4-2-1', name: 'Vibration', kind: 'vibration', value: 0.28, unit: 'mm/s', trend: 'stable' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },
  {
    id: 'part-4-3',
    name: 'Drive Motor',
    machineId: 'machine-4',
    sectionId: 'section-4',
    readings: [
      { id: 'r-4-3-1', name: 'Motor Load', kind: 'motorLoad', value: 71, unit: '%', trend: 'stable' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },

  // Cooling & Finishing > Cooler
  {
    id: 'part-5-1',
    name: 'Fan Motor',
    machineId: 'machine-5',
    sectionId: 'section-5',
    readings: [
      { id: 'r-5-1-1', name: 'Temperature', kind: 'temperature', value: 48, unit: '°C', trend: 'stable' },
      { id: 'r-5-1-2', name: 'Motor Load', kind: 'motorLoad', value: 58, unit: '%', trend: 'stable' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },
  {
    id: 'part-5-2',
    name: 'Airlock Drive',
    machineId: 'machine-5',
    sectionId: 'section-5',
    readings: [
      { id: 'r-5-2-1', name: 'Motor Load', kind: 'motorLoad', value: 45, unit: '%', trend: 'stable' },
    ],
    lastSeen: minutesAgo(1),
    isOnline: true,
  },
];

export const sampleParts: PartSeed[] = getInitialParts();

// ---------------------------------------------------------------------------
// Alert log
// ---------------------------------------------------------------------------
// Seeds for the 15 alerts in the demo. Ages, values, severities and actions are
// fixed so the history looks identical on every reload. The thresholds recorded
// below are the defaults that were in force when each alert was raised.

interface AlertSeed {
  id: string;
  partId: string;
  readingId: string;
  type: AlertSeverity;
  /** Age of the alert in minutes (1 h = 60, 1 day = 1440). */
  minutesAgo: number;
  /** Value the reading was showing when the alert was raised. */
  value: number;
  /** Connectivity alerts are about the sensor box, not about crossed limit. */
  source?: 'threshold' | 'connectivity';
  /** Overrides the generated "Section > Machine > Part: ..." message. */
  message?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  actionTaken?: string;
  acknowledgementDelayMinutes?: number;
}

const alertSeeds: AlertSeed[] = [
  // Opening scenario: the single unacknowledged alert on Intake & Conveying > Bucket Elevator > Head Pulley Bearing
  {
    id: 'alert-1',
    partId: 'part-1-1',
    readingId: 'r-1-1-1',
    type: 'warning',
    minutesAgo: 5,
    value: 65,
    message: 'Intake & Conveying > Bucket Elevator > Head Pulley Bearing: Temperature and Vibration trending upward',
    acknowledged: false,
  },
  // History: 14 acknowledged alerts over the last 30 days.
  {
    id: 'alert-2',
    partId: 'part-1-2',
    readingId: 'r-1-2-1',
    type: 'warning',
    minutesAgo: 720,
    value: 41,
    source: 'connectivity',
    message: 'Intake & Conveying > Bucket Elevator > Boot Pulley Bearing: sensor box offline',
    acknowledged: true,
    acknowledgedBy: 'user-2',
    acknowledgementDelayMinutes: 60,
    actionTaken: 'Checked the power connection and reseated the sensor box cable.',
  },
  {
    id: 'alert-3',
    partId: 'part-3-1',
    readingId: 'r-3-1-1',
    type: 'warning',
    minutesAgo: 1440,
    value: 61,
    acknowledged: true,
    acknowledgedBy: 'user-2',
    acknowledgementDelayMinutes: 120,
    actionTaken: 'Replaced the worn shaft bearing.',
  },
  {
    id: 'alert-4',
    partId: 'part-4-1',
    readingId: 'r-4-1-1',
    type: 'warning',
    minutesAgo: 2880,
    value: 61,
    acknowledged: true,
    acknowledgedBy: 'user-1',
    acknowledgementDelayMinutes: 45,
    actionTaken: 'Re-greased the bearing and re-checked the trend.',
  },
  {
    id: 'alert-5',
    partId: 'part-2-1',
    readingId: 'r-2-1-1',
    type: 'warning',
    minutesAgo: 4320,
    value: 62,
    acknowledged: true,
    acknowledgedBy: 'user-1',
    acknowledgementDelayMinutes: 90,
    actionTaken: 'Lubricated the bearing and checked the alignment.',
  },
  {
    id: 'alert-6',
    partId: 'part-5-1',
    readingId: 'r-5-1-1',
    type: 'warning',
    minutesAgo: 5760,
    value: 62,
    acknowledged: true,
    acknowledgedBy: 'user-1',
    acknowledgementDelayMinutes: 75,
    actionTaken: 'Cleaned the cooling fins and checked the airflow.',
  },
  {
    id: 'alert-7',
    partId: 'part-4-2',
    readingId: 'r-4-2-1',
    type: 'warning',
    minutesAgo: 8640,
    value: 0.64,
    acknowledged: true,
    acknowledgedBy: 'user-2',
    acknowledgementDelayMinutes: 30,
    actionTaken: 'Re-torqued the die chamber bolts.',
  },
  {
    id: 'alert-8',
    partId: 'part-2-2',
    readingId: 'r-2-2-1',
    type: 'critical',
    minutesAgo: 11520,
    value: 0.95,
    acknowledged: true,
    acknowledgedBy: 'user-1',
    acknowledgementDelayMinutes: 25,
    actionTaken: 'Took the mill out of service, replaced the rotor bearings and rebalanced the rotor.',
  },
  {
    id: 'alert-9',
    partId: 'part-3-2',
    readingId: 'r-3-2-1',
    type: 'warning',
    minutesAgo: 15840,
    value: 63,
    acknowledged: true,
    acknowledgedBy: 'user-2',
    acknowledgementDelayMinutes: 45,
    actionTaken: 'Topped up the gearbox oil.',
  },
  {
    id: 'alert-10',
    partId: 'part-4-3',
    readingId: 'r-4-3-1',
    type: 'warning',
    minutesAgo: 20160,
    value: 84,
    acknowledged: true,
    acknowledgedBy: 'user-1',
    acknowledgementDelayMinutes: 20,
    actionTaken: 'Cleared a partial blockage in the feed chute.',
  },
  {
    id: 'alert-11',
    partId: 'part-5-2',
    readingId: 'r-5-2-1',
    type: 'warning',
    minutesAgo: 24480,
    value: 83,
    acknowledged: true,
    acknowledgedBy: 'user-2',
    acknowledgementDelayMinutes: 60,
    actionTaken: 'Adjusted the airlock clearance.',
  },
  {
    id: 'alert-12',
    partId: 'part-1-1',
    readingId: 'r-1-1-1',
    type: 'warning',
    minutesAgo: 28800,
    value: 60.5,
    acknowledged: true,
    acknowledgedBy: 'user-1',
    acknowledgementDelayMinutes: 30,
    actionTaken: 'Re-greased the head pulley bearing.',
  },
  {
    id: 'alert-13',
    partId: 'part-3-3',
    readingId: 'r-3-3-1',
    type: 'warning',
    minutesAgo: 33120,
    value: 82,
    acknowledged: true,
    acknowledgedBy: 'user-2',
    acknowledgementDelayMinutes: 40,
    actionTaken: 'Cleaned product build-up inside the mixer.',
  },
  {
    id: 'alert-14',
    partId: 'part-2-3',
    readingId: 'r-2-3-1',
    type: 'warning',
    minutesAgo: 37440,
    value: 85,
    acknowledged: true,
    acknowledgedBy: 'user-1',
    acknowledgementDelayMinutes: 50,
    actionTaken: 'Replaced a worn drive belt.',
  },
  {
    id: 'alert-15',
    partId: 'part-1-3',
    readingId: 'r-1-3-1',
    type: 'warning',
    minutesAgo: 41760,
    value: 81,
    acknowledged: true,
    acknowledgedBy: 'user-2',
    acknowledgementDelayMinutes: 35,
    actionTaken: 'Checked and adjusted the drive chain tension.',
  },
];

/**
 * Turns a seed into a complete alert: resolves the "Section > Machine > Part"
 * path, the recorded value against the limit it crossed, and the advisory
 * cause / action / time frame for that reading kind and severity.
 */
const buildAlert = (seed: AlertSeed): Alert => {
  const part = sampleParts.find((candidate) => candidate.id === seed.partId)!;
  const machine = sampleMachines.find((candidate) => candidate.id === part.machineId)!;
  const reading = part.readings.find((candidate) => candidate.id === seed.readingId)!;
  const source = seed.source ?? 'threshold';
  const limits = defaultThresholds[reading.kind];
  const threshold = seed.type === 'critical' ? limits.critical : limits.warning;
  const recommendation =
    source === 'connectivity' ? connectivityRecommendation : getRecommendation(reading.kind, seed.type);
  const path = `${sectionNames[part.sectionId]} > ${machine.name} > ${part.name}`;
  const timestamp = minutesAgo(seed.minutesAgo);
  const generatedMessage =
    source === 'connectivity'
      ? `${path}: sensor box offline, last reported ${reading.value} ${reading.unit}`
      : `${path}: ${reading.name} at ${seed.value} ${reading.unit} against a ${seed.type} limit of ${threshold} ${reading.unit}`;

  return {
    id: seed.id,
    partId: part.id,
    machineId: machine.id,
    sectionId: part.sectionId,
    path,
    type: seed.type,
    source,
    readingName: reading.name,
    readingValue: seed.value,
    unit: reading.unit,
    // A connectivity alert has no crossed limit: 0 marks it as "not value based"
    // and the alert screens branch on `source`, showing the last known reading.
    threshold: source === 'connectivity' ? 0 : threshold,
    message: seed.message ?? generatedMessage,
    likelyCause: recommendation.likelyCause,
    recommendedAction: recommendation.recommendedAction,
    timeFrame: recommendation.timeFrame,
    timestamp,
    acknowledged: seed.acknowledged,
    acknowledgedBy: seed.acknowledgedBy,
    acknowledgedAt: seed.acknowledged
      ? new Date(
          new Date(timestamp).getTime() + (seed.acknowledgementDelayMinutes ?? 30) * 60 * 1000
        ).toISOString()
      : undefined,
    actionTaken: seed.actionTaken,
  };
};

/** Build the initial alert list (used on startup and for Reset Demo). */
export const getInitialAlerts = (): Alert[] =>
  alertSeeds
    .map(buildAlert)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

/** Newest first: this is what the Alerts and History screens read. */
export const sampleAlerts: Alert[] = getInitialAlerts();

export const sampleFacility: FacilitySeed = {
  name: 'Northside Feed Mill',
  lastSync: '5',
};

export const getInitialOperators = (): Operator[] => [
  { id: 'user-1', username: 'jsmith', role: 'supervisor', name: 'John Smith' },
  { id: 'user-2', username: 'ajones', role: 'supervisor', name: 'Alice Jones' },
  { id: 'user-3', username: 'rbrown', role: 'administrator', name: 'Robert Brown' },
];

export const sampleOperators: Operator[] = getInitialOperators();

/** The whole seeded demo data set in one place, handy for a Reset Demo action. */
export const sampleData = {
  facility: sampleFacility,
  sections: sampleSections,
  machines: sampleMachines,
  parts: sampleParts,
  alerts: sampleAlerts,
  operators: sampleOperators,
};