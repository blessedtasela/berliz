import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { GroupPack, isGroupPackage } from 'src/app/models/group-pack.model';
import { ProviderPackage } from 'src/app/models/provider-package.model';
import { GroupPackService } from 'src/app/services/group-pack.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { GroupPacksListComponent, groupPackStatusText } from './group-packs-list.component';

describe('GroupPacksListComponent', () => {
  let fixture: ComponentFixture<GroupPacksListComponent>;
  let component: GroupPacksListComponent;
  let api: jasmine.SpyObj<GroupPackService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  const pack = (over: Partial<GroupPack> = {}): GroupPack => ({
    id: 1, packageId: 7, packageName: 'Group session pack', trainerId: 9, trainerName: 'Coach Jane', size: 5, slotsTaken: 2, slotsLeft: 3,
    totalPrice: 299.99, currency: 'CAD', pricePerSlot: 60, sessionsTotal: 5, sessionsRemaining: 5, status: 'FORMING',
    formingDeadline: new Date('2026-11-20T12:00:00Z'), ...over,
  } as GroupPack);

  const groupPackage = (over: Partial<ProviderPackage> = {}): ProviderPackage => ({
    id: 7, trainerId: 9, name: 'Group session pack', sessionCount: 5, price: 299.99, currency: 'CAD', durationDays: 10, groupSize: 5,
    billingType: 'ONE_TIME', isActive: true, ...over,
  } as ProviderPackage);

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const q = (sel: string) => fixture.nativeElement.querySelector(sel) as HTMLElement | null;

  function show(signedIn: boolean, open: GroupPack[], mine: GroupPack[] = [], packages: ProviderPackage[] = []): void {
    api.getOpenForTrainer.and.returnValue(of({ data: open } as any));
    api.getMine.and.returnValue(of({ data: mine } as any));
    component.trainerId = 9;
    component.providerName = 'Coach Jane';
    component.signedIn = signedIn;
    component.packages = packages;
    component.ngOnInit();
    fixture.detectChanges();
  }

  beforeEach(() => {
    api = jasmine.createSpyObj('GroupPackService', ['getOpenForTrainer', 'getMine', 'start', 'join', 'leave', 'checkout']);
    snackBar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    TestBed.configureTestingModule({
      imports: [GroupPacksListComponent],
      providers: [
        { provide: GroupPackService, useValue: api },
        { provide: SnackBarService, useValue: snackBar },
      ],
    });
    fixture = TestBed.createComponent(GroupPacksListComponent);
    component = fixture.componentInstance;
  });

  describe('which packages can start a group pack', () => {
    it('needs a trainer, 2 to 5 people, sessions and a price', () => {
      expect(isGroupPackage(groupPackage())).toBeTrue();
      expect(isGroupPackage(groupPackage({ groupSize: 1 }))).toBeFalse();
      expect(isGroupPackage(groupPackage({ groupSize: 6 }))).toBeFalse();
      expect(isGroupPackage(groupPackage({ sessionCount: null }))).toBeFalse();
      expect(isGroupPackage(groupPackage({ price: 0 }))).toBeFalse();
      expect(isGroupPackage(groupPackage({ trainerId: null }))).toBeFalse();
      expect(isGroupPackage(groupPackage({ isActive: false }))).toBeFalse();
    });

    it('offers only the group packages of the trainer, with the price of a place', () => {
      show(true, [], [], [groupPackage(), groupPackage({ id: 8, name: 'Solo pack', groupSize: 1 })]);
      const cards = fixture.nativeElement.querySelectorAll('[data-testid="startable-package"]');
      expect(cards.length).toBe(1);
      expect(text()).toContain('Group session pack');
      expect(text()).toContain('5 sessions for 5 people');
      expect(text()).toContain('CA$299.99');
      expect(text()).toContain('CA$60.00 a place');
      expect(text()).toContain('valid 10 days once active');
    });
  });

  describe('starting, joining and leaving', () => {
    it('starts a pack with the places chosen', () => {
      api.start.and.returnValue(of({ data: { message: 'Your group pack is started.' } } as any));
      show(true, [], [], [groupPackage()]);
      component.wanted['start7'] = 2;
      (q('[data-testid="start-pack-button"]') as HTMLButtonElement).click();
      expect(api.start).toHaveBeenCalledWith(7, 2);
      expect(snackBar.openSnackBar).toHaveBeenCalledWith('Your group pack is started.', '');
    });

    it('a visitor who tries to start or join is asked to sign in, nothing is sent', () => {
      const asked = jasmine.createSpy('signInRequired');
      component.signInRequired.subscribe(asked);
      show(false, [pack()], [], [groupPackage()]);
      (q('[data-testid="start-pack-button"]') as HTMLButtonElement).click();
      (q('[data-testid="join-pack"]') as HTMLButtonElement).click();
      expect(asked).toHaveBeenCalledTimes(2);
      expect(api.start).not.toHaveBeenCalled();
      expect(api.join).not.toHaveBeenCalled();
    });

    it('joins an open pack with the places chosen, never more than are left', () => {
      api.join.and.returnValue(of({ data: { message: "You're in." } } as any));
      show(true, [pack({ slotsLeft: 2 })]);
      component.wanted['join1'] = 4;
      expect(component.slotsFor(pack({ slotsLeft: 2 }))).toBe(2);
      (q('[data-testid="join-pack"]') as HTMLButtonElement).click();
      expect(api.join).toHaveBeenCalledWith(1, 2);
    });

    it('shows the server message when it refuses', () => {
      api.join.and.returnValue(throwError(() => ({ error: { message: 'This group pack is no longer open to join.' } })));
      show(true, [pack()]);
      (q('[data-testid="join-pack"]') as HTMLButtonElement).click();
      expect(snackBar.openSnackBar).toHaveBeenCalledWith('This group pack is no longer open to join.', 'error');
    });

    it('leaves a pack that is still filling, but not one whose share is paid', () => {
      api.leave.and.returnValue(of({ data: { message: 'You\'ve left.' } } as any));
      show(true, [], [pack({ status: 'FORMING', mySlots: 1 })]);
      (q('[data-testid="leave-pack"]') as HTMLButtonElement).click();
      expect(api.leave).toHaveBeenCalledWith(1);

      show(true, [], [pack({ status: 'FULL', mySlots: 1, myPaid: true, myAmount: 60 })]);
      expect(q('[data-testid="leave-pack"]')).toBeNull();
    });

    it('does not offer a pack the person is already in to join again', () => {
      show(true, [pack()], [pack({ mySlots: 1 })]);
      expect(fixture.nativeElement.querySelectorAll('[data-testid="open-pack"]').length).toBe(0);
      expect(fixture.nativeElement.querySelectorAll('[data-testid="my-pack"]').length).toBe(1);
    });

    it('hides finished packs', () => {
      show(true, [], [pack({ status: 'CANCELLED' }), pack({ id: 2, status: 'EXPIRED' }), pack({ id: 3, status: 'EXHAUSTED' })]);
      expect(fixture.nativeElement.querySelectorAll('[data-testid="my-pack"]').length).toBe(0);
    });
  });

  describe('paying a share', () => {
    const full = (over: Partial<GroupPack> = {}) => pack({
      status: 'FULL', slotsTaken: 5, slotsLeft: 0, mySlots: 2, myAmount: 120, myPaid: false, payDeadline: new Date('2026-11-12T12:00:00Z'), ...over,
    });

    it('shows the exact share and the deadline, and sends the person to Stripe', () => {
      api.checkout.and.returnValue(of({ data: { checkoutUrl: 'https://checkout.stripe.test/x' } } as any));
      const redirect = spyOn(component, 'redirect');
      show(true, [], [full()]);
      expect(text()).toContain('Pay my share · CA$120.00');
      expect(text()).toContain('Pay by');
      (q('[data-testid="pay-share"]') as HTMLButtonElement).click();
      expect(api.checkout).toHaveBeenCalledWith(1);
      expect(redirect).toHaveBeenCalledWith('https://checkout.stripe.test/x');
    });

    it('stays on the page and says why when checkout cannot start', () => {
      api.checkout.and.returnValue(throwError(() => ({ error: { message: 'Your share of this group pack can\'t be paid right now.' } })));
      const redirect = spyOn(component, 'redirect');
      show(true, [], [full()]);
      (q('[data-testid="pay-share"]') as HTMLButtonElement).click();
      expect(redirect).not.toHaveBeenCalled();
      expect(snackBar.openSnackBar).toHaveBeenCalledWith('Your share of this group pack can\'t be paid right now.', 'error');
      expect(component.busyId).toBeNull();
    });

    it('once paid there is nothing more to pay, only waiting', () => {
      show(true, [], [full({ myPaid: true })]);
      expect(q('[data-testid="pay-share"]')).toBeNull();
      expect(text()).toContain('waiting for the others to pay theirs');
    });
  });

  describe('using an active pack', () => {
    const active = (over: Partial<GroupPack> = {}) => pack({
      status: 'ACTIVE', slotsTaken: 5, slotsLeft: 0, mySlots: 2, sessionsRemaining: 3, expiresAt: new Date('2026-11-25T00:00:00Z'), ...over,
    });

    it('says how many sessions are left and lets the picked time be booked with it', () => {
      const used = jasmine.createSpy('usePack');
      component.usePack.subscribe(used);
      component.canBook = true;
      show(true, [], [active()]);
      expect(text()).toContain('3 of 5 sessions left');
      expect(text()).toContain('Valid until');
      (q('[data-testid="use-pack"]') as HTMLButtonElement).click();
      expect(used).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1 }));
    });

    it('asks for a time to be picked first', () => {
      component.canBook = false;
      show(true, [], [active()]);
      expect((q('[data-testid="use-pack"]') as HTMLButtonElement).disabled).toBeTrue();
      expect(text()).toContain('Pick a day and time above first');
    });

    it('offers nothing when no sessions are left', () => {
      show(true, [], [active({ sessionsRemaining: 0 })]);
      expect(q('[data-testid="use-pack"]')).toBeNull();
    });
  });

  describe('on the My Bookings page (all trainers)', () => {
    beforeEach(() => { component.allTrainers = true; });

    it('lists the live packs with every trainer, naming the trainer, and nothing to join or start', () => {
      api.getMine.and.returnValue(of({ data: [pack({ trainerId: 9 }), pack({ id: 2, trainerId: 11, trainerName: 'Coach Max' }), pack({ id: 3, status: 'CANCELLED' })] } as any));
      component.signedIn = true;
      component.ngOnInit();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('[data-testid="my-pack"]').length).toBe(2);
      expect(text()).toContain('with Coach Jane');
      expect(text()).toContain('with Coach Max');
      expect(api.getOpenForTrainer).not.toHaveBeenCalled();
      expect(q('[data-testid="open-packs"]')).toBeNull();
      expect(q('[data-testid="start-pack"]')).toBeNull();
    });

    it('shows nothing at all when the person is in no pack', () => {
      api.getMine.and.returnValue(of({ data: [] } as any));
      component.signedIn = true;
      component.ngOnInit();
      fixture.detectChanges();
      expect(text().trim()).toBe('');
    });
  });

  it('states the rules: nothing charged until full, 24 hours to pay, shared sessions, 14 days, refunds', () => {
    show(true, [pack()], [], [groupPackage()]);
    const rules = q('[data-testid="pack-rules"]')?.textContent ?? '';
    expect(rules).toContain('Nobody is charged until every place is taken');
    expect(rules).toContain('24 hours to pay');
    expect(rules).toContain('shared by the group');
    expect(rules).toContain('14 days');
    expect(rules).toContain('refunded in proportion');
  });

  it('describes each status in plain words', () => {
    expect(groupPackStatusText(pack({ status: 'FORMING' }))).toContain('nobody is charged');
    expect(groupPackStatusText(pack({ status: 'ACTIVE', sessionsRemaining: 2 }))).toBe('2 of 5 sessions left, shared by the group');
    expect(groupPackStatusText(pack({ status: 'CANCELLED' }))).toBe('Cancelled');
  });
});
