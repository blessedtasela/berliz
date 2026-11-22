import { Actions } from '@ngrx/effects';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { NEVER, of, Subject } from 'rxjs';

import { loadAllUsers, loadUsersFailure, loadUsersSuccess } from 'src/app/state/user/user.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { UsersComponent } from './users.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { selectUsersLoading } from 'src/app/state/user/user.selector';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject<any>();
    const rxStompServiceSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompServiceSpy.watch.and.returnValue(NEVER);

    TestBed.configureTestingModule({
      imports: [LoadErrorComponent, RouterTestingModule],
      declarations: [UsersComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Actions, useValue: actions$ },
        provideMockStore(),
        { provide: RxStompService, useValue: rxStompServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    TestBed.inject(MockStore).overrideSelector(selectUsersLoading, false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the users cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of an empty table', () => {
      actions$.next(loadUsersFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load users");
      expect(el().textContent).toContain('Server exploded');
      expect(/<app-(?!page-)[a-z-]+-(header|list)\b/.test(el().innerHTML)).toBeFalse();
    });

    it('retrying loads them again, and a success brings the table back', () => {
      actions$.next(loadUsersFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadAllUsers());

      actions$.next(loadUsersSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(/<app-[a-z-]+-header\b/.test(el().innerHTML)).toBeTrue();
    });

    it('shows the table (not an error) when nothing failed', () => {
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(/<app-[a-z-]+-header\b/.test(el().innerHTML)).toBeTrue();
    });
  });

  /** GN-73: this page used to go straight from blank to "49 cards" with no loading indicator at all. */
  describe('while the list is still loading (GN-73)', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a spinner, not the table or the empty/error state', () => {
      TestBed.inject(MockStore).overrideSelector(selectUsersLoading, true);
      TestBed.inject(MockStore).refreshState();
      fixture.detectChanges();

      expect(el().querySelector('[data-testid="users-loading"]')).toBeTruthy();
      expect(el().querySelector('app-user-header')).toBeNull();
      expect(el().querySelector('app-load-error')).toBeNull();
    });

    it('hides the spinner once loading resolves', () => {
      TestBed.inject(MockStore).overrideSelector(selectUsersLoading, true);
      TestBed.inject(MockStore).refreshState();
      fixture.detectChanges();

      actions$.next(loadUsersSuccess({ response: [] } as any));
      TestBed.inject(MockStore).overrideSelector(selectUsersLoading, false);
      TestBed.inject(MockStore).refreshState();
      fixture.detectChanges();

      expect(el().querySelector('[data-testid="users-loading"]')).toBeNull();
    });
  });
});
