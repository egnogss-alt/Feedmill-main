import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  AlertSeverity,
  Facility,
  Machine,
  Operator,
  Part,
  PartSeed,
  Reading,
  ReadingKind,
  ReadingWithStatus,
  Section,
  ThresholdMap,
  Thresholds,
} from '../types';
import {
  getInitialAlerts,
  getInitialOperators,
  getInitialParts,
  sampleAlerts,
  sampleFacility,
  sampleMachines,
  sampleParts,
  sampleOperators,
  sampleSections,
} from '../data/sample-data';
import { cloneDefaultThresholds } from '../data/thresholds';
import { getRecommendation } from '../data/recommendations';
import { deriveReadingStatus, thresholdFor, worstStatus } from '../utils/status';
import { runSimulationTick, SIM_TICK_SECONDS } from '../utils/simulator';

// All demo data lives in memory, seeded from src/data/sample-data.ts.
// Nothing is written to localStorage on purpose: the demo must look identical
// on every reload (see "Reset Demo" in the demo controls).

const OPERATOR_STORAGE_KEY = 'millguard_operator';

const loadStoredOperator = (operators: Operator[]): Operator | null => {
  try {
    const raw = localStorage.getItem(OPERATOR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return operators.find((op) => op.id === parsed?.id || op.username === parsed?.username) ?? null;
  } catch {
    return null;
  }
};
/** Slide-in banner switches shown in Settings; Layout reads them before toasting. */
export interface NotificationPrefs {
  /** Show the toast banner for newly raised critical alerts. */
  criticalBanners: boolean;
  /** Show the toast banner for newly raised warning alerts. */
  warningBanners: boolean;
}

const AppContext = createContext<{
  /** Derived hierarchy: every status follows from values + thresholds. */
  facility: Facility;
  sections: Section[];
  machines: Machine[];
  parts: Part[];
  /** Raw sensor data behind the derived hierarchy, used by the demo controls. */
  partSeeds: PartSeed[];
  setPartSeeds: (parts: PartSeed[] | ((prev: PartSeed[]) => PartSeed[])) => void;
  /** Live Green/Yellow/Red bands, editable by an administrator in Settings. */
  thresholds: ThresholdMap;
  updateThreshold: (kind: ReadingKind, patch: Partial<Thresholds>) => void;
  /** Acknowledge an alert; the alert log and every count update immediately. */
  acknowledgeAlert: (alertId: string, actionTaken?: string) => void;
  updateActionTaken: (alertId: string, actionTaken: string) => void;
  alerts: Alert[];
  setAlerts: (alerts: Alert[] | ((prev: Alert[]) => Alert[])) => void;
  operators: Operator[];
  addOperator: (operator: Omit<Operator, 'id'>) => void;
  simulateWarning: (partId: string) => void;
  simulateCritical: (partId: string) => void;
  resetDemo: () => void;
  /** Live notification switches, edited in Settings and obeyed by the toast banner. */
  notificationPrefs: NotificationPrefs;
  setNotificationPrefs: (
    update: NotificationPrefs | ((prev: NotificationPrefs) => NotificationPrefs)
  ) => void;
  currentOperator: Operator | null;
  setCurrentOperator: (op: Operator | null) => void;
  login: (username: string) => boolean;
  logout: () => void;
} | null>(null);

type AlertCount = { unacknowledged: number; total: number };

/** Unacknowledged/total alert counters for any level of the hierarchy. */
const countAlerts = (alerts: Alert[], match: (alert: Alert) => boolean): AlertCount => {
  const matching = alerts.filter(match);
  return {
    unacknowledged: matching.filter((alert) => !alert.acknowledged).length,
    total: matching.length,
  };
};

/**
 * Value that puts a reading just past a limit: inside the band for a warning,
 * just beyond the critical limit for a critical (clamped to the scale).
 */
const scenarioValue = (severity: AlertSeverity, limits: Thresholds): number => {
  if (severity === 'critical') {
    const overshoot = Math.max((limits.max - limits.critical) * 0.25, 0);
    return Number(Math.min(limits.critical + overshoot, limits.max).toFixed(2));
  }
  return Number((limits.warning + (limits.critical - limits.warning) * 0.5).toFixed(2));
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // Source of truth: raw readings, the alert log and the live thresholds.
  // Every status shown anywhere in the app is derived from these, never stored.
  const [partSeeds, setPartSeeds] = useState<PartSeed[]>(sampleParts);
  const [alerts, setAlerts] = useState<Alert[]>(sampleAlerts);
  const [thresholds, setThresholds] = useState<ThresholdMap>(cloneDefaultThresholds);
  const [operators, setOperators] = useState<Operator[]>(sampleOperators);
  const [currentOperator, setCurrentOperatorState] = useState<Operator | null>(() =>
    loadStoredOperator(sampleOperators)
  );

  // Live simulation state: parts pinned by an explicit demo scenario (the tick
  // must never jitter those), the sync counter shown as "Ns ago", and the
  // notification switches shared between Settings and the toast banner.
  const [scenarioOverrides, setScenarioOverrides] = useState<Record<string, AlertSeverity>>({});
  const [lastSyncSeconds, setLastSyncSeconds] = useState(Number(sampleFacility.lastSync));
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    criticalBanners: true,
    warningBanners: true,
  });
  const tickCountRef = useRef(0);

  const setCurrentOperator = (op: Operator | null) => {
    setCurrentOperatorState(op);
    try {
      if (op) {
        localStorage.setItem(OPERATOR_STORAGE_KEY, JSON.stringify({ id: op.id, username: op.username }));
      } else {
        localStorage.removeItem(OPERATOR_STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage write failures in private/restricted browsing
    }
  };

  const logout = () => {
    setCurrentOperator(null);
  };

  // Derived parts: each reading status comes from value + thresholds, and the
  // part status is the worst of those readings - or "offline" when the sensor
  // box itself is not reporting, which is a property of the part, not a value.
  const parts = useMemo<Part[]>(
    () =>
      partSeeds.map((seed) => {
        const section = sampleSections.find((candidate) => candidate.id === seed.sectionId);
        const readings: ReadingWithStatus[] = seed.readings.map((reading) => ({
          ...reading,
          status: deriveReadingStatus(reading.value, reading.kind, thresholds),
        }));
        return {
          ...seed,
          section: section?.name ?? '',
          readings,
          status: seed.isOnline ? worstStatus(readings.map((reading) => reading.status)) : 'offline',
          alertCount: countAlerts(alerts, (alert) => alert.partId === seed.id),
        };
      }),
    [partSeeds, thresholds, alerts]
  );

  // Machine status = worst non-offline part, so one dead sensor box never
  // escalates a healthy machine (offline is counted separately in the UI).
  const machines = useMemo<Machine[]>(
    () =>
      sampleMachines.map((machine) => {
        const section = sampleSections.find((candidate) => candidate.id === machine.sectionId);
        const machineParts = parts.filter((part) => part.machineId === machine.id);
        return {
          ...machine,
          section: section?.name ?? '',
          parts: machineParts,
          status: worstStatus(machineParts.map((part) => part.status)),
          offlineParts: machineParts.filter((part) => !part.isOnline).length,
          alertCount: countAlerts(alerts, (alert) => alert.machineId === machine.id),
        };
      }),
    [parts, alerts]
  );

  // Section status = worst non-offline machine, kept in process flow order.
  const sections = useMemo<Section[]>(
    () =>
      [...sampleSections]
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const sectionMachines = machines.filter((machine) => machine.sectionId === section.id);
          return {
            ...section,
            machines: sectionMachines,
            status: worstStatus(sectionMachines.map((machine) => machine.status)),
            offlineParts: sectionMachines.reduce(
              (total, machine) => total + machine.offlineParts,
              0
            ),
            alertCount: countAlerts(alerts, (alert) => alert.sectionId === section.id),
          };
        }),
    [machines, alerts]
  );

  // Facility status = worst non-offline section.
  const facility = useMemo<Facility>(
    () => ({
      ...sampleFacility,
      lastSync: String(lastSyncSeconds),
      sections,
      status: worstStatus(sections.map((section) => section.status)),
      alertCount: countAlerts(alerts, (alert) =>
        sampleSections.some((section) => section.id === alert.sectionId)
      ),
      // Offline sensor boxes and parts are reported separately, never folded into status.
      offlineParts: parts.filter((part) => !part.isOnline).length,
      sensorBoxesOnline: {
        online: parts.filter((part) => part.isOnline).length,
        total: parts.length,
      },
    }),
    [sections, alerts, parts, lastSyncSeconds]
  );

  /**
   * The live simulation clock. Every second the sync counter counts up, and
   * every SIM_TICK_SECONDS one tick runs: each online reading jitters inside
   * its current band (never across a limit), offline boxes stay frozen and
   * scenario-pinned parts keep their scripted values. All screens driven by
   * partSeeds - gauges, trend charts, cards, badges - follow automatically.
   */
  useEffect(() => {
    let secondsSinceTick = 0;
    const intervalId = window.setInterval(() => {
      secondsSinceTick += 1;
      if (secondsSinceTick >= SIM_TICK_SECONDS) {
        secondsSinceTick = 0;
        setLastSyncSeconds(0);
        const tick = tickCountRef.current;
        tickCountRef.current += 1;
        setPartSeeds((prev) => runSimulationTick(prev, thresholds, scenarioOverrides, tick));
      } else {
        setLastSyncSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [thresholds, scenarioOverrides]);

  /** Administrator action: edit a Green/Yellow/Red band. Statuses update at once. */
  const updateThreshold = (kind: ReadingKind, patch: Partial<Thresholds>) => {
    setThresholds((prev) => ({ ...prev, [kind]: { ...prev[kind], ...patch } }));
  };

  /** Acknowledges an alert and records who did it and when. */
  const acknowledgeAlert = (alertId: string, actionTaken?: string) => {
    const acknowledgedAt = new Date().toISOString();
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              acknowledged: true,
              acknowledgedBy: currentOperator?.id ?? alert.acknowledgedBy,
              acknowledgedAt,
              actionTaken: actionTaken ?? alert.actionTaken,
            }
          : alert
      )
    );
  };

  /** Update or save an action taken note on an alert. */
  const updateActionTaken = (alertId: string, actionTaken: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, actionTaken } : alert))
    );
  };

  /** Add a new operator (mock user management). */
  const addOperator = (operator: Omit<Operator, 'id'>) => {
    const newOp: Operator = {
      ...operator,
      id: `user-${Date.now()}`,
    };
    setOperators((prev) => [...prev, newOp]);
  };

  /**
   * Reset entire demo back to the clean initial scenario: thresholds, readings,
   * alerts, operator accounts, the scenario pins, the sync counter and the tick
   * sequence all go back to zero. The signed-in operator is deliberately left
   * alone - Reset Demo never logs anyone out.
   */
  const resetDemo = () => {
    setThresholds(cloneDefaultThresholds());
    setPartSeeds(getInitialParts());
    setAlerts(getInitialAlerts());
    setOperators(getInitialOperators());
    setScenarioOverrides({});
    setLastSyncSeconds(Number(sampleFacility.lastSync));
    tickCountRef.current = 0;
  };

  /**
   * Demo control: pushes one part into a warning or critical scenario by setting
   * its VALUES just past the limit, then logs the alert that follows. Values are
   * written, never statuses - statuses are derived from these values, so a
   * scenario and a threshold edit flow through exactly the same code path.
   */
  const applyScenario = (partId: string, severity: AlertSeverity) => {
    const target = parts.find((part) => part.id === partId);
    if (!target) return;

    const machine = sampleMachines.find((candidate) => candidate.id === target.machineId);
    const timestamp = new Date().toISOString();
    const readings: Reading[] = target.readings.map((reading) => ({
      id: reading.id,
      name: reading.name,
      kind: reading.kind,
      unit: reading.unit,
      trend: 'up',
      value: scenarioValue(severity, thresholds[reading.kind]),
    }));

    // The first reading that lands in the requested band explains the alert.
    const trigger =
      readings.find(
        (reading) => deriveReadingStatus(reading.value, reading.kind, thresholds) === severity
      ) ?? readings[0];
    const limits = thresholds[trigger.kind];
    const triggerLimit = thresholdFor(severity, limits);
    const recommendation = getRecommendation(trigger.kind, severity);
    const path = `${target.section} > ${machine?.name ?? target.machineId} > ${target.name}`;

    // Functional updates keep the demo deterministic and free of stale closures.
    setPartSeeds((prev) =>
      prev.map((seed) =>
        seed.id === partId ? { ...seed, isOnline: true, lastSeen: timestamp, readings } : seed
      )
    );

    // Pin the part: the simulation tick must not jitter this scenario away.
    setScenarioOverrides((prev) => ({ ...prev, [partId]: severity }));

    setAlerts((prev) => [
      {
        id: `alert-sim-${severity}-${partId}-${Date.now()}`,
        partId,
        machineId: target.machineId,
        sectionId: target.sectionId,
        path,
        type: severity,
        source: 'threshold',
        readingName: trigger.name,
        readingValue: trigger.value,
        unit: trigger.unit,
        threshold: triggerLimit,
        message: `${path}: ${trigger.name} at ${trigger.value} ${trigger.unit} against a ${severity} limit of ${triggerLimit} ${trigger.unit}`,
        likelyCause: recommendation.likelyCause,
        recommendedAction: recommendation.recommendedAction,
        timeFrame: recommendation.timeFrame,
        timestamp,
        acknowledged: false,
      },
      ...prev,
    ]);
  };

  // Demo controls: force a part into a warning or critical scenario.
  const simulateWarning = (partId: string) => applyScenario(partId, 'warning');
  const simulateCritical = (partId: string) => applyScenario(partId, 'critical');

  // Login function
  const login = (username: string): boolean => {
    const trimmed = username.trim().toLowerCase();
    const operator = operators.find(
      (op) => op.username.toLowerCase() === trimmed || op.name.toLowerCase() === trimmed
    );
    if (operator) {
      setCurrentOperator(operator);
      return true;
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        facility,
        sections,
        machines,
        parts,
        partSeeds,
        setPartSeeds,
        thresholds,
        updateThreshold,
        acknowledgeAlert,
        updateActionTaken,
        alerts,
        setAlerts,
        operators,
        addOperator,
        simulateWarning,
        simulateCritical,
        resetDemo,
        notificationPrefs,
        setNotificationPrefs,
        currentOperator,
        setCurrentOperator,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};