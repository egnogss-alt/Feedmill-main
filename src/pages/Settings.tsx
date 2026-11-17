import {
  Moon,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  Bell,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { SimulateButtons } from '../components/simulate/SimulateButtons';
import { ThresholdSettings } from '../components/settings/ThresholdSettings';
import { UserManagement } from '../components/settings/UserManagement';

export const Settings = () => {
  const { currentOperator, facility, logout, notificationPrefs, setNotificationPrefs } = useApp();
  const { theme, toggleTheme } = useTheme();
  const isAdministrator = currentOperator?.role === 'administrator';

  return (
    <div className="space-y-6">
      {/* 1. Account & Operator Profile */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-content">
              <SettingsIcon className="h-5 w-5 text-content-muted" />
              Operator Profile & Facility
            </h2>
            <p className="mt-0.5 text-xs text-content-muted">
              Current authenticated session and facility credentials
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-status-critical/30 bg-status-critical/10 px-3.5 text-xs font-semibold text-status-critical transition-colors hover:bg-status-critical/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-critical"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
          <div className="rounded-lg bg-surface-muted/60 p-3">
            <span className="text-xs text-content-muted block">Signed In Operator</span>
            <span className="text-sm font-semibold text-content block mt-0.5">
              {currentOperator?.name}
            </span>
            <span className="text-xs text-content-muted capitalize">@{currentOperator?.username}</span>
          </div>

          <div className="rounded-lg bg-surface-muted/60 p-3">
            <span className="text-xs text-content-muted block">Assigned Role</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-semibold text-content capitalize">
                {currentOperator?.role}
              </span>
              {isAdministrator && (
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>
            <span className="text-xs text-content-muted">
              {isAdministrator ? 'Full administrative rights' : 'Control room & acknowledge permissions'}
            </span>
          </div>

          <div className="rounded-lg bg-surface-muted/60 p-3">
            <span className="text-xs text-content-muted block">Monitored Facility</span>
            <span className="text-sm font-semibold text-content block mt-0.5">
              {facility.name}
            </span>
            <span className="text-xs text-content-muted">Feed Processing Plant</span>
          </div>
        </div>

        {/* Theme mode toggle */}
        <div className="pt-2 flex items-center justify-between border-t border-border">
          <div>
            <span className="text-xs font-semibold text-content block">Theme Appearance</span>
            <span className="text-xs text-content-muted">Toggle between dark and light industrial display modes</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-content transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {theme === 'dark' ? (
              <Sun aria-hidden="true" className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon aria-hidden="true" className="h-4 w-4 text-blue-500" />
            )}
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </button>
        </div>
      </section>

      {/* 2. Notification Preferences */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-content">
            <Bell className="h-5 w-5 text-content-muted" />
            Alarm & Notification Preferences
          </h2>
          <p className="mt-0.5 text-xs text-content-muted">
            Choose which newly raised alerts slide in as a banner on this terminal
          </p>
        </div>

        <div className="divide-y divide-border pt-1">
          <label className="flex items-center justify-between py-2.5 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-content block">
                Critical Alert Banners
              </span>
              <span className="text-[11px] text-content-muted">
                Slide in a banner at the top of the screen when a critical threshold is breached
              </span>
            </div>
            <input
              type="checkbox"
              checked={notificationPrefs.criticalBanners}
              onChange={(e) =>
                setNotificationPrefs((prev) => ({ ...prev, criticalBanners: e.target.checked }))
              }
              className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between py-2.5 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-content block">
                Warning Banner Toasts
              </span>
              <span className="text-[11px] text-content-muted">
                Display pop-up banners on top of the screen when caution thresholds trip
              </span>
            </div>
            <input
              type="checkbox"
              checked={notificationPrefs.warningBanners}
              onChange={(e) =>
                setNotificationPrefs((prev) => ({ ...prev, warningBanners: e.target.checked }))
              }
              className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer"
            />
          </label>
        </div>
      </section>

      {/* 3. Demo Controls with Part Picker defaulting to Pellet Press Main Bearing + Reset Demo */}
      <section>
        <SimulateButtons showReset={true} />
      </section>

      {/* 4. Administrator Only Sections */}
      {isAdministrator && (
        <section className="space-y-6 pt-2 border-t border-border">
          {/* Threshold Configuration with Live ArcGauge */}
          <ThresholdSettings />

          {/* User Management */}
          <UserManagement />
        </section>
      )}
    </div>
  );
};