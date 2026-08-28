export interface SidebarNavItem {
  name?: string;
  icon?: string;
  route?: string;
  exact?: boolean;
  separator?: true;
  /** Section heading — collapsed rail shows nothing for these (no room for text). */
  label?: string;
}

/**
 * Single source of truth for the dashboard sidebar's nav list — used by both
 * the expanded (side-bar-open) and collapsed (side-bar-close) variants.
 * Previously each had its own hand-copied array, which drifted out of sync
 * (the collapsed one was missing several routes and still had 'Settings' as
 * its own entry after Profile/Settings were merged).
 *
 * Grouped into three sections rather than one flat list — a flat 15-item
 * list is what made the sidebar overflow the viewport in the first place.
 */
export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { label: 'Overview' },
  { name: 'Dashboard', icon: 'package', route: '/dashboard', exact: true },
  { name: 'Notifications', icon: 'inbox', route: '/dashboard/my-notifications' },
  { name: 'Messages', icon: 'message-circle', route: '/dashboard/messages' },
  { name: 'Timeline', icon: 'file-text', route: '/dashboard/timeline' },
  { name: 'Connections', icon: 'users', route: '/dashboard/connections' },
  { name: 'Members', icon: 'grid', route: '/dashboard/member-directory' },

  { label: 'Training' },
  { name: 'Tasks', icon: 'activity', route: '/dashboard/my-tasks' },
  { name: 'To-do list', icon: 'calendar', route: '/dashboard/my-todos' },
  { name: 'Workouts', icon: 'zap', route: '/dashboard/workouts' },
  { name: 'My Progress', icon: 'trending-up', route: '/dashboard/my-progress' },
  { name: 'Exercises & Gear', icon: 'layers', route: '/dashboard/exercises' },
  { name: 'Find a Provider', icon: 'search', route: '/dashboard/find-providers' },
  { name: 'My Bookings', icon: 'clock', route: '/dashboard/my-bookings' },

  { label: 'Account' },
  { name: 'Profile', icon: 'user', route: '/dashboard/profile' },
  { name: 'Subscriptions', icon: 'airplay', route: '/dashboard/my-subscriptions' },
  { name: 'Hub', icon: 'globe', route: '/dashboard/hub' },
  { name: 'FAQs', icon: 'message-square', route: '/dashboard/my-faqs' },
];
