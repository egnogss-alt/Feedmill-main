import { LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

interface TopBarProps {
  title: string;
}

/**
 * Top bar shared by every screen. Mobile gets a single slim row - screen title,
 * the concept-demo tag and the theme/sign-out actions - so the sticky header no
 * longer eats a large slice of the viewport. The facility line (name + sync
 * age) only renders from the md breakpoint up. The signed-in role chip and the
 * live sensor-box count are deliberately not shown here: they live in Settings
 * (Operator Profile) and on the Home summary strip / Sidebar instead.
 */
export const TopBar = ({ title }: TopBarProps) => {
  const { facility, logout } = useApp();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const iconButton =
    'inline-flex h-11 w-11 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-hover hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  return (
    <header
      className="sticky top-0 z-20 border-b border-border bg-surface"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-3 py-2 md:gap-3 md:px-6 md:py-3">
        <h1 className="min-w-0 truncate text-base font-semibold text-content md:text-lg">{title}</h1>

        <span className="ml-auto shrink-0 rounded-full border border-primary-border bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium text-primary-soft-foreground md:px-2 md:text-[11px]">
          Sample Data - Concept Demo
        </span>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className={iconButton}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          <button type="button" onClick={handleLogout} aria-label="Sign out" className={iconButton}>
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mx-auto hidden w-full max-w-7xl items-center gap-2 px-6 pb-2 text-xs text-content-muted md:flex">
        <span className="font-medium text-content">{facility.name}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">synced {facility.lastSync}s ago</span>
      </div>
    </header>
  );
};
