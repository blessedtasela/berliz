import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { WorkoutBuilderComponent } from './workout-builder.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('WorkoutBuilderComponent', () => {
  let component: WorkoutBuilderComponent;
  let fixture: ComponentFixture<WorkoutBuilderComponent>;

  beforeEach(() => {
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);
    const mockActivatedRoute = {
      paramMap: of(convertToParamMap({})),
      snapshot: { paramMap: convertToParamMap({}) },
      queryParams: of({})
    };

    TestBed.configureTestingModule({
      declarations: [WorkoutBuilderComponent],
      imports: [DragDropModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: Actions, useValue: of() },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: SnackBarService, useValue: mockSnackBarService },
      ]
    });

    fixture = TestBed.createComponent(WorkoutBuilderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
