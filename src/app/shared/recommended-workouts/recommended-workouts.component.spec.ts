import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { RecommendedWorkoutsComponent } from './recommended-workouts.component';
import { AuthService } from 'src/app/services/auth.service';
import { WorkoutService } from 'src/app/services/workout.service';
import { WorkoutResponse } from 'src/app/models/workout.interface';

describe('RecommendedWorkoutsComponent', () => {
  let component: RecommendedWorkoutsComponent;
  let fixture: ComponentFixture<RecommendedWorkoutsComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let workoutService: jasmine.SpyObj<WorkoutService>;

  function workout(id: number, cloneCount: number): WorkoutResponse {
    return { id, name: `Workout ${id}`, cloneCount, exercises: [], isTemplate: true } as unknown as WorkoutResponse;
  }

  function setup() {
    authService = jasmine.createSpyObj('AuthService', ['hasSession']);
    workoutService = jasmine.createSpyObj('WorkoutService', ['getTemplates']);

    TestBed.configureTestingModule({
      imports: [RecommendedWorkoutsComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: WorkoutService, useValue: workoutService },
      ],
    });

    fixture = TestBed.createComponent(RecommendedWorkoutsComponent);
    component = fixture.componentInstance;
  }

  it('stays hidden for a signed-out visitor, with no API call', () => {
    setup();
    authService.hasSession.and.returnValue(false);

    fixture.detectChanges();

    expect(component.visible).toBeFalse();
    expect(workoutService.getTemplates).not.toHaveBeenCalled();
  });

  it('sorts templates by clone count, most-used first', () => {
    setup();
    authService.hasSession.and.returnValue(true);
    workoutService.getTemplates.and.returnValue(of({ success: true, message: '', data: [workout(1, 2), workout(2, 50), workout(3, 10)], statusCode: 200 } as any));

    fixture.detectChanges();

    expect(component.workouts.map(w => w.id)).toEqual([2, 3, 1]);
  });

  it('caps the list at 8', () => {
    setup();
    authService.hasSession.and.returnValue(true);
    const many = Array.from({ length: 12 }, (_, i) => workout(i, i));
    workoutService.getTemplates.and.returnValue(of({ success: true, message: '', data: many, statusCode: 200 } as any));

    fixture.detectChanges();

    expect(component.workouts.length).toBe(8);
  });

  it('degrades to an empty list instead of throwing when the request fails', () => {
    setup();
    authService.hasSession.and.returnValue(true);
    workoutService.getTemplates.and.returnValue(throwError(() => new Error('boom')));

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.workouts).toEqual([]);
  });
});
