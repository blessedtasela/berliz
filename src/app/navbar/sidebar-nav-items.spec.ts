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

  it('still reaches every MVP page that used to be a top-level entry', () => {
    const routes = leaves(filterSidebarNavItems('user')).map(i => i.route);
    for (const r of [
      '/dashboard', '/dashboard/messages', '/dashboard/my-notifications', '/dashboard/timeline', '/dashboard/connections',
      '/dashboard/my-sessions', '/dashboard/member-directory', '/dashboard/workout-room',
      '/dashboard/workouts', '/dashboard/exercises', '/dashboard/find-providers', '/dashboard/my-bookings',
      '/dashboard/profile/view', '/dashboard/profile/edit', '/dashboard/saved', '/dashboard/my-drafts',
      '/dashboard/my-subscriptions', '/dashboard/hub', '/dashboard/my-faqs',
    ]) {
      expect(routes).toContain(r);
    }
  });

  // GN-75 MVP sidebar trim (Nov 21, 2026): these never mapped to Trainers/Clients/Content/
  // Community, so the owner's call was to drop them from the menu -- same "hide, don't
  // delete" mechanism as the earlier Shop/Centers pass, but menu-only here: the routes
  // themselves, their dashboard widgets and notification deep-links are untouched.
  it('drops non-MVP items from the Train/Find & Book/Me groups', () => {
    const routes = leaves(filterSidebarNavItems('user')).map(i => i.route);
    for (const r of [
      '/dashboard/runs', '/dashboard/my-tasks', '/dashboard/my-todos', '/dashboard/my-progress',
      '/dashboard/recap', '/dashboard/achievements', '/dashboard/deals', '/dashboard/my-rewards',
    ]) {
      expect(routes).not.toContain(r);
    }
  });

  it('keeps Workout Room grouped with Workouts and Exercises & Gear in Train', () => {
    const train = SIDEBAR_NAV_ITEMS.find(i => i.name === 'Train')!;
    const names = train.items!.map(i => i.name);
    expect(names).toEqual(['Workout Room', 'Workouts', 'Exercises & Gear']);
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
    expect(sidebarGroupIsActive(train, '/dashboard/workouts/12')).toBeTrue();
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

describe('sidebar-nav-items Home/Dashboard split', () => {
  it('Home is the feed at /dashboard; Dashboard is the full-widget page at /dashboard/overview', () => {
    const topLevel = SIDEBAR_NAV_ITEMS.filter(i => !i.label && !i.items);
    const home = topLevel.find(i => i.name === 'Home');
    const dashboard = topLevel.find(i => i.name === 'Dashboard');

    expect(home?.route).toBe('/dashboard');
    expect(home?.exact).toBeTrue();
    expect(dashboard?.route).toBe('/dashboard/overview');
    expect(dashboard?.exact).toBeTrue();
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
