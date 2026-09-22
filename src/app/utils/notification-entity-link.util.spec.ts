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

  it('routes a post notification (comment/mention/reply) to the timeline with ?postId=', () => {
    const result = navigateToNotificationEntity(router, notification({ entityType: 'post', entityId: 55 }));

    expect(result).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/timeline'], { queryParams: { postId: 55 } });
  });

  it('does not navigate a post notification missing its entityId', () => {
    const result = navigateToNotificationEntity(router, notification({ entityType: 'post' }));

    expect(result).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('routes workoutLog and workout notifications to Workouts', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'workoutLog', entityId: 1 }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/workouts']);

    router.navigate.calls.reset();
    expect(navigateToNotificationEntity(router, notification({ entityType: 'workout' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/workouts']);
  });

  it('routes a run notification to Runs', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'run', entityId: 2 }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/runs']);
  });

  it('routes a task notification to My Tasks', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'task' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-tasks']);
  });

  it('routes a faq notification to My FAQs', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'faq' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-faqs']);
  });

  it('routes payment and subscription notifications to My Subscriptions', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'payment' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-subscriptions']);

    router.navigate.calls.reset();
    expect(navigateToNotificationEntity(router, notification({ entityType: 'subscription' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-subscriptions']);
  });

  it('routes a payout notification to My Bookings', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'payout', entityId: 4 }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-bookings']);
  });

  it('routes partnership and centerProfile notifications to Partnership', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'partnership' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/partnership']);

    router.navigate.calls.reset();
    expect(navigateToNotificationEntity(router, notification({ entityType: 'centerProfile' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/partnership']);
  });

  it('routes a trainerProfile notification to the trainer details page', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'trainerProfile' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/partnership/trainer-details']);
  });

  it('routes an accountSettings notification to Settings', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'accountSettings' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/profile/edit']);
  });

  it('routes a memberProfile notification to the caller\'s own profile', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'memberProfile' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/profile/view']);
  });

  it('routes an accountabilityNudge notification to Workouts', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'accountabilityNudge' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/workouts']);
  });

  it('leaves testimonial/category notifications (no single obvious page) for the caller to handle', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'testimonial' }))).toBeFalse();
    expect(navigateToNotificationEntity(router, notification({ entityType: 'category' }))).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
