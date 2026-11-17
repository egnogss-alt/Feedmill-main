import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { navAriaLabel, useNavItems } from './navItems';

/** Tablet and desktop navigation, 768px and up. */
export const Sidebar = () => {
  const items = useNavItems();
  const { facility } = useApp();

  return (
    <aside
      aria-label="Main navigation"
      className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-surface md:flex"
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          MG
        </span>
        <span className="font-semibold text-content">MillGuard</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                aria-label={navAriaLabel(item)}
                className={({ isActive }) =>
                  [
                    'flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isActive
                      ? 'bg-primary-soft text-primary-soft-foreground'
                      : 'text-content-muted hover:bg-surface-hover hover:text-content',
                  ].join(' ')
                }
              >
                <item.icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full bg-status-critical px-2 py-0.5 text-xs font-semibold text-white tabular-nums">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-3 text-xs text-content-muted">
              <p className="font-medium text-content">{facility.name}</p>
              <p className="tabular-nums">
                {facility.sensorBoxesOnline.online}/{facility.sensorBoxesOnline.total} simulated sensor boxes
              </p>
            </div>
    </aside>
  );
};
