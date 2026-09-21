import { Router } from '@angular/router';
import { Notifications } from '../models/Notifications.interface';
import { navigateToNotificationEntity } from './notification-entity-link.util';

describe('navigateToNotificationEntity', () => {
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
  });

  function notification(overrides: Partial<Notifications>): Notifications {
    return {
      id: 1, userId: 1, userFirstname: '', userLastname: '', userEmail: '',
      notification: '', type: '', date: new Date(), ...overrides
    };
  }

  it('routes a message notification to the conversation with that sender', () => {
    const result = navigateToNotificationEntity(router, notification({ entityType: 'message', entityId: 42 }));

    expect(result).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/messages'], { queryParams: { userId: 42 } });
  });

  it('does not navigate a message notification missing its entityId', () => {
    const result = navigateToNotificationEntity(router, notification({ entityType: 'message' }));

    expect(result).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('routes a connection notification to the connections page', () => {
    const result = navigateToNotificationEntity(router, notification({ entityType: 'connection', entityId: 7 }));

    expect(result).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/connections']);
  });

  it('routes a peerSession notification to My Sessions', () => {
    const result = navigateToNotificationEntity(router, notification({ entityType: 'peerSession', entityId: 3 }));

    expect(result).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-sessions']);
  });

  it('routes a booking notification to My Bookings', () => {
    const result = navigateToNotificationEntity(router, notification({ entityType: 'booking', entityId: 9 }));

    expect(result).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-bookings']);
  });

  it('leaves an unknown or legacy notification (no entityType) for the caller to handle', () => {
    const result = navigateToNotificationEntity(router, notification({}));

    expect(result).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
