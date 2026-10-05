import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { DashboardMainComponent } from './dashboard-main.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StateService } from 'src/app/services/state.service';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { loadDashboard } from 'src/app/state/dashboard/dashboard.actions';
import { selectDashboardData, selectDashboardError } from 'src/app/state/dashboard/dashboard.selectors';

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
      imports: [LoadErrorComponent],
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

  describe('when /dashboard/details fails', () => {
    let store: MockStore;

    // overrideSelector() mutates the module-level memoized selectors, which outlive
    // this TestBed. Left in place, selectDashboardData stays stubbed to { 'my-todos': 3 }
    // and leaks into any later spec in Jasmine's random order -- HubMainComponent's
    // specs saw "cached data" and never dispatched loadDashboard.
    afterEach(() => store.resetSelectors());

    beforeEach(() => {
      // The outer fixture already ran ngOnInit against the empty mock store, where the
      // real selectors throw and end their subscriptions -- so override first, then
      // build a fresh component that subscribes to the overridden values.
      fixture.destroy();
      store = TestBed.inject(MockStore);
      store.overrideSelector(selectDashboardData, null);
      store.overrideSelector(selectDashboardError, 'Failed to load dashboard');
      spyOn(store, 'dispatch').and.callThrough();
      fixture = TestBed.createComponent(DashboardMainComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => fixture.destroy());

    it('shows an error banner instead of leaving every widget silently empty', () => {
      const banner = fixture.nativeElement.querySelector('app-load-error [role="alert"]');

      expect(banner).not.toBeNull();
      expect(banner.textContent).toContain("Couldn't load your overview");
      expect(banner.textContent).toContain('Failed to load dashboard');
    });

    it('retry re-dispatches loadDashboard', () => {
      component.retryDashboard();

      expect(store.dispatch).toHaveBeenCalledWith(loadDashboard());
    });

    it('hides the banner once data is available, even if a stale error is still set', () => {
      store.overrideSelector(selectDashboardData, { 'my-todos': 3 });
      store.refreshState();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-load-error')).toBeNull();
    });
  });
});
