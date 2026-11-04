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
    page.askingTrainerForPlanId = null;
    page.askSentPlanIds = new Set();
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

  describe('"I have a unique code"', () => {
    let purchasePackage: jasmine.Spy;
    let createCheckoutSession: jasmine.Spy;
    let navigate: jasmine.Spy;

    beforeEach(() => {
      createCheckoutSession = jasmine.createSpy('createCheckoutSession').and.returnValue(of({ data: {} }));
      purchasePackage = jasmine.createSpy('purchasePackage');
      navigate = jasmine.createSpy('navigate');
      page.subscriptionService = { purchasePackage };
      page.stripeService = { createCheckoutSession };
      page.router = { navigate };
    });

    it('buys with the typed code, skips Stripe and lands on My Subscriptions when the code activated it', () => {
      purchasePackage.and.returnValue(of({ message: 'Your code is applied', data: { subscriptionId: 55, packageId: 7, packageName: 'Plan', price: 200, currency: 'USD', status: 'true' } }));
      page.selectedPlan = plan();
      page.showCodeBox = true;
      page.paymentCode = '  BZ-ABCD-EFGH ';

      page.buy();

      expect(purchasePackage).toHaveBeenCalledWith(7, 'BZ-ABCD-EFGH');
      expect(createCheckoutSession).not.toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(['/dashboard/my-subscriptions'], {});
    });

    it('sends a weekly plan bought with a code to its weekly times page', () => {
      purchasePackage.and.returnValue(of({ data: { subscriptionId: 55, packageId: 7, packageName: 'Plan', price: 200, currency: 'USD', status: 'true' } }));
      page.selectedPlan = plan({ sessionsPerWeek: 2, sessionCount: 8, billingType: 'ONE_TIME' });
      page.showCodeBox = true;
      page.paymentCode = 'BZ-ABCD-EFGH';

      page.buy();

      expect(navigate).toHaveBeenCalledWith(['/dashboard/weekly-subscriptions'], { queryParams: { id: 55 } });
    });

    it('shows why a wrong code was refused and does not charge', () => {
      purchasePackage.and.returnValue(throwError(() => ({ status: 400, error: { message: 'This code has expired.' } })));
      page.selectedPlan = plan();
      page.showCodeBox = true;
      page.paymentCode = 'BZ-OLD';

      page.buy();

      expect(page.submitError).toBe('This code has expired.');
      expect(createCheckoutSession).not.toHaveBeenCalled();
      expect(page.buyingPlanId).toBeNull();
    });

    it('ignores a typed code while the code box is closed', () => {
      purchasePackage.and.returnValue(of({ data: { subscriptionId: 55, packageId: 7, packageName: 'Plan', price: 200, currency: 'USD', status: 'PENDING_PAYMENT' } }));
      page.selectedPlan = plan();
      page.showCodeBox = false;
      page.paymentCode = 'BZ-ABCD-EFGH';

      page.buy();

      expect(purchasePackage).toHaveBeenCalledWith(7, undefined);
      expect(createCheckoutSession).toHaveBeenCalled();
    });

    it('labels the button "with my code" once a code is typed', () => {
      page.selectedPlan = plan();
      page.showCodeBox = true;
      page.paymentCode = 'BZ-ABCD-EFGH';
      expect(page.buyLabel).toBe('Buy pack with my code');
    });

    it('lets a client without a code ask their trainer, once', () => {
      const askTrainer = jasmine.createSpy('askTrainer').and.returnValue(of({ data: {} }));
      page.paymentCodeService = { askTrainer };
      const p = plan();

      page.askTrainerForCode(p);
      page.askTrainerForCode(p);

      expect(askTrainer).toHaveBeenCalledTimes(1);
      expect(askTrainer).toHaveBeenCalledWith({ targetType: 'PACKAGE', packageId: 7 });
      expect(page.hasAskedFor(p)).toBeTrue();
    });

    it('tracks the ask separately per plan, so asking about one does not mark another as asked', () => {
      const askTrainer = jasmine.createSpy('askTrainer').and.returnValue(of({ data: {} }));
      page.paymentCodeService = { askTrainer };
      const planA = plan({ id: 7 });
      const planB = plan({ id: 8 });

      page.askTrainerForCode(planA);

      expect(page.hasAskedFor(planA)).toBeTrue();
      expect(page.hasAskedFor(planB)).toBeFalse();
    });

    it('asks a guest to sign in instead of asking the trainer', () => {
      const askTrainer = jasmine.createSpy('askTrainer');
      page.paymentCodeService = { askTrainer };
      page.saveDraft = jasmine.createSpy('saveDraft');
      page.user = null;

      page.askTrainerForCode(plan());

      expect(askTrainer).not.toHaveBeenCalled();
      expect(page.showAuthPrompt).toBeTrue();
    });
  });

  describe('weekly plans', () => {
    it('is a weekly plan when it has sessions per week, with its own price note and label', () => {
      page.selectedPlan = plan({ sessionsPerWeek: 2, sessionCount: 8, billingType: 'RECURRING', price: 240 });
      expect(page.buyLabel).toBe('Subscribe · $240 / month');
      page.selectedPlan = plan({ sessionsPerWeek: 2, sessionCount: 8, billingType: 'ONE_TIME', price: 240 });
      expect(page.buyLabel).toBe('Subscribe · $240 / term');
    });

    it('charges a renewing weekly plan every month and a fixed-term one once', () => {
      const createCheckoutSession = jasmine.createSpy('c').and.returnValue(of({ data: {} }));
      page.subscriptionService = { purchasePackage: jasmine.createSpy('p').and.returnValue(of({ data: { subscriptionId: 5, price: 240, currency: 'USD', packageName: 'W', status: 'PENDING_PAYMENT' } })) };
      page.stripeService = { createCheckoutSession };

      page.selectedPlan = plan({ sessionsPerWeek: 2, sessionCount: 8, billingType: 'RECURRING' });
      page.buy();
      expect(createCheckoutSession.calls.mostRecent().args[0].recurring).toBeTrue();

      page.buyingPlanId = null;
      page.selectedPlan = plan({ sessionsPerWeek: 2, sessionCount: 8, billingType: 'ONE_TIME' });
      page.buy();
      expect(createCheckoutSession.calls.mostRecent().args[0].recurring).toBeFalse();
    });
  });
});

describe('LevelUpPageComponent intro', () => {
  const pageWith = (...kinds: string[]): any => {
    const page = Object.create(LevelUpPageComponent.prototype);
    page.groups = kinds.map(kind => ({ kind, plans: [] }));
    return page;
  };

  it('names only what the provider sells', () => {
    expect(pageWith('pack').introText).toContain('buy a session pack.');
    expect(pageWith('pack').introText).not.toContain('subscribe');
    expect(pageWith('subscription', 'pack', 'membership').introText)
      .toContain('subscribe, buy a session pack or get a membership.');
  });

  it('has a plain fallback when there are no plans', () => {
    expect(pageWith().introText).toBe('Commit to more than one session with this provider.');
  });
});
