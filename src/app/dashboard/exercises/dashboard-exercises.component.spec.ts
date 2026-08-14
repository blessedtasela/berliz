import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { DashboardExercisesComponent } from './dashboard-exercises.component';

describe('DashboardExercisesComponent', () => {
  let component: DashboardExercisesComponent;
  let fixture: ComponentFixture<DashboardExercisesComponent>;

  beforeEach(() => {
    const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue({ afterClosed: () => of(false) });

    TestBed.configureTestingModule({
      declarations: [DashboardExercisesComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: MatDialog, useValue: mockDialog },
      ]
    });

    fixture = TestBed.createComponent(DashboardExercisesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
