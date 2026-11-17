import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Minus,
  TrendingDown,
  TrendingUp,
  WifiOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Status, Trend } from '../types';

// One place that maps a status to its colour token, icon and wording, so a
// status is never communicated by colour alone anywhere in the app.

export const statusLabels: Record<Status, string> = {
  normal: 'Normal',
  warning: 'Warning',
  critical: 'Critical',
  offline: 'Offline',
};

export const statusTextClass: Record<Status, string> = {
  normal: 'text-status-normal',
  warning: 'text-status-warning',
  critical: 'text-status-critical',
  offline: 'text-status-offline',
};

export const statusBgClass: Record<Status, string> = {
  normal: 'bg-status-normal',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
  offline: 'bg-status-offline',
};

export const statusBorderClass: Record<Status, string> = {
  normal: 'border-status-normal',
  warning: 'border-status-warning',
  critical: 'border-status-critical',
  offline: 'border-status-offline',
};

/** SVG helpers, used by the gauges. */
export const statusStrokeClass: Record<Status, string> = {
  normal: 'stroke-status-normal',
  warning: 'stroke-status-warning',
  critical: 'stroke-status-critical',
  offline: 'stroke-status-offline',
};

export const statusFillClass: Record<Status, string> = {
  normal: 'fill-status-normal',
  warning: 'fill-status-warning',
  critical: 'fill-status-critical',
  offline: 'fill-status-offline',
};

export const statusIcons: Record<Status, LucideIcon> = {
  normal: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertOctagon,
  offline: WifiOff,
};

/** Hue used inside inline SVG styles (needle, value arc). */
export const statusCssVar: Record<Status, string> = {
  normal: 'hsl(var(--status-normal))',
  warning: 'hsl(var(--status-warning))',
  critical: 'hsl(var(--status-critical))',
  offline: 'hsl(var(--status-offline))',
};

export const trendLabels: Record<Trend, string> = {
  up: 'Rising',
  down: 'Falling',
  stable: 'Steady',
};

export const trendIcons: Record<Trend, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

/** Sentence form for aria-labels and screen-reader-only text. */
export const statusSentence = (status: Status): string => `Status ${statusLabels[status]}`;
