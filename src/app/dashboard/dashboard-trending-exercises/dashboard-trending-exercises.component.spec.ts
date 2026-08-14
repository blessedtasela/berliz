import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { DashboardTrendingExercisesComponent } from './dashboard-trending-exercises.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('DashboardTrendingExercisesComponent', () => {
  let component: DashboardTrendingExercisesComponent;
  let fixture: ComponentFixture<DashboardTrendingExercisesComponent>;

  beforeEach(() => {
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue({ afterClosed: () => of(false) });
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [DashboardTrendingExercisesComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: SnackBarService, useValue: mockSnackBarService },
      ]
    });

    fixture = TestBed.createComponent(DashboardTrendingExercisesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
