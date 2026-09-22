import { Router } from '@angular/router';
import { Notifications } from '../models/Notifications.interface';

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

    // 'testimonial' / 'category' have no single obvious destination page yet
    // -- falls through to the caller's existing detail-dialog behavior.
    default:
      return false;
  }
}
