// Types for the feed mill monitoring app

export type Status = 'normal' | 'warning' | 'critical' | 'offline';

/** Direction a reading is moving in, shown as a trend indicator. */
export type Trend = 'up' | 'down' | 'stable';

/** Each reading kind maps to one entry in the threshold configuration. */
export type ReadingKind = 'temperature' | 'vibration' | 'motorLoad' | 'acoustic';

/** Concept demo only has these two roles. */
export type UserRole = 'supervisor' | 'administrator';

export type AlertSeverity = 'warning' | 'critical';

/** Threshold alerts come from a crossed limit; connectivity ones from a dead sensor box. */
export type AlertSource = 'threshold' | 'connectivity';

export interface AlertCount {
  unacknowledged: number;
  total: number;
}

/**
 * A stored sensor reading. It deliberately has NO status and NO min/max:
 * status always follows from value + thresholds (see deriveStatus), and the
 * scale comes from the same threshold entry.
 */
export interface Reading {
  id: string;
  name: string;
  kind: ReadingKind;
  value: number;
  unit: string;
  trend: Trend;
}

/** A reading together with its derived status, as exposed by AppContext. */
export interface ReadingWithStatus extends Reading {
  status: Status;
}

/**
 * Green/Yellow/Red band for one reading kind, also used as the gauge scale.
 * value >= warning is a warning, value >= critical is critical.
 */
export interface Thresholds {
  min: number;
  max: number;
  warning: number;
  critical: number;
}

export type ThresholdMap = Record<ReadingKind, Thresholds>;

// Stored shapes (seeds) vs derived shapes:
// seeds hold only what the "sensor boxes" report; status, section names and
// alert counts are always rolled up from seeds in AppContext.

export interface PartSeed {
  id: string;
  name: string;
  machineId: string;
  sectionId: string;
  readings: Reading[];
  lastSeen: string; // ISO timestamp
  isOnline: boolean;
}

/** Derived: part with its section name, rolled-up status and alert counts. */
export interface Part extends PartSeed {
  section: string;
  readings: ReadingWithStatus[];
  /** Worst reading status, or "offline" when the sensor box is offline. */
  status: Status;
  alertCount: AlertCount;
}

export interface MachineSeed {
  id: string;
  name: string;
  sectionId: string;
}

export interface Machine extends MachineSeed {
  section: string;
  parts: Part[];
  /** Worst non-offline part status (see worstStatus). */
  status: Status;
  /** Reported separately so a dead sensor box never escalates the status. */
  offlineParts: number;
  alertCount: AlertCount;
}

export interface SectionSeed {
  id: string;
  name: string;
  order: number;
}

export interface Section extends SectionSeed {
  machines: Machine[];
  status: Status;
  offlineParts: number;
  alertCount: AlertCount;
}

export interface FacilitySeed {
  name: string;
  lastSync: string; // seconds ago, kept as a string for display
}

export interface Facility extends FacilitySeed {
  sections: Section[];
  status: Status;
  offlineParts: number;
  alertCount: AlertCount;
  sensorBoxesOnline: {
    online: number;
    total: number;
  };
}

export interface Alert {
  id: string;
  partId: string;
  machineId: string;
  sectionId: string;
  /** "Section > Machine > Part", stored so alert lists need no lookups. */
  path: string;
  type: AlertSeverity;
  /** Which kind of alert this is: the screens render them differently. */
  source: AlertSource;
  /** Reading that tripped, and the value against the limit it crossed. */
  readingName: string;
  readingValue: number;
  unit: string;
  threshold: number;
  message: string;
  likelyCause: string;
  recommendedAction: string;
  timeFrame: string;
  timestamp: string; // ISO timestamp
  acknowledged: boolean;
  acknowledgedBy?: string; // Operator id
  acknowledgedAt?: string; // ISO timestamp
  actionTaken?: string;
}

export interface Operator {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}