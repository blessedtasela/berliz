import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProviderPackage } from 'src/app/models/provider-package.model';
import { BookingPageComponent } from './booking-page.component';

describe('BookingPageComponent share', () => {

  let snackBar: { openSnackBar: jasmine.Spy };
  let page: BookingPageComponent;

  const setNavigator = (props: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(props)) {
      Object.defineProperty(navigator, key, { value, configurable: true });
    }
  };

  beforeEach(() => {
    snackBar = { openSnackBar: jasmine.createSpy('openSnackBar') };
    // The share logic only needs these three fields, so skip the 13-service constructor.
    page = Object.create(BookingPageComponent.prototype);
    page.kind = 'trainer';
    page.providerName = 'Jo Smith';
    (page as any).snackBar = snackBar;
  });

  afterEach(() => {
    // Restore the real implementations the browser ships with.
    delete (navigator as any).share;
    delete (navigator as any).clipboard;
  });

  it('shares the canonical booking URL through the native sheet when there is one', async () => {
    const share = jasmine.createSpy('share').and.resolveTo();
    setNavigator({ share });

    await page.share();

    expect(share).toHaveBeenCalledWith({
      title: 'Book Jo Smith | Berliz',
      url: `${environment.baseUrl}/trainers/Jo-Smith/book`,
    });
    expect(snackBar.openSnackBar).not.toHaveBeenCalled();
  });

  it('uses the /centers path for a center', async () => {
    page.kind = 'center';
    page.providerName = 'Iron Works Gym';
    const share = jasmine.createSpy('share').and.resolveTo();
    setNavigator({ share });

    await page.share();

    expect(share.calls.mostRecent().args[0].url).toBe(`${environment.baseUrl}/centers/Iron-Works-Gym/book`);
  });

  it('copies the link when the browser has no share sheet', async () => {
    const writeText = jasmine.createSpy('writeText').and.resolveTo();
    setNavigator({ share: undefined, clipboard: { writeText } });

    await page.share();

    expect(writeText).toHaveBeenCalledWith(`${environment.baseUrl}/trainers/Jo-Smith/book`);
    expect(snackBar.openSnackBar).toHaveBeenCalledWith('Booking link copied', '');
  });

  it('stays quiet when the person closes the share sheet', async () => {
    const cancelled = new DOMException('cancelled', 'AbortError');
    setNavigator({ share: jasmine.createSpy('share').and.rejectWith(cancelled) });

    await page.share();

    expect(snackBar.openSnackBar).not.toHaveBeenCalled();
  });

  it('tells the person when neither sharing nor copying worked', async () => {
    setNavigator({ share: undefined, clipboard: { writeText: jasmine.createSpy().and.rejectWith(new Error('denied')) } });

    await page.share();

    expect(snackBar.openSnackBar).toHaveBeenCalledWith('Could not share the link', 'error');
  });
});

