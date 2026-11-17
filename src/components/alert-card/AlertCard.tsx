import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { Alert } from '../../types';
import { useApp } from '../../context/AppContext';
import { statusCssVar, statusIcons, statusLabels, statusTextClass } from '../../lib/statusStyles';

interface AlertCardProps {
  alert: Alert;
}

/**
 * Alert summary: severity, path, the reading against its limit (or the last
 * known reading for a connectivity alert), likely cause, recommended action with
 * a time frame, and an acknowledge button that writes to the alert log.
 */
export const AlertCard = ({ alert }: AlertCardProps) => {
  const { acknowledgeAlert, operators } = useApp();
  const Icon = statusIcons[alert.type];
  const acknowledgedBy = operators.find((operator) => operator.id === alert.acknowledgedBy);
  const isConnectivity = alert.source === 'connectivity';
  const severity = statusLabels[alert.type];

  return (
    <article
      className="rounded-xl border border-border border-l-4 bg-surface p-3 md:p-4"
      style={{ borderLeftColor: statusCssVar[alert.type] }}
    >
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden="true"
          className={`mt-0.5 h-5 w-5 shrink-0 ${statusTextClass[alert.type]}`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-xs font-semibold uppercase tracking-wide ${statusTextClass[alert.type]}`}>
              {severity}
            </span>
            <span className="text-xs text-content-muted">
              {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
            </span>
            {alert.acknowledged ? (
              <span className="inline-flex items-center gap-1 text-xs text-content-muted">
                <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                Acknowledged
              </span>
            ) : null}
          </div>

          <Link
            to={`/alerts/${alert.id}`}
            className="mt-1 block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <h3 className="text-sm font-medium text-content hover:underline">{alert.path}</h3>
          </Link>

          {isConnectivity ? (
            <p className="mt-2 text-xs text-content-muted">
              Sensor box offline. Last reported {alert.readingName}{' '}
              <span className="font-medium tabular-nums text-content">
                {alert.readingValue} {alert.unit}
              </span>
              .
            </p>
          ) : (
            <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-surface-muted px-2 py-1.5">
                <dt className="text-content-muted">Reading</dt>
                <dd className={`font-semibold tabular-nums ${statusTextClass[alert.type]}`}>
                  {alert.readingValue} {alert.unit}
                </dd>
              </div>
              <div className="rounded-lg bg-surface-muted px-2 py-1.5">
                <dt className="text-content-muted capitalize">{severity} limit</dt>
                <dd className="font-semibold tabular-nums text-content">
                  {alert.threshold} {alert.unit}
                </dd>
              </div>
            </dl>
          )}

          <dl className="mt-2 space-y-1 text-xs">
            <div>
              <dt className="inline font-medium text-content">Likely cause: </dt>
              <dd className="inline text-content-muted">{alert.likelyCause}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-content">Recommended: </dt>
              <dd className="inline text-content-muted">
                {alert.recommendedAction}{' '}
                <span className="font-medium text-content">({alert.timeFrame})</span>
              </dd>
            </div>
          </dl>

          {alert.actionTaken ? (
            <p className="mt-2 text-xs text-content-muted">
              Action taken: {alert.actionTaken}
              {acknowledgedBy ? ` — ${acknowledgedBy.name}` : ''}
            </p>
          ) : null}

          {!alert.acknowledged ? (
            <button
              type="button"
              onClick={() => acknowledgeAlert(alert.id)}
              className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Acknowledge
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
};
