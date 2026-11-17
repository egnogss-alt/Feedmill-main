import { Bell, Factory, History, Home as HomeIcon, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Home needs `end` so it is not active on every route. */
  end?: boolean;
  /** Unacknowledged alert count, shown as a badge. */
  badge?: number;
}

/** The five destinations, shared by the mobile bottom nav and the desktop sidebar. */
export const useNavItems = (): NavItem[] => {
  const { facility } = useApp();
  const unacknowledged = facility.alertCount.unacknowledged;

  return [
    { to: '/', label: 'Home', icon: HomeIcon, end: true },
    { to: '/machines', label: 'Machines', icon: Factory },
    { to: '/alerts', label: 'Alerts', icon: Bell, badge: unacknowledged },
    { to: '/history', label: 'History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];
};

export const navAriaLabel = (item: NavItem): string =>
  item.badge
    ? `${item.label}, ${item.badge} unacknowledged alert${item.badge === 1 ? '' : 's'}`
    : item.label;