describe('BookingPageComponent plans', () => {

  let page: any;
  let snackBar: { openSnackBar: jasmine.Spy };

  const plan = (over: Partial<ProviderPackage> = {}): ProviderPackage => ({
    id: 7, name: '5 session starter', price: 200, currency: 'USD', sessionCount: 5, billingType: 'ONE_TIME',
    groupSize: 1, isActive: true, sortOrder: 0, durationDays: 60, ...over,
  } as ProviderPackage);

  beforeEach(() => {
    snackBar = { openSnackBar: jasmine.createSpy('openSnackBar') };
    // Only the plan logic is under test, so skip the 13-service constructor.
    page = Object.create(BookingPageComponent.prototype);
    page.snackBar = snackBar;
    page.selectedOption = { kind: 'single' };
    page.buyingPackageId = null;
    page.submitting = false;
    page.availabilityConfigured = true;
    page.packages = [];
    page.ownedByPackageId = new Map();
    page.pendingPlanId = null;
    page.user = { email: 'a@b.c' };
  });

  describe('the main button', () => {
    it('requests a booking for a single session', () => {
      expect(page.primaryLabel).toBe('Request booking');
      expect(page.primaryDisabled).toBeFalse();
    });

    it('is "Continue" for a guest, on a single session and on an owned pack', () => {
      page.user = null;
      expect(page.primaryLabel).toBe('Continue');
      page.selectedOption = { kind: 'ownedPackage', subscription: { id: 1, providerPackage: plan() } };
      expect(page.primaryLabel).toBe('Continue');
    });

    it('books from the pack when you own it', () => {
      page.selectedOption = { kind: 'ownedPackage', subscription: { id: 1, providerPackage: plan() } };
      expect(page.primaryLabel).toBe('Book with your pack');
    });

    it('buys a session pack, with its price, rather than requesting a booking', () => {
      page.selectedOption = { kind: 'buyPackage', pkg: plan() };
      expect(page.primaryLabel).toBe('Buy pack · $200');
      expect(page.primaryIcon).toBe('credit-card');
    });

    it('subscribes to a monthly plan and says it is per month', () => {
      page.selectedOption = { kind: 'buyPackage', pkg: plan({ billingType: 'RECURRING', sessionCount: null, price: 99 }) };
      expect(page.primaryLabel).toBe('Subscribe · $99 / month');
    });

    it('does not need availability to buy a plan, but does to book a session', () => {
      page.availabilityConfigured = false;
      expect(page.primaryDisabled).toBeTrue();
      page.selectedOption = { kind: 'buyPackage', pkg: plan() };
      expect(page.primaryDisabled).toBeFalse();
    });

    it('is disabled and shows progress while checkout starts', () => {
      page.selectedOption = { kind: 'buyPackage', pkg: plan() };
      page.buyingPackageId = 7;
      expect(page.primaryLabel).toBe('Starting checkout…');
      expect(page.primaryDisabled).toBeTrue();
      expect(page.primaryIcon).toBe('loader');
    });

    it('buys the plan when a plan is selected, and submits a booking otherwise', () => {
      const buy = spyOn(page, 'buyPackage');
      const submit = spyOn(page, 'submit');

      page.onPrimaryAction();
      expect(submit).toHaveBeenCalled();

      page.selectedOption = { kind: 'buyPackage', pkg: plan() };
      page.onPrimaryAction();
      expect(buy).toHaveBeenCalledWith(page.planToBuy);
    });
  });

  describe('opening on a plan from a link', () => {
    it('selects a plan to buy when you do not own it', () => {
      page.packages = [plan({ id: 3 }), plan({ id: 7 })];
      page.pendingPlanId = 7;

      page.preselectPlan();

      expect(page.selectedOption).toEqual({ kind: 'buyPackage', pkg: page.packages[1] });
      expect(page.pendingPlanId).toBeNull('used once, so a later pick sticks');
    });

    it('selects the owned plan instead when you already have it', () => {
      const sub = { id: 99, providerPackage: plan({ id: 7 }) };
      page.packages = [plan({ id: 7 })];
      page.ownedByPackageId = new Map([[7, sub]]);
      page.pendingPlanId = 7;

      page.preselectPlan();

      expect(page.selectedOption).toEqual({ kind: 'ownedPackage', subscription: sub });
    });

    it('ignores a plan from another provider, and waits until the plans have loaded', () => {
      page.pendingPlanId = 7;
      page.preselectPlan();
      expect(page.selectedOption).toEqual({ kind: 'single' });
      expect(page.pendingPlanId).toBe(7, 'kept for when the plans arrive');

      page.packages = [plan({ id: 3 })];
      page.preselectPlan();
      expect(page.selectedOption).toEqual({ kind: 'single' });
    });
  });

  describe('starting checkout', () => {
    let createCheckoutSession: jasmine.Spy;

    beforeEach(() => {
      createCheckoutSession = jasmine.createSpy('createCheckoutSession').and.returnValue(of({ data: {} }));
      page.subscriptionService = {
        purchasePackage: jasmine.createSpy('purchasePackage').and.returnValue(of({
          data: { subscriptionId: 55, packageId: 7, packageName: 'Plan', price: 99, currency: 'USD', status: 'PENDING_PAYMENT' },
        })),
      };
      page.stripeService = { createCheckoutSession };
    });

    it('charges a subscription every month', () => {
      page.buyPackage(plan({ billingType: 'RECURRING', sessionCount: null }));

      expect(createCheckoutSession.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ subscriptionId: 55, recurring: true }));
    });

    it('charges a session pack or membership once', () => {
      page.buyPackage(plan());

      expect(createCheckoutSession.calls.mostRecent().args[0].recurring).toBeFalse();
    });
  });
});
