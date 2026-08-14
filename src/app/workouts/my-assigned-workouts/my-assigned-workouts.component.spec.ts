import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { MyAssignedWorkoutsComponent } from './my-assigned-workouts.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('MyAssignedWorkoutsComponent', () => {
  let component: MyAssignedWorkoutsComponent;
  let fixture: ComponentFixture<MyAssignedWorkoutsComponent>;

  beforeEach(() => {
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);

    TestBed.configureTestingModule({
      declarations: [MyAssignedWorkoutsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: SnackBarService, useValue: mockSnackBarService },
      ]
    });

    fixture = TestBed.createComponent(MyAssignedWorkoutsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
