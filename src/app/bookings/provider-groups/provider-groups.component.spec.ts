import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { GroupPack } from 'src/app/models/group-pack.model';
import { GroupSession } from 'src/app/models/group-session.model';
import { GroupPackService } from 'src/app/services/group-pack.service';
import { GroupSessionService } from 'src/app/services/group-session.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ProviderGroupsComponent, trainerGroupStatusText } from './provider-groups.component';

describe('ProviderGroupsComponent', () => {
  let fixture: ComponentFixture<ProviderGroupsComponent>;
  let component: ProviderGroupsComponent;
  let groups: jasmine.SpyObj<GroupSessionService>;
  let packs: jasmine.SpyObj<GroupPackService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  const group = (over: Partial<GroupSession> = {}): GroupSession => ({
    id: 1, trainerId: 9, trainerName: 'Coach Jane', scheduledAt: new Date('2026-11-10T17:00:00Z'), durationMinutes: 60, size: 3, slotsTaken: 3, slotsLeft: 0,
    pricePerSlot: 75, status: 'FULL', members: [
      { userId: 2, name: 'Alex Test', slots: 2, bookingId: 11, bookingStatus: 'pending', paymentStatus: null },
      { userId: 3, name: 'Bo Test', slots: 1, bookingId: 12, bookingStatus: 'pending', paymentStatus: 'UNPAID' },
    ], ...over,
  } as GroupSession);

  const pack = (over: Partial<GroupPack> = {}): GroupPack => ({
    id: 5, packageId: 7, packageName: 'Group session pack', trainerId: 9, trainerName: 'Coach Jane', size: 5, slotsTaken: 5, slotsLeft: 0,
    totalPrice: 299.99, currency: 'CAD', pricePerSlot: 60, sessionsTotal: 5, sessionsRemaining: 5, status: 'FULL',
    formingDeadline: new Date('2026-11-20T12:00:00Z'), members: [
      { userId: 2, name: 'Alex Test', slots: 3, amount: 180, paid: true },
      { userId: 3, name: 'Bo Test', slots: 2, amount: 119.99, paid: false },
    ], ...over,
  } as GroupPack);

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const q = (sel: string) => fixture.nativeElement.querySelector(sel) as HTMLElement | null;

  function show(g: GroupSession[], p: GroupPack[] = []): void {
    groups.getForMyTrainerProfile.and.returnValue(of({ data: g } as any));
    packs.getForMyTrainerProfile.and.returnValue(of({ data: p } as any));
    component.ngOnInit();
    fixture.detectChanges();
  }

  beforeEach(() => {
    groups = jasmine.createSpyObj('GroupSessionService', ['getForMyTrainerProfile', 'confirm', 'cancel', 'complete']);
    packs = jasmine.createSpyObj('GroupPackService', ['getForMyTrainerProfile', 'cancel']);
    snackBar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    TestBed.configureTestingModule({
      imports: [ProviderGroupsComponent],
      providers: [
        { provide: GroupSessionService, useValue: groups },
        { provide: GroupPackService, useValue: packs },
        { provide: SnackBarService, useValue: snackBar },
      ],
    });
    fixture = TestBed.createComponent(ProviderGroupsComponent);
    component = fixture.componentInstance;
  });

  it('shows nothing at all when the trainer has no live groups or packs', () => {
    show([group({ status: 'CANCELLED' }), group({ id: 2, status: 'COMPLETED' })], [pack({ status: 'EXPIRED' })]);
    expect(q('[data-testid="provider-groups"]')).toBeNull();
    expect(text().trim()).toBe('');
  });

  it('lists a group with who is in it, the price and what the trainer has to do next', () => {
    show([group()]);
    expect(fixture.nativeElement.querySelectorAll('[data-testid="trainer-group"]').length).toBe(1);
    expect(text()).toContain('3 of 3 places taken');
    expect(text()).toContain('$75.00 a place');
    expect(text()).toContain('Alex Test · 2 places');
    expect(text()).toContain('Bo Test · 1 place');
    expect(text()).toContain('not paid yet');
    expect(text()).toContain('Confirm it and each member gets 24 hours to pay');
  });

  it('says a pack covers the session when it does', () => {
    show([group({ groupPackId: 5, pricePerSlot: 0 })]);
    expect(text()).toContain('covered by a group pack');
    expect(text()).not.toContain('a place');
  });

  describe('confirming', () => {
    it('confirms a full group, and only a full one', () => {
      groups.confirm.and.returnValue(of({ data: { message: 'The group is confirmed.' } } as any));
      show([group()]);
      (q('[data-testid="confirm-group"]') as HTMLButtonElement).click();
      expect(groups.confirm).toHaveBeenCalledWith(1);
      expect(snackBar.openSnackBar).toHaveBeenCalledWith('The group is confirmed.', '');

      show([group({ status: 'OPEN', slotsTaken: 1, slotsLeft: 2 })]);
      expect(q('[data-testid="confirm-group"]')).toBeNull();
      expect(text()).toContain('2 places still to take');
    });

    it('shows the reason when the server refuses', () => {
      groups.confirm.and.returnValue(throwError(() => ({ error: { message: 'A group only goes ahead once every slot is taken.' } })));
      show([group()]);
      (q('[data-testid="confirm-group"]') as HTMLButtonElement).click();
      expect(snackBar.openSnackBar).toHaveBeenCalledWith('A group only goes ahead once every slot is taken.', 'error');
      expect(component.busyKey).toBeNull();
    });
  });

  describe('marking done', () => {
    it('is offered for a confirmed group', () => {
      groups.complete.and.returnValue(of({ data: { message: 'Done.' } } as any));
      show([group({ status: 'CONFIRMED' })]);
      expect(q('[data-testid="confirm-group"]')).toBeNull();
      (q('[data-testid="complete-group"]') as HTMLButtonElement).click();
      expect(groups.complete).toHaveBeenCalledWith(1);
    });
  });

  describe('cancelling', () => {
    it('asks first and does nothing until it is confirmed', () => {
      groups.cancel.and.returnValue(of({ data: { message: 'Cancelled.' } } as any));
      show([group()]);
      (q('[data-testid="cancel-group"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(groups.cancel).not.toHaveBeenCalled();
      expect(text()).toContain('Everyone is refunded in full. Cancel it?');

      (q('[data-testid="cancel-group-yes"]') as HTMLButtonElement).click();
      expect(groups.cancel).toHaveBeenCalledWith(1);
      expect(component.askingCancel).toBeNull();
    });

    it('"Keep it" backs out', () => {
      show([group()]);
      (q('[data-testid="cancel-group"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      const keep = Array.from(fixture.nativeElement.querySelectorAll('[data-testid="cancel-group-confirm"] button') as NodeListOf<HTMLButtonElement>).find(b => b.textContent?.includes('Keep it'));
      keep?.click();
      fixture.detectChanges();
      expect(q('[data-testid="cancel-group-confirm"]')).toBeNull();
      expect(groups.cancel).not.toHaveBeenCalled();
    });

    it('locks every button while one action is running', () => {
      show([group(), group({ id: 2 })]);
      component.busyKey = 'g1';
      component.confirm(group({ id: 2 }));
      expect(groups.confirm).not.toHaveBeenCalled();
    });
  });

  describe('group packs', () => {
    it('lists a pack with each member, their exact share and whether they have paid', () => {
      show([], [pack()]);
      expect(fixture.nativeElement.querySelectorAll('[data-testid="trainer-pack"]').length).toBe(1);
      expect(text()).toContain('Group session pack · 5 sessions');
      expect(text()).toContain('Alex Test · 3 places');
      expect(text()).toContain('$180.00 paid');
      expect(text()).toContain('$119.99 not paid yet');
    });

    it('cancels a pack that is filling or waiting for payment, after asking', () => {
      packs.cancel.and.returnValue(of({ data: { message: 'The group pack is cancelled.' } } as any));
      show([], [pack()]);
      (q('[data-testid="cancel-pack"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(packs.cancel).not.toHaveBeenCalled();
      expect(text()).toContain('Anyone who paid is refunded. Cancel it?');
      (q('[data-testid="cancel-pack-yes"]') as HTMLButtonElement).click();
      expect(packs.cancel).toHaveBeenCalledWith(5);
    });

    it('an active pack cannot be cancelled from here', () => {
      show([], [pack({ status: 'ACTIVE', sessionsRemaining: 3 })]);
      expect(q('[data-testid="cancel-pack"]')).toBeNull();
      expect(text()).toContain('3 of 5 sessions left');
    });
  });

  it('describes each group status for the trainer', () => {
    expect(trainerGroupStatusText({ status: 'OPEN', slotsLeft: 1 })).toContain('1 place still to take');
    expect(trainerGroupStatusText({ status: 'FULL', slotsLeft: 0 })).toContain('Confirm it');
    expect(trainerGroupStatusText({ status: 'CONFIRMED', slotsLeft: 0 })).toContain('mark it done');
  });
});
