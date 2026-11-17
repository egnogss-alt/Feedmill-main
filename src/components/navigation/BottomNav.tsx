import { NavLink } from 'react-router-dom';
import { navAriaLabel, useNavItems } from './navItems';

/**
 * Mobile navigation, under 768px. Visible at all times (icon + label), 44px
 * minimum touch targets and safe-area padding so it clears the home bar on
 * phones. Desktop uses <Sidebar /> instead.
 */
export const BottomNav = () => {
  const items = useNavItems();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              aria-label={navAriaLabel(item)}
              className={({ isActive }) =>
                [
                  'flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                  isActive ? 'text-primary' : 'text-content-muted hover:text-content',
                ].join(' ')
              }
            >
              <span className="relative">
                <item.icon aria-hidden="true" className="h-5 w-5" />
                {item.badge ? (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-status-critical px-1 text-[10px] font-semibold leading-none text-white">
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
