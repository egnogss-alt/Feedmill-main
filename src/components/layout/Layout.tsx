import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert } from '../../types';
import { NotificationPrefs, useApp } from '../../context/AppContext';
import { BottomNav } from '../navigation/BottomNav';
import { Sidebar } from '../navigation/Sidebar';
import { ToastBanner } from '../toast-banner/ToastBanner';
import { TopBar } from './TopBar';

/** Screen title shown in the top bar, derived from the route. */
const screenTitle = (pathname: string): string => {
  if (pathname === '/') return 'Overview';
  if (pathname.startsWith('/machines')) return 'Machines';
  if (pathname.startsWith('/equipment')) return 'Equipment';
  if (pathname.startsWith('/part')) return 'Part detail';
  if (pathname.startsWith('/alerts')) return 'Alerts';
  if (pathname.startsWith('/history')) return 'History';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'MillGuard';
};

/**
 * Watches the alert log for something new and unacknowledged and surfaces it as
 * a slide-in banner. Alerts that already existed on load are not re-announced.
 * The Critical / Warning switches in Settings suppress the matching banners -
 * a suppressed alert is still marked as seen, so re-enabling the switch never
 * replays old notifications. If Reset Demo removes the alert a banner points
 * at, the banner is dismissed rather than linking to a dead detail screen.
 */
const useNewAlertBanner = (alerts: Alert[], prefs: NotificationPrefs) => {
  const seen = useRef<Set<string>>(new Set(alerts.map((alert) => alert.id)));
  const [banner, setBanner] = useState<Alert | null>(null);

  useEffect(() => {
    const fresh = alerts.filter(
      (alert) => !alert.acknowledged && !seen.current.has(alert.id)
    );
    if (fresh.length === 0) return;
    // Newest first (the log is prepend-ordered): mark all as seen, then surface
    // the newest one whose severity switch allows it.
    fresh.forEach((alert) => seen.current.add(alert.id));
    const next = fresh.find((alert) =>
      alert.type === 'critical' ? prefs.criticalBanners : prefs.warningBanners
    );
    if (next) setBanner(next);
  }, [alerts, prefs.criticalBanners, prefs.warningBanners]);

  useEffect(() => {
    if (banner && !alerts.some((alert) => alert.id === banner.id)) setBanner(null);
  }, [alerts, banner]);

  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => setBanner(null), 9000);
    return () => window.clearTimeout(timer);
  }, [banner]);

  return { banner, dismissBanner: () => setBanner(null) };
};

const simulatedDataBanner = 'SIMULATED DATA - Design prototype. No sensors connected. Read-only monitoring only.';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { alerts, notificationPrefs } = useApp();
  const location = useLocation();
  const { banner, dismissBanner } = useNewAlertBanner(alerts, notificationPrefs);
  
  return (
    <div className="min-h-screen bg-surface-muted text-content">
      <Sidebar />

      <div className="md:pl-60">
        <TopBar title={screenTitle(location.pathname)} />

        <div className="w-full bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-b border-amber-200 dark:border-amber-800">
          <div className="mx-auto w-full max-w-7xl px-3 py-1.5 text-xs font-medium text-center md:text-left md:px-6">
            {simulatedDataBanner}
          </div>
        </div>

        <main id="main" className="mx-auto w-full max-w-7xl px-3 pb-24 pt-4 md:px-6 md:pb-10">
          {children}
        </main>

        <footer className="mx-auto w-full max-w-7xl px-3 pb-24 text-xs text-content-muted md:px-6 md:pb-8">
          Concept demo: every value, alert and user is sample data.
        </footer>
      </div>

      <BottomNav />

      {banner ? <ToastBanner alert={banner} onDismiss={dismissBanner} /> : null}
    </div>
  );
};