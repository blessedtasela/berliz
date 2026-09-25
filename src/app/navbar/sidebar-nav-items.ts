export interface SidebarNavItem {
  name?: string;
  icon?: string;
  route?: string;
  exact?: boolean;
  separator?: true;
  /** Section heading — collapsed rail shows nothing for these (no room for text). */
  label?: string;
  /**
   * Restricts this item (or every item under this label, until the next
   * label) to the given roles. Omit for "everyone" — that's still most of
   * the list; a trainer or center is a user first and keeps every one of
   * the always-shown items too, this is purely additive.
   */
  roles?: string[];
  /** Sub-items shown expanded under this one (manually via its chevron, or
   *  automatically while any of its own route is active) -- e.g. My Trainer/
   *  Center Profile's Introduction/Pricing/Benefits sections. Each jumps to
   *  a specific part of the parent's page via router fragment, not a
   *  separate route of its own. */
  children?: SidebarNavChildItem[];
}

export interface SidebarNavChildItem {
  name: string;
  route: string;
  fragment?: string;
}

/**
 * Single source of truth for the dashboard sidebar's nav list — used by both
 * the expanded (side-bar-open) and collapsed (side-bar-close) variants.
 * Previously each had its own hand-copied array, which drifted out of sync
 * (the collapsed one was missing several routes and still had 'Settings' as
 * its own entry after Profile/Settings were merged).
 *
 * Grouped into sections rather than one flat list — a flat 15+ item list is
 * what made the sidebar overflow the viewport in the first place.
 */
export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { label: 'Overview' },
  { name: 'Dashboard', icon: 'package', route: '/dashboard', exact: true },
  { name: 'Notifications', icon: 'inbox', route: '/dashboard/my-notifications' },
  { name: 'Messages', icon: 'message-circle', route: '/dashboard/messages' },
  { name: 'Timeline', icon: 'file-text', route: '/dashboard/timeline' },
  { name: 'Connections', icon: 'users', route: '/dashboard/connections' },
  { name: 'Sessions', icon: 'user-check', route: '/dashboard/my-sessions' },
  { name: 'Members', icon: 'grid', route: '/dashboard/member-directory' },

  // A trainer/center is a partner first-class citizen, not just "a user with
  // extra pages" — same reasoning as the mobile app's TRAINER_SECTION /
  // CENTER_SECTION drawer sections (roleSections.ts): a dedicated, named
  // section so their profile (bio/pricing/benefits/photo+video album/
  // availability, plus clients/reviews/shared-progress for a trainer) is one
  // click away instead of only reachable by stumbling into a Hub tile.
  { label: 'My Profile', roles: ['trainer', 'center'] },
  {
    name: 'My Trainer Profile', icon: 'briefcase', route: '/dashboard/partnership', roles: ['trainer'],
    // The overview lives at /dashboard/partnership itself; the actual editable
    // sections are further in, on /dashboard/partnership/trainer-details.
    children: [
      { name: 'Introduction', route: '/dashboard/partnership/trainer-details', fragment: 'introduction' },
      { name: 'Pricing', route: '/dashboard/partnership/trainer-details', fragment: 'pricing' },
      { name: 'Benefits', route: '/dashboard/partnership/trainer-details', fragment: 'benefits' },
      { name: 'Feature Videos', route: '/dashboard/partnership/trainer-details', fragment: 'feature-videos' },
      { name: 'Photo Album', route: '/dashboard/partnership/trainer-details', fragment: 'photo-album' },
      { name: 'Video Album', route: '/dashboard/partnership/trainer-details', fragment: 'video-album' },
    ],
  },
  {
    name: 'My Center Profile', icon: 'briefcase', route: '/dashboard/partnership', roles: ['center'],
    // Unlike trainers, a center's sections render directly on /dashboard/partnership
    // itself -- no separate "-details" sub-route exists for centers.
    children: [
      { name: 'Introduction', route: '/dashboard/partnership', fragment: 'introduction' },
      { name: 'Pricing', route: '/dashboard/partnership', fragment: 'pricing' },
      { name: 'Equipment', route: '/dashboard/partnership', fragment: 'equipment' },
      { name: 'Locations', route: '/dashboard/partnership', fragment: 'locations' },
      { name: 'Photo Album', route: '/dashboard/partnership', fragment: 'photo-album' },
      { name: 'Video Album', route: '/dashboard/partnership', fragment: 'video-album' },
    ],
  },
  { name: 'Promotions', icon: 'tag', route: '/dashboard/my-promotions', roles: ['trainer', 'center'] },
  { name: 'Packages', icon: 'package', route: '/dashboard/my-packages', roles: ['trainer', 'center'] },

  { label: 'Training' },
  { name: 'Tasks', icon: 'activity', route: '/dashboard/my-tasks' },
  { name: 'To-do list', icon: 'calendar', route: '/dashboard/my-todos' },
  { name: 'Workouts', icon: 'zap', route: '/dashboard/workouts' },
  { name: 'Runs', icon: 'wind', route: '/dashboard/runs' },
  { name: 'My Progress', icon: 'trending-up', route: '/dashboard/my-progress' },
  { name: 'Recap', icon: 'bar-chart-2', route: '/dashboard/recap' },
  { name: 'Exercises & Gear', icon: 'layers', route: '/dashboard/exercises' },
  { name: 'Find a Provider', icon: 'search', route: '/dashboard/find-providers' },
  { name: 'Deals', icon: 'tag', route: '/dashboard/deals' },
  { name: 'Bookings', icon: 'clock', route: '/dashboard/my-bookings' },

  { label: 'Account' },
  { name: 'Profile', icon: 'user', route: '/dashboard/profile/view' },
  { name: 'Settings', icon: 'settings', route: '/dashboard/profile/edit' },
  { name: 'Saved', icon: 'bookmark', route: '/dashboard/saved' },
  { name: 'My Drafts', icon: 'clock', route: '/dashboard/my-drafts' },
  { name: 'Rewards', icon: 'gift', route: '/dashboard/my-rewards' },
  { name: 'Subscriptions', icon: 'airplay', route: '/dashboard/my-subscriptions' },
  { name: 'Hub', icon: 'globe', route: '/dashboard/hub' },
  { name: 'FAQs', icon: 'message-square', route: '/dashboard/my-faqs' },
];

/**
 * `SIDEBAR_NAV_ITEMS` filtered for one viewer's role: drops any item whose
 * `roles` doesn't include theirs, and drops a `label` row too if every item
 * under it (up to the next label) got dropped — a section heading with
 * nothing under it is worse than no heading at all, not a harmless no-op.
 */
export function filterSidebarNavItems(role: string | null | undefined): SidebarNavItem[] {
  const visible = (item: SidebarNavItem): boolean => !item.roles || (!!role && item.roles.includes(role));

  const result: SidebarNavItem[] = [];
  let pendingLabel: SidebarNavItem | null = null;
  let pendingLabelHasItems = false;

  for (const item of SIDEBAR_NAV_ITEMS) {
    if (item.label !== undefined) {
      // Flush the previous section only if it ended up with something in it.
      if (pendingLabel && pendingLabelHasItems) result.push(pendingLabel);
      pendingLabel = item;
      pendingLabelHasItems = false;
      continue;
    }

    if (!visible(item)) continue;

    if (pendingLabel) {
      result.push(pendingLabel);
      pendingLabel = null;
    }
    pendingLabelHasItems = true;
    result.push(item);
  }

  if (pendingLabel && pendingLabelHasItems) result.push(pendingLabel);

  return result;
}
