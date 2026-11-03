import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { GroupSession } from 'src/app/models/group-session.model';
import { GroupSessionService } from 'src/app/services/group-session.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { GroupSessionsListComponent, groupStatusText } from './group-sessions-list.component';

describe('GroupSessionsListComponent', () => {
  let fixture: ComponentFixture<GroupSessionsListComponent>;
  let component: GroupSessionsListComponent;
  let groups: jasmine.SpyObj<GroupSessionService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  const group = (over: Partial<GroupSession> = {}): GroupSession => ({
    id: 1, trainerId: 9, trainerName: 'Coach Jane', scheduledAt: new Date('2026-11-10T17:00:00Z'), durationMinutes: 60,
    size: 4, slotsTaken: 2, slotsLeft: 2, pricePerSlot: 75, status: 'OPEN', ...over,
  } as GroupSession);

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  function show(signedIn: boolean, open: GroupSession[], mine: GroupSession[] = []): void {
    groups.getOpenForTrainer.and.returnValue(of({ data: open } as any));
    groups.getMine.and.returnValue(of({ data: mine } as any));
    component.trainerId = 9;
    component.providerName = 'Coach Jane';
    component.signedIn = signedIn;
    component.ngOnInit();
    fixture.detectChanges();
  }

  beforeEach(() => {
    groups = jasmine.createSpyObj('GroupSessionService', ['getOpenForTrainer', 'getMine', 'join', 'leave']);
    snackBar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    TestBed.configureTestingModule({
      imports: [GroupSessionsListComponent],
      providers: [
        { provide: GroupSessionService, useValue: groups },
        { provide: SnackBarService, useValue: snackBar },
      ],
    });
    fixture = TestBed.createComponent(GroupSessionsListComponent);
    component = fixture.componentInstance;
  });

  it('lists open groups with places left and the price per place', () => {
    show(false, [group()]);
    expect(text()).toContain('2 of 4 places left');
    expect(text()).toContain('$75.00 a place');
    expect(groups.getMine).not.toHaveBeenCalled();
  });

  it('says there are no open groups, and how to start one', () => {
    show(false, []);
    expect(fixture.nativeElement.querySelector('[data-testid="no-open-groups"]')).not.toBeNull();
  });

  it('states the rules: booked together, nothing charged until full, 48 hours, who fills it, cancellation policy', () => {
    show(false, []);
    const rules = (fixture.nativeElement.querySelector('[data-testid="group-rules"]') as HTMLElement).textContent!;
    expect(rules).toContain('only goes ahead once every place is taken');
    expect(rules).toContain('Nothing is charged until the group is full');
    expect(rules).toContain('48 hours');
    expect(rules).toContain('responsible for filling it');
    expect(rules).toContain("Coach Jane's cancellation policy");
  });

  it('asks a visitor to sign in instead of joining', () => {
    show(false, [group()]);
    const asked = jasmine.createSpy('asked');
    component.signInRequired.subscribe(asked);
    component.join(group());
    expect(asked).toHaveBeenCalled();
    expect(groups.join).not.toHaveBeenCalled();
  });

  it('joins with the chosen number of places and reloads', () => {
    show(true, [group()]);
    groups.join.and.returnValue(of({ data: { message: 'You joined the group.' } } as any));
    component.wanted[1] = 2;
    groups.getOpenForTrainer.calls.reset();
    component.join(group());
    expect(groups.join).toHaveBeenCalledWith(1, 2);
    expect(snackBar.openSnackBar).toHaveBeenCalledWith('You joined the group.', '');
    expect(groups.getOpenForTrainer).toHaveBeenCalledTimes(1);
  });

  it('never offers more places than are left', () => {
    show(true, [group({ slotsLeft: 1 })]);
    component.wanted[1] = 4;
    expect(component.slotsFor(group({ slotsLeft: 1 }))).toBe(1);
    expect(component.placeOptions(group({ slotsLeft: 3 }))).toEqual([1, 2, 3]);
  });

  it('shows the server reason when a group cannot be joined', () => {
    show(true, [group()]);
    groups.join.and.returnValue(throwError(() => ({ error: { message: 'This group is no longer open to join.' } })));
    component.join(group());
    expect(snackBar.openSnackBar).toHaveBeenCalledWith('This group is no longer open to join.', 'error');
    expect(component.busyId).toBeNull();
  });

  it('shows the groups you are in with this trainer (not other trainers, not finished ones) and keeps them out of the open list', () => {
    show(true,
      [group({ id: 1 }), group({ id: 2, slotsLeft: 3 })],
      [group({ id: 1, mySlots: 2 }), group({ id: 5, trainerId: 77 }), group({ id: 6, status: 'CANCELLED' })]);
    expect(component.mine.map(g => g.id)).toEqual([1]);
    expect(component.open.map(g => g.id)).toEqual([2]);
    expect(text()).toContain('Your groups with Coach Jane');
    expect(text()).toContain('you have 2');
  });

  it('lets you leave a group and reloads', () => {
    show(true, [], [group({ id: 1, mySlots: 1 })]);
    groups.leave.and.returnValue(of({ data: { message: 'You left the group.' } } as any));
    component.leave(group({ id: 1 }));
    expect(groups.leave).toHaveBeenCalledWith(1);
    expect(snackBar.openSnackBar).toHaveBeenCalledWith('You left the group.', '');
  });

  it('explains each status', () => {
    expect(groupStatusText('OPEN', true)).toContain('only goes ahead once every place is taken');
    expect(groupStatusText('FULL', true)).toContain('waiting for the trainer');
    expect(groupStatusText('CONFIRMED', true)).toBe('Confirmed');
  });
});

import { GROUP_SIZE_OPTIONS } from 'src/app/models/group-session.model';

describe('group sizes', () => {
  it('are 2 to 5 people', () => {
    expect(GROUP_SIZE_OPTIONS).toEqual([2, 3, 4, 5]);
  });
});
