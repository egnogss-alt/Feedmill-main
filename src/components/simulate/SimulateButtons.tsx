import { useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SimulateButtonsProps {
  showReset?: boolean;
}

/**
 * Demo data generator: pushes a part into a warning or critical scenario.
 * Supports part picker defaulting to Bucket Elevator Head Pulley Bearing (`part-1-1`)
 * and optional Reset Demo button.
 */
export const SimulateButtons = ({ showReset = false }: SimulateButtonsProps) => {
  // Reads the live parts from context so the selector always matches what the screens show.
  const { simulateWarning, simulateCritical, resetDemo, parts } = useApp();
  
  // Default to Bucket Elevator Head Pulley Bearing if found, else parts[0].id
  const defaultPartId = parts.find((p) => p.id === 'part-1-1')?.id ?? parts[0]?.id;
  const [selectedPart, setSelectedPart] = useState(defaultPartId);
  const [showDropdown, setShowDropdown] = useState(false);
  const [resetMessage, setResetMessage] = useState(false);

  const handleSimulateWarning = () => {
    simulateWarning(selectedPart);
    setShowDropdown(false);
  };

  const handleSimulateCritical = () => {
    simulateCritical(selectedPart);
    setShowDropdown(false);
  };

  const handleReset = () => {
    resetDemo();
    setResetMessage(true);
    setTimeout(() => setResetMessage(false), 2500);
  };

  const currentPart = parts.find((part) => part.id === selectedPart) ?? parts[0];

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-content">Demo Data Generator</h3>
          <p className="mt-0.5 text-xs text-content-muted">
            Generates fake data only. Cannot control or affect any machine.
          </p>
        </div>
        {showReset && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-content transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RotateCcw className="h-3.5 w-3.5 text-content-muted" />
            Reset Demo
          </button>
        )}
      </div>

      {resetMessage && (
        <div className="mt-2.5 rounded-lg bg-status-normal/10 border border-status-normal/30 px-3 py-1.5 text-xs font-medium text-status-normal">
          Demo restored to initial scenario (thresholds, readings, alerts, and operator accounts).
        </div>
      )}

      <div className="mt-3.5 flex flex-col gap-3">
        <div className="relative">
          <span className="mb-1 block text-xs font-medium text-content-muted">Target Component</span>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 text-left text-sm text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="truncate">
              {currentPart ? `${currentPart.name} (${currentPart.section})` : 'Select component'}
            </span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-content-muted" />
          </button>

          {showDropdown ? (
            <ul
              role="listbox"
              className="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-surface shadow-lg"
            >
              {parts.map((part) => (
                <li key={part.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedPart === part.id}
                    onClick={() => {
                      setSelectedPart(part.id);
                      setShowDropdown(false);
                    }}
                    className={[
                      'flex w-full min-h-[44px] flex-col items-start justify-center px-3 py-1.5 text-left text-sm',
                      selectedPart === part.id
                        ? 'bg-primary-soft text-primary-soft-foreground font-semibold'
                        : 'text-content hover:bg-surface-hover',
                    ].join(' ')}
                  >
                    <span className="truncate">{part.name}</span>
                    <span className="truncate text-xs text-content-muted">{part.section}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSimulateWarning}
            className="min-h-[44px] flex-1 rounded-lg bg-status-warning px-3 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-warning focus-visible:ring-offset-2"
          >
            Generate warning data
          </button>
          <button
            type="button"
            onClick={handleSimulateCritical}
            className="min-h-[44px] flex-1 rounded-lg bg-status-critical px-3 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-critical focus-visible:ring-offset-2"
          >
            Generate critical data
          </button>
        </div>
      </div>
    </div>
  );
};
