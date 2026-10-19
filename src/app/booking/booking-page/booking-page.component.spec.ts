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
  let navigate: jasmine.Spy;

  const plan = (over: Partial<ProviderPackage> = {}): ProviderPackage => ({
    id: 7, name: '5 session starter', price: 200, currency: 'USD', sessionCount: 5, billingType: 'ONE_TIME',
    groupSize: 1, isActive: true, sortOrder: 0, durationDays: 60, ...over,
  } as ProviderPackage);

  beforeEach(() => {
    navigate = jasmine.createSpy('navigate');
    // Only the plan logic is under test, so skip the many-service constructor.
    page = Object.create(BookingPageComponent.prototype);
    page.router = { navigate };
    page.kind = 'trainer';
    page.providerName = 'Jo Smith';
    page.selectedOption = { kind: 'single' };
    page.submitting = false;
    page.availabilityConfigured = true;
    page.packages = [];
    page.packagesLoaded = true;
    page.ownedLoaded = true;
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

    it('is disabled until the provider has availability, and while sending', () => {
      page.availabilityConfigured = false;
      expect(page.primaryDisabled).toBeTrue();
      page.availabilityConfigured = true;
      page.submitting = true;
      expect(page.primaryDisabled).toBeTrue();
      expect(page.primaryIcon).toBe('loader');
    });
  });

  describe('opening on a plan from a link', () => {
    it('selects the owned plan, so the session comes out of it', () => {
      const sub = { id: 99, providerPackage: plan({ id: 7 }) };
      page.packages = [plan({ id: 7 })];
      page.ownedByPackageId = new Map([[7, sub]]);
      page.pendingPlanId = 7;

      page.preselectPlan();

      expect(page.selectedOption).toEqual({ kind: 'ownedPackage', subscription: sub });
      expect(page.pendingPlanId).toBeNull('used once, so a later pick sticks');
      expect(navigate).not.toHaveBeenCalled();
    });

    it('sends a plan you do not own to the Level Up page, replacing this URL', () => {
      page.packages = [plan({ id: 3 }), plan({ id: 7 })];
      page.pendingPlanId = 7;

      page.preselectPlan();

      expect(navigate).toHaveBeenCalledWith(['/trainers', 'Jo-Smith', 'level-up'], { queryParams: { plan: 7 }, replaceUrl: true });
      expect(page.selectedOption).toEqual({ kind: 'single' });
    });

    it('uses /centers for a center', () => {
      page.kind = 'center';
      page.providerName = 'Iron Works Gym';
      page.packages = [plan({ id: 7 })];
      page.pendingPlanId = 7;

      page.preselectPlan();

      expect(navigate.calls.mostRecent().args[0]).toEqual(['/centers', 'Iron-Works-Gym', 'level-up']);
    });

    it('ignores a plan from another provider', () => {
      page.packages = [plan({ id: 3 })];
      page.pendingPlanId = 7;

      page.preselectPlan();

      expect(navigate).not.toHaveBeenCalled();
      expect(page.selectedOption).toEqual({ kind: 'single' });
    });

    it('waits until the plans, and what the client owns, have loaded', () => {
      page.packages = [plan({ id: 7 })];
      page.pendingPlanId = 7;

      page.packagesLoaded = false;
      page.preselectPlan();
      page.packagesLoaded = true;
      page.ownedLoaded = false;
      page.preselectPlan();

      expect(navigate).not.toHaveBeenCalled();
      expect(page.pendingPlanId).toBe(7, 'kept for when everything has arrived');

      page.ownedLoaded = true;
      page.preselectPlan();
      expect(navigate).toHaveBeenCalled();
    });

    it('does not wait on ownership for a guest, who owns nothing', () => {
      page.user = null;
      page.ownedLoaded = false;
      page.packages = [plan({ id: 7 })];
      page.pendingPlanId = 7;

      page.preselectPlan();

      expect(navigate).toHaveBeenCalled();
    });
  });
});
