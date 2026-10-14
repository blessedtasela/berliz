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
  /**
   * Makes this entry a collapsible GROUP of destinations (Train, Find & book, Community, Me) instead of a link
   * of its own: the open sidebar shows just its name and chevron, and opens to these items; the icon rail shows
   * one icon for the whole group. A group never has its own `route`.
   */
  items?: SidebarNavItem[];
}

export interface SidebarNavChildItem {
  name: string;
  route: string;
  fragment?: string;
}

/**
 * Single source of truth for the dashboard sidebar's nav list -- used by both
 * the expanded (side-bar-open) and collapsed (side-bar-close) variants.
 *
 * Shaped around what people do rather than around every page that exists: the
 * handful of things used daily are always visible, and the rest sit in four
 * named groups that open on demand (and open by themselves while one of their
 * pages is showing). A flat list of 25+ entries is what made the sidebar hard
 * to scan and overflow the viewport; every route is still reachable, one tap
 * further in.
 */
export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { name: 'Dashboard', icon: 'package', route: '/dashboard', exact: true },
  { name: 'Messages', icon: 'message-circle', route: '/dashboard/messages' },
  { name: 'Notifications', icon: 'inbox', route: '/dashboard/my-notifications' },
  { name: 'Bookings', icon: 'clock', route: '/dashboard/my-bookings' },

  // A trainer/center is a partner first-class citizen, not just "a user with
  // extra pages" -- same reasoning as the mobile app's TRAINER_SECTION /
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

  { label: 'Explore' },
  {
    name: 'Train', icon: 'activity', items: [
      { name: 'Workout Room', icon: 'zap', route: '/dashboard/workout-room' },
      { name: 'Workouts', icon: 'play-circle', route: '/dashboard/workouts' },
      { name: 'Runs', icon: 'wind', route: '/dashboard/runs' },
      { name: 'Tasks', icon: 'activity', route: '/dashboard/my-tasks' },
      { name: 'To-do list', icon: 'calendar', route: '/dashboard/my-todos' },
      { name: 'My Progress', icon: 'trending-up', route: '/dashboard/my-progress' },
      { name: 'Recap', icon: 'bar-chart-2', route: '/dashboard/recap' },
      { name: 'Achievements', icon: 'award', route: '/dashboard/achievements' },
      { name: 'Exercises & Gear', icon: 'layers', route: '/dashboard/exercises' },
    ],
  },
  {
    name: 'Find & Book', icon: 'search', items: [
      { name: 'Find a Provider', icon: 'search', route: '/dashboard/find-providers' },
      { name: 'Deals', icon: 'percent', route: '/dashboard/deals' },
      { name: 'Sessions', icon: 'user-check', route: '/dashboard/my-sessions' },
    ],
  },
  {
    name: 'Community', icon: 'users', items: [
      { name: 'Timeline', icon: 'file-text', route: '/dashboard/timeline' },
      { name: 'Connections', icon: 'users', route: '/dashboard/connections' },
      { name: 'Members', icon: 'grid', route: '/dashboard/member-directory' },
      { name: 'Hub', icon: 'globe', route: '/dashboard/hub' },
    ],
  },
  {
    name: 'Me', icon: 'user', items: [
      { name: 'Profile', icon: 'user', route: '/dashboard/profile/view' },
      { name: 'Settings', icon: 'settings', route: '/dashboard/profile/edit' },
      { name: 'Saved', icon: 'bookmark', route: '/dashboard/saved' },
      { name: 'My Drafts', icon: 'edit-3', route: '/dashboard/my-drafts' },
      { name: 'Rewards', icon: 'gift', route: '/dashboard/my-rewards' },
      { name: 'Subscriptions', icon: 'airplay', route: '/dashboard/my-subscriptions' },
      { name: 'FAQs', icon: 'message-square', route: '/dashboard/my-faqs' },
    ],
  },
];

/** Where the icon rail sends you for a group: its first destination (the full list is one tap away in the open sidebar). */
export function sidebarGroupRoute(group: SidebarNavItem): string {
  return group.items?.[0]?.route ?? '/dashboard';
}

/** True when `url` is on any page of the group (so the group header highlights and opens by itself). */
export function sidebarGroupIsActive(group: SidebarNavItem, url: string | null | undefined): boolean {
  if (!url) return false;
  return (group.items ?? []).some(i => !!i.route && (i.exact ? url === i.route : url.startsWith(i.route)));
}

/**
 * `SIDEBAR_NAV_ITEMS` filtered for one viewer's role: drops any item whose
 * `roles` doesn't include theirs, and drops a `label` row too if every item
 * under it (up to the next label) got dropped — a section heading with
 * nothing under it is worse than no heading at all, not a harmless no-op.
 */
/**
 * The result is cached per role and the SAME array comes back on every call. Both sidebars read it from a
 * getter bound to *ngFor, so a fresh array (with fresh `{...item, items}` copies) on every change-detection
 * pass made Angular tear down and rebuild the whole sidebar each pass; RouterLinkActive marks the view dirty
 * as each link is created, which triggers the next pass -- a render loop that froze the dashboard the moment
 * the sidebar mounted after login. SIDEBAR_NAV_ITEMS is constant, so caching by role is always valid.
 */
const filteredByRole = new Map<string, SidebarNavItem[]>();

export function filterSidebarNavItems(role: string | null | undefined): SidebarNavItem[] {
  const key = role ?? '';
  let cached = filteredByRole.get(key);
  if (!cached) {
    cached = buildSidebarNavItems(role);
    filteredByRole.set(key, cached);
  }
  return cached;
}

function buildSidebarNavItems(role: string | null | undefined): SidebarNavItem[] {
  const visible = (item: SidebarNavItem): boolean => !item.roles || (!!role && item.roles.includes(role));

  const result: SidebarNavItem[] = [];
  let pendingLabel: SidebarNavItem | null = null;
  let pendingLabelHasItems = false;

  for (let item of SIDEBAR_NAV_ITEMS) {
    if (item.label !== undefined) {
      // Flush the previous section only if it ended up with something in it.
      if (pendingLabel && pendingLabelHasItems) result.push(pendingLabel);
      pendingLabel = item;
      pendingLabelHasItems = false;
      continue;
    }

    if (!visible(item)) continue;

    if (item.items) {
      const kept = item.items.filter(visible);
      if (!kept.length) continue;
      item = { ...item, items: kept };
    }

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
