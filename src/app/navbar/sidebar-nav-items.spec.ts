import { filterSidebarNavItems, SIDEBAR_NAV_ITEMS, sidebarGroupIsActive, sidebarGroupRoute } from './sidebar-nav-items';

describe('sidebar-nav-items', () => {

  it('gives Profile and Settings distinct, non-overlapping routes', () => {
    // Both live under /dashboard/profile (a shared toggle component), so a
    // sloppy route here would make BOTH items highlight together via the
    // sidebar's startsWith-based active check -- see side-bar-open's isActive.
    const all = SIDEBAR_NAV_ITEMS.flatMap(i => i.items ?? [i]);
    const profile = all.find(i => i.name === 'Profile');
    const settings = all.find(i => i.name === 'Settings');

    expect(profile?.route).toBe('/dashboard/profile/view');
    expect(settings?.route).toBe('/dashboard/profile/edit');
    expect(settings?.route!.startsWith(profile!.route!)).toBeFalse();
    expect(profile?.route!.startsWith(settings!.route!)).toBeFalse();
  });

  it('keeps Settings visible for every role (no roles restriction)', () => {
    for (const role of ['user', 'trainer', 'center', 'admin', null, undefined]) {
      const visible = filterSidebarNavItems(role as any).flatMap(i => i.items ?? [i]).some(i => i.name === 'Settings');
      expect(visible).toBeTrue();
    }
  });
});

describe('sidebar-nav-items groups', () => {
  const leaves = (items: any[]): any[] => items.flatMap(i => i.items ? leaves(i.items) : [i]);

  it('keeps the default sidebar short: a client sees at most 10 rows before opening any group', () => {
    const rows = filterSidebarNavItems('user').filter(i => !i.label);
    expect(rows.length).toBeLessThanOrEqual(10);
  });

  it('still reaches every page that used to be a top-level entry', () => {
    const routes = leaves(filterSidebarNavItems('user')).map(i => i.route);
    for (const r of [
      '/dashboard', '/dashboard/messages', '/dashboard/my-notifications', '/dashboard/timeline', '/dashboard/connections',
      '/dashboard/my-sessions', '/dashboard/member-directory', '/dashboard/workout-room', '/dashboard/achievements',
      '/dashboard/my-tasks', '/dashboard/my-todos', '/dashboard/workouts', '/dashboard/runs', '/dashboard/my-progress',
      '/dashboard/recap', '/dashboard/exercises', '/dashboard/find-providers', '/dashboard/deals', '/dashboard/my-bookings',
      '/dashboard/profile/view', '/dashboard/profile/edit', '/dashboard/saved', '/dashboard/my-drafts',
      '/dashboard/my-rewards', '/dashboard/my-subscriptions', '/dashboard/hub', '/dashboard/my-faqs',
    ]) {
      expect(routes).toContain(r);
    }
  });

  it('gives groups a name, an icon and items, and never a route of their own', () => {
    for (const g of SIDEBAR_NAV_ITEMS.filter(i => i.items)) {
      expect(g.name).toBeTruthy();
      expect(g.icon).toBeTruthy();
      expect(g.route).toBeUndefined();
      expect(g.items!.length).toBeGreaterThan(0);
    }
  });

  it('shows the provider sections only to providers, and group members keep their role filter', () => {
    expect(filterSidebarNavItems('user').some(i => i.name === 'My Trainer Profile')).toBeFalse();
    expect(filterSidebarNavItems('trainer').some(i => i.name === 'My Trainer Profile')).toBeTrue();
    expect(filterSidebarNavItems('center').some(i => i.name === 'My Center Profile')).toBeTrue();
  });

  it('reports a group as active on any of its pages', () => {
    const train = SIDEBAR_NAV_ITEMS.find(i => i.name === 'Train')!;
    expect(sidebarGroupIsActive(train, '/dashboard/runs/12')).toBeTrue();
    expect(sidebarGroupIsActive(train, '/dashboard/messages')).toBeFalse();
    expect(sidebarGroupIsActive(train, null)).toBeFalse();
    expect(sidebarGroupRoute(train)).toBe('/dashboard/workout-room');
  });

  // Both sidebars bind this to *ngFor through a getter, so it runs on every change-detection pass. A fresh array
  // (and fresh group copies) each time rebuilt the whole sidebar every pass, and RouterLinkActive marking the
  // view dirty as links were created kicked off the next pass: an endless render loop that froze the dashboard
  // right after login.
  it('returns the SAME array (and the same group objects) for the same role on every call', () => {
    for (const role of ['user', 'trainer', 'center', 'admin', undefined, null]) {
      const first = filterSidebarNavItems(role as any);
      const second = filterSidebarNavItems(role as any);
      expect(second).toBe(first);
      first.forEach((item, i) => expect(second[i]).toBe(item));
    }
  });

  it('keeps separate results per role', () => {
    expect(filterSidebarNavItems('user')).not.toBe(filterSidebarNavItems('trainer'));
  });
});

describe('sidebar-nav-items Hub', () => {
  it('is a top-level row, visible without opening any group, for every role including admin', () => {
    for (const role of ['user', 'client', 'trainer', 'center', 'admin', null, undefined]) {
      const topLevel = filterSidebarNavItems(role as any).filter(i => !i.label && !i.items);
      expect(topLevel.some(i => i.name === 'Hub' && i.route === '/dashboard/hub')).toBeTrue();
    }
  });

  it('appears once, not also inside a group', () => {
    const all = SIDEBAR_NAV_ITEMS.flatMap(i => i.items ?? [i]);
    expect(all.filter(i => i.route === '/dashboard/hub').length).toBe(1);
  });
});
