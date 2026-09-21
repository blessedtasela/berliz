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

    default:
      return false;
  }
}
