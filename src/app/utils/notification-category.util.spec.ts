import { NOTIFICATION_CATEGORIES, categoryKeyOf, categoryOf, countByCategory, isCategoryKey } from './notification-category.util';

describe('notification-category.util', () => {
  it('maps known entity types to their category', () => {
    expect(categoryKeyOf({ entityType: 'message' })).toBe('messages');
    expect(categoryKeyOf({ entityType: 'booking' })).toBe('bookings');
    expect(categoryKeyOf({ entityType: 'payout' })).toBe('payments');
    expect(categoryKeyOf({ entityType: 'post' })).toBe('social');
    expect(categoryKeyOf({ entityType: 'workoutLog' })).toBe('training');
    expect(categoryKeyOf({ entityType: 'accountSettings' })).toBe('account');
  });

  it('falls back to "other" for missing or unknown entity types', () => {
    expect(categoryKeyOf({})).toBe('other');
    expect(categoryKeyOf({ entityType: 'somethingNew' })).toBe('other');
  });

  it('returns the full category with a label and icon', () => {
    const c = categoryOf({ entityType: 'booking' });
    expect(c.label).toBe('Bookings');
    expect(c.icon).toBe('calendar');
  });

  it('validates category keys (used when reading ?category= from the URL)', () => {
    expect(isCategoryKey('bookings')).toBeTrue();
    expect(isCategoryKey('nonsense')).toBeFalse();
    expect(isCategoryKey(undefined)).toBeFalse();
    expect(NOTIFICATION_CATEGORIES.every(c => isCategoryKey(c.key))).toBeTrue();
  });

  it('counts only non-empty categories, in the canonical order', () => {
    const counts = countByCategory([
      { entityType: 'booking' }, { entityType: 'message' }, { entityType: 'booking' }, {},
    ]);
    expect(counts.map(c => [c.category.key, c.count])).toEqual([
      ['messages', 1], ['bookings', 2], ['other', 1],
    ]);
  });
});
