import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Alert } from '../../types';
import { statusCssVar, statusIcons, statusLabels, statusTextClass } from '../../lib/statusStyles';

interface ToastBannerProps {
  alert: Alert;
  onDismiss: () => void;
}

/**
 * Slide-in push notification for a newly raised alert. The body is the tap
 * target (it opens the alert) and the close button sits beside it, so a tap can
 * never be ambiguous.
 */
export const ToastBanner = ({ alert, onDismiss }: ToastBannerProps) => {
  const Icon = statusIcons[alert.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 top-3 z-50 animate-in slide-in-from-top-3 fade-in duration-300 md:left-auto md:right-4 md:w-96"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div
        className="flex items-start gap-3 rounded-xl border border-border border-l-4 bg-surface p-3 shadow-lg"
        style={{ borderLeftColor: statusCssVar[alert.type] }}
      >
        <Icon
          aria-hidden="true"
          className={`mt-0.5 h-5 w-5 shrink-0 ${statusTextClass[alert.type]}`}
        />

        <Link
          to={`/alerts/${alert.id}`}
          onClick={onDismiss}
          className="min-w-0 flex-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <p className={`text-sm font-semibold ${statusTextClass[alert.type]}`}>
            {statusLabels[alert.type]} alert
          </p>
          <p className="mt-0.5 truncate text-sm text-content">{alert.path}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-content-muted">
            {alert.recommendedAction}
          </p>
          <p className="mt-1 text-[11px] text-content-muted">
            {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })} · tap for details
          </p>
        </Link>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="-m-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-hover hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
