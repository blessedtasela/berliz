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

  it('deep-links a workoutLog notification to that log in Workout History', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'workoutLog', entityId: 1 }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/workouts/history'], { queryParams: { logId: 1 } });
  });

  it('routes a workoutLog notification with no entityId to Workout History without a query param', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'workoutLog' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/workouts/history'], {});
  });

  it('routes a workout (template) notification to Workouts', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'workout' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/workouts']);
  });

  it('deep-links a run notification to that run log in Runs', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'run', entityId: 2 }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/runs'], { queryParams: { logId: 2 } });
  });

  it('routes a run notification with no entityId to Runs without a query param', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'run' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/runs'], {});
  });

  it('routes a task notification to My Tasks', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'task' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-tasks']);
  });

  it('deep-links a faq notification to that FAQ in My FAQs', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'faq', entityId: 6 }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-faqs'], { queryParams: { faqId: 6 } });
  });

  it('routes a faq notification with no entityId to My FAQs without a query param', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'faq' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-faqs'], {});
  });

  it('routes payment and subscription notifications to My Subscriptions', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'payment' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-subscriptions']);

    router.navigate.calls.reset();
    expect(navigateToNotificationEntity(router, notification({ entityType: 'subscription' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-subscriptions']);
  });

  it('deep-links a payout notification to that payout on the My Bookings Earnings tab', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'payout', entityId: 4 }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-bookings'], { queryParams: { payoutId: 4 } });
  });

  it('routes a payout notification with no entityId to My Bookings without a query param', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'payout' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-bookings'], {});
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

  it('routes a testimonial notification to that testimonial in the admin Hub, or the list without an id', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'testimonial', entityId: 8 }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/hub/testimonials', 8]);

    router.navigate.calls.reset();
    expect(navigateToNotificationEntity(router, notification({ entityType: 'testimonial' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/hub/testimonials']);
  });

  it('routes a category notification to the admin Hub categories list', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'category' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/hub/categories']);
  });

  it('routes a referralSlot notification to My Rewards', () => {
    expect(navigateToNotificationEntity(router, notification({ entityType: 'referralSlot' }))).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-rewards']);
  });
});
