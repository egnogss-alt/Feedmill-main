import { useState, useMemo } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  AlertOctagon,
  Clock,
  User,
  Wrench,
  WifiOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, formatDistanceToNow } from 'date-fns';
import { statusCssVar, statusIcons, statusLabels, statusTextClass } from '../lib/statusStyles';
import { Link } from 'react-router-dom';

type SeverityFilter = 'all' | 'critical' | 'warning';
type DateFilter = 'all' | '24h' | '7d' | '30d';

export const History = () => {
  const { facility, alerts, machines, operators } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>('all');
  const [selectedDate, setSelectedDate] = useState<DateFilter>('all');

  // Filter history alerts
  const filteredAlerts = useMemo(() => {
    const now = Date.now();
    return alerts.filter((alert) => {
      // Machine filter
      if (selectedMachine !== 'all' && alert.machineId !== selectedMachine) {
        return false;
      }

      // Severity filter
      if (selectedSeverity !== 'all' && alert.type !== selectedSeverity) {
        return false;
      }

      // Date window filter
      if (selectedDate !== 'all') {
        const alertTime = new Date(alert.timestamp).getTime();
        const diffHours = (now - alertTime) / (1000 * 60 * 60);
        if (selectedDate === '24h' && diffHours > 24) return false;
        if (selectedDate === '7d' && diffHours > 24 * 7) return false;
        if (selectedDate === '30d' && diffHours > 24 * 30) return false;
      }

      // Search query filter (matches path, message, actionTaken, acknowledgedBy)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const operatorName =
          operators.find((op) => op.id === alert.acknowledgedBy)?.name.toLowerCase() ?? '';
        const matchPath = alert.path.toLowerCase().includes(query);
        const matchMessage = alert.message.toLowerCase().includes(query);
        const matchAction = alert.actionTaken?.toLowerCase().includes(query) ?? false;
        const matchCause = alert.likelyCause?.toLowerCase().includes(query) ?? false;
        const matchOp = operatorName.includes(query);
        if (!matchPath && !matchMessage && !matchAction && !matchCause && !matchOp) {
          return false;
        }
      }

      return true;
    });
  }, [alerts, selectedMachine, selectedSeverity, selectedDate, searchQuery, operators]);

  return (
    <div className="space-y-4">
      {/* Top Banner and Search/Filter Bar */}
      <section className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-base font-semibold text-content">
              <HistoryIcon className="h-5 w-5 text-content-muted" />
              Incident & Maintenance History
            </h1>
            <p className="mt-0.5 text-xs text-content-muted">
              Audit trail of detected telemetry alerts and logged operator remediation at{' '}
              {facility.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-semibold text-content">
              {filteredAlerts.length} of {alerts.length} incidents
            </span>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search component, action, operator..."
              className="w-full min-h-[40px] pl-9 pr-3 rounded-lg border border-border bg-surface text-xs text-content placeholder:text-content-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* Machine Filter Dropdown */}
          <div>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-lg border border-border bg-surface text-xs text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="all">All Machines (All Sections)</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.section})
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter Dropdown */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as SeverityFilter)}
              className="w-full min-h-[40px] px-3 rounded-lg border border-border bg-surface text-xs text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Incidents</option>
              <option value="warning">Warning Incidents</option>
            </select>
          </div>

          {/* Date Window Dropdown */}
          <div>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value as DateFilter)}
              className="w-full min-h-[40px] px-3 rounded-lg border border-border bg-surface text-xs text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="all">All Available History (30 Days)</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </section>

      {/* Incident List */}
      <section className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isConnectivity = alert.source === 'connectivity';
            const Icon = isConnectivity ? WifiOff : statusIcons[alert.type];
            const acknowledgedBy = operators.find((op) => op.id === alert.acknowledgedBy);
            const severity = statusLabels[alert.type];

            return (
              <article
                key={alert.id}
                className="rounded-xl border border-border border-l-4 bg-surface p-4 shadow-xs transition-colors hover:border-border-strong"
                style={{ borderLeftColor: statusCssVar[alert.type] }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`h-5 w-5 shrink-0 mt-0.5 ${statusTextClass[alert.type]}`}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${statusTextClass[alert.type]}`}
                        >
                          {severity}
                        </span>
                        <span className="text-xs text-content-muted">·</span>
                        <span className="text-xs text-content-muted">
                          {format(new Date(alert.timestamp), 'MMM d, yyyy HH:mm')} (
                          {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })})
                        </span>
                        {alert.acknowledged ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-normal bg-status-normal/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> Acknowledged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-critical bg-status-critical/10 px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3" /> Unacknowledged
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/alerts/${alert.id}`}
                        className="mt-1 block font-semibold text-sm text-content hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      >
                        {alert.path}
                      </Link>

                      <p className="mt-1 text-xs text-content-muted">{alert.message}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold tabular-nums text-content block">
                      {alert.readingValue} {alert.unit}
                    </span>
                    {!isConnectivity && (
                      <span className="text-[11px] text-content-muted block">
                        Limit: {alert.threshold} {alert.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Audit & Remediation Details */}
                <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-2 pt-3 border-t border-border bg-surface-muted/30 rounded-lg p-3 text-xs">
                  <div>
                    <span className="font-semibold text-content block flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-content-muted" /> Acknowledged By:
                    </span>
                    <span className="text-content-muted mt-0.5 block">
                      {acknowledgedBy?.name ?? alert.acknowledgedBy ?? 'Pending operator acknowledgement'}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-content block flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-content-muted" /> Action Taken:
                    </span>
                    <span className="text-content-muted mt-0.5 block italic">
                      {alert.actionTaken ? `"${alert.actionTaken}"` : 'No maintenance action logged.'}
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-status-normal" />
            <p className="mt-2 text-sm font-semibold text-content">No incident history matches</p>
            <p className="mt-1 text-xs text-content-muted">
              Try adjusting your search query, machine selection, or historical date range.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};