import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';

import { WorkoutService } from 'src/app/services/workout.service';
import { WorkoutDetailComponent } from './workout-detail.component';

describe('WorkoutDetailComponent', () => {
  let fixture: ComponentFixture<WorkoutDetailComponent>;
  let component: WorkoutDetailComponent;
  let params: BehaviorSubject<any>;
  let getWorkout: jasmine.Spy;

  function create(id: string | null, response: any) {
    params = new BehaviorSubject(convertToParamMap(id ? { id } : {}));
    getWorkout = jasmine.createSpy('getWorkout').and.returnValue(response);
    TestBed.configureTestingModule({
      imports: [WorkoutDetailComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: params } },
        { provide: WorkoutService, useValue: { getWorkout } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(WorkoutDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('shows the spinner, not "not found", while the first request is in flight', () => {
    create('3', new Subject());
    expect(component.loading).toBeTrue();
    expect(component.notFound).toBeFalse();
  });

  it('shows the workout once it arrives', () => {
    create('3', of({ data: { id: 3, name: 'Fight Camp Conditioning', exercises: [] } }));
    expect(component.workout?.name).toBe('Fight Camp Conditioning');
    expect(component.loading).toBeFalse();
    expect(component.notFound).toBeFalse();
  });

  it('treats the empty workout the server returns on an internal failure as not found', () => {
    create('3', of({ data: {} }));
    expect(component.workout).toBeNull();
    expect(component.notFound).toBeTrue();
  });

  it('offers a retry when the request fails, instead of "not found"', () => {
    create('3', throwError(() => new Error('boom')));
    expect(component.loadFailed).toBeTrue();
    expect(component.notFound).toBeFalse();
    expect(fixture.nativeElement.querySelector('[data-testid="workout-load-failed"]')).not.toBeNull();

    getWorkout.and.returnValue(of({ data: { id: 3, name: 'Back', exercises: [] } }));
    component.refresh();
    expect(component.loadFailed).toBeFalse();
    expect(component.workout?.name).toBe('Back');
  });

  it('does not spin forever on a link with no usable id', () => {
    create(null, new Subject());
    expect(getWorkout).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(component.notFound).toBeTrue();
  });
});
