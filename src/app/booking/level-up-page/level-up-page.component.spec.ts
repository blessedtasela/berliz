import { of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProviderPackage } from 'src/app/models/provider-package.model';
import { LevelUpPageComponent } from './level-up-page.component';

describe('LevelUpPageComponent', () => {

  let page: any;
  let snackBar: { openSnackBar: jasmine.Spy };

  const plan = (over: Partial<ProviderPackage> = {}): ProviderPackage => ({
    id: 7, name: '5 session starter', price: 200, currency: 'USD', sessionCount: 5, billingType: 'ONE_TIME',
    groupSize: 1, isActive: true, sortOrder: 0, durationDays: 60, ...over,
  } as ProviderPackage);

  beforeEach(() => {
    snackBar = { openSnackBar: jasmine.createSpy('openSnackBar') };
    // Only the page logic is under test, so skip the many-service constructor.
    page = Object.create(LevelUpPageComponent.prototype);
    page.snackBar = snackBar;
    page.kind = 'trainer';
    page.providerId = 9;
    page.providerName = 'Jo Smith';
    page.plans = [];
    page.selectedPlan = null;
    page.buyingPlanId = null;
    page.pendingPlanId = null;
    page.ownedByPlanId = new Map();
    page.showAuthPrompt = false;
    page.user = { email: 'a@b.c' };
  });

  describe('the pay button', () => {
    it('says what it does and what it costs: a pack is paid once', () => {
      page.selectedPlan = plan();
      expect(page.buyLabel).toBe('Buy pack · $200');
    });

    it('says a subscription is per month', () => {
      page.selectedPlan = plan({ billingType: 'RECURRING', sessionCount: null, price: 99 });
      expect(page.buyLabel).toBe('Subscribe · $99 / month');
    });

    it('is "Continue" for a guest, and shows progress while checkout starts', () => {
      page.selectedPlan = plan();
      page.user = null;
      expect(page.buyLabel).toBe('Continue');

      page.user = { email: 'a@b.c' };
      page.buyingPlanId = 7;
      expect(page.buyLabel).toBe('Starting checkout…');
      expect(page.buyBusy).toBeTrue();
    });
  });

  describe('opening on a plan from a link', () => {
    it('selects the plan the link named, once', () => {
      page.plans = [plan({ id: 3 }), plan({ id: 7 })];
      page.pendingPlanId = 7;

      page.preselectPlan();

      expect(page.selectedPlan).toBe(page.plans[1]);
      expect(page.pendingPlanId).toBeNull('used once, so a later pick sticks');
    });

    it('ignores a plan from another provider, and waits until the plans have loaded', () => {
      page.pendingPlanId = 7;
      page.preselectPlan();
      expect(page.selectedPlan).toBeNull();
      expect(page.pendingPlanId).toBe(7, 'kept for when the plans arrive');

      page.plans = [plan({ id: 3 })];
      page.preselectPlan();
      expect(page.selectedPlan).toBeNull();
    });
  });

  describe('buying', () => {
    let createCheckoutSession: jasmine.Spy;
    let purchasePackage: jasmine.Spy;

    beforeEach(() => {
      createCheckoutSession = jasmine.createSpy('createCheckoutSession').and.returnValue(of({ data: {} }));
      purchasePackage = jasmine.createSpy('purchasePackage').and.returnValue(of({
        data: { subscriptionId: 55, packageId: 7, packageName: 'Plan', price: 99, currency: 'USD', status: 'PENDING_PAYMENT' },
      }));
      page.subscriptionService = { purchasePackage };
      page.stripeService = { createCheckoutSession };
    });

    it('charges a subscription every month', () => {
      page.selectedPlan = plan({ billingType: 'RECURRING', sessionCount: null });

      page.buy();

      expect(createCheckoutSession.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ subscriptionId: 55, recurring: true }));
    });

    it('charges a session pack or membership once', () => {
      page.selectedPlan = plan();

      page.buy();

      expect(createCheckoutSession.calls.mostRecent().args[0].recurring).toBeFalse();
    });

    it('asks a guest to sign in instead of buying, and remembers where to come back to', () => {
      page.user = null;
      page.selectedPlan = plan();
      const saveDraft = spyOn(page, 'saveDraft');

      page.buy();

      expect(purchasePackage).not.toHaveBeenCalled();
      expect(page.showAuthPrompt).toBeTrue();
      expect(saveDraft).toHaveBeenCalled();
    });

    it('never buys a plan you already have', () => {
      page.selectedPlan = plan();
      page.ownedByPlanId = new Map([[7, { id: 1 }]]);

      page.buy();

      expect(purchasePackage).not.toHaveBeenCalled();
    });

    it('ignores a second press while checkout is starting', () => {
      page.selectedPlan = plan();
      page.buyingPlanId = 7;

      page.buy();

      expect(purchasePackage).not.toHaveBeenCalled();
    });

    /**
     * Regression coverage: a session that quietly expired while this page was open (access tokens
     * last about an hour) used to show the raw backend message ("Full authentication is required
     * to access this resource") via submitError instead of the same "sign in to continue" hand-off
     * a true guest sees -- isGuest alone doesn't catch this, since the page's cached user profile
     * still looks signed-in until the request actually fails.
     */
    it('a 401 starting the purchase is treated as an expired session, not a generic failure', () => {
      purchasePackage.and.returnValue(throwError(() => ({ status: 401 })));
      page.selectedPlan = plan();
      const saveDraft = spyOn(page, 'saveDraft');

      page.buy();

      expect(page.user).toBeNull();
      expect(page.showAuthPrompt).toBeTrue();
      expect(saveDraft).toHaveBeenCalled();
      expect(page.submitError).toBeNull();
    });

    it('a 401 starting checkout (after a successful purchase) is also treated as an expired session', () => {
      createCheckoutSession.and.returnValue(throwError(() => ({ status: 401 })));
      page.selectedPlan = plan();
      const saveDraft = spyOn(page, 'saveDraft');

      page.buy();

      expect(page.user).toBeNull();
      expect(page.showAuthPrompt).toBeTrue();
      expect(saveDraft).toHaveBeenCalled();
      expect(page.submitError).toBeNull();
    });

    it('a non-401 failure still shows the plain message, not the sign-in hand-off', () => {
      purchasePackage.and.returnValue(throwError(() => ({ status: 500, error: { message: 'boom' } })));
      page.selectedPlan = plan();

      page.buy();

      expect(page.showAuthPrompt).toBeFalse();
      expect(page.submitError).toBe('boom');
    });
  });

  describe('plans you own', () => {
    it('says how many sessions are left, or unlimited', () => {
      page.ownedByPlanId = new Map<number, any>([[7, { sessionsRemaining: 3 }], [8, { sessionsRemaining: null }]]);

      expect(page.sessionsLeft(plan({ id: 7 }))).toBe('3 left');
      expect(page.sessionsLeft(plan({ id: 8 }))).toBe('Unlimited');
    });
  });

  describe('links', () => {
    it('points at the booking page and profile for a trainer and a center', () => {
      expect(page.bookPath).toEqual(['/trainers', 'Jo-Smith', 'book']);
      expect(page.profilePath).toEqual(['/trainers', 'Jo-Smith']);

      page.kind = 'center';
      page.providerName = 'Iron Works Gym';
      expect(page.bookPath).toEqual(['/centers', 'Iron-Works-Gym', 'book']);
    });

    it('shares the canonical level-up URL', async () => {
      const share = jasmine.createSpy('share').and.resolveTo();
      Object.defineProperty(navigator, 'share', { value: share, configurable: true });
      try {
        await page.share();
        expect(share).toHaveBeenCalledWith({
          title: 'Level up with Jo Smith | Berliz',
          url: `${environment.baseUrl}/trainers/Jo-Smith/level-up`,
        });
      } finally {
        delete (navigator as any).share;
      }
    });
  });
});
