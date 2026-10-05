import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { provideMockStore } from '@ngrx/store/testing';

import { WorkoutRoomComponent } from './workout-room.component';
import { WorkoutService } from 'src/app/services/workout.service';
import { WorkoutLogResponse } from 'src/app/models/workout.interface';

/**
 * The streak calculation is the one piece of genuinely new logic on this
 * page (everything else is routerLinks to existing features) -- these cover
 * the cases most likely to get the day-boundary math wrong: today vs.
 * yesterday both counting as "current", a gap breaking the streak, multiple
 * logs on the same day only counting once, and the longest-ever streak
 * being independent of whether the current one is still alive.
 */
describe('WorkoutRoomComponent streaks', () => {
  let component: WorkoutRoomComponent;
  let fixture: ComponentFixture<WorkoutRoomComponent>;
  let workoutService: jasmine.SpyObj<WorkoutService>;

  const daysAgo = (n: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  const logAt = (daysBack: number): WorkoutLogResponse => ({
    id: daysBack,
    userId: 1,
    creatorName: null,
    workoutId: null,
    workoutName: null,
    title: 'Session',
    logDate: daysAgo(daysBack),
    notes: null,
    durationMinutes: 30,
    lastEditedByUserId: null,
    lastEditedByName: null,
    lastEditedAt: null,
  } as unknown as WorkoutLogResponse);

  function setup(logs: WorkoutLogResponse[]) {
    workoutService = jasmine.createSpyObj('WorkoutService', ['getMyWorkoutLogs', 'getTemplates']);
    workoutService.getMyWorkoutLogs.and.returnValue(of({ message: '', success: true, statusCode: 200, data: logs }));
    workoutService.getTemplates.and.returnValue(of({ message: '', success: true, statusCode: 200, data: [] }));

    TestBed.configureTestingModule({
      imports: [WorkoutRoomComponent],
      providers: [
        { provide: WorkoutService, useValue: workoutService },
        provideMockStore({ initialState: { user: { user: { role: 'user' } } } }),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}) } } },
      ],
    });

    fixture = TestBed.createComponent(WorkoutRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('is a zero streak with no logs at all', () => {
    setup([]);
    expect(component.currentStreak).toBe(0);
    expect(component.longestStreak).toBe(0);
  });

  it('counts today, yesterday and the day before as a 3-day current streak', () => {
    setup([logAt(0), logAt(1), logAt(2)]);
    expect(component.currentStreak).toBe(3);
    expect(component.longestStreak).toBe(3);
  });

  it('still counts as current when the most recent log was yesterday, not today', () => {
    setup([logAt(1), logAt(2), logAt(3)]);
    expect(component.currentStreak).toBe(3);
  });

  it('is broken (current = 0) when the most recent log is 2+ days old', () => {
    setup([logAt(2), logAt(3), logAt(4)]);
    expect(component.currentStreak).toBe(0);
    expect(component.longestStreak).toBe(3);
  });

  it('a gap in the middle stops the current streak count at the gap', () => {
    setup([logAt(0), logAt(1), logAt(3), logAt(4)]);
    expect(component.currentStreak).toBe(2);
    expect(component.longestStreak).toBe(2);
  });

  it('counts multiple logs on the same day as a single streak day', () => {
    setup([logAt(0), logAt(0), logAt(1)]);
    expect(component.currentStreak).toBe(2);
  });

  it('reports the longest-ever streak even if the current streak is shorter', () => {
    // A 5-day streak from 10-14 days ago, then a gap, then today only.
    setup([logAt(0), logAt(10), logAt(11), logAt(12), logAt(13), logAt(14)]);
    expect(component.currentStreak).toBe(1);
    expect(component.longestStreak).toBe(5);
  });
});
