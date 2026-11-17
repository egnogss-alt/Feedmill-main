import { useState } from 'react';
import { Sliders, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReadingKind, ReadingWithStatus } from '../../types';
import { readingKindLabels, readingKindUnits, readingKinds } from '../../data/thresholds';
import { ArcGauge } from '../gauge/ArcGauge';

export const ThresholdSettings = () => {
  const { thresholds, updateThreshold } = useApp();
  const [selectedKind, setSelectedKind] = useState<ReadingKind>('temperature');
  const [testValue, setTestValue] = useState<number>(thresholds.temperature.warning);
  const [saveBanner, setSaveBanner] = useState(false);

  const currentThresholds = thresholds[selectedKind];

  const handleKindSelect = (kind: ReadingKind) => {
    setSelectedKind(kind);
    setTestValue(thresholds[kind].warning);
  };

  const handleUpdate = (field: 'min' | 'max' | 'warning' | 'critical', val: number) => {
    if (isNaN(val)) return;
    updateThreshold(selectedKind, { [field]: val });
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2000);
  };

  const testReading: ReadingWithStatus = {
    id: `test-${selectedKind}`,
    name: readingKindLabels[selectedKind],
    kind: selectedKind,
    value: testValue,
    unit: readingKindUnits[selectedKind],
    trend: 'stable',
    status:
      testValue >= currentThresholds.critical
        ? 'critical'
        : testValue >= currentThresholds.warning
        ? 'warning'
        : 'normal',
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">
      <div>
        <h3 className="text-base font-semibold text-content flex items-center gap-2">
          <Sliders className="h-5 w-5 text-primary" />
          Threshold Configuration (Administrator)
        </h3>
        <p className="mt-0.5 text-xs text-content-muted">
          Configure sensor Green/Yellow/Red bands. Changes update all gauges, charts, and alarm logic live.
        </p>
        <p className="mt-0.5 text-[11px] text-content-muted">
          Changing limits only changes alert levels. It never controls a machine.
        </p>
      </div>

      {saveBanner && (
        <div className="rounded-lg bg-status-normal/10 border border-status-normal/30 px-3 py-1.5 text-xs font-semibold text-status-normal flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          Threshold changes applied live to the monitoring system.
        </div>
      )}

      {/* Kind selector pills */}
      <div className="flex flex-wrap gap-2">
        {readingKinds.map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => handleKindSelect(kind)}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedKind === kind
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'border border-border bg-surface text-content hover:bg-surface-hover'
            }`}
          >
            {readingKindLabels[kind]} ({readingKindUnits[kind]})
          </button>
        ))}
      </div>

      {/* Grid: Live ArcGauge preview on left/top, Threshold inputs on right/bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Live Preview ArcGauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-xl border border-border bg-surface-muted/40 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted mb-2">
            Live ArcGauge Preview
          </span>
          <ArcGauge reading={testReading} thresholds={currentThresholds} size={200} />

          {/* Test slider */}
          <div className="mt-4 w-full space-y-1">
            <div className="flex justify-between text-xs text-content-muted font-medium">
              <span>Simulated Input Value:</span>
              <span className="font-bold tabular-nums text-content">
                {testValue} {readingKindUnits[selectedKind]}
              </span>
            </div>
            <input
              type="range"
              min={currentThresholds.min}
              max={currentThresholds.max}
              step={selectedKind === 'vibration' ? 0.05 : 1}
              value={testValue}
              onChange={(e) => setTestValue(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        {/* Inputs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">
                Scale Min ({readingKindUnits[selectedKind]})
              </label>
              <input
                type="number"
                step={selectedKind === 'vibration' ? 0.1 : 1}
                value={currentThresholds.min}
                onChange={(e) => handleUpdate('min', parseFloat(e.target.value))}
                className="w-full min-h-[40px] rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">
                Scale Max ({readingKindUnits[selectedKind]})
              </label>
              <input
                type="number"
                step={selectedKind === 'vibration' ? 0.1 : 1}
                value={currentThresholds.max}
                onChange={(e) => handleUpdate('max', parseFloat(e.target.value))}
                className="w-full min-h-[40px] rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-status-warning/40 bg-status-warning/5 p-3">
              <label className="block text-xs font-bold text-status-warning mb-1 uppercase tracking-wider">
                Warning Band (≥)
              </label>
              <input
                type="number"
                step={selectedKind === 'vibration' ? 0.05 : 1}
                value={currentThresholds.warning}
                onChange={(e) => handleUpdate('warning', parseFloat(e.target.value))}
                className="w-full min-h-[40px] rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-bold tabular-nums text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <span className="mt-1 block text-[11px] text-content-muted">
                Yellow cautionary trip point
              </span>
            </div>

            <div className="rounded-lg border border-status-critical/40 bg-status-critical/5 p-3">
              <label className="block text-xs font-bold text-status-critical mb-1 uppercase tracking-wider">
                Critical Band (≥)
              </label>
              <input
                type="number"
                step={selectedKind === 'vibration' ? 0.05 : 1}
                value={currentThresholds.critical}
                onChange={(e) => handleUpdate('critical', parseFloat(e.target.value))}
                className="w-full min-h-[40px] rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-bold tabular-nums text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <span className="mt-1 block text-[11px] text-content-muted">
                Red critical alarm trip point
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};