import { Notifications } from '../models/Notifications.interface';

export type NotificationCategoryKey = 'messages' | 'bookings' | 'payments' | 'social' | 'training' | 'account' | 'other';

export interface NotificationCategory {
  key: NotificationCategoryKey;
  label: string;
  /** angular-feather icon name (must be registered in IconsModule). */
  icon: string;
}

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  { key: 'messages', label: 'Messages', icon: 'message-circle' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar' },
  { key: 'payments', label: 'Payments', icon: 'credit-card' },
  { key: 'social', label: 'Social', icon: 'users' },
  { key: 'training', label: 'Training', icon: 'activity' },
  { key: 'account', label: 'Account', icon: 'user' },
  { key: 'other', label: 'Other', icon: 'bell' },
];

/** Which category each entityType (see notification-entity-link.util) belongs to. */
const CATEGORY_BY_ENTITY_TYPE: Record<string, NotificationCategoryKey> = {
  message: 'messages',
  booking: 'bookings',
  peerSession: 'bookings',
  clientIntake: 'bookings',
  referralSlot: 'bookings',
  payment: 'payments',
  subscription: 'payments',
  payout: 'payments',
  connection: 'social',
  post: 'social',
  testimonial: 'social',
  accountabilityNudge: 'social',
  recap: 'social',
  workout: 'training',
  workoutLog: 'training',
  run: 'training',
  task: 'training',
  partnership: 'account',
  centerProfile: 'account',
  trainerProfile: 'account',
  memberProfile: 'account',
  accountSettings: 'account',
  faq: 'account',
  category: 'account',
};

export function categoryKeyOf(notification: Pick<Notifications, 'entityType'>): NotificationCategoryKey {
  return (notification.entityType && CATEGORY_BY_ENTITY_TYPE[notification.entityType]) || 'other';
}

export function categoryOf(notification: Pick<Notifications, 'entityType'>): NotificationCategory {
  const key = categoryKeyOf(notification);
  return NOTIFICATION_CATEGORIES.find(c => c.key === key)!;
}

export function isCategoryKey(value: unknown): value is NotificationCategoryKey {
  return typeof value === 'string' && NOTIFICATION_CATEGORIES.some(c => c.key === value);
}

/** Count per category, only for categories that have at least one notification. */
export function countByCategory(notifications: Pick<Notifications, 'entityType'>[]): { category: NotificationCategory; count: number }[] {
  const counts = new Map<NotificationCategoryKey, number>();
  for (const n of notifications) counts.set(categoryKeyOf(n), (counts.get(categoryKeyOf(n)) ?? 0) + 1);
  return NOTIFICATION_CATEGORIES
    .filter(c => (counts.get(c.key) ?? 0) > 0)
    .map(c => ({ category: c, count: counts.get(c.key)! }));
}
