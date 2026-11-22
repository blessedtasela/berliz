import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { DashboardTopUsersComponent } from './dashboard-top-users.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectUsers, selectUsersLoading } from 'src/app/state/user/user.selector';

describe('DashboardTopUsersComponent', () => {
  let component: DashboardTopUsersComponent;
  let fixture: ComponentFixture<DashboardTopUsersComponent>;
  let store: MockStore;

  beforeEach(() => {
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [DashboardTopUsersComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({
          selectors: [
            { selector: selectUsers, value: [] },
            { selector: selectUsersLoading, value: true },
          ],
        }),
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ]
    });
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DashboardTopUsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // GN-72: this widget used to claim "No users yet" the instant it rendered, before
  // loadAllUsers() had actually resolved, while the real Users page (reading the same store
  // slice) correctly showed every user once loaded -- not two data sources disagreeing, a
  // false-empty-state render race, same class of bug as GN-58/GN-60.
  describe('loading vs. genuinely empty (GN-72)', () => {
    it('shows a loading state, not "No users yet", while the fetch is still in flight', () => {
      fixture.detectChanges();

      expect(component.loading).toBeTrue();
      expect(fixture.nativeElement.querySelector('[data-testid="top-users-loading"]')).toBeTruthy();
      expect(fixture.nativeElement.textContent).not.toContain('No users yet');
    });

    it('shows "No users yet" only once loading has genuinely finished with nothing found', () => {
      store.overrideSelector(selectUsersLoading, false);
      store.refreshState();
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(fixture.nativeElement.querySelector('[data-testid="top-users-loading"]')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('No users yet');
    });

    it('shows the real list and count once users have loaded', () => {
      const users = [{ id: 1, firstname: 'Ada', lastname: 'Lovelace', email: 'ada@example.com', role: 'client', status: 'true', date: '2026-01-01' }] as any;
      store.overrideSelector(selectUsers, users);
      store.overrideSelector(selectUsersLoading, false);
      store.refreshState();
      fixture.detectChanges();

      expect(component.users.length).toBe(1);
      expect(fixture.nativeElement.textContent).toContain('1 total');
      expect(fixture.nativeElement.textContent).not.toContain('No users yet');
    });
  });
});
