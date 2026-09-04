import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { DashboardMainComponent } from './dashboard-main.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StateService } from 'src/app/services/state.service';

describe('DashboardMainComponent', () => {
  let component: DashboardMainComponent;
  let fixture: ComponentFixture<DashboardMainComponent>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], { events: of() });
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const stateServiceSpy = jasmine.createSpyObj('StateService', ['getTodaysTodo', 'setTodaysTodo']);

    TestBed.configureTestingModule({
      declarations: [DashboardMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Router, useValue: routerSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: StateService, useValue: stateServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(DashboardMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('greeting matches the time of day', () => {
    jasmine.clock().install();

    jasmine.clock().mockDate(new Date(2024, 0, 1, 9));
    expect(component.greeting).toBe('Good morning');

    jasmine.clock().mockDate(new Date(2024, 0, 1, 14));
    expect(component.greeting).toBe('Good afternoon');

    jasmine.clock().mockDate(new Date(2024, 0, 1, 20));
    expect(component.greeting).toBe('Good evening');

    jasmine.clock().uninstall();
  });
});
