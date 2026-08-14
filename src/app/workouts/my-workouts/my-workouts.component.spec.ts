import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { MyWorkoutsComponent } from './my-workouts.component';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('MyWorkoutsComponent', () => {
  let component: MyWorkoutsComponent;
  let fixture: ComponentFixture<MyWorkoutsComponent>;

  beforeEach(() => {
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    const mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUserRole']);
    mockAuthService.getCurrentUserRole.and.returnValue('user');
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);

    TestBed.configureTestingModule({
      declarations: [MyWorkoutsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Actions, useValue: of() },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SnackBarService, useValue: mockSnackBarService },
      ]
    });

    fixture = TestBed.createComponent(MyWorkoutsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
