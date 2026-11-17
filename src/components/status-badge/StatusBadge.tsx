import { Status } from '../../types';
import { statusBgClass, statusIcons, statusLabels, statusTextClass } from '../../lib/statusStyles';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  /** Set false for a dot only: it keeps an aria-label so colour is never the only cue. */
  showLabel?: boolean;
  className?: string;
}

const dotSize: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

const iconSize: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const labelSize: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/**
 * Status is always accompanied by an icon and a written label, so the meaning
 * survives greyscale printing and colour blindness.
 */
export const StatusBadge = ({ status, size = 'md', showLabel = true, className }: StatusBadgeProps) => {
  const label = statusLabels[status];
  const classes = className ? ` ${className}` : '';

  if (!showLabel) {
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        className={`inline-block shrink-0 rounded-full ${statusBgClass[status]} ${dotSize[size]}${classes}`}
      />
    );
  }

  const Icon = statusIcons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${statusTextClass[status]} ${labelSize[size]}${classes}`}
    >
      <Icon aria-hidden="true" className={`shrink-0 ${iconSize[size]}`} />
      {label}
    </span>
  );
};

/** Dot only variant, still labelled for assistive tech. */
export const StatusDot = ({
  status,
  size = 'md',
}: {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}) => (
  <span
    role="img"
    aria-label={statusLabels[status]}
    title={statusLabels[status]}
    className={`inline-block shrink-0 rounded-full ${statusBgClass[status]} ${dotSize[size]}`}
  />
);
