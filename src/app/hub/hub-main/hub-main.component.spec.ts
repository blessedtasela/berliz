import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { HubMainComponent } from './hub-main.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadDashboard } from 'src/app/state/dashboard/dashboard.actions';
import { dashboardFeatureKey } from 'src/app/state/dashboard/dashboard.reducer';
import { initialDashboardState } from 'src/app/state/dashboard/dashboard.state';

describe('HubMainComponent', () => {
  let component: HubMainComponent;
  let fixture: ComponentFixture<HubMainComponent>;
  let store: MockStore;

  function setState(partial: Partial<typeof initialDashboardState>): void {
    store.setState({ [dashboardFeatureKey]: { ...initialDashboardState, ...partial } });
    fixture.detectChanges();
  }

  beforeEach(() => {
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [HubMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({ initialState: { [dashboardFeatureKey]: initialDashboardState } }),
        { provide: NgxUiLoaderService, useValue: loaderSpy },
        { provide: SnackBarService, useValue: snackbarSpy }
      ]
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(HubMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create, and kick off a dashboard load when nothing is cached', () => {
    expect(component).toBeTruthy();
    expect(store.dispatch).toHaveBeenCalledWith(loadDashboard());
  });

  it('shows a spinner (not the empty state) while the request is in flight', () => {
    setState({ loading: true });

    const text = fixture.nativeElement.textContent as string;
    expect(text).not.toContain('No hub data available');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows an error with a retry button when the load failed, instead of looking like an empty Hub', () => {
    setState({ error: 'Failed to load dashboard' });

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert.textContent).toContain("Couldn't load your Hub");
    expect(alert.textContent).toContain('Failed to load dashboard');
    expect(fixture.nativeElement.textContent).not.toContain('No hub data available');
  });

  it('retry() re-dispatches loadDashboard', () => {
    setState({ error: 'Failed to load dashboard' });
    (store.dispatch as jasmine.Spy).calls.reset();

    component.retry();

    expect(store.dispatch).toHaveBeenCalledWith(loadDashboard());
  });

  it('only shows the plain empty state when there is no data, no request in flight, and no error', () => {
    setState({});

    expect(fixture.nativeElement.textContent).toContain('No hub data available');
  });
});
