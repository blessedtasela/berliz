import { of, throwError } from 'rxjs';
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

  describe('trial session', () => {
    beforeEach(() => {
      page.kind = 'trainer';
      page.trialPrice = 100;
      page.newMemberPercent = 50;
    });

    it('states the new-member offer with the real prices', () => {
      expect(page.trialOfferText).toBe('New members: 50% off your first trial session, CA$100 down to CA$50.');
      page.trialPrice = 80;
      expect(page.trialOfferText).toBe('New members: 50% off your first trial session, CA$80 down to CA$40.');
    });

    it('has no offer text once the client is no longer new', () => {
      page.newMemberPercent = null;
      expect(page.trialOfferText).toBeNull();
    });

    it('asks for a trial only for a trainer, and never out of a pack', () => {
      page.sessionType = 'TRIAL';
      expect(page.requestedSessionType).toBe('TRIAL');
      page.kind = 'center';
      expect(page.requestedSessionType).toBe('SINGLE');
      page.kind = 'trainer';
      page.selectedOption = { kind: 'ownedPackage', subscription: { id: 1, providerPackage: plan() } };
      page.ownedByPackageId = new Map([[plan().id, { id: 1, providerPackage: plan() } as any]]);
      expect(page.requestedSessionType).toBe('SINGLE');
    });
  });

  describe('BK-32: trial status', () => {
    let getMyTrialStatus: jasmine.Spy;

    beforeEach(() => {
      getMyTrialStatus = jasmine.createSpy('getMyTrialStatus').and.returnValue(of({ data: { used: false, usedAt: null, bookingId: null, bookingReference: null } }));
      page.bookingService = { getMyTrialStatus };
      page.providerId = 9;
      page.trialStatusRequested = false;
    });

    it('fetches the status once the provider and a signed-in user are both known', () => {
      (page as any).loadTrialStatus();
      expect(getMyTrialStatus).toHaveBeenCalledWith(9);
    });

    it('never fetches for a center -- a trial is a trainer-only thing', () => {
      page.kind = 'center';
      (page as any).loadTrialStatus();
      expect(getMyTrialStatus).not.toHaveBeenCalled();
    });

    it('never fetches for a guest', () => {
      page.user = null;
      (page as any).loadTrialStatus();
      expect(getMyTrialStatus).not.toHaveBeenCalled();
    });

    it('only fetches once, even if called again', () => {
      (page as any).loadTrialStatus();
      (page as any).loadTrialStatus();
      expect(getMyTrialStatus).toHaveBeenCalledTimes(1);
    });

    it('shows the used date on the trial option, and blocks picking it', () => {
      getMyTrialStatus.and.returnValue(of({ data: { used: true, usedAt: '2026-11-05T18:30:00Z', bookingId: 17, bookingReference: 'BK-000017' } }));
      (page as any).loadTrialStatus();

      expect(page.trialUsedNote).toContain('Already used');
      page.sessionType = 'SINGLE';
      page.chooseSessionType('TRIAL');
      expect(page.sessionType).toBe('SINGLE', 'picking a used trial is a no-op');
    });

    it('has no used-note while the trial is still available', () => {
      (page as any).loadTrialStatus();
      expect(page.trialUsedNote).toBeNull();
      page.chooseSessionType('TRIAL');
      expect(page.sessionType).toBe('TRIAL');
    });

    it('recognizes the already-used server message and offers the one-tap recovery', () => {
      page.submitError = 'You have already used your trial session with Jane Coach on Nov 5, 2026. Book a regular session instead.';
      expect(page.isTrialAlreadyUsedError).toBeTrue();

      page.sessionType = 'TRIAL';
      page.bookRegularInstead();
      expect(page.sessionType).toBe('SINGLE');
      expect(page.submitError).toBeNull();
    });

    it('leaves an ordinary submit error alone', () => {
      page.submitError = 'Pick a date and an available time.';
      expect(page.isTrialAlreadyUsedError).toBeFalse();
    });
  });

  describe('unique payment code', () => {
    function send(code: string): any {
      const dispatch = jasmine.createSpy('dispatch');
      (page as any).store = { dispatch };
      page.kind = 'trainer';
      page.providerId = 9;
      page.selectedDate = '2099-01-05';
      page.selectedSlot = { startTime: '17:00:00', endTime: '18:00:00' } as any;
      page.slotDurationMinutes = 60;
      page.minLeadTimeMinutes = 60;
      page.notes = '';
      page.locationSelection = null;
      page.paymentCode = code;
      page.submit();
      return dispatch.calls.mostRecent().args[0].data;
    }

    it('sends a trimmed code with the request', () => {
      expect(send('  ABC-123 ').paymentCode).toBe('ABC-123');
    });

    it('sends nothing when the field is empty', () => {
      expect('paymentCode' in send('   ')).toBeFalse();
    });
  });

  describe('group session', () => {
    beforeEach(() => {
      page.kind = 'trainer';
      page.groupPrice = 75;
      page.groupSize = 4;
      page.groupSlots = 1;
      page.sessionType = 'GROUP';
    });

    it('is only for a trainer, and never out of a pack', () => {
      expect(page.isGroup).toBeTrue();
      page.kind = 'center';
      expect(page.isGroup).toBeFalse();
    });

    it('works out the starter total and the places left to fill', () => {
      expect(page.groupTotal).toBe(75);
      expect(page.groupPlacesToFill).toBe(3);
      page.groupSlots = 2;
      expect(page.groupTotal).toBe(150);
      expect(page.groupPlacesToFill).toBe(2);
    });

    it('shrinks the places taken when the group gets smaller, and offers 2 to 5 people', () => {
      page.groupSlots = 4;
      page.onGroupSize(2);
      expect(page.groupSlots).toBe(2);
      expect(page.groupSlotOptions).toEqual([1, 2]);
    });

    it('is not a trial or a single session request, and says what the button does', () => {
      expect(page.requestedSessionType).toBe('SINGLE');
      expect(page.primaryLabel).toBe('Start this group');
      page.user = null;
      expect(page.primaryLabel).toBe('Continue');
    });

    it('starts the group at the picked time with the chosen size and places', () => {
      const start = jasmine.createSpy('start').and.returnValue(of({ data: { message: 'Your group is open.' } }));
      (page as any).groupService = { start };
      (page as any).snackBar = { openSnackBar: jasmine.createSpy('openSnackBar') };
      page.providerId = 9;
      page.selectedDate = '2026-11-10';
      page.selectedSlot = { startTime: '17:00:00', endTime: '18:00:00' } as any;
      page.slotDurationMinutes = 60;
      page.groupSlots = 2;
      page.notes = ' leg day ';
      page.locationSelection = null;
      page.groupRefresh = 0;
      const before = 0;

      (page as any).startGroup();

      expect(start).toHaveBeenCalledWith(jasmine.objectContaining({
        trainerId: 9, localDate: '2026-11-10', localTime: '17:00:00', durationMinutes: 60, size: 4, slots: 2, notes: 'leg day',
      }));
      expect(page.groupRefresh).toBe(before + 1);
      expect(page.submitting).toBeFalse();
    });

    it('shows the server reason when the group cannot be started', () => {
      (page as any).groupService = { start: () => throwError(() => ({ error: { message: 'A trainer cannot join their own group.' } })) };
      page.selectedSlot = { startTime: '17:00:00', endTime: '18:00:00' } as any;

      (page as any).startGroup();

      expect(page.submitError).toBe('A trainer cannot join their own group.');
      expect(page.submitting).toBeFalse();
    });

    it('books the picked time under an active pack: the pack decides who is in it, nothing else is sent', () => {
      const start = jasmine.createSpy('start').and.returnValue(of({ data: { message: 'Booked with your pack.' } }));
      (page as any).groupService = { start };
      (page as any).snackBar = { openSnackBar: jasmine.createSpy('openSnackBar') };
      page.selectedDate = '2026-11-10';
      page.selectedSlot = { startTime: '17:00:00', endTime: '18:00:00' } as any;
      page.slotDurationMinutes = 60;
      page.notes = '';
      page.locationSelection = null;
      page.groupRefresh = 0;
      const before = 0;

      page.startGroupFromPack({ id: 50 } as any);

      expect(start).toHaveBeenCalledWith(jasmine.objectContaining({
        groupPackId: 50, localDate: '2026-11-10', localTime: '17:00:00', durationMinutes: 60,
      }));
      const sent = start.calls.mostRecent().args[0];
      expect(sent.size).toBeUndefined();
      expect(sent.slots).toBeUndefined();
      expect(page.groupRefresh).toBe(before + 1);
      expect(page.submitting).toBeFalse();
    });

    it('does nothing without a picked time, and shows the reason when the pack cannot cover it', () => {
      const start = jasmine.createSpy('start');
      (page as any).groupService = { start };
      page.selectedSlot = null;
      page.startGroupFromPack({ id: 50 } as any);
      expect(start).not.toHaveBeenCalled();

      (page as any).groupService = { start: () => throwError(() => ({ error: { message: 'This group pack has no sessions left (or has expired).' } })) };
      page.selectedSlot = { startTime: '17:00:00', endTime: '18:00:00' } as any;
      page.startGroupFromPack({ id: 50 } as any);
      expect(page.submitError).toBe('This group pack has no sessions left (or has expired).');
    });
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

describe('BookingPageComponent summary and day switching', () => {
  let page: BookingPageComponent;
  let dispatch: jasmine.Spy;

  beforeEach(() => {
    // Only the fields these members read: skip the 13-service constructor.
    page = Object.create(BookingPageComponent.prototype);
    dispatch = jasmine.createSpy('dispatch');
    (page as any).store = { dispatch };
    page.kind = 'trainer';
    page.providerId = 7;
    page.providerName = 'Blessed Fit';
    page.selectedDate = '2026-10-24';
    page.selectedSlot = { startTime: '19:00:00', endTime: '20:00:00' } as any;
    page.slots = [{ startTime: '19:00:00', endTime: '20:00:00' } as any];
  });

  it('describes the picked time, the day spelled out', () => {
    expect(page.summaryWhen).toBe('Saturday, October 24 · 7:00 PM - 8:00 PM');
  });

  it('has no "when" until a time is picked', () => {
    page.selectedSlot = null;
    expect(page.summaryWhen).toBeNull();
  });

  it('names the chosen spot, or the center itself, as the place', () => {
    page.locationSelection = { label: 'Kits Beach Gym, Vancouver, Canada', incomplete: false, fee: null };
    expect(page.summaryWhere).toBe('Kits Beach Gym, Vancouver, Canada');
    page.locationSelection = null;
    expect(page.summaryWhere).toBeNull();
    page.kind = 'center';
    page.providerName = 'Berliz Works';
    expect(page.summaryWhere).toBe('Berliz Works');
  });

  it("clears the old day's times the moment another day is picked, before the new ones arrive", () => {
    page.selectDate('2026-10-26');
    expect(page.slots).toEqual([]);
    expect(page.selectedSlot).toBeNull();
    expect(dispatch).toHaveBeenCalled();
  });
});

describe('BookingPageComponent timezone notes', () => {
  let page: any;

  beforeEach(() => {
    page = Object.create(BookingPageComponent.prototype);
    page.selectedDate = '2026-07-15';
    page.slotsTimezone = 'America/Vancouver';
    page.selectedSlot = null;
  });

  it('says which clock the offered times are on, and says nothing until the provider zone is known', () => {
    expect(page.timezoneNote).toContain('Times are on Vancouver (');
    expect(page.timezoneNote).toMatch(/PDT|GMT-7/);
    page.slotsTimezone = null;
    expect(page.timezoneNote).toBeNull();
  });

  it('tells a client in another zone what the picked slot is on their clock', () => {
    page.selectedSlot = { startTime: '18:00:00', endTime: '19:00:00' };
    page.viewerZoneId = () => 'Africa/Casablanca';

    const note = page.yourTimeNote as string;

    expect(note).toContain('in your time');
    expect(note).toMatch(/^That is \d{1,2}:\d{2} [AP]M in your time \(Casablanca/);
  });

  it('adds no conversion note until a slot is picked', () => {
    expect(page.yourTimeNote).toBeNull();
  });
});
