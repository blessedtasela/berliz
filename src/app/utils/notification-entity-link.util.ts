import { Router } from '@angular/router';
import { Notifications } from '../models/Notifications.interface';

/**
 * Every entityType navigateToNotificationEntity actually knows how to route.
 * Kept as one list so notificationHasDeepLink can answer "would this notification
 * navigate anywhere?" without performing the navigation (and its read-marking
 * side effects) just to find out -- see notification-details.component.ts's
 * "read the full text first, then offer to go there" button, and
 * my-notifications-page/notification-main's "skip the dialog entirely when the
 * full text was already on-screen" fast path.
 */
const KNOWN_ENTITY_TYPES = new Set([
  'message', 'connection', 'peerSession', 'booking', 'post', 'workoutLog',
  'workout', 'run', 'task', 'faq', 'payment', 'subscription', 'payout',
  'partnership', 'centerProfile', 'trainerProfile', 'accountSettings',
  'memberProfile', 'accountabilityNudge', 'recap',
]);

/** True when this notification's entityType is one navigateToNotificationEntity can actually route (and, for the types that need one, it has an entityId too). */
export function notificationHasDeepLink(notification: Notifications): boolean {
  if (!notification.entityType || !KNOWN_ENTITY_TYPES.has(notification.entityType)) return false;
  if ((notification.entityType === 'message' || notification.entityType === 'post') && !notification.entityId) return false;
  return true;
}

/**
 * Routes a notification click straight to the thing it's about instead of
 * just showing text in a dialog. Shared by the notification bell dropdown
 * and the full My Notifications page so both surfaces stay in sync as new
 * entityTypes get wired up on the backend.
 *
 * Returns true when it navigated (caller should mark the notification read
 * and skip its own detail-dialog fallback); false for an unknown/legacy
 * notification (no entityType set), which the caller should still show.
 */
export function navigateToNotificationEntity(router: Router, notification: Notifications): boolean {
  switch (notification.entityType) {
    case 'message':
      if (!notification.entityId) return false;
      router.navigate(['/dashboard/messages'], { queryParams: { userId: notification.entityId } });
      return true;

    case 'connection':
      router.navigate(['/dashboard/connections']);
      return true;

    case 'peerSession':
      router.navigate(['/dashboard/my-sessions']);
      return true;

    case 'booking':
      router.navigate(['/dashboard/my-bookings']);
      return true;

    // Comment/mention/reply notifications all carry the post they're about --
    // DashboardTimelineComponent fetches it independently and opens the
    // media+comments sheet (see its openPostFromQueryParam).
    case 'post':
      if (!notification.entityId) return false;
      router.navigate(['/dashboard/timeline'], { queryParams: { postId: notification.entityId } });
      return true;

    case 'workoutLog':
    case 'workout':
      router.navigate(['/dashboard/workouts']);
      return true;

    case 'run':
      router.navigate(['/dashboard/runs']);
      return true;

    case 'task':
      router.navigate(['/dashboard/my-tasks']);
      return true;

    case 'faq':
      router.navigate(['/dashboard/my-faqs']);
      return true;

    case 'payment':
    case 'subscription':
      router.navigate(['/dashboard/my-subscriptions']);
      return true;

    case 'payout':
      router.navigate(['/dashboard/my-bookings']);
      return true;

    case 'partnership':
    case 'centerProfile':
      router.navigate(['/dashboard/partnership']);
      return true;

    case 'trainerProfile':
      router.navigate(['/dashboard/partnership/trainer-details']);
      return true;

    case 'accountSettings':
      router.navigate(['/dashboard/profile/edit']);
      return true;

    case 'memberProfile':
      router.navigate(['/dashboard/profile/view']);
      return true;

    case 'accountabilityNudge':
      router.navigate(['/dashboard/workouts']);
      return true;

    case 'recap':
      router.navigate(['/dashboard/recap']);
      return true;

    // 'testimonial' / 'category' have no single obvious destination page yet
    // -- falls through to the caller's existing detail-dialog behavior.
    default:
      return false;
  }
}
