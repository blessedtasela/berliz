import { filterSidebarNavItems, SIDEBAR_NAV_ITEMS } from './sidebar-nav-items';

describe('sidebar-nav-items', () => {

  it('gives Profile and Settings distinct, non-overlapping routes', () => {
    // Both live under /dashboard/profile (a shared toggle component), so a
    // sloppy route here would make BOTH items highlight together via the
    // sidebar's startsWith-based active check -- see side-bar-open's isActive.
    const profile = SIDEBAR_NAV_ITEMS.find(i => i.name === 'Profile');
    const settings = SIDEBAR_NAV_ITEMS.find(i => i.name === 'Settings');

    expect(profile?.route).toBe('/dashboard/profile/view');
    expect(settings?.route).toBe('/dashboard/profile/edit');
    expect(settings?.route!.startsWith(profile!.route!)).toBeFalse();
    expect(profile?.route!.startsWith(settings!.route!)).toBeFalse();
  });

  it('keeps Settings visible for every role (no roles restriction)', () => {
    for (const role of ['user', 'trainer', 'center', 'admin', null, undefined]) {
      const visible = filterSidebarNavItems(role as any).some(i => i.name === 'Settings');
      expect(visible).toBeTrue();
    }
  });
});
