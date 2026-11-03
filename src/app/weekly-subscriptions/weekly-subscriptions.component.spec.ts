import { of, throwError } from 'rxjs';
import { WeeklySubscription } from 'src/app/models/weekly-subscription.model';
import { WeeklySubscriptionsComponent } from './weekly-subscriptions.component';

describe('WeeklySubscriptionsComponent', () => {

  let page: any;
  let weekly: Record<string, jasmine.Spy>;
  let snackBar: { openSnackBar: jasmine.Spy };

  const sub = (over: Partial<WeeklySubscription> = {}): WeeklySubscription => ({
    subscriptionId: 70, packageName: 'Twice a week', sessionsPerWeek: 2, sessionMinutes: 60, status: 'true', paused: false, autoRenew: true,
    startDate: null, endDate: '2026-12-01', sessionsTotal: 8, sessionsRemaining: 8, clientId: 1, clientName: 'Sam Client',
    providerName: 'Coach Jane', needsSchedule: true, slots: [], upcoming: [], skipped: [], ...over,
  });

  beforeEach(() => {
    snackBar = { openSnackBar: jasmine.createSpy('openSnackBar') };
    weekly = {
      mine: jasmine.createSpy('mine').and.returnValue(of({ data: [sub()] })),
      setSchedule: jasmine.createSpy('setSchedule').and.returnValue(of({ message: 'Your weekly times are set.', data: sub() })),
      pause: jasmine.createSpy('pause').and.returnValue(of({ message: 'Paused', data: sub() })),
      resume: jasmine.createSpy('resume').and.returnValue(of({ message: 'Resumed', data: sub() })),
      cancel: jasmine.createSpy('cancel').and.returnValue(of({ message: 'Cancelled', data: sub() })),
    };
    page = Object.create(WeeklySubscriptionsComponent.prototype);
    page.weekly = weekly;
    page.snackBar = snackBar;
    page.weekdays = [{ value: 1, label: 'Monday' }, { value: 2, label: 'Tuesday' }];
    page.editing = {};
    page.errors = {};
    page.subs = [];
    page.focusId = null;
  });

  it('opens the time picker straight away for a subscription that has no weekly times yet', () => {
    page.load();
    expect(page.subs.length).toBe(1);
    expect(page.editing[70].length).toBe(2);
  });

  it('starts from the current times when changing them', () => {
    const s = sub({ needsSchedule: false, slots: [{ dayOfWeek: 2, time: '18:00' }, { dayOfWeek: 4, time: '18:00' }] });
    page.startEdit(s);
    expect(page.editing[70]).toEqual([{ dayOfWeek: 2, time: '18:00' }, { dayOfWeek: 4, time: '18:00' }]);
  });

  describe('picking the times', () => {
    it('needs exactly as many times as the plan has sessions a week', () => {
      page.editing[70] = [{ dayOfWeek: 2, time: '18:00' }];
      expect(page.problem(sub())).toBe('Pick exactly 2 weekly times.');
    });

    it('refuses the same day and time twice, and a missing time', () => {
      page.editing[70] = [{ dayOfWeek: 2, time: '18:00' }, { dayOfWeek: 2, time: '18:00' }];
      expect(page.problem(sub())).toBe('Two of the weekly times are the same.');
      page.editing[70] = [{ dayOfWeek: 2, time: '' }, { dayOfWeek: 4, time: '18:00' }];
      expect(page.problem(sub())).toBe('Pick a start time for every slot.');
    });

    it('accepts Tuesday and Thursday evenings, and sends them', () => {
      page.editing[70] = [{ dayOfWeek: 2, time: '18:00' }, { dayOfWeek: 4, time: '18:00' }];
      expect(page.problem(sub())).toBe('');
      weekly['mine'].and.returnValue(of({ data: [sub({ needsSchedule: false })] }));
      page.save(sub());

      expect(weekly['setSchedule']).toHaveBeenCalledWith(70, [{ dayOfWeek: 2, time: '18:00' }, { dayOfWeek: 4, time: '18:00' }]);
      expect(snackBar.openSnackBar).toHaveBeenCalledWith('Your weekly times are set.', '');
      expect(page.editing[70]).toBeUndefined('the editor closes once saved');
    });

    it('does not send an invalid schedule', () => {
      page.editing[70] = [{ dayOfWeek: 2, time: '18:00' }];
      page.save(sub());
      expect(weekly['setSchedule']).not.toHaveBeenCalled();
      expect(page.errors[70]).toBe('Pick exactly 2 weekly times.');
    });

    it('shows the server reason when saving fails', () => {
      weekly['setSchedule'].and.returnValue(throwError(() => ({ error: { message: 'This subscription is not active yet.' } })));
      page.editing[70] = [{ dayOfWeek: 2, time: '18:00' }, { dayOfWeek: 4, time: '18:00' }];
      page.save(sub());
      expect(page.errors[70]).toBe('This subscription is not active yet.');
      expect(page.busyId).toBeNull();
    });
  });

  describe('pause, resume and cancel', () => {
    it('pauses and resumes', () => {
      page.pause(sub());
      page.resume(sub({ paused: true }));
      expect(weekly['pause']).toHaveBeenCalledWith(70);
      expect(weekly['resume']).toHaveBeenCalledWith(70);
    });

    it('cancels only after the person confirms', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      page.cancel(sub());
      expect(weekly['cancel']).not.toHaveBeenCalled();
      (window.confirm as jasmine.Spy).and.returnValue(true);
      page.cancel(sub());
      expect(weekly['cancel']).toHaveBeenCalledWith(70);
    });
  });

  it('knows an active subscription from a cancelled one, and names the days', () => {
    expect(page.isActive(sub())).toBeTrue();
    expect(page.isActive(sub({ status: 'CANCELLED' }))).toBeFalse();
    expect(page.dayLabel(2)).toBe('Tuesday');
  });
});
