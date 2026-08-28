export interface SidebarNavItem {
  name?: string;
  icon?: string;
  route?: string;
  exact?: boolean;
  separator?: true;
}

/**
 * Single source of truth for the dashboard sidebar's nav list — used by both
 * the expanded (side-bar-open) and collapsed (side-bar-close) variants.
 * Previously each had its own hand-copied array, which drifted out of sync
 * (the collapsed one was missing several routes and still had 'Settings' as
 * its own entry after Profile/Settings were merged).
 */
export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { name: 'Dashboard', icon: 'package', route: '/dashboard', exact: true },
  { name: 'Tasks', icon: 'activity', route: '/dashboard/my-tasks' },
  { name: 'Notifications', icon: 'inbox', route: '/dashboard/my-notifications' },
  { name: 'Messages', icon: 'message-circle', route: '/dashboard/messages' },
  { name: 'Connections', icon: 'users', route: '/dashboard/connections' },
  { name: 'Hub', icon: 'globe', route: '/dashboard/hub' },
  { name: 'Profile', icon: 'user', route: '/dashboard/profile' },
  { separator: true },
  { name: 'Workouts', icon: 'zap', route: '/dashboard/workouts' },
  { name: 'My Progress', icon: 'trending-up', route: '/dashboard/my-progress' },
  { name: 'Exercises & Gear', icon: 'layers', route: '/dashboard/exercises' },
  { name: 'To-do list', icon: 'calendar', route: '/dashboard/my-todos' },
  { name: 'Subscriptions', icon: 'airplay', route: '/dashboard/my-subscriptions' },
  { name: 'Find a Provider', icon: 'search', route: '/dashboard/find-providers' },
  { name: 'My Bookings', icon: 'clock', route: '/dashboard/my-bookings' },
  { name: 'FAQs', icon: 'message-square', route: '/dashboard/my-faqs' },
];
